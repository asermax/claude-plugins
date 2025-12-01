#!/usr/bin/env python3
"""
Multi-agent communication agent daemon.

Per-instance background process that maintains connection to broker,
queues incoming messages, and exposes local socket for chat.py commands.
"""

import zmq
import json
import os
import sys
import atexit
import signal
import argparse
import time
from datetime import datetime, UTC
from pathlib import Path
from collections import deque
import threading
import socket as sock


def get_runtime_dir():
    """Get runtime directory for socket files."""
    return Path(os.environ.get('XDG_RUNTIME_DIR', '/tmp'))


def get_broker_paths():
    """Get broker socket paths."""
    runtime_dir = get_runtime_dir()
    return {
        'pub': str(runtime_dir / "claude-agent-chat-pub.sock"),
        'sub': str(runtime_dir / "claude-agent-chat-sub.sock"),
    }


def get_agent_socket_path(agent_name):
    """Get agent's local socket path."""
    runtime_dir = get_runtime_dir()
    return str(runtime_dir / f"claude-agent-{agent_name}.sock")


class Agent:
    """Agent daemon."""

    def __init__(self, name, context, presentation, cwd):
        """Initialize agent."""
        self.name = name
        self.context = context
        self.presentation = presentation
        self.cwd = Path(cwd)

        self.zmq_ctx = None
        self.pub_sock = None
        self.sub_sock = None
        self.local_sock = None
        self.local_socket_path = get_agent_socket_path(self.name)
        self.unread_file_path = self.cwd / ".unread-messages"

        self.message_queue = deque(maxlen=100)
        self.members = {}
        self.running = True

    def cleanup(self):
        """Clean up resources."""
        # Send leave message
        if self.pub_sock:
            try:
                self.send_message('leave', '')
            except:
                pass

        # Close sockets
        if self.pub_sock:
            self.pub_sock.close()
        if self.sub_sock:
            self.sub_sock.close()
        if self.local_sock:
            self.local_sock.close()
        if self.zmq_ctx:
            self.zmq_ctx.term()

        # Remove unread messages file
        self.clear_unread_file()

        # Remove local socket file
        if os.path.exists(self.local_socket_path):
            try:
                os.unlink(self.local_socket_path)
                print(f"Cleaned up agent socket: {self.local_socket_path}", file=sys.stderr)
            except OSError as e:
                print(f"Error cleaning up socket: {e}", file=sys.stderr)

    def connect_to_broker(self):
        """Connect to broker. Fails if broker not running."""
        paths = get_broker_paths()

        # Check if broker sockets exist
        if not os.path.exists(paths['pub']) or not os.path.exists(paths['sub']):
            print(f"Error: Broker not running", file=sys.stderr)
            print(f"Expected sockets at:", file=sys.stderr)
            print(f"  {paths['pub']}", file=sys.stderr)
            print(f"  {paths['sub']}", file=sys.stderr)
            sys.exit(3)  # Special exit code for "broker not running"

        # Initialize ZeroMQ
        self.zmq_ctx = zmq.Context()

        # PUB socket - send messages to broker
        self.pub_sock = self.zmq_ctx.socket(zmq.PUB)
        self.pub_sock.connect(f"ipc://{paths['pub']}")

        # SUB socket - receive messages from broker
        self.sub_sock = self.zmq_ctx.socket(zmq.SUB)
        self.sub_sock.connect(f"ipc://{paths['sub']}")
        self.sub_sock.subscribe(b"")  # Subscribe to all messages

        # Small delay to allow ZeroMQ connections to establish (slow joiner problem)
        time.sleep(0.1)

        print(f"Connected to broker", file=sys.stderr)

    def update_unread_file(self):
        """Update .unread-messages file with current queue size."""
        count = len(self.message_queue)
        if count > 0:
            try:
                self.unread_file_path.write_text(str(count))
            except Exception as e:
                print(f"Error updating unread file: {e}", file=sys.stderr)

    def clear_unread_file(self):
        """Remove .unread-messages file when messages are read."""
        if self.unread_file_path.exists():
            try:
                self.unread_file_path.unlink()
            except Exception as e:
                print(f"Error clearing unread file: {e}", file=sys.stderr)

    def send_message(self, msg_type, content):
        """Send a message to the broker."""
        timestamp = datetime.now(UTC).isoformat().replace('+00:00', 'Z')
        msg = {
            'id': f"{self.name}-{timestamp}",
            'timestamp': timestamp,
            'type': msg_type,
            'sender': {
                'name': self.name,
                'context': self.context,
                'presentation': self.presentation,
            },
            'content': content,
        }

        self.pub_sock.send(json.dumps(msg).encode('utf-8'))

    def join(self):
        """Send join message and wait for members response."""
        self.send_message('join', self.presentation)

        # Wait for members message
        poller = zmq.Poller()
        poller.register(self.sub_sock, zmq.POLLIN)

        timeout = 5000  # 5 seconds
        events = dict(poller.poll(timeout))

        if self.sub_sock in events:
            raw_msg = self.sub_sock.recv()
            msg = json.loads(raw_msg.decode('utf-8'))

            if msg.get('type') == 'members':
                self.members = msg.get('content', {})
                print(f"Joined chat. {len(self.members)} member(s) present.", file=sys.stderr)
            else:
                # Put back in queue
                self.message_queue.append(msg)
        else:
            print("Error: Broker not responding", file=sys.stderr)
            print("No members response received within timeout", file=sys.stderr)
            sys.exit(4)  # Exit code 4: broker not responding

    def receive_messages_loop(self):
        """Background thread to receive messages from broker."""
        while self.running:
            try:
                if self.sub_sock.poll(timeout=1000):
                    raw_msg = self.sub_sock.recv()
                    msg = json.loads(raw_msg.decode('utf-8'))

                    # Filter out messages targeted to other agents
                    if 'target' in msg and msg['target'] != self.name:
                        continue

                    msg_type = msg.get('type')

                    if msg_type == 'join':
                        # Update members
                        sender = msg.get('sender', {})
                        sender_name = sender.get('name')
                        if sender_name and sender_name != self.name:
                            self.members[sender_name] = sender
                            self.message_queue.append(msg)
                            self.update_unread_file()

                    elif msg_type == 'leave':
                        # Update members
                        sender = msg.get('sender', {})
                        sender_name = sender.get('name')
                        if sender_name and sender_name in self.members:
                            del self.members[sender_name]
                        self.message_queue.append(msg)
                        self.update_unread_file()

                    elif msg_type == 'message':
                        # Queue message if not from self
                        sender = msg.get('sender', {})
                        if sender.get('name') != self.name:
                            self.message_queue.append(msg)
                            self.update_unread_file()

            except Exception as e:
                if self.running:
                    print(f"Error in receive loop: {e}", file=sys.stderr)

    def start_local_server(self):
        """Start local Unix socket server for chat.py commands."""
        # Remove stale socket
        if os.path.exists(self.local_socket_path):
            os.unlink(self.local_socket_path)

        # Create Unix socket
        self.local_sock = sock.socket(sock.AF_UNIX, sock.SOCK_STREAM)
        self.local_sock.bind(self.local_socket_path)
        self.local_sock.listen(5)
        self.local_sock.settimeout(1.0)

        print(f"Agent listening on {self.local_socket_path}", file=sys.stderr)
        print(f"Agent name: {self.name}", file=sys.stderr)

    def handle_command(self, cmd):
        """Handle command from chat.py."""
        command = cmd.get('command')

        if command == 'send':
            # Block sending if there are unread messages
            if self.message_queue:
                return {
                    'status': 'error',
                    'error': f'Cannot send: {len(self.message_queue)} unread message(s). Use "receive" first.'
                }

            content = cmd.get('args', {}).get('content', '')
            self.send_message('message', content)
            return {'status': 'ok', 'data': {}}

        elif command == 'receive':
            timeout = cmd.get('args', {}).get('timeout', 30)
            messages = []

            # First, drain existing queue
            while self.message_queue:
                messages.append(self.message_queue.popleft())

            # If no messages yet, wait for timeout
            if not messages:
                start_time = time.time()
                while time.time() - start_time < timeout:
                    if self.message_queue:
                        while self.message_queue:
                            messages.append(self.message_queue.popleft())
                        break
                    time.sleep(0.1)  # Poll every 100ms

            # Clear unread file since messages have been read
            self.clear_unread_file()

            return {'status': 'ok', 'data': {'messages': messages}}

        elif command == 'status':
            return {
                'status': 'ok',
                'data': {
                    'agent': {
                        'name': self.name,
                        'context': self.context,
                    },
                    'members': self.members,
                    'queue_size': len(self.message_queue),
                }
            }

        else:
            return {'status': 'error', 'error': f'Unknown command: {command}'}

    def run_local_server(self):
        """Run local server loop."""
        while self.running:
            try:
                conn, addr = self.local_sock.accept()

                # Receive command
                data = conn.recv(4096)
                cmd = json.loads(data.decode('utf-8'))

                # Handle command
                response = self.handle_command(cmd)

                # Send response
                conn.send(json.dumps(response).encode('utf-8'))
                conn.close()

            except sock.timeout:
                continue
            except Exception as e:
                if self.running:
                    print(f"Error in local server: {e}", file=sys.stderr)

    def run(self):
        """Run the agent."""
        # Connect to broker
        self.connect_to_broker()

        # Join the chat
        self.join()

        # Start local server
        self.start_local_server()

        # Start receive thread
        receive_thread = threading.Thread(target=self.receive_messages_loop, daemon=True)
        receive_thread.start()

        # Run local server
        self.run_local_server()


