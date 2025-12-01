#!/usr/bin/env python3
"""
Multi-agent communication agent daemon.

Per-instance background process that manages file-based communication,
queues incoming messages, and exposes local socket for chat.py commands.
"""

import fcntl
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

try:
    from inotify_simple import INotify, flags
except ImportError:
    print("Error: inotify-simple not installed. Run: pip install inotify-simple", file=sys.stderr)
    sys.exit(1)


def get_runtime_dir():
    """Get runtime directory for chat files."""
    return Path(os.environ.get('XDG_RUNTIME_DIR', '/tmp'))


def get_chat_dir():
    """Get chat directory for registry and messages."""
    chat_dir = get_runtime_dir() / "claude-agent-chat"
    chat_dir.mkdir(exist_ok=True)
    (chat_dir / "messages").mkdir(exist_ok=True)
    return chat_dir


def get_registry_path():
    """Get path to registry file."""
    return get_chat_dir() / "registry.json"


def get_message_file_path(agent_name):
    """Get path to agent's message file."""
    return get_chat_dir() / "messages" / f"{agent_name}.jsonl"


def get_agent_socket_path(agent_name):
    """Get agent's local socket path."""
    runtime_dir = get_runtime_dir()
    return str(runtime_dir / f"claude-agent-{agent_name}.sock")


def read_registry():
    """Read registry with shared lock."""
    registry_path = get_registry_path()

    if not registry_path.exists():
        return {}

    with open(registry_path, 'r') as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_SH)
        try:
            data = f.read()
            return json.loads(data) if data else {}
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)


def write_registry(registry):
    """Write registry with exclusive lock."""
    registry_path = get_registry_path()

    with open(registry_path, 'w') as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)
        try:
            json.dump(registry, f, indent=2)
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)


def check_agent_alive(agent_name):
    """Check if agent is alive by probing its socket."""
    socket_path = get_agent_socket_path(agent_name)

    if not os.path.exists(socket_path):
        return False

    try:
        s = sock.socket(sock.AF_UNIX, sock.SOCK_STREAM)
        s.settimeout(1.0)
        s.connect(socket_path)
        s.close()
        return True
    except:
        return False


def append_message_to_file(agent_name, message):
    """Append message to agent's message file with exclusive lock."""
    message_file = get_message_file_path(agent_name)

    with open(message_file, 'a') as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)
        try:
            f.write(json.dumps(message) + '\n')
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)


def read_and_clear_messages(agent_name):
    """Read all messages from agent's file and clear it."""
    message_file = get_message_file_path(agent_name)

    if not message_file.exists():
        return []

    messages = []
    with open(message_file, 'r+') as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)
        try:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        messages.append(json.loads(line))
                    except json.JSONDecodeError:
                        print(f"Invalid JSON in message file: {line}", file=sys.stderr)

            f.seek(0)
            f.truncate()
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)

    return messages


