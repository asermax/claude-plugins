#!/usr/bin/env bash
# telepathy.sh <scratch-folder> [--port N] [--agent TARGET] [--no-open]
# Serves .scratch/<scratch-folder>/ from the current directory. Installs the
# server's dependencies next to this script on first run.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -d "$here/node_modules" ]; then
  bun install --cwd "$here" --frozen-lockfile --production >&2
fi

exec bun "$here/src/server.ts" "$@"
