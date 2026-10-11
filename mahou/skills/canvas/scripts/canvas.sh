#!/usr/bin/env bash
# Runs a tldraw canvas over one document, <folder>/<name>.tldr.json.
#
#   canvas.sh start   <document>  install on first run, start the server detached, print its URL
#   canvas.sh watch   <document>  start if needed, then print one line per "Send to Claude" click or voice message
#   canvas.sh export  <document>  write <folder>/<name>.svg from the open document
#   canvas.sh texts   <document>  print every canvas text and arrow label, one per line
#   canvas.sh migrate <document>  bring a document saved by an older version of the app to the current format
#   canvas.sh stop    <document>  stop the document's server
#
# Each document gets its own server on the first free port from 5190 up, or on CANVAS_PORT when it is set. Its
# document, port and PID are kept in a state file in the cache, keyed by a hash of the document's path.
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
SERVERS="$CACHE/servers"
FIRST_PORT=5190
LAST_PORT=5289

# One server per document, so the state, the log and the port belong to that document alone
KEY="$(printf '%s' "$DOC" | { sha256sum 2>/dev/null || shasum -a 256; } | cut -c1-16)"
STATE="$SERVERS/$KEY.state"
LOG="$SERVERS/$KEY.log"

# The document the canvas on a port serves, or nothing. Any other server on the port answers with something else.
serving() {
  local answer
  answer="$(curl -sf --max-time 2 "http://localhost:$1/api/health" 2>/dev/null || true)"

  [[ "$answer" == /* && "$answer" != *$'\n'* && "$answer" != *'<'* ]] && echo "$answer" || true
}

# curl exits with 7 only when nothing accepts the connection; any other result means something listens there
port_free() {
  local code=0
  curl -s -o /dev/null --max-time 2 "http://localhost:$1" || code=$?

  [[ "$code" == 7 ]]
}

# A state file is stale once its process is gone or its port serves something other than its document
state_alive() {
  local doc port pid
  { read -r doc; read -r port; read -r pid; } <"$1" || return 1

  kill -0 "$pid" 2>/dev/null && [[ "$(serving "$port")" == "$doc" ]]
}

sweep() {
  local state

  for state in "$SERVERS"/*.state; do
    [[ -f "$state" ]] || continue

    if ! state_alive "$state"; then
      rm -f "$state"
    fi
  done
}

# Sets PORT and PID from this document's state file when its server is up and confirmed by the health check
find_server() {
  [[ -f "$STATE" ]] || return 1

  if ! state_alive "$STATE"; then
    rm -f "$STATE"
    return 1
  fi

  { read -r _; read -r PORT; read -r PID; } <"$STATE"
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
  find_server || return 0

  kill "$PID" 2>/dev/null || true
  rm -f "$STATE"

  for _ in $(seq 20); do
    kill -0 "$PID" 2>/dev/null || return 0
    sleep 0.25
  done
}

# Starts the server on one port and waits for it; fails when the process exits, as vite does when the port is taken
launch() {
  local port="$1" pid

  # Detached, so the server outlives the shell that started it and any background time limit
  CANVAS_DOC="$DOC" setsid nohup "$APP/node_modules/.bin/vite" --config "$APP/vite.config.ts" --port "$port" --strictPort \
    >"$LOG" 2>&1 </dev/null &
  pid=$!

  for _ in $(seq 60); do
    if [[ "$(serving "$port")" == "$DOC" ]]; then
      printf '%s\n%s\n%s\n' "$DOC" "$port" "$pid" >"$STATE"
      echo "http://localhost:$port"
      return 0
    fi

    kill -0 "$pid" 2>/dev/null || return 1
    sleep 0.5
  done

  kill "$pid" 2>/dev/null || true
  return 1
}

start() {
  mkdir -p "$SERVERS"
  sweep

  if find_server; then
    echo "http://localhost:$PORT"
    return
  fi

  # An older document would be served in a format the app no longer reads, and its edits saved over it
  if ! document_cli check; then
    exit 1
  fi

  scaffold

  if [[ -n "${CANVAS_PORT:-}" ]]; then
    if ! port_free "$CANVAS_PORT"; then
      echo "port $CANVAS_PORT is taken by another server; unset CANVAS_PORT to pick a free port" >&2
      exit 1
    fi

    launch "$CANVAS_PORT" && return
    echo "the server did not come up; its log is $LOG" >&2
    exit 1
  fi

  local port
  for port in $(seq "$FIRST_PORT" "$LAST_PORT"); do
    # A server started before the state files existed has none, and a second one would write the same document
    if [[ "$(serving "$port")" == "$DOC" ]]; then
      echo "http://localhost:$port"
      return
    fi

    port_free "$port" || continue

    # Another start may take the port between the check and the launch; vite then exits and the next port is tried
    launch "$port" && return

    if [[ "$(serving "$port")" == "$DOC" ]]; then
      echo "http://localhost:$port"
      return
    fi

    if port_free "$port"; then
      echo "the server did not come up; its log is $LOG" >&2
      exit 1
    fi
  done

  echo "no free port between $FIRST_PORT and $LAST_PORT" >&2
  exit 1
}

case "$COMMAND" in
  start)
    start
    ;;
  watch)
    URL="$(start)"
    curl -sN "$URL/api/events" | sed -u -n 's/^data: //p'
    ;;
  export)
    URL="$(start)"
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
    if find_server; then
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
