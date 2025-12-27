#!/bin/bash
set -e

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(dirname "$(dirname "$(realpath "$0")")")}"
SKILL_DIR="$PLUGIN_ROOT/skills/using-browser"
LOCK_FILE="$SKILL_DIR/uv.lock"

# Fast check - if lock file exists, deps are synced
if [ -f "$LOCK_FILE" ]; then
  exit 0
fi

# Check SUPERPOWERS_BROWSER_PATH is set
if [ -z "$SUPERPOWERS_BROWSER_PATH" ]; then
  echo "Warning: SUPERPOWERS_BROWSER_PATH not set. Configure it in Claude settings." >&2
fi

# Sync dependencies
echo "Initializing browser skill environment..." >&2
cd "$SKILL_DIR"
uv sync >&2

echo "Browser skill environment initialized successfully" >&2
exit 0
