#!/bin/bash
set -e

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(dirname "$(dirname "$(realpath "$0")")")}"
CONTEXT_FILE="$PLUGIN_ROOT/hooks/BEADS.md"

if [ -f "$CONTEXT_FILE" ]; then
  jq -Rs '{hookSpecificOutput: {hookEventName: "SessionStart", additionalContext: .}}' < "$CONTEXT_FILE"
fi

exit 0