class Agent:
    """Agent daemon."""

    def __init__(self, name, context, presentation, cwd):
        """Initialize agent."""
        self.name = name
        self.context = context
        self.presentation = presentation
        self.cwd = Path(cwd)

        self.local_sock = None
        self.local_socket_path = get_agent_socket_path(self.name)
        self.unread_file_path = self.cwd / ".unread-messages"
        self.message_file_path = get_message_file_path(self.name)

        self.message_queue = deque(maxlen=100)
        self.members = {}
        self.running = True
        self.message_event = threading.Event()

    def cleanup(self):
        """Clean up resources."""
        # Unregister from registry
        try:
            registry = read_registry()
            if self.name in registry:
                del registry[self.name]
                write_registry(registry)
        except Exception as e:
            print(f"Error unregistering: {e}", file=sys.stderr)

        # Close local socket
        if self.local_sock:
            self.local_sock.close()

        # Remove unread messages file
        self.clear_unread_file()

        # Remove local socket file
        if os.path.exists(self.local_socket_path):
            try:
                os.unlink(self.local_socket_path)
                print(f"Cleaned up agent socket: {self.local_socket_path}", file=sys.stderr)
            except OSError as e:
                print(f"Error cleaning up socket: {e}", file=sys.stderr)

        # Remove message file
        if self.message_file_path.exists():
            try:
                self.message_file_path.unlink()
            except Exception as e:
                print(f"Error removing message file: {e}", file=sys.stderr)

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

    def register(self):
        """Register agent in registry."""
        registry = read_registry()

        # Check if name already exists
        if self.name in registry:
            if check_agent_alive(self.name):
                print(f"Error: Agent name '{self.name}' already in use", file=sys.stderr)
                sys.exit(1)
            else:
                # Stale entry, clean it up
                print(f"Cleaning up stale entry for '{self.name}'", file=sys.stderr)
                del registry[self.name]

        # Add self to registry
        registry[self.name] = {
            'name': self.name,
            'context': self.context,
            'presentation': self.presentation,
            'joined_at': datetime.now(UTC).isoformat().replace('+00:00', 'Z'),
        }

        write_registry(registry)

        # Update local members cache
        self.members = {k: v for k, v in registry.items() if k != self.name}

        # Create message file if doesn't exist
        self.message_file_path.touch()

        print(f"Joined chat. {len(registry)} member(s) present.", file=sys.stderr)

        # Broadcast join message to other agents
        if self.members:
            join_msg = {
                'id': f"{self.name}-{datetime.now(UTC).isoformat().replace('+00:00', 'Z')}",
                'timestamp': datetime.now(UTC).isoformat().replace('+00:00', 'Z'),
                'type': 'join',
                'sender': {
                    'name': self.name,
                    'context': self.context,
                    'presentation': self.presentation,
                },
                'content': self.presentation,
            }

            for agent_name in self.members.keys():
                try:
                    append_message_to_file(agent_name, join_msg)
                except Exception as e:
                    print(f"Error sending join to {agent_name}: {e}", file=sys.stderr)

    def send_message_to_agents(self, content):
        """Send message to all other agents."""
        registry = read_registry()

        # Update members cache
        self.members = {k: v for k, v in registry.items() if k != self.name}

        if not self.members:
            return

        timestamp = datetime.now(UTC).isoformat().replace('+00:00', 'Z')
        msg = {
            'id': f"{self.name}-{timestamp}",
            'timestamp': timestamp,
            'type': 'message',
            'sender': {
                'name': self.name,
                'context': self.context,
                'presentation': self.presentation,
            },
            'content': content,
        }

        for agent_name in self.members.keys():
            try:
                append_message_to_file(agent_name, msg)
            except Exception as e:
                print(f"Error sending to {agent_name}: {e}", file=sys.stderr)

    def watch_messages_loop(self):
        """Background thread to watch for new messages using inotify."""
        inotify = INotify()
        watch_flags = flags.MODIFY | flags.CREATE | flags.MOVED_TO
        wd = inotify.add_watch(str(self.message_file_path.parent), watch_flags)

        while self.running:
            try:
                events = inotify.read(timeout=1000)  # 1s timeout for graceful shutdown

                # Filter for our message file
                our_events = [e for e in events if e.name == self.message_file_path.name]

                if our_events:
                    messages = read_and_clear_messages(self.name)

                    if messages:
                        for msg in messages:
                            msg_type = msg.get('type')

                            if msg_type == 'join':
                                # Update members
                                sender = msg.get('sender', {})
                                sender_name = sender.get('name')
                                if sender_name and sender_name != self.name:
                                    self.members[sender_name] = sender
                                    self.message_queue.append(msg)

                            elif msg_type == 'leave':
                                # Update members
                                sender = msg.get('sender', {})
                                sender_name = sender.get('name')
                                if sender_name and sender_name in self.members:
                                    del self.members[sender_name]
                                self.message_queue.append(msg)

                            elif msg_type == 'message':
                                # Queue message
                                sender = msg.get('sender', {})
                                if sender.get('name') != self.name:
                                    self.message_queue.append(msg)

                        # Update unread file
                        self.update_unread_file()
                        # Signal waiting receivers
                        self.message_event.set()

            except Exception as e:
                if self.running:
                    print(f"Error in watch loop: {e}", file=sys.stderr)
                    time.sleep(1)  # Backoff on error

        inotify.close()

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
            self.send_message_to_agents(content)
            return {'status': 'ok', 'data': {}}

        elif command == 'receive':
            timeout = cmd.get('args', {}).get('timeout', 30)
            messages = []

            # Clear event first (before draining - prevents race condition)
            self.message_event.clear()

            # Drain existing queue
            while self.message_queue:
                messages.append(self.message_queue.popleft())

            # If no messages yet, wait for event
            if not messages:
                got_event = self.message_event.wait(timeout=timeout)
                if got_event:
                    while self.message_queue:
                        messages.append(self.message_queue.popleft())

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
            conn = None
            try:
                conn, addr = self.local_sock.accept()

                # Receive command
                data = conn.recv(4096)
                cmd = json.loads(data.decode('utf-8'))

                # Handle command
                response = self.handle_command(cmd)

                # Send response
                conn.send(json.dumps(response).encode('utf-8'))

            except sock.timeout:
                continue
            except BrokenPipeError:
                # Client disconnected before receiving response - expected behavior
                pass
            except Exception as e:
                if self.running:
                    print(f"Error in local server: {e}", file=sys.stderr)
            finally:
                if conn:
                    try:
                        conn.close()
                    except:
                        pass

    def run(self):
        """Run the agent."""
        # Register
        self.register()

        # Start local server
        self.start_local_server()

        # Start watch thread
        watch_thread = threading.Thread(target=self.watch_messages_loop, daemon=True)
        watch_thread.start()

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
    # Ignore SIGPIPE - prevents process death when writing to closed sockets
    signal.signal(signal.SIGPIPE, signal.SIG_IGN)

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

        # Broadcast leave message
        if agent.members:
            leave_msg = {
                'id': f"{agent.name}-{datetime.now(UTC).isoformat().replace('+00:00', 'Z')}",
                'timestamp': datetime.now(UTC).isoformat().replace('+00:00', 'Z'),
                'type': 'leave',
                'sender': {
                    'name': agent.name,
                    'context': agent.context,
                    'presentation': agent.presentation,
                },
                'content': '',
            }

            for agent_name in agent.members.keys():
                try:
                    append_message_to_file(agent_name, leave_msg)
                except:
                    pass

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
