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
from pathlib import Path
from typing import Dict, Any, Optional

try:
    import websocket
except ImportError:
    print(json.dumps({"error": "websocket-client not installed. Run: uv pip install websocket-client"}))
    sys.exit(1)


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

        # Current page state
        self.current_url = None
        self.current_title = None

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
        """Connect to Chrome via CDP WebSocket."""
        import http.client

        # Get available pages
        conn = http.client.HTTPConnection(f"127.0.0.1:{self.debug_port}")
        try:
            conn.request("GET", "/json/list")
            response = conn.getresponse()
            if response.status != 200:
                raise ConnectionError(f"Chrome not running or debug port {self.debug_port} not available")

            pages = json.loads(response.read())
            if not pages:
                raise ConnectionError("No Chrome pages available")

            # Connect to first page
            ws_url = pages[0]["webSocketDebuggerUrl"]
            self.cdp_ws = websocket.WebSocket()
            self.cdp_ws.connect(ws_url)

            # Enable required CDP domains
            self._send_cdp("Page.enable", {})
            self._send_cdp("DOM.enable", {})
            self._send_cdp("Runtime.enable", {})

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

        # Wait for response (simple synchronous approach)
        while True:
            response = json.loads(self.cdp_ws.recv())
            if response.get("id") == msg_id:
                if "error" in response:
                    raise RuntimeError(f"CDP error: {response['error']}")
                return response.get("result", {})

    def start_unix_socket_server(self) -> None:
        """Start Unix socket server for CLI commands."""
        # Remove old socket if exists
        if self.socket_path.exists():
            self.socket_path.unlink()

        self.local_sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.local_sock.bind(str(self.socket_path))
        self.local_sock.listen(5)
        self.running = True

        print(f"Browser daemon listening on {self.socket_path}", file=sys.stderr)

        while self.running:
            try:
                conn, _ = self.local_sock.accept()
                thread = threading.Thread(target=self.handle_client, args=(conn,))
                thread.daemon = True
                thread.start()
            except Exception as e:
                if self.running:
                    print(f"Accept error: {e}", file=sys.stderr)

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
                if command == "status":
                    result = self.cmd_status()
                elif command == "quit":
                    result = self.cmd_quit()
                elif command == "navigate":
                    result = self.cmd_navigate(args.get("url"))
                elif command == "extract":
                    result = self.cmd_extract(args.get("selector"))
                elif command == "eval":
                    result = self.cmd_eval(args.get("script_file"))
                elif command == "snapshot":
                    result = self.cmd_snapshot(args.get("mode", "tree"))
                elif command == "click":
                    result = self.cmd_click(args.get("selector"))
                elif command == "type":
                    result = self.cmd_type(args.get("selector"), args.get("text"))
                elif command == "wait":
                    result = self.cmd_wait(args.get("selector"), args.get("timeout", 10))
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

    # Command implementations

    def cmd_status(self) -> Dict[str, Any]:
        """Get daemon status."""
        return {
            "status": "running",
            "connected_to_chrome": self.cdp_ws is not None,
            "current_url": self.current_url,
            "current_title": self.current_title
        }

    def cmd_quit(self) -> Dict[str, Any]:
        """Stop the daemon server loop."""
        self.running = False

        # Close socket to unblock accept()
        if self.local_sock:
            try:
                self.local_sock.close()
            except:
                pass

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
                self.chrome_process.wait(timeout=2)
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

    def cmd_navigate(self, url: str) -> Dict[str, Any]:
        """Navigate to URL."""
        if not url:
            return {"error": "url required"}

        # Navigate
        result = self._send_cdp("Page.navigate", {"url": url})

        # Wait for load
        time.sleep(1)  # Simple wait for now

        # Get page title
        title_result = self._send_cdp("Runtime.evaluate", {
            "expression": "document.title",
            "returnByValue": True
        })

        self.current_url = url
        self.current_title = title_result.get("result", {}).get("value", "")

        return {
            "success": True,
            "url": self.current_url,
            "title": self.current_title
        }

    def cmd_extract(self, selector: Optional[str]) -> Dict[str, Any]:
        """Extract text/HTML from element or page."""
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

        result = self._send_cdp("Runtime.evaluate", {
            "expression": expression,
            "returnByValue": True
        })

        value = result.get("result", {}).get("value")
        if value is None:
            return {"error": f"Selector not found: {selector}"}

        return {"success": True, "data": value}

    def cmd_eval(self, script_file: str) -> Dict[str, Any]:
        """Execute JavaScript from file in page context."""
        if not script_file:
            return {"error": "script_file required"}

        # Read JavaScript from file
        try:
            with open(script_file, 'r') as f:
                javascript = f.read()
        except FileNotFoundError:
            return {"error": f"Script file not found: {script_file}"}
        except Exception as e:
            return {"error": f"Failed to read script file: {e}"}

        result = self._send_cdp("Runtime.evaluate", {
            "expression": javascript,
            "returnByValue": True,
            "awaitPromise": True
        })

        if "exceptionDetails" in result:
            return {
                "error": "JavaScript exception",
                "details": result["exceptionDetails"]
            }

        return {
            "success": True,
            "result": result.get("result", {}).get("value")
        }

    def cmd_snapshot(self, mode: str = "tree") -> Dict[str, Any]:
        """Get page structure for element discovery."""
        if mode == "tree":
            # Accessibility tree
            try:
                result = self._send_cdp("Accessibility.getFullAXTree", {})
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

                return {"success": True, "mode": "tree", "nodes": simplified}
            except Exception as e:
                return {"error": f"Accessibility tree failed: {e}"}

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

            result = self._send_cdp("Runtime.evaluate", {
                "expression": expression,
                "returnByValue": True
            })

            return {
                "success": True,
                "mode": "dom",
                "structure": result.get("result", {}).get("value")
            }

        else:
            return {"error": f"Unknown mode: {mode}"}

    def cmd_click(self, selector: str) -> Dict[str, Any]:
        """Click an element."""
        if not selector:
            return {"error": "selector required"}

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

        result = self._send_cdp("Runtime.evaluate", {
            "expression": expression,
            "returnByValue": True
        })

        coords = result.get("result", {}).get("value")
        if not coords or not coords.get("found"):
            return {"error": f"Element not found: {selector}"}

        # Dispatch mouse click
        self._send_cdp("Input.dispatchMouseEvent", {
            "type": "mousePressed",
            "x": coords["x"],
            "y": coords["y"],
            "button": "left",
            "clickCount": 1
        })

        self._send_cdp("Input.dispatchMouseEvent", {
            "type": "mouseReleased",
            "x": coords["x"],
            "y": coords["y"],
            "button": "left",
            "clickCount": 1
        })

        return {"success": True, "clicked": selector}

    def cmd_type(self, selector: str, text: str) -> Dict[str, Any]:
        """Type text into an element."""
        if not selector:
            return {"error": "selector required"}
        if not text:
            return {"error": "text required"}

        # Focus element first
        focus_expr = f"""
            (function() {{
                const el = document.querySelector('{selector}');
                if (!el) return false;
                el.focus();
                return true;
            }})()
        """

        result = self._send_cdp("Runtime.evaluate", {
            "expression": focus_expr,
            "returnByValue": True
        })

        if not result.get("result", {}).get("value"):
            return {"error": f"Element not found: {selector}"}

        # Type text
        for char in text:
            self._send_cdp("Input.dispatchKeyEvent", {
                "type": "char",
                "text": char
            })

        return {"success": True, "typed": text, "into": selector}

    def cmd_wait(self, selector: str, timeout: int = 10) -> Dict[str, Any]:
        """Wait for element or text to appear."""
        if not selector:
            return {"error": "selector or text required"}

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

            result = self._send_cdp("Runtime.evaluate", {
                "expression": expression,
                "returnByValue": True
            })

            if result.get("result", {}).get("value"):
                return {"success": True, "found": selector, "time": time.time() - start_time}

            time.sleep(0.5)

        return {"error": f"Timeout waiting for: {selector}"}

    def run(self) -> None:
        """Main daemon loop."""
        # Setup signal handlers
        signal.signal(signal.SIGTERM, lambda s, f: self.cmd_quit())
        signal.signal(signal.SIGINT, lambda s, f: self.cmd_quit())

        try:
            # Start Chrome
            self.start_chrome()

            # Connect to Chrome
            self.connect_to_chrome()

            # Start socket server
            self.start_unix_socket_server()
        finally:
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

    args = parser.parse_args()

    if not args.browser_path:
        print(json.dumps({"error": "SUPERPOWERS_BROWSER_PATH environment variable not set"}))
        sys.exit(1)

    daemon = BrowserDaemon(browser_path=args.browser_path, debug_port=args.debug_port)
    daemon.run()


if __name__ == "__main__":
    main()
