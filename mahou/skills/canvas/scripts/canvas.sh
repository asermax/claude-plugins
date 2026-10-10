#!/usr/bin/env bash
# Runs a tldraw canvas over one document, <folder>/<name>.tldr.json.
#
#   canvas.sh start   <document>  install on first run, start the server detached, print its URL
#   canvas.sh watch   <document>  start if needed, then print one line per "Send to Claude" click or voice message
#   canvas.sh export  <document>  write <folder>/<name>.svg from the open document
#   canvas.sh texts   <document>  print every canvas text and arrow label, one per line
#   canvas.sh migrate <document>  bring a document saved by an older version of the app to the current format
#   canvas.sh stop    <document>  stop the server
#
# The app and its dependencies live in a cache folder outside the plugin, because plugin updates replace the
# plugin's directory. Every document in a folder shares the folder's mockups/.
set -euo pipefail

USAGE="usage: canvas.sh <start|watch|export|texts|migrate|stop> <folder>/<name>.tldr.json"
COMMAND="${1:?$USAGE}"
DOC="$(realpath -m "${2:?$USAGE}")"
DOC_DIR="$(dirname "$DOC")"

if [[ "$DOC" != *.tldr.json ]]; then
  echo "$USAGE" >&2
  exit 1
fi

SKILL_APP="$(cd "$(dirname "${BASH_SOURCE[0]}")/app" && pwd)"
CACHE="${XDG_CACHE_HOME:-$HOME/.cache}/mahou-canvas"
APP="$CACHE/app"
PORT="${CANVAS_PORT:-5190}"
URL="http://localhost:$PORT"
PID_FILE="$CACHE/server.pid"

# The document the canvas on the port serves, or nothing. Any other server on the port answers with something else.
serving() {
  local answer
  answer="$(curl -sf "$URL/api/health" 2>/dev/null || true)"

  [[ "$answer" == /* && "$answer" != *$'\n'* && "$answer" != *'<'* ]] && echo "$answer" || true
}

install() {
  mkdir -p "$APP"
  rsync -a --delete --exclude node_modules --exclude package-lock.json "$SKILL_APP/" "$APP/"

  # npm, not pnpm: pnpm refuses to run esbuild's install script until the build is approved
  if [[ ! -d "$APP/node_modules" || "$APP/package.json" -nt "$APP/node_modules" ]]; then
    (cd "$APP" && npm install --no-audit --no-fund --loglevel=error >/dev/null)
    touch "$APP/node_modules"
  fi
}

document_cli() {
  install
  node "$APP/document/cli.ts" "$1" "$DOC"
}

scaffold() {
  mkdir -p "$DOC_DIR/mockups"
}

stop() {
  [[ -f "$PID_FILE" ]] && kill "$(cat "$PID_FILE")" 2>/dev/null || true
  rm -f "$PID_FILE"

  for _ in $(seq 20); do
    [[ -z "$(serving)" ]] && return
    sleep 0.25
  done
}

start() {
  local current
  current="$(serving)"

  if [[ "$current" == "$DOC" ]]; then
    echo "$URL"
    return
  fi

  # One server serves one document at a time, and the other document is already on disk
  if [[ -n "$current" ]]; then
    echo "stopping the canvas for $current" >&2
    stop
  fi

  if curl -s -o /dev/null "$URL"; then
    echo "port $PORT is taken by another server; set CANVAS_PORT to use another port" >&2
    exit 1
  fi

  # An older document would be served in a format the app no longer reads, and its edits saved over it
  if ! document_cli check; then
    exit 1
  fi

  scaffold

  # Detached, so the server outlives the shell that started it and any background time limit
  CANVAS_DOC="$DOC" setsid nohup "$APP/node_modules/.bin/vite" --config "$APP/vite.config.ts" --port "$PORT" --strictPort \
    >"$CACHE/server.log" 2>&1 </dev/null &
  echo $! >"$PID_FILE"

  for _ in $(seq 60); do
    [[ "$(serving)" == "$DOC" ]] && { echo "$URL"; return; }
    sleep 0.5
  done

  echo "the server did not come up; its log is $CACHE/server.log" >&2
  exit 1
}

case "$COMMAND" in
  start)
    start
    ;;
  watch)
    start >/dev/null
    curl -sN "$URL/api/events" | sed -u -n 's/^data: //p'
    ;;
  export)
    start >/dev/null
    # Its own browser session, so the export leaves Claude's open tab alone
    agent-browser --session canvas-export open "$URL?user=export" >/dev/null
    agent-browser --session canvas-export wait --fn "window.editor != null" >/dev/null
    agent-browser --session canvas-export eval "(async () => { await document.fonts.ready; const e = window.editor; e.selectNone(); const r = await e.getSvgString([...e.getCurrentPageShapeIds()], { background: true, padding: 64 }); return await fetch('/api/export', { method: 'POST', body: r.svg }).then((response) => response.text()) })()"
    agent-browser --session canvas-export close >/dev/null
    ;;
  texts)
    document_cli texts
    ;;
  migrate)
    if [[ "$(serving)" == "$DOC" ]]; then
      echo "stop the canvas before migrating its document" >&2
      exit 1
    fi

    document_cli migrate
    ;;
  stop)
    stop
    ;;
  *)
    echo "unknown command: $COMMAND" >&2
    exit 1
    ;;
esac
