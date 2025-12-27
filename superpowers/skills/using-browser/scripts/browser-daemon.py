#!/usr/bin/env python3
"""
Browser automation daemon using Chrome DevTools Protocol.
Manages a persistent Chrome connection via CDP WebSocket.
"""

import argparse
import asyncio
import fcntl
import itertools
import json
import os
import signal
import socket
import struct
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Any, Optional, List

try:
    import websockets
except ImportError:
    print(json.dumps({"error": "websockets not installed. Run: uv pip install websockets"}))
    sys.exit(1)


@dataclass
class BrowsingContextAction:
    """Record of an action performed in a browsing context."""
    action: str           # "navigate", "click", "extract", etc.
    intention: str        # Why this action was taken
    timestamp: float
    params: Dict[str, Any]  # Command parameters (sanitized)
    result_summary: str   # Brief outcome description


@dataclass
class BrowsingContext:
    """Named browser tab/window with action history."""
    name: str
    target_id: str
    session_id: str
    url: str
    title: str
    created_at: float
    history: List[BrowsingContextAction] = field(default_factory=list)
    lock: asyncio.Lock = field(default_factory=asyncio.Lock)


class BrowserDaemon:
    """
    Browser automation daemon.
    Connects to Chrome via CDP WebSocket and listens on Unix socket for commands.
    """

    def __init__(self, browser_path: str, debug_port: int = 9222):
        if not browser_path:
            raise ValueError("SUPERPOWERS_BROWSER_PATH environment variable not set")

        self.browser_path = browser_path
        self.debug_port = debug_port
        self.runtime_dir = Path(os.getenv("XDG_RUNTIME_DIR", "/tmp")) / "claude-browser"
        self.socket_path = self.runtime_dir / "browser.sock"
        self.runtime_dir.mkdir(parents=True, exist_ok=True)

        self.cdp_ws: Optional[websockets.WebSocketClientProtocol] = None
        self.pending_requests: Dict[int, asyncio.Future] = {}
        self.id_counter = itertools.count(1)
        self.cdp_receiver_task: Optional[asyncio.Task] = None
        self.local_sock: Optional[socket.socket] = None
        self.running = False
        self.chrome_process: Optional[subprocess.Popen] = None

        # Browsing contexts (named tabs/windows with history)
        self.browsing_contexts: Dict[str, BrowsingContext] = {}

        # Chrome process monitor task
        self.monitor_task: Optional[asyncio.Task] = None

        # Unix socket server
        self.server: Optional[asyncio.Server] = None

    async def _monitor_chrome_process(self) -> None:
        """Monitor Chrome subprocess and shutdown daemon if it exits."""
        while self.running:
            await asyncio.sleep(1)  # Check every second

            # Check if Chrome process is still running
            if self.chrome_process:
                returncode = self.chrome_process.poll()
                if returncode is not None:
                    print("Chrome process exited, shutting down daemon...", file=sys.stderr)
                    self.running = False
                    break

    def start_chrome(self) -> None:
        """Start Chrome with remote debugging enabled."""
        import subprocess

        # Check if Chrome is already running on debug port
        import http.client
        conn = http.client.HTTPConnection(f"127.0.0.1:{self.debug_port}")
        try:
            conn.request("GET", "/json/version")
            response = conn.getresponse()
            if response.status == 200:
                print("Chrome already running", file=sys.stderr)
                return
        except:
            pass  # Chrome not running, will start it
        finally:
            conn.close()

        # Start Chrome
        user_data_dir = self.runtime_dir / "chrome-profile"
        user_data_dir.mkdir(parents=True, exist_ok=True)

        cmd = [
            self.browser_path,
            f"--remote-debugging-port={self.debug_port}",
            f"--user-data-dir={user_data_dir}",
            "--remote-allow-origins=*",
            "--no-first-run",
            "--no-default-browser-check",
        ]

        print(f"Starting Chrome: {' '.join(cmd)}", file=sys.stderr)
        self.chrome_process = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        # Wait for Chrome to be ready
        for i in range(30):  # Wait up to 3 seconds
            time.sleep(0.1)
            try:
                conn = http.client.HTTPConnection(f"127.0.0.1:{self.debug_port}")
                conn.request("GET", "/json/version")
                response = conn.getresponse()
                if response.status == 200:
                    print("Chrome started successfully", file=sys.stderr)
                    conn.close()
                    return
                conn.close()
            except:
                pass

        raise RuntimeError("Failed to start Chrome")

    async def connect_to_chrome(self) -> None:
        """Connect to Chrome browser via CDP WebSocket (browser-level connection)."""
        import http.client

        # Get browser-level WebSocket endpoint
        conn = http.client.HTTPConnection(f"127.0.0.1:{self.debug_port}", timeout=5)
        try:
            print(f"Connecting to Chrome on port {self.debug_port}...", file=sys.stderr)
            conn.request("GET", "/json/version")
            response = conn.getresponse()
            if response.status != 200:
                raise ConnectionError(f"Chrome not running or debug port {self.debug_port} not available")

            version_info = json.loads(response.read())
            ws_url = version_info.get("webSocketDebuggerUrl")
            if not ws_url:
                raise ConnectionError("Browser WebSocket URL not available")

            print(f"Connecting to WebSocket: {ws_url}", file=sys.stderr)
            # Connect to browser-level WebSocket with timeout
            self.cdp_ws = await asyncio.wait_for(
                websockets.connect(ws_url),
                timeout=5.0
            )
            print(f"WebSocket connected successfully", file=sys.stderr)

        finally:
            conn.close()

    async def _cdp_receiver(self) -> None:
        """Background coroutine that receives CDP messages and dispatches to waiting callers."""
        try:
            async for message in self.cdp_ws:
                data = json.loads(message)
                if "id" in data:
                    # Response to a command
                    future = self.pending_requests.pop(data["id"], None)
                    if future and not future.done():
                        future.set_result(data)
                # else: CDP event (page load, navigation, etc.) - ignore for now
        except websockets.ConnectionClosed:
            pass
        except Exception as e:
            print(f"CDP receiver error: {e}", file=sys.stderr)

    async def _send_cdp(self, method: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Send CDP command and wait for response via future-based dispatch."""
        if not self.cdp_ws:
            raise RuntimeError("Not connected to Chrome")

        msg_id = next(self.id_counter)
        future = asyncio.get_event_loop().create_future()
        self.pending_requests[msg_id] = future

        message = {
            "id": msg_id,
            "method": method,
            "params": params or {}
        }

        await self.cdp_ws.send(json.dumps(message))

        result = await future
        if "error" in result:
            raise RuntimeError(f"CDP error: {result['error']}")
        return result.get("result", {})

    async def start_unix_socket_server(self) -> None:
        """Start async Unix socket server for CLI commands."""
        # Remove old socket if exists
        if self.socket_path.exists():
            self.socket_path.unlink()

        print(f"Browser daemon listening on {self.socket_path}", file=sys.stderr)

        self.server = await asyncio.start_unix_server(
            self._handle_client,
            path=str(self.socket_path)
        )

        async with self.server:
            await self.server.serve_forever()

    async def _handle_client(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter) -> None:
        """Handle client connection asynchronously."""
        command = None  # Track command for quit handling
        try:
            # Receive length-prefixed message
            length_data = await reader.readexactly(4)
            message_length = struct.unpack('>I', length_data)[0]
            message_data = await reader.readexactly(message_length)

            request = json.loads(message_data.decode('utf-8'))

            # Dispatch command
            command = request.get("command")
            args = request.get("args", {})

            try:
                # Browsing context lifecycle commands
                if command == "create_browsing_context":
                    result = await self.cmd_create_browsing_context(args.get("name"), args.get("url"))
                elif command == "close_browsing_context":
                    result = await self.cmd_close_browsing_context(args.get("browsing_context"))
                elif command == "get_browsing_context_history":
                    result = await self.cmd_get_browsing_context_history(
                        args.get("browsing_context"),
                        args.get("limit", 50)
                    )
                # Daemon commands
                elif command == "status":
                    result = await self.cmd_status()
                elif command == "quit":
                    result = await self.cmd_quit()
                # Action commands (require browsing_context and intention)
                elif command == "navigate":
                    result = await self.cmd_navigate(
                        args.get("browsing_context"),
                        args.get("intention"),
                        args.get("url")
                    )
                elif command == "extract":
                    result = await self.cmd_extract(
                        args.get("browsing_context"),
                        args.get("intention"),
                        args.get("selector")
                    )
                elif command == "eval":
                    result = await self.cmd_eval(
                        args.get("browsing_context"),
                        args.get("intention"),
                        args.get("javascript")
                    )
                elif command == "snapshot":
                    result = await self.cmd_snapshot(
                        args.get("browsing_context"),
                        args.get("intention"),
                        args.get("mode", "tree")
                    )
                elif command == "click":
                    result = await self.cmd_click(
                        args.get("browsing_context"),
                        args.get("intention"),
                        args.get("selector")
                    )
                elif command == "type":
                    result = await self.cmd_type(
                        args.get("browsing_context"),
                        args.get("intention"),
                        args.get("selector"),
                        args.get("text")
                    )
                elif command == "wait":
                    result = await self.cmd_wait(
                        args.get("browsing_context"),
                        args.get("intention"),
                        args.get("selector"),
                        args.get("timeout", 10)
                    )
                else:
                    result = {"error": f"Unknown command: {command}"}
            except Exception as e:
                result = {"error": str(e)}

            # Send response
            response = json.dumps(result).encode('utf-8')
            writer.write(struct.pack('>I', len(response)) + response)
            await writer.drain()

            # If this was a quit command, close connection and shutdown
            if command == "quit":
                writer.close()
                await writer.wait_closed()  # Ensure response fully sent
                await self._shutdown()

        except asyncio.IncompleteReadError:
            pass  # Client disconnected
        except Exception as e:
            print(f"Client handler error: {e}", file=sys.stderr)
        finally:
            if command != "quit":  # Already closed for quit above
                writer.close()
                await writer.wait_closed()

    # Browsing context helper methods

    def _get_browsing_context(self, name: str) -> BrowsingContext:
        """Get browsing context by name or raise error."""
        if name not in self.browsing_contexts:
            raise RuntimeError(f"Browsing context not found: {name}")
        return self.browsing_contexts[name]

    def _record_action(self, browsing_context: str, action: str, intention: str,
                      params: Dict[str, Any], result_summary: str) -> None:
        """Record an action in browsing context history."""
        ctx = self._get_browsing_context(browsing_context)
        action_record = BrowsingContextAction(
            action=action,
            intention=intention,
            timestamp=time.time(),
            params=params,
            result_summary=result_summary
        )
        ctx.history.append(action_record)

    async def _send_cdp_to_context(self, browsing_context: str, method: str,
                            params: Dict[str, Any]) -> Dict[str, Any]:
        """Send CDP command to specific browsing context via sessionId."""
        ctx = self._get_browsing_context(browsing_context)

        if not self.cdp_ws:
            raise RuntimeError("Not connected to Chrome")

        msg_id = next(self.id_counter)
        future = asyncio.get_event_loop().create_future()
        self.pending_requests[msg_id] = future

        message = {
            "id": msg_id,
            "method": method,
            "params": params,
            "sessionId": ctx.session_id
        }

        await self.cdp_ws.send(json.dumps(message))

        result = await future
        if "error" in result:
            raise RuntimeError(f"CDP error: {result['error']}")
        return result.get("result", {})

    # Browsing context lifecycle commands

    async def cmd_create_browsing_context(self, name: str, url: Optional[str] = None) -> Dict[str, Any]:
        """Create a new browsing context (tab/window)."""
        if not name:
            return {"error": "name is required"}

        if name in self.browsing_contexts:
            return {"error": f"Browsing context already exists: {name}"}

        try:
            # Create new target (tab)
            create_result = await self._send_cdp("Target.createTarget", {
                "url": url or "about:blank"
            })
            target_id = create_result.get("targetId")

            # Attach to get session
            attach_result = await self._send_cdp("Target.attachToTarget", {
                "targetId": target_id,
                "flatten": True
            })
            session_id = attach_result.get("sessionId")

            # Create browsing context record
            ctx = BrowsingContext(
                name=name,
                target_id=target_id,
                session_id=session_id,
                url=url or "about:blank",
                title="",
                created_at=time.time()
            )
            self.browsing_contexts[name] = ctx

            # Record creation action
            self._record_action(name, "create", "Creating browsing context",
                              {"url": url}, "Browsing context created")

            return {
                "success": True,
                "browsing_context": {
                    "name": ctx.name,
                    "url": ctx.url,
                    "title": ctx.title
                }
            }

        except Exception as e:
            return {"error": f"Failed to create browsing context: {str(e)}"}

    async def cmd_close_browsing_context(self, browsing_context: str) -> Dict[str, Any]:
        """Close a browsing context and remove it."""
        if not browsing_context:
            return {"error": "browsing_context is required"}

        try:
            ctx = self._get_browsing_context(browsing_context)

            # Close target via CDP
            await self._send_cdp("Target.closeTarget", {"targetId": ctx.target_id})

            # Remove from our tracking
            del self.browsing_contexts[browsing_context]

            return {"success": True}

        except Exception as e:
            return {"error": str(e)}

    async def cmd_get_browsing_context_history(self, browsing_context: str,
                                        limit: int = 50) -> Dict[str, Any]:
        """Get action history for a browsing context."""
        if not browsing_context:
            return {"error": "browsing_context is required"}

        try:
            ctx = self._get_browsing_context(browsing_context)

            history = [
                {
                    "action": a.action,
                    "intention": a.intention,
                    "timestamp": a.timestamp,
                    "params": a.params,
                    "result": a.result_summary
                }
                for a in ctx.history[-limit:]
            ]

            return {
                "success": True,
                "browsing_context": browsing_context,
                "history": history
            }

        except Exception as e:
            return {"error": str(e)}

    # Daemon status command

    async def cmd_status(self) -> Dict[str, Any]:
        """Get daemon status including all browsing contexts with recent history."""
        browsing_contexts = []
        for ctx in self.browsing_contexts.values():
            age_minutes = (time.time() - ctx.created_at) / 60
            recent_history = [
                {
                    "action": a.action,
                    "intention": a.intention,
                    "result": a.result_summary
                }
                for a in ctx.history[-5:]  # Last 5 actions
            ]

            browsing_contexts.append({
                "name": ctx.name,
                "url": ctx.url,
                "title": ctx.title,
                "age_minutes": age_minutes,
                "recent_history": recent_history
            })

        return {
            "status": "running",
            "connected_to_chrome": self.cdp_ws is not None,
            "browsing_contexts": browsing_contexts
        }

    async def _shutdown(self) -> None:
        """Handle shutdown signal."""
        print("Received shutdown signal", file=sys.stderr)
        self.running = False

        # Close the server to stop accepting new connections
        if self.server:
            self.server.close()

    async def cmd_quit(self) -> Dict[str, Any]:
        """Stop the daemon server loop."""
        # Shutdown happens in _handle_client after response is sent
        return {"status": "shutting down"}

    def cleanup(self) -> None:
        """Clean up resources (Chrome, sockets, etc.)."""
        print("Cleaning up resources...", file=sys.stderr)

        # WebSocket will be closed automatically when the event loop shuts down
        # (websockets.close() is async, can't call from sync cleanup)

        # Terminate Chrome process if we started it
        if self.chrome_process:
            try:
                print("Terminating Chrome process...", file=sys.stderr)
                self.chrome_process.terminate()
                self.chrome_process.wait(timeout=1)  # Reduced from 2s to 1s
            except:
                try:
                    self.chrome_process.kill()
                except:
                    pass

        # Close socket
        if self.local_sock:
            try:
                self.local_sock.close()
            except:
                pass

        # Remove socket file
        if self.socket_path.exists():
            try:
                self.socket_path.unlink()
            except:
                pass

        print("Cleanup complete", file=sys.stderr)

    async def cmd_navigate(self, browsing_context: str, intention: str, url: str) -> Dict[str, Any]:
        """Navigate to URL in browsing context."""
        if not browsing_context:
            return {"error": "browsing_context is required"}
        if not intention:
            return {"error": "intention is required"}
        if not url:
            return {"error": "url required"}

        try:
            ctx = self._get_browsing_context(browsing_context)

            async with ctx.lock:
                # Navigate
                result = await self._send_cdp_to_context(browsing_context, "Page.navigate", {"url": url})

                # Wait for load
                await asyncio.sleep(1)  # Simple wait for now

                # Get page title
                title_result = await self._send_cdp_to_context(browsing_context, "Runtime.evaluate", {
                    "expression": "document.title",
                    "returnByValue": True
                })

                # Update context state
                ctx.url = url
                ctx.title = title_result.get("result", {}).get("value", "")

                # Record action
                self._record_action(browsing_context, "navigate", intention,
                                  {"url": url}, f"Navigated to {url}")

                return {
                    "success": True,
                    "browsing_context_state": {
                        "name": ctx.name,
                        "url": ctx.url,
                        "title": ctx.title,
                        "history_length": len(ctx.history)
                    }
                }

        except Exception as e:
            return {"error": str(e)}

    async def cmd_extract(self, browsing_context: str, intention: str,
                   selector: Optional[str]) -> Dict[str, Any]:
        """Extract text/HTML from element or page."""
        if not browsing_context:
            return {"error": "browsing_context is required"}
        if not intention:
            return {"error": "intention is required"}

        try:
            ctx = self._get_browsing_context(browsing_context)

            async with ctx.lock:
                if selector:
                    # Extract specific element
                    expression = f"""
                        (function() {{
                            const el = document.querySelector('{selector}');
                            if (!el) return null;
                            return {{
                                text: el.textContent.trim(),
                                html: el.innerHTML,
                                tagName: el.tagName.toLowerCase()
                            }};
                        }})()
                    """
                else:
                    # Extract whole page
                    expression = """
                        (function() {
                            return {
                                text: document.body.textContent.trim(),
                                html: document.body.innerHTML,
                                title: document.title,
                                url: window.location.href
                            };
                        })()
                    """

                result = await self._send_cdp_to_context(browsing_context, "Runtime.evaluate", {
                    "expression": expression,
                    "returnByValue": True
                })

                value = result.get("result", {}).get("value")
                if value is None:
                    return {"error": f"Selector not found: {selector}"}

                # Record action
                self._record_action(browsing_context, "extract", intention,
                                  {"selector": selector}, f"Extracted from {selector or 'page'}")

                return {
                    "success": True,
                    "data": value,
                    "browsing_context_state": {
                        "name": ctx.name,
                        "url": ctx.url,
                        "title": ctx.title,
                        "history_length": len(ctx.history)
                    }
                }

        except Exception as e:
            return {"error": str(e)}

    async def cmd_eval(self, browsing_context: str, intention: str,
                javascript: str) -> Dict[str, Any]:
        """Execute JavaScript in browsing context."""
        if not browsing_context:
            return {"error": "browsing_context is required"}
        if not intention:
            return {"error": "intention is required"}
        if not javascript:
            return {"error": "javascript required"}

        try:
            ctx = self._get_browsing_context(browsing_context)

            async with ctx.lock:
                result = await self._send_cdp_to_context(browsing_context, "Runtime.evaluate", {
                    "expression": javascript,
                    "returnByValue": True,
                    "awaitPromise": True
                })

                if "exceptionDetails" in result:
                    return {
                        "error": "JavaScript exception",
                        "details": result["exceptionDetails"]
                    }

                # Record action
                self._record_action(browsing_context, "eval", intention,
                                  {"javascript": javascript[:100]}, "Executed JavaScript")

                return {
                    "success": True,
                    "result": result.get("result", {}).get("value"),
                    "browsing_context_state": {
                        "name": ctx.name,
                        "url": ctx.url,
                        "title": ctx.title,
                        "history_length": len(ctx.history)
                    }
                }

        except Exception as e:
            return {"error": str(e)}

    async def cmd_snapshot(self, browsing_context: str, intention: str,
                    mode: str = "tree") -> Dict[str, Any]:
        """Get page structure for element discovery."""
        if not browsing_context:
            return {"error": "browsing_context is required"}
        if not intention:
            return {"error": "intention is required"}

        try:
            ctx = self._get_browsing_context(browsing_context)

            async with ctx.lock:
                if mode == "tree":
                    # Accessibility tree
                    result = await self._send_cdp_to_context(browsing_context, "Accessibility.getFullAXTree", {})
                    nodes = result.get("nodes", [])

                    # Simplify tree structure
                    simplified = []
                    for node in nodes:
                        if node.get("role", {}).get("value") in ["button", "link", "textbox", "heading", "generic"]:
                            simplified.append({
                                "role": node.get("role", {}).get("value"),
                                "name": node.get("name", {}).get("value", ""),
                                "nodeId": node.get("nodeId")
                            })

                    # Record action
                    self._record_action(browsing_context, "snapshot", intention,
                                      {"mode": mode}, f"Captured {mode} snapshot")

                    return {
                        "success": True,
                        "mode": "tree",
                        "nodes": simplified,
                        "browsing_context_state": {
                            "name": ctx.name,
                            "url": ctx.url,
                            "title": ctx.title,
                            "history_length": len(ctx.history)
                        }
                    }

                elif mode == "dom":
                    # Simplified DOM structure
                    expression = """
                        (function() {
                            function simplifyElement(el, depth = 0) {
                                if (depth > 3) return null;
                                const children = Array.from(el.children)
                                    .map(child => simplifyElement(child, depth + 1))
                                    .filter(x => x !== null);

                                return {
                                    tag: el.tagName.toLowerCase(),
                                    id: el.id || null,
                                    classes: Array.from(el.classList),
                                    text: el.childNodes.length === 1 && el.childNodes[0].nodeType === 3
                                        ? el.textContent.trim().substring(0, 50)
                                        : null,
                                    children: children.length > 0 ? children : null
                                };
                            }

                            return simplifyElement(document.body);
                        })()
                    """

                    result = await self._send_cdp_to_context(browsing_context, "Runtime.evaluate", {
                        "expression": expression,
                        "returnByValue": True
                    })

                    # Record action
                    self._record_action(browsing_context, "snapshot", intention,
                                      {"mode": mode}, f"Captured {mode} snapshot")

                    return {
                        "success": True,
                        "mode": "dom",
                        "structure": result.get("result", {}).get("value"),
                        "browsing_context_state": {
                            "name": ctx.name,
                            "url": ctx.url,
                            "title": ctx.title,
                            "history_length": len(ctx.history)
                        }
                    }

                else:
                    return {"error": f"Unknown mode: {mode}"}

        except Exception as e:
            return {"error": str(e)}

    async def cmd_click(self, browsing_context: str, intention: str,
                 selector: str) -> Dict[str, Any]:
        """Click an element."""
        if not browsing_context:
            return {"error": "browsing_context is required"}
        if not intention:
            return {"error": "intention is required"}
        if not selector:
            return {"error": "selector required"}

        try:
            ctx = self._get_browsing_context(browsing_context)

            async with ctx.lock:
                # Find element
                expression = f"""
                    (function() {{
                        const el = document.querySelector('{selector}');
                        if (!el) return null;

                        const rect = el.getBoundingClientRect();
                        return {{
                            x: rect.left + rect.width / 2,
                            y: rect.top + rect.height / 2,
                            found: true
                        }};
                    }})()
                """

                result = await self._send_cdp_to_context(browsing_context, "Runtime.evaluate", {
                    "expression": expression,
                    "returnByValue": True
                })

                coords = result.get("result", {}).get("value")
                if not coords or not coords.get("found"):
                    return {"error": f"Element not found: {selector}"}

                # Dispatch mouse click
                await self._send_cdp_to_context(browsing_context, "Input.dispatchMouseEvent", {
                    "type": "mousePressed",
                    "x": coords["x"],
                    "y": coords["y"],
                    "button": "left",
                    "clickCount": 1
                })

                await self._send_cdp_to_context(browsing_context, "Input.dispatchMouseEvent", {
                    "type": "mouseReleased",
                    "x": coords["x"],
                    "y": coords["y"],
                    "button": "left",
                    "clickCount": 1
                })

                # Record action
                self._record_action(browsing_context, "click", intention,
                                  {"selector": selector}, f"Clicked {selector}")

                return {
                    "success": True,
                    "clicked": selector,
                    "browsing_context_state": {
                        "name": ctx.name,
                        "url": ctx.url,
                        "title": ctx.title,
                        "history_length": len(ctx.history)
                    }
                }

        except Exception as e:
            return {"error": str(e)}

    async def cmd_type(self, browsing_context: str, intention: str,
                selector: str, text: str) -> Dict[str, Any]:
        """Type text into an element."""
        if not browsing_context:
            return {"error": "browsing_context is required"}
        if not intention:
            return {"error": "intention is required"}
        if not selector:
            return {"error": "selector required"}
        if not text:
            return {"error": "text required"}

        try:
            ctx = self._get_browsing_context(browsing_context)

            async with ctx.lock:
                # Focus element first
                focus_expr = f"""
                    (function() {{
                        const el = document.querySelector('{selector}');
                        if (!el) return false;
                        el.focus();
                        return true;
                    }})()
                """

                result = await self._send_cdp_to_context(browsing_context, "Runtime.evaluate", {
                    "expression": focus_expr,
                    "returnByValue": True
                })

                if not result.get("result", {}).get("value"):
                    return {"error": f"Element not found: {selector}"}

                # Type text
                for char in text:
                    await self._send_cdp_to_context(browsing_context, "Input.dispatchKeyEvent", {
                        "type": "char",
                        "text": char
                    })

                # Record action
                self._record_action(browsing_context, "type", intention,
                                  {"selector": selector, "text": text}, f"Typed into {selector}")

                return {
                    "success": True,
                    "typed": text,
                    "into": selector,
                    "browsing_context_state": {
                        "name": ctx.name,
                        "url": ctx.url,
                        "title": ctx.title,
                        "history_length": len(ctx.history)
                    }
                }

        except Exception as e:
            return {"error": str(e)}

    async def cmd_wait(self, browsing_context: str, intention: str,
                selector: str, timeout: int = 10) -> Dict[str, Any]:
        """Wait for element or text to appear."""
        if not browsing_context:
            return {"error": "browsing_context is required"}
        if not intention:
            return {"error": "intention is required"}
        if not selector:
            return {"error": "selector or text required"}

        try:
            ctx = self._get_browsing_context(browsing_context)

            async with ctx.lock:
                # Poll for element
                start_time = time.time()
                while time.time() - start_time < timeout:
                    expression = f"""
                        (function() {{
                            const el = document.querySelector('{selector}');
                            if (el) return true;

                            // Also check for text content
                            if (document.body.textContent.includes('{selector}')) return true;

                            return false;
                        }})()
                    """

                    result = await self._send_cdp_to_context(browsing_context, "Runtime.evaluate", {
                        "expression": expression,
                        "returnByValue": True
                    })

                    if result.get("result", {}).get("value"):
                        # Record action
                        self._record_action(browsing_context, "wait", intention,
                                          {"selector": selector, "timeout": timeout},
                                          f"Found {selector} after {time.time() - start_time:.1f}s")

                        return {
                            "success": True,
                            "found": selector,
                            "time": time.time() - start_time,
                            "browsing_context_state": {
                                "name": ctx.name,
                                "url": ctx.url,
                                "title": ctx.title,
                                "history_length": len(ctx.history)
                            }
                        }

                    await asyncio.sleep(0.5)

                return {"error": f"Timeout waiting for: {selector}"}

        except Exception as e:
            return {"error": str(e)}

    async def run_async(self, initial_context_name: str, initial_context_url: str = "about:blank") -> None:
        """Async main daemon loop."""
        # Set running flag early so CDP operations work during startup
        self.running = True

        # Set up signal handlers for graceful shutdown
        loop = asyncio.get_event_loop()
        for sig in (signal.SIGTERM, signal.SIGINT):
            loop.add_signal_handler(sig, lambda: asyncio.create_task(self._shutdown()))

        try:
            # Start Chrome
            self.start_chrome()

            # Connect to Chrome
            await self.connect_to_chrome()

            # Start CDP receiver task
            self.cdp_receiver_task = asyncio.create_task(self._cdp_receiver())

            # Enable Target domain for browsing context management
            await self._send_cdp("Target.setDiscoverTargets", {"discover": True})

            # Use the default tab for initial browsing context
            # Get existing targets
            targets_result = await self._send_cdp("Target.getTargets", {})
            targets = targets_result.get("targetInfos", [])

            # Find first page target (the default tab Chrome creates)
            default_tab = None
            for target in targets:
                if target.get("type") == "page":
                    default_tab = target
                    break

            if not default_tab:
                print("No default tab found", file=sys.stderr)
                sys.exit(1)

            target_id = default_tab.get("targetId")

            # Attach to default tab
            attach_result = await self._send_cdp("Target.attachToTarget", {
                "targetId": target_id,
                "flatten": True
            })
            session_id = attach_result.get("sessionId")

            # Create browsing context record
            ctx = BrowsingContext(
                name=initial_context_name,
                target_id=target_id,
                session_id=session_id,
                url=initial_context_url,
                title="",
                created_at=time.time()
            )
            self.browsing_contexts[initial_context_name] = ctx

            # Record creation action
            self._record_action(initial_context_name, "create", "Creating initial browsing context",
                              {"url": initial_context_url}, "Initial browsing context created from default tab")

            # Navigate if URL provided
            if initial_context_url and initial_context_url != "about:blank":
                navigate_result = await self._send_cdp_to_context(initial_context_name, "Page.navigate",
                                                           {"url": initial_context_url})
                await asyncio.sleep(1)

                # Update context state
                title_result = await self._send_cdp_to_context(initial_context_name, "Runtime.evaluate", {
                    "expression": "document.title",
                    "returnByValue": True
                })
                ctx.title = title_result.get("result", {}).get("value", "")

                # Record navigation
                self._record_action(initial_context_name, "navigate", "Navigating to initial URL",
                                  {"url": initial_context_url}, f"Navigated to {initial_context_url}")

            print(f"Initial browsing context created: {initial_context_name} ({initial_context_url})", file=sys.stderr)

            # Start Chrome process monitor
            self.monitor_task = asyncio.create_task(self._monitor_chrome_process())

            # Start socket server (blocks until shutdown)
            await self.start_unix_socket_server()
        except asyncio.CancelledError:
            # Server was shut down cleanly via quit command or signal
            print("Server shutdown initiated", file=sys.stderr)
        except Exception as e:
            print(f"Fatal error in daemon: {e}", file=sys.stderr)
            import traceback
            traceback.print_exc()
            raise
        finally:
            # Always clean up resources, even on crash or kill
            self.cleanup()

        # Exit cleanly after socket server stops
        sys.exit(0)

    def run(self, initial_context_name: str, initial_context_url: str = "about:blank") -> None:
        """Sync wrapper for async main loop."""
        try:
            asyncio.run(self.run_async(initial_context_name, initial_context_url))
        except Exception as e:
            print(f"FATAL: Exception in run(): {e}", file=sys.stderr)
            import traceback
            traceback.print_exc()
            sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Browser automation daemon")
    parser.add_argument("--browser-path", default=os.getenv("SUPERPOWERS_BROWSER_PATH"),
                       help="Path to browser executable")
    parser.add_argument("--debug-port", type=int, default=int(os.getenv("SUPERPOWERS_BROWSER_DEBUG_PORT", "9222")),
                       help="CDP debug port")
    parser.add_argument("--initial-context-name", required=True,
                       help="Name for the initial browsing context")
    parser.add_argument("--initial-context-url", default="about:blank",
                       help="Optional URL for the initial browsing context (default: about:blank)")

    args = parser.parse_args()

    if not args.browser_path:
        print(json.dumps({"error": "SUPERPOWERS_BROWSER_PATH environment variable not set"}))
        sys.exit(1)

    daemon = BrowserDaemon(browser_path=args.browser_path, debug_port=args.debug_port)
    daemon.run(initial_context_name=args.initial_context_name,
               initial_context_url=args.initial_context_url)


if __name__ == "__main__":
    main()
