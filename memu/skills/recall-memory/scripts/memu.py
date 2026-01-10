#!/usr/bin/env python3
"""
memU CLI wrapper for Claude Code integration.

Provides memorize and retrieve operations with JSON output for the memU cloud API.
Uses only Python built-in libraries (no external dependencies).
"""

import argparse
import hashlib
import json
import os
import subprocess
import sys
import time
import urllib.request
import urllib.error
from typing import Dict, Any


API_BASE = "https://api.memu.so/api/v3/memory"


def get_api_key() -> str:
    """Get API key from environment, exit with clear error if missing."""
    api_key = os.getenv('MEMU_API_KEY')
    if not api_key:
        error_response = {
            "status": "error",
            "error": "MEMU_API_KEY environment variable not set. Get your API key from https://memu.so and set it with: export MEMU_API_KEY=your_key"
        }
        print(json.dumps(error_response), file=sys.stderr)
        sys.exit(1)
    return api_key


def get_project_id() -> str:
    """Derive unique project ID from git remote or folder name."""
    # Try git remote
    result = subprocess.run(
        ['git', 'remote', 'get-url', 'origin'],
        capture_output=True,
        text=True,
        cwd=os.getcwd()
    )

    if result.returncode == 0 and result.stdout.strip():
        # Hash git remote URL
        remote_url = result.stdout.strip()
        return hashlib.sha256(remote_url.encode()).hexdigest()[:16]

    # Fallback to current directory path
    cwd_path = os.getcwd()
    return hashlib.sha256(cwd_path.encode()).hexdigest()[:16]


def http_request(url: str, method: str = "GET", headers: Dict[str, str] = None,
                 data: Dict[str, Any] = None, timeout: int = 30) -> Dict[str, Any]:
    """
    Make HTTP request using urllib (built-in library).

    Args:
        url: Full URL to request
        method: HTTP method (GET, POST)
        headers: HTTP headers dict
        data: JSON data to send (for POST)
        timeout: Request timeout in seconds

    Returns:
        Response data as dict

    Raises:
        urllib.error.HTTPError, urllib.error.URLError
    """
    headers = headers or {}

    req_data = None
    if data:
        req_data = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'

    request = urllib.request.Request(
        url,
        data=req_data,
        headers=headers,
        method=method
    )

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            response_data = response.read().decode('utf-8')
            return json.loads(response_data)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        try:
            error_data = json.loads(error_body)
            raise Exception(f"HTTP {e.code}: {error_data.get('error', error_body)}")
        except json.JSONDecodeError:
            raise Exception(f"HTTP {e.code}: {error_body}")
    except urllib.error.URLError as e:
        raise Exception(f"Network error: {str(e.reason)}")


def memorize(conversation_data: str) -> Dict[str, Any]:
    """
    Memorize conversation data via memU API.

    Args:
        conversation_data: JSON string of conversation messages

    Returns:
        Dict with status and result data
    """
    api_key = get_api_key()
    project_id = get_project_id()

    try:
        # Parse conversation JSON
        messages = json.loads(conversation_data)

        # Prepare headers
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "modality": "conversation",
            "resource_data": messages,
            "user": {"user_id": project_id}
        }

        # Start memorization task
        task_data = http_request(
            f"{API_BASE}/memorize",
            method="POST",
            headers=headers,
            data=payload,
            timeout=30
        )

        task_id = task_data.get("task_id")

        if not task_id:
            return {
                "status": "error",
                "error": "No task_id returned from memU API"
            }

        # Poll for completion
        max_polls = 60  # 60 * 2s = 2 minutes max
        for _ in range(max_polls):
            time.sleep(2)

            status_data = http_request(
                f"{API_BASE}/memorize/status/{task_id}",
                method="GET",
                headers=headers,
                timeout=10
            )

            state = status_data.get("state", "")

            if state == "completed":
                return {
                    "status": "ok",
                    "message": "Conversation memorized successfully",
                    "data": status_data.get("result", {})
                }
            elif state == "failed":
                return {
                    "status": "error",
                    "error": status_data.get("error", "Memorization failed")
                }

        return {
            "status": "error",
            "error": "Memorization timeout - task did not complete in time"
        }

    except json.JSONDecodeError as e:
        return {
            "status": "error",
            "error": f"Invalid JSON input: {str(e)}"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": f"API request failed: {str(e)}"
        }


def retrieve(query: str, method: str = "rag") -> Dict[str, Any]:
    """
    Retrieve memories via memU API.

    Args:
        query: Query string
        method: "rag" (fast, default) or "llm" (deep semantic)

    Returns:
        Dict with status and retrieved data
    """
    api_key = get_api_key()
    project_id = get_project_id()

    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "queries": [{"role": "user", "content": {"text": query}}],
            "where": {"user_id": project_id},
            "method": method
        }

        result_data = http_request(
            f"{API_BASE}/retrieve",
            method="POST",
            headers=headers,
            data=payload,
            timeout=30
        )

        return {
            "status": "ok",
            "data": result_data
        }

    except Exception as e:
        return {
            "status": "error",
            "error": f"API request failed: {str(e)}"
        }


def main():
    parser = argparse.ArgumentParser(
        description='memU CLI for Claude Code',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    subparsers = parser.add_subparsers(dest='command', required=True, help='Command to execute')

    # memorize command
    mem_parser = subparsers.add_parser('memorize', help='Memorize conversation from stdin')

    # retrieve command
    ret_parser = subparsers.add_parser('retrieve', help='Retrieve memories')
    ret_parser.add_argument('--query', required=True, help='Query string')
    ret_parser.add_argument(
        '--method',
        default='rag',
        choices=['rag', 'llm'],
        help='Retrieval method: rag (fast, default) or llm (deep semantic)'
    )

    args = parser.parse_args()

    try:
        if args.command == 'memorize':
            # Read conversation from stdin
            conversation_data = sys.stdin.read()
            if not conversation_data.strip():
                result = {
                    "status": "error",
                    "error": "No conversation data provided on stdin"
                }
            else:
                result = memorize(conversation_data)

        elif args.command == 'retrieve':
            result = retrieve(args.query, args.method)

        else:
            result = {
                "status": "error",
                "error": f"Unknown command: {args.command}"
            }

        # Output JSON result
        print(json.dumps(result, indent=2))

        # Exit with error code if status is error
        if result.get("status") == "error":
            sys.exit(1)

    except Exception as e:
        error_result = {
            "status": "error",
            "error": f"Fatal error: {str(e)}"
        }
        print(json.dumps(error_result), file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
