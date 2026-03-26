#!/usr/bin/env bash
# Validates mermaid diagram syntax using merval (lightweight, ~552KB)
# Usage: echo "flowchart TD; A-->B" | bash validate-mermaid.sh
#
# Accepts raw mermaid content from stdin (without ```mermaid fences).
# Outputs JSON with validation results.
# Exit code: 0 = valid, 1 = invalid, 2 = setup error

set -euo pipefail

CACHE_DIR="${HOME}/.cache/claude-plugins/merval"

if [ ! -d "$CACHE_DIR/node_modules/@aj-archipelago/merval" ]; then
  echo "Installing merval validator (one-time setup, ~552KB)..." >&2
  npm install --prefix "$CACHE_DIR" @aj-archipelago/merval --silent 2>/dev/null

  if [ $? -ne 0 ]; then
    echo '{"error": "Failed to install merval. Ensure npm and node are available."}' >&2
    exit 2
  fi
fi

NODE_PATH="$CACHE_DIR/node_modules" node -e "
const { validateMermaid } = require('@aj-archipelago/merval');

let data = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  const trimmed = data.trim();

  if (!trimmed) {
    console.log(JSON.stringify({ isValid: false, errors: [{ message: 'Empty input' }] }));
    process.exit(1);
  }

  const result = validateMermaid(trimmed);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.isValid ? 0 : 1);
});
"