def get_parent_cwd():
    """Get the working directory of the parent process."""
    try:
        parent_pid = os.getppid()
        # Read the cwd from /proc filesystem (Linux)
        cwd_link = f"/proc/{parent_pid}/cwd"
        if os.path.exists(cwd_link):
            return os.readlink(cwd_link)
    except Exception as e:
        print(f"Warning: Could not determine parent cwd: {e}", file=sys.stderr)

    # Fallback to current directory
    return os.getcwd()


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Agent daemon for multi-agent communication')
    parser.add_argument('--name', required=True, help='Agent name')
    parser.add_argument('--context', required=True, help='Agent context (e.g., project/repo)')
    parser.add_argument('--presentation', required=True, help='Agent self-presentation')
    parser.add_argument('--cwd', required=False, help='Working directory for unread notifications (default: auto-detect from parent process)')

    args = parser.parse_args()

    # Use provided cwd or auto-detect from parent process
    cwd = args.cwd if args.cwd else get_parent_cwd()

    agent = Agent(args.name, args.context, args.presentation, cwd)

    # Register cleanup
    atexit.register(agent.cleanup)

    # Handle signals
    def signal_handler(sig, frame):
        print("\nAgent shutting down...", file=sys.stderr)
        agent.running = False
        agent.cleanup()
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        agent.run()
    except Exception as e:
        print(f"Fatal error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
