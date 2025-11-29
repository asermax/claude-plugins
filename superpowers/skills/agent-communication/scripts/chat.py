#!/usr/bin/env python3
"""
Multi-agent communication CLI.

Foreground tool for Claude to interact with agent daemon.
Commands: send, receive, status
"""

import sys
import json
import argparse
import socket
import os
from pathlib import Path


def get_runtime_dir():
    """Get runtime directory for socket files."""
    return Path(os.environ.get('XDG_RUNTIME_DIR', '/tmp'))


def send_command(sock_path, command, args=None):
    """Send command to agent and return response."""
    if args is None:
        args = {}

    try:
        # Connect to agent
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        sock.connect(sock_path)

        # Send command
        cmd = {
            'command': command,
            'args': args,
        }
        sock.send(json.dumps(cmd).encode('utf-8'))

        # Receive response
        data = sock.recv(4096)
        response = json.loads(data.decode('utf-8'))

        sock.close()

        return response

    except socket.error as e:
        return {
            'status': 'error',
            'error': f'Cannot connect to agent: {e}'
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }


def cmd_send(args, sock_path):
    """Send a message."""
    response = send_command(sock_path, 'send', {'content': args.message})

    if response['status'] == 'ok':
        print(json.dumps({'status': 'ok', 'message': 'Message sent'}))
        return 0
    else:
        print(json.dumps(response))
        return 1


def cmd_receive(args, sock_path):
    """Receive messages."""
    response = send_command(sock_path, 'receive', {'timeout': args.timeout})

    if response['status'] == 'ok':
        messages = response['data']['messages']
        print(json.dumps({'status': 'ok', 'messages': messages}, indent=2))
        return 0 if messages else 2  # Exit code 2 if no messages (timeout)
    else:
        print(json.dumps(response))
        return 1


def cmd_status(args, sock_path):
    """Show status."""
    response = send_command(sock_path, 'status')

    if response['status'] == 'ok':
        print(json.dumps({'status': 'ok', 'data': response['data']}, indent=2))
        return 0
    else:
        print(json.dumps(response))
        return 1


def cmd_ask(args, sock_path):
    """Send a message and wait for response."""
    # First, send the message
    send_response = send_command(sock_path, 'send', {'content': args.message})

    if send_response['status'] != 'ok':
        print(json.dumps(send_response))
        return 1

    print(json.dumps({'status': 'ok', 'message': 'Message sent, waiting for response...'}), file=sys.stderr)

    # Then wait for responses
    receive_response = send_command(sock_path, 'receive', {'timeout': args.timeout})

    if receive_response['status'] == 'ok':
        messages = receive_response['data']['messages']
        print(json.dumps({'status': 'ok', 'messages': messages}, indent=2))
        return 0 if messages else 2  # Exit code 2 if no messages (timeout)
    else:
        print(json.dumps(receive_response))
        return 1


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Multi-agent communication CLI',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  chat.py --agent plugins-agent send "Hello other agents!"
  chat.py --agent plugins-agent receive --timeout 30
  chat.py --agent plugins-agent ask "What's the API format?" --timeout 60
  chat.py --agent plugins-agent status
        """
    )

    parser.add_argument('--agent', required=True, help='Agent name')

    subparsers = parser.add_subparsers(dest='command', help='Command to execute')

    # send command
    send_parser = subparsers.add_parser('send', help='Send a message')
    send_parser.add_argument('message', help='Message content')

    # receive command
    receive_parser = subparsers.add_parser('receive', help='Receive messages')
    receive_parser.add_argument('--timeout', type=int, default=30, help='Timeout in seconds')

    # ask command (send + receive)
    ask_parser = subparsers.add_parser('ask', help='Send a message and wait for response')
    ask_parser.add_argument('message', help='Message content')
    ask_parser.add_argument('--timeout', type=int, default=30, help='Timeout in seconds to wait for response')

    # status command
    status_parser = subparsers.add_parser('status', help='Show agent status and members')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 1

    # Get agent socket path
    runtime_dir = get_runtime_dir()
    sock_path = str(runtime_dir / f"claude-agent-{args.agent}.sock")

    if not os.path.exists(sock_path):
        print(json.dumps({
            'status': 'error',
            'error': f'Agent socket not found: {sock_path}'
        }))
        return 1

    # Execute command
    if args.command == 'send':
        return cmd_send(args, sock_path)
    elif args.command == 'receive':
        return cmd_receive(args, sock_path)
    elif args.command == 'ask':
        return cmd_ask(args, sock_path)
    elif args.command == 'status':
        return cmd_status(args, sock_path)
    else:
        print(json.dumps({
            'status': 'error',
            'error': f'Unknown command: {args.command}'
        }))
        return 1


if __name__ == '__main__':
    sys.exit(main())
