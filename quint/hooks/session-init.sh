#!/bin/bash
set -e

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(dirname "$(dirname "$(realpath "$0")")")}"
BINARY_PATH="$PLUGIN_ROOT/bin/quint-code"
CACHE_DIR="$HOME/.cache/claude-plugins/quint-code"
PATCH_FILE="$PLUGIN_ROOT/patches/init-skip-claude-setup.patch"
CONTEXT_FILE="$PLUGIN_ROOT/context/PRINCIPLES.md"

# Fast check - if binary exists, skip build
if [ -f "$BINARY_PATH" ]; then
  # Just inject context
  if [ -f "$CONTEXT_FILE" ]; then
    jq -Rs '{hookSpecificOutput: {hookEventName: "SessionStart", additionalContext: .}}' < "$CONTEXT_FILE"
  fi
  exit 0
fi

# Clone or update repo
if [ ! -d "$CACHE_DIR" ]; then
  git clone https://github.com/m0n0x41d/quint-code.git "$CACHE_DIR" >&2
fi

# Apply patch, build, revert patch
cd "$CACHE_DIR"
git checkout -- . >&2
git pull origin main >&2
git apply "$PATCH_FILE" >&2

mkdir -p "$PLUGIN_ROOT/bin" >&2
cd src/mcp
go build -o "$BINARY_PATH" -trimpath . >&2
chmod +x "$BINARY_PATH" >&2

cd "$CACHE_DIR"
git checkout -- src/mcp/cmd/init.go >&2

echo "quint-code binary built successfully" >&2

# Inject context
if [ -f "$CONTEXT_FILE" ]; then
  jq -Rs '{hookSpecificOutput: {hookEventName: "SessionStart", additionalContext: .}}' < "$CONTEXT_FILE"
fi

exit 0
