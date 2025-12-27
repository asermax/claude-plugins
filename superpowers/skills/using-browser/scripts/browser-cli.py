#!/usr/bin/env python3
"""
Browser CLI - sends commands to browser daemon via Unix socket.
"""

import argparse
import json
import os
import socket
import struct
import sys
from pathlib import Path


def send_command(command: str, args: dict) -> dict:
    """Send command to daemon and return response."""
    runtime_dir = Path(os.getenv("XDG_RUNTIME_DIR", "/tmp")) / "claude-browser"
    socket_path = runtime_dir / "browser.sock"

    if not socket_path.exists():
        return {"error": "Daemon not running (socket not found)"}

    sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    try:
        sock.connect(str(socket_path))

        # Send length-prefixed JSON message
        request = {"command": command, "args": args}
        payload = json.dumps(request).encode('utf-8')
        sock.sendall(struct.pack('>I', len(payload)) + payload)

        # Receive length-prefixed JSON response
        length_data = sock.recv(4)
        if not length_data:
            return {"error": "No response from daemon"}

        message_length = struct.unpack('>I', length_data)[0]
        response_data = b''
        while len(response_data) < message_length:
            chunk = sock.recv(message_length - len(response_data))
            if not chunk:
                break
            response_data += chunk

        return json.loads(response_data.decode('utf-8'))

    except Exception as e:
        return {"error": str(e)}
    finally:
        sock.close()


def main():
    parser = argparse.ArgumentParser(description="Browser CLI")
    subparsers = parser.add_subparsers(dest="command", help="Commands")

    # status
    subparsers.add_parser("status", help="Get daemon status")

    # quit
    subparsers.add_parser("quit", help="Stop daemon")

    # navigate
    nav_parser = subparsers.add_parser("navigate", help="Navigate to URL")
    nav_parser.add_argument("url", help="URL to navigate to")

    # extract
    extract_parser = subparsers.add_parser("extract", help="Extract text/HTML from element")
    extract_parser.add_argument("--selector", help="CSS selector (optional, extracts whole page if not provided)")

    # eval
    eval_parser = subparsers.add_parser("eval", help="Execute JavaScript from file")
    eval_parser.add_argument("script_file", help="Path to JavaScript file to execute")

    # snapshot
    snapshot_parser = subparsers.add_parser("snapshot", help="Get page structure")
    snapshot_parser.add_argument("--mode", choices=["tree", "dom"], default="tree",
                                help="Snapshot mode (tree=accessibility, dom=simplified DOM)")

    # click
    click_parser = subparsers.add_parser("click", help="Click element")
    click_parser.add_argument("selector", help="CSS selector")

    # type
    type_parser = subparsers.add_parser("type", help="Type text into element")
    type_parser.add_argument("selector", help="CSS selector")
    type_parser.add_argument("text", help="Text to type")

    # wait
    wait_parser = subparsers.add_parser("wait", help="Wait for element or text")
    wait_parser.add_argument("selector", help="CSS selector or text to wait for")
    wait_parser.add_argument("--timeout", type=int, default=10, help="Timeout in seconds")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    # Build command args
    cmd_args = {}
    if args.command == "navigate":
        cmd_args["url"] = args.url
    elif args.command == "extract":
        cmd_args["selector"] = getattr(args, "selector", None)
    elif args.command == "eval":
        cmd_args["script_file"] = args.script_file
    elif args.command == "snapshot":
        cmd_args["mode"] = args.mode
    elif args.command == "click":
        cmd_args["selector"] = args.selector
    elif args.command == "type":
        cmd_args["selector"] = args.selector
        cmd_args["text"] = args.text
    elif args.command == "wait":
        cmd_args["selector"] = args.selector
        cmd_args["timeout"] = args.timeout

    # Send command
    response = send_command(args.command, cmd_args)

    # Output JSON
    print(json.dumps(response, indent=2))

    # Exit code
    sys.exit(0 if response.get("success") or response.get("status") else 1)


if __name__ == "__main__":
    main()
