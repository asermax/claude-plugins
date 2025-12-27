#!/bin/bash
set -e

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(dirname "$(dirname "$(realpath "$0")")")}"
VENV_DIR="$PLUGIN_ROOT/skills/using-browser/.venv"

# Fast check - if venv exists, skip setup
if [ -d "$VENV_DIR" ]; then
  exit 0
fi

# Check SUPERPOWERS_BROWSER_PATH is set
if [ -z "$SUPERPOWERS_BROWSER_PATH" ]; then
  echo "Warning: SUPERPOWERS_BROWSER_PATH not set. Configure it in Claude settings." >&2
fi

# Create venv and install deps
echo "Initializing browser skill environment..." >&2
uv venv "$VENV_DIR" >&2
source "$VENV_DIR/bin/activate"
uv pip install websocket-client >&2

echo "Browser skill environment initialized successfully" >&2
exit 0
