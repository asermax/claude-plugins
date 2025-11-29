#!/usr/bin/env python3
"""
Multi-agent communication broker.

Central message router that maintains member registry and coordinates
agent join/leave synchronization.
"""

import zmq
import json
import os
import sys
import atexit
import signal
from datetime import datetime, UTC
from pathlib import Path


def get_runtime_dir():
    """Get runtime directory for socket files."""
    return Path(os.environ.get('XDG_RUNTIME_DIR', '/tmp'))


def get_socket_paths():
    """Get broker socket paths."""
    runtime_dir = get_runtime_dir()
    return {
        'pub': str(runtime_dir / "claude-agent-chat-pub.sock"),
        'sub': str(runtime_dir / "claude-agent-chat-sub.sock"),
    }


def cleanup_sockets():
    """Remove socket files on shutdown."""
    paths = get_socket_paths()

    for name, path in paths.items():
        if os.path.exists(path):
            try:
                os.unlink(path)
                print(f"Cleaned up {name} socket: {path}", file=sys.stderr)
            except OSError as e:
                print(f"Error cleaning up {name} socket: {e}", file=sys.stderr)


def main():
    """Run the broker."""
    paths = get_socket_paths()

    # Remove stale sockets from previous run
    for path in paths.values():
        if os.path.exists(path):
            os.unlink(path)

    # Register cleanup handler
    atexit.register(cleanup_sockets)

    # Handle signals gracefully
    def signal_handler(sig, frame):
        print("\nBroker shutting down...", file=sys.stderr)
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Initialize ZeroMQ context
    ctx = zmq.Context()

    # SUB socket - receives messages from agents
    frontend = ctx.socket(zmq.SUB)
    frontend.bind(f"ipc://{paths['pub']}")
    frontend.subscribe(b"")  # Subscribe to all messages

    # PUB socket - broadcasts to agents
    backend = ctx.socket(zmq.PUB)
    backend.bind(f"ipc://{paths['sub']}")

    print(f"Broker started", file=sys.stderr)
    print(f"  SUB: ipc://{paths['pub']}", file=sys.stderr)
    print(f"  PUB: ipc://{paths['sub']}", file=sys.stderr)

    # Member registry
    members = {}

    try:
        while True:
            # Receive message from agent
            raw_msg = frontend.recv()

            try:
                msg = json.loads(raw_msg.decode('utf-8'))
            except json.JSONDecodeError:
                print(f"Invalid JSON received: {raw_msg}", file=sys.stderr)
                continue

            msg_type = msg.get('type')
            sender = msg.get('sender', {})
            sender_name = sender.get('name')

            if msg_type == 'join':
                # Add to registry
                members[sender_name] = {
                    'name': sender.get('name'),
                    'context': sender.get('context'),
                    'presentation': sender.get('presentation'),
                    'joined_at': msg.get('timestamp'),
                }

                print(f"Agent joined: {sender_name}", file=sys.stderr)

                # Send members registry to new joiner only
                members_msg = {
                    'id': f"members-{sender_name}",
                    'timestamp': datetime.now(UTC).isoformat().replace('+00:00', 'Z'),
                    'type': 'members',
                    'sender': {'name': 'broker'},
                    'content': members,
                    'target': sender_name,  # Target specific agent
                }
                backend.send(json.dumps(members_msg).encode('utf-8'))

                # Broadcast join to all other agents
                backend.send(raw_msg)

            elif msg_type == 'leave':
                # Remove from registry
                if sender_name in members:
                    del members[sender_name]
                    print(f"Agent left: {sender_name}", file=sys.stderr)

                # Broadcast leave to all agents
                backend.send(raw_msg)

            elif msg_type == 'message':
                # Forward message to all agents
                print(f"Message from {sender.get('name')}: {msg.get('content')[:50]}...", file=sys.stderr)
                backend.send(raw_msg)

            else:
                print(f"Unknown message type: {msg_type}", file=sys.stderr)

    except KeyboardInterrupt:
        pass

    finally:
        frontend.close()
        backend.close()
        ctx.term()
        print("Broker stopped", file=sys.stderr)


if __name__ == '__main__':
    main()
