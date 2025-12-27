#!/usr/bin/env python3
"""
Browser automation daemon using Chrome DevTools Protocol.
Manages a persistent Chrome connection via CDP WebSocket.
"""

import argparse
import fcntl
import json
import os
import signal
import socket
import struct
import sys
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Any, Optional, List

try:
    import websocket
except ImportError:
    print(json.dumps({"error": "websocket-client not installed. Run: uv pip install websocket-client"}))
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

        self.cdp_ws: Optional[websocket.WebSocket] = None
        self.cdp_message_id = 0
        self.local_sock: Optional[socket.socket] = None
        self.running = False
        self.chrome_process: Optional[subprocess.Popen] = None

        # Track active client handler threads
        self.active_handlers: set = set()
        self.handlers_lock = threading.Lock()

        # Browsing contexts (named tabs/windows with history)
        self.browsing_contexts: Dict[str, BrowsingContext] = {}

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

    def connect_to_chrome(self) -> None:
        """Connect to Chrome browser via CDP WebSocket (browser-level connection)."""
        import http.client

        # Get browser-level WebSocket endpoint
        conn = http.client.HTTPConnection(f"127.0.0.1:{self.debug_port}")
        try:
            conn.request("GET", "/json/version")
            response = conn.getresponse()
            if response.status != 200:
                raise ConnectionError(f"Chrome not running or debug port {self.debug_port} not available")

            version_info = json.loads(response.read())
            ws_url = version_info.get("webSocketDebuggerUrl")
            if not ws_url:
                raise ConnectionError("Browser WebSocket URL not available")

            # Connect to browser-level WebSocket with timeout
            self.cdp_ws = websocket.WebSocket()
            self.cdp_ws.settimeout(5)  # Set 5 second timeout for recv() operations
            self.cdp_ws.connect(ws_url)

            # Enable Target domain for browsing context management
            self._send_cdp("Target.setDiscoverTargets", {"discover": True})

        finally:
            conn.close()

    def _send_cdp(self, method: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Send CDP command and wait for response."""
        if not self.cdp_ws:
            raise RuntimeError("Not connected to Chrome")

        self.cdp_message_id += 1
        msg_id = self.cdp_message_id

        message = {
            "id": msg_id,
            "method": method,
            "params": params
        }

        self.cdp_ws.send(json.dumps(message))

        # Wait for response (with shutdown check and timeout handling)
        while self.running:
            try:
                response = json.loads(self.cdp_ws.recv())
                if response.get("id") == msg_id:
                    if "error" in response:
                        raise RuntimeError(f"CDP error: {response['error']}")
                    return response.get("result", {})
            except websocket.WebSocketTimeoutException:
                continue  # Retry recv, allows checking self.running

        raise RuntimeError("Daemon shutting down")

    def start_unix_socket_server(self) -> None:
        """Start Unix socket server for CLI commands."""
        # Remove old socket if exists
        if self.socket_path.exists():
            self.socket_path.unlink()

        self.local_sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.local_sock.bind(str(self.socket_path))
        self.local_sock.listen(5)
        self.local_sock.settimeout(1.0)  # 1 second timeout to check running flag

        print(f"Browser daemon listening on {self.socket_path}", file=sys.stderr)

        while self.running:
            try:
                conn, _ = self.local_sock.accept()
                thread = threading.Thread(target=self._handle_client_wrapper, args=(conn,))
                thread.daemon = True
                with self.handlers_lock:
                    self.active_handlers.add(thread)
                thread.start()
            except socket.timeout:
                # Timeout allows checking self.running periodically
                continue
            except Exception as e:
                if self.running:
                    print(f"Accept error: {e}", file=sys.stderr)

    def _handle_client_wrapper(self, conn: socket.socket) -> None:
        """Wrapper to track client handler thread lifecycle."""
        try:
            self.handle_client(conn)
        finally:
            with self.handlers_lock:
                self.active_handlers.discard(threading.current_thread())

    def handle_client(self, conn: socket.socket) -> None:
        """Handle client connection."""
        try:
            # Receive length-prefixed message
            length_data = self._recv_exact(conn, 4)
            if not length_data:
                return

            message_length = struct.unpack('>I', length_data)[0]
            message_data = self._recv_exact(conn, message_length)
            if not message_data:
                return

            request = json.loads(message_data.decode('utf-8'))

            # Dispatch command
            command = request.get("command")
            args = request.get("args", {})

            try:
                # Browsing context lifecycle commands
                if command == "create_browsing_context":
                    result = self.cmd_create_browsing_context(args.get("name"), args.get("url"))
                elif command == "close_browsing_context":
                    result = self.cmd_close_browsing_context(args.get("browsing_context"))
                elif command == "get_browsing_context_history":
                    result = self.cmd_get_browsing_context_history(
                        args.get("browsing_context"),
                        args.get("limit", 50)
                    )
                # Daemon commands
                elif command == "status":
                    result = self.cmd_status()
                elif command == "quit":
                    result = self.cmd_quit()
                # Action commands (require browsing_context and intention)
                elif command == "navigate":
                    result = self.cmd_navigate(
                        args.get("browsing_context"),
                        args.get("intention"),
                        args.get("url")
                    )
                elif command == "extract":
                    result = self.cmd_extract(
                        args.get("browsing_context"),
                        args.get("intention"),
                        args.get("selector")
                    )
                elif command == "eval":
                    result = self.cmd_eval(
                        args.get("browsing_context"),
                        args.get("intention"),
                        args.get("javascript")
                    )
                elif command == "snapshot":
                    result = self.cmd_snapshot(
                        args.get("browsing_context"),
                        args.get("intention"),
                        args.get("mode", "tree")
                    )
                elif command == "click":
                    result = self.cmd_click(
                        args.get("browsing_context"),
                        args.get("intention"),
                        args.get("selector")
                    )
                elif command == "type":
                    result = self.cmd_type(
                        args.get("browsing_context"),
                        args.get("intention"),
                        args.get("selector"),
                        args.get("text")
                    )
                elif command == "wait":
                    result = self.cmd_wait(
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
            conn.sendall(struct.pack('>I', len(response)) + response)

        except Exception as e:
            print(f"Client handler error: {e}", file=sys.stderr)
        finally:
            conn.close()

    def _recv_exact(self, sock: socket.socket, n: int) -> bytes:
        """Receive exactly n bytes from socket."""
        data = b''
        while len(data) < n:
            chunk = sock.recv(n - len(data))
            if not chunk:
                return b''
            data += chunk
        return data

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

    def _send_cdp_to_context(self, browsing_context: str, method: str,
                            params: Dict[str, Any]) -> Dict[str, Any]:
        """Send CDP command to specific browsing context via sessionId."""
        ctx = self._get_browsing_context(browsing_context)

        if not self.cdp_ws:
            raise RuntimeError("Not connected to Chrome")

        self.cdp_message_id += 1
        msg_id = self.cdp_message_id

        message = {
            "id": msg_id,
            "method": method,
            "params": params,
            "sessionId": ctx.session_id
        }

        self.cdp_ws.send(json.dumps(message))

        # Wait for response (with shutdown check and timeout handling)
        while self.running:
            try:
                response = json.loads(self.cdp_ws.recv())
                if response.get("id") == msg_id:
                    if "error" in response:
                        raise RuntimeError(f"CDP error: {response['error']}")
                    return response.get("result", {})
            except websocket.WebSocketTimeoutException:
                continue  # Retry recv, allows checking self.running

        raise RuntimeError("Daemon shutting down")

    # Browsing context lifecycle commands

    def cmd_create_browsing_context(self, name: str, url: Optional[str] = None) -> Dict[str, Any]:
        """Create a new browsing context (tab/window)."""
        if not name:
            return {"error": "name is required"}

        if name in self.browsing_contexts:
            return {"error": f"Browsing context already exists: {name}"}

        try:
            # Create new target (tab)
            create_result = self._send_cdp("Target.createTarget", {
                "url": url or "about:blank"
            })
            target_id = create_result.get("targetId")

            # Attach to get session
            attach_result = self._send_cdp("Target.attachToTarget", {
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

    def cmd_close_browsing_context(self, browsing_context: str) -> Dict[str, Any]:
        """Close a browsing context and remove it."""
        if not browsing_context:
            return {"error": "browsing_context is required"}

        try:
            ctx = self._get_browsing_context(browsing_context)

            # Close target via CDP
            self._send_cdp("Target.closeTarget", {"targetId": ctx.target_id})

            # Remove from our tracking
            del self.browsing_contexts[browsing_context]

            return {"success": True}

        except Exception as e:
            return {"error": str(e)}

    def cmd_get_browsing_context_history(self, browsing_context: str,
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

    def cmd_status(self) -> Dict[str, Any]:
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

    def cmd_quit(self) -> Dict[str, Any]:
        """Stop the daemon server loop."""
        self.running = False

        # Brief delay to let in-flight CDP operations see shutdown flag
        time.sleep(0.1)

        # No need to close socket here - accept() has timeout and will check running flag

        return {"status": "shutting down"}

    def cleanup(self) -> None:
        """Clean up resources (Chrome, sockets, etc.)."""
        print("Cleaning up resources...", file=sys.stderr)

        # Close CDP websocket (skip Browser.close - we'll terminate the process anyway)
        if self.cdp_ws:
            try:
                self.cdp_ws.close()
            except:
                pass

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

    def cmd_navigate(self, browsing_context: str, intention: str, url: str) -> Dict[str, Any]:
        """Navigate to URL in browsing context."""
        if not browsing_context:
            return {"error": "browsing_context is required"}
        if not intention:
            return {"error": "intention is required"}
        if not url:
            return {"error": "url required"}

        try:
            ctx = self._get_browsing_context(browsing_context)

            # Navigate
            result = self._send_cdp_to_context(browsing_context, "Page.navigate", {"url": url})

            # Wait for load
            time.sleep(1)  # Simple wait for now

            # Get page title
            title_result = self._send_cdp_to_context(browsing_context, "Runtime.evaluate", {
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

    def cmd_extract(self, browsing_context: str, intention: str,
                   selector: Optional[str]) -> Dict[str, Any]:
        """Extract text/HTML from element or page."""
        if not browsing_context:
            return {"error": "browsing_context is required"}
        if not intention:
            return {"error": "intention is required"}

        try:
            ctx = self._get_browsing_context(browsing_context)

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

            result = self._send_cdp_to_context(browsing_context, "Runtime.evaluate", {
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

    def cmd_eval(self, browsing_context: str, intention: str,
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

            result = self._send_cdp_to_context(browsing_context, "Runtime.evaluate", {
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

    def cmd_snapshot(self, browsing_context: str, intention: str,
                    mode: str = "tree") -> Dict[str, Any]:
        """Get page structure for element discovery."""
        if not browsing_context:
            return {"error": "browsing_context is required"}
        if not intention:
            return {"error": "intention is required"}

        try:
            ctx = self._get_browsing_context(browsing_context)

            if mode == "tree":
                # Accessibility tree
                result = self._send_cdp_to_context(browsing_context, "Accessibility.getFullAXTree", {})
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

                result = self._send_cdp_to_context(browsing_context, "Runtime.evaluate", {
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

    def cmd_click(self, browsing_context: str, intention: str,
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

            result = self._send_cdp_to_context(browsing_context, "Runtime.evaluate", {
                "expression": expression,
                "returnByValue": True
            })

            coords = result.get("result", {}).get("value")
            if not coords or not coords.get("found"):
                return {"error": f"Element not found: {selector}"}

            # Dispatch mouse click
            self._send_cdp_to_context(browsing_context, "Input.dispatchMouseEvent", {
                "type": "mousePressed",
                "x": coords["x"],
                "y": coords["y"],
                "button": "left",
                "clickCount": 1
            })

            self._send_cdp_to_context(browsing_context, "Input.dispatchMouseEvent", {
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

    def cmd_type(self, browsing_context: str, intention: str,
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

            # Focus element first
            focus_expr = f"""
                (function() {{
                    const el = document.querySelector('{selector}');
                    if (!el) return false;
                    el.focus();
                    return true;
                }})()
            """

            result = self._send_cdp_to_context(browsing_context, "Runtime.evaluate", {
                "expression": focus_expr,
                "returnByValue": True
            })

            if not result.get("result", {}).get("value"):
                return {"error": f"Element not found: {selector}"}

            # Type text
            for char in text:
                self._send_cdp_to_context(browsing_context, "Input.dispatchKeyEvent", {
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

    def cmd_wait(self, browsing_context: str, intention: str,
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

                result = self._send_cdp_to_context(browsing_context, "Runtime.evaluate", {
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

                time.sleep(0.5)

            return {"error": f"Timeout waiting for: {selector}"}

        except Exception as e:
            return {"error": str(e)}

    def run(self, initial_context_name: str, initial_context_url: str = "about:blank") -> None:
        """Main daemon loop."""
        # Set running flag early so CDP operations work during startup
        self.running = True

        # Setup signal handlers
        signal.signal(signal.SIGTERM, lambda s, f: self.cmd_quit())
        signal.signal(signal.SIGINT, lambda s, f: self.cmd_quit())

        try:
            # Start Chrome
            self.start_chrome()

            # Connect to Chrome
            self.connect_to_chrome()

            # Use the default tab for initial browsing context
            # Get existing targets
            targets_result = self._send_cdp("Target.getTargets", {})
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
            attach_result = self._send_cdp("Target.attachToTarget", {
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
                navigate_result = self._send_cdp_to_context(initial_context_name, "Page.navigate",
                                                           {"url": initial_context_url})
                time.sleep(1)

                # Update context state
                title_result = self._send_cdp_to_context(initial_context_name, "Runtime.evaluate", {
                    "expression": "document.title",
                    "returnByValue": True
                })
                ctx.title = title_result.get("result", {}).get("value", "")

                # Record navigation
                self._record_action(initial_context_name, "navigate", "Navigating to initial URL",
                                  {"url": initial_context_url}, f"Navigated to {initial_context_url}")

            print(f"Initial browsing context created: {initial_context_name} ({initial_context_url})", file=sys.stderr)

            # Start socket server
            self.start_unix_socket_server()
        finally:
            # Wait for active client handlers to finish sending responses
            with self.handlers_lock:
                active_threads = list(self.active_handlers)

            for thread in active_threads:
                thread.join(timeout=0.5)  # Wait up to 0.5s per thread

            # Always clean up resources, even on crash or kill
            self.cleanup()

        # Exit cleanly after socket server stops
        sys.exit(0)


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
