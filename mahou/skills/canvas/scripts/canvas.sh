#!/usr/bin/env bash
# Runs a tldraw canvas over one document, <folder>/<name>.tldr.json.
#
#   canvas.sh start   <document> [title]  install on first run, link the built-in mockups, start the server, print its
#                                         URL and stay in the foreground until the server stops; the title is required
#                                         until the document has one, and replaces the stored one when given
#   canvas.sh open    <document> [helpers.js]  open the agent's tab in the canvas's own agent-browser session, load
#                                         the helpers file into it when given, and print the session's name
#   canvas.sh watch   <document>  print one line per "Send to Agent" click or voice message from the running canvas
#   canvas.sh export  <document>  write <folder>/<name>.svg from the running canvas
#   canvas.sh texts   <document>  print every canvas text and arrow label, one per line
#   canvas.sh apply-texts <document> <pairs.json>  apply [{ shape?, from, to }] replacements to the running canvas's
#                                         texts and print the pairs found nowhere
#   canvas.sh migrate <document>  bring a document saved by an older version of the app to the current format
#
# Each document gets its own server on the first free port from 5190 up, or on CANVAS_PORT when it is set. Its
# document, port and PID are kept in a state file in the cache, keyed by a hash of the document's path.
#
# The app and its dependencies live in a cache folder outside the plugin, because plugin updates replace the
# plugin's directory. Every document in a folder shares the folder's mockups/.
set -euo pipefail

USAGE="usage: canvas.sh <start|open|watch|export|texts|apply-texts|migrate> <folder>/<name>.tldr.json [title|helpers.js|pairs.json]"
COMMAND="${1:?$USAGE}"
DOC="$(realpath -m "${2:?$USAGE}")"
DOC_DIR="$(dirname "$DOC")"
TITLE="${3:-}"
EXTRA="${3:-}"

if [[ "$DOC" != *.tldr.json ]]; then
  echo "$USAGE" >&2
  exit 1
fi

SKILL_APP="$(cd "$(dirname "${BASH_SOURCE[0]}")/app" && pwd)"
SKILLS="$(cd "$SKILL_APP/../../.." && pwd)"
CACHE="${XDG_CACHE_HOME:-$HOME/.cache}/mahou-canvas"
APP="$CACHE/app"
SERVERS="$CACHE/servers"
FIRST_PORT=5190
LAST_PORT=5289

# One server per document, so the state, the log and the port belong to that document alone
KEY="$(printf '%s' "$DOC" | { sha256sum 2>/dev/null || shasum -a 256; } | cut -c1-16)"
STATE="$SERVERS/$KEY.state"
LOG="$SERVERS/$KEY.log"

# One agent-browser session per canvas, so two canvases never draw in each other's tab; the hash tells apart two
# documents with the same name in different folders
NAME="$(basename "$DOC" .tldr.json | tr -c 'A-Za-z0-9_\n-' '-')"
SESSION="canvas-$NAME-${KEY:0:6}"

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
  rsync -ac --delete --exclude node_modules --exclude package-lock.json "$SKILL_APP/" "$APP/"

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

# Links every skill's built-in mockups into the folder's mockups/. The plugin's install path changes with each version,
# so the links an earlier start made are replaced; a real file of the same name is the folder's own and stays
scaffold() {
  local mockups="$DOC_DIR/mockups" link source target

  mkdir -p "$mockups"

  for link in "$mockups"/*.tsx; do
    if [[ -L "$link" && "$(readlink "$link")" == */skills/*/mockups/*.tsx ]]; then
      rm -f "$link"
    fi
  done

  for source in "$SKILLS"/*/mockups/*.tsx; do
    [[ -f "$source" ]] || continue

    target="$mockups/$(basename "$source")"

    if [[ -e "$target" || -L "$target" ]]; then
      echo "mockups/$(basename "$source") is this folder's own and shadows the built-in from $(basename "$(dirname "$(dirname "$source")")")" >&2
      continue
    fi

    ln -s "$source" "$target"
  done
}

# Starts the server on one port and waits for it; fails when the process exits, as vite does when the port is taken
launch() {
  local port="$1" pid

  CANVAS_DOC="$DOC" CANVAS_TITLE="$TITLE" "$APP/node_modules/.bin/vite" --config "$APP/vite.config.ts" --port "$port" --strictPort \
    >"$LOG" 2>&1 </dev/null &
  pid=$!

  for _ in $(seq 60); do
    if [[ "$(serving "$port")" == "$DOC" ]]; then
      printf '%s\n%s\n%s\n' "$DOC" "$port" "$pid" >"$STATE"
      PID="$pid"
      echo "http://localhost:$port"
      return 0
    fi

    kill -0 "$pid" 2>/dev/null || return 1
    sleep 0.5
  done

  kill "$pid" 2>/dev/null || true
  return 1
}

# Keeps start in the foreground for as long as the server runs, so the caller can hold it as a background task.
# A background child of a non-interactive shell ignores SIGINT, so the server is killed here rather than by the signal.
hold() {
  trap 'kill "$PID" 2>/dev/null || true; rm -f "$STATE"' EXIT
  trap 'exit 0' INT TERM HUP

  wait "$PID" || true
}

# The running canvas's URL; watch and export never start one, since start no longer returns while its server runs
running_url() {
  if ! find_server; then
    echo "the canvas is not running; start it first with canvas.sh start $DOC as a background task" >&2
    exit 1
  fi

  echo "http://localhost:$PORT"
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

  if [[ -z "$TITLE" ]]; then
    TITLE="$(document_cli title)"
  fi

  if [[ -z "$TITLE" ]]; then
    echo "the canvas needs a title: canvas.sh start $DOC \"<title>\"" >&2
    exit 1
  fi

  scaffold

  if [[ -n "${CANVAS_PORT:-}" ]]; then
    if ! port_free "$CANVAS_PORT"; then
      echo "port $CANVAS_PORT is taken by another server; unset CANVAS_PORT to pick a free port" >&2
      exit 1
    fi

    if launch "$CANVAS_PORT"; then
      hold
      return
    fi

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
    if launch "$port"; then
      hold
      return
    fi

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

# agent-browser prints an eval's string result as a JSON string, quotes and escapes included
decoded() {
  node -e 'let raw = ""; process.stdin.on("data", (chunk) => (raw += chunk)).on("end", () => { const value = JSON.parse(raw.trim().split("\n").pop()); console.log(typeof value === "string" ? value : JSON.stringify(value)) })'
}

# Each html mock's prototype is laid out in an overlay of the export tab at its own width, screenshotted into shots/,
# and drawn from that image in the SVG, since an iframe draws nothing there
shoot_html_mocks() {
  local session="$1" count index width height shot

  agent-browser --session "$session" eval --stdin >/dev/null <<'JS'
window.__htmlMocks = window.editor.getCurrentPageShapes().filter((shape) => shape.type === 'mock' && shape.props.kind === 'html')
window.__shootHtml = async (index) => {
  const { data } = window.__htmlMocks[index].props
  const states = data.state == null ? [] : [data.state].flat()
  const frame = document.createElement('iframe')

  document.getElementById('html-shot')?.remove()
  frame.id = 'html-shot'
  frame.src = `/files/${data.file.split('/').map(encodeURIComponent).join('/')}`
  frame.style.cssText = `position: fixed; left: 0; top: 0; z-index: 2147483647; border: 0; background: white; width: ${data.width ?? 1280}px; height: 800px`
  document.body.append(frame)

  await new Promise((done) => frame.addEventListener('load', done, { once: true }))
  window.__htmlState(frame.contentDocument, states)
  await new Promise((done) => setTimeout(done, 300))

  const height = Math.ceil(frame.contentDocument.documentElement.getBoundingClientRect().height)

  frame.style.height = `${height}px`

  return height
}
JS

  count="$(agent-browser --session "$session" eval "window.__htmlMocks.length")"

  if [[ "$count" -gt 0 ]]; then
    mkdir -p "$DOC_DIR/shots"
  fi

  for ((index = 0; index < count; index++)); do
    width="$(agent-browser --session "$session" eval "window.__htmlMocks[$index].props.data.width ?? 1280")"
    height="$(agent-browser --session "$session" eval "window.__shootHtml($index)")"
    shot="export-$NAME-$index.png"

    agent-browser --session "$session" set viewport "$width" "$height" >/dev/null
    agent-browser --session "$session" screenshot "#html-shot" "$DOC_DIR/shots/$shot" >/dev/null
    agent-browser --session "$session" eval "document.getElementById('html-shot').remove(); (window.__htmlShots ??= {})[window.__htmlMocks[$index].id] = '/files/$(basename "$DOC_DIR")/shots/$shot'" >/dev/null
  done
}

case "$COMMAND" in
  start)
    start
    ;;
  open)
    URL="$(running_url)"

    if [[ -n "$EXTRA" && ! -f "$EXTRA" ]]; then
      echo "no helpers file at $EXTRA" >&2
      exit 1
    fi

    agent-browser --session "$SESSION" open "$URL?user=Agent" >/dev/null
    agent-browser --session "$SESSION" wait --fn "typeof window.canvas !== 'undefined'" >/dev/null

    if [[ -n "$EXTRA" ]]; then
      agent-browser --session "$SESSION" eval --stdin <"$EXTRA" >/dev/null
    fi

    echo "$SESSION"
    ;;
  apply-texts)
    URL="$(running_url)"

    if [[ ! -f "$EXTRA" ]]; then
      echo "usage: canvas.sh apply-texts <document> <pairs.json>, a JSON list of { shape?, from, to }" >&2
      exit 1
    fi

    # Its own session, so the agent's tab keeps the helpers loaded into it
    agent-browser --session "$SESSION-texts" open "$URL?user=Agent" >/dev/null
    agent-browser --session "$SESSION-texts" wait --fn "typeof window.canvas !== 'undefined'" >/dev/null
    {
      printf '(async () => { const missing = await window.canvas.applyTexts('
      cat "$EXTRA"
      cat <<'JS'
); return missing.length === 0 ? 'every pair applied' : missing.map((pair) => `not found: ${pair.shape == null ? '' : `${pair.shape} | `}${pair.from}`).join('\n') })()
JS
    } | agent-browser --session "$SESSION-texts" eval --stdin | decoded
    agent-browser --session "$SESSION-texts" close >/dev/null
    ;;
  watch)
    URL="$(running_url)"
    while find_server; do
      curl -sN "$URL/api/events" | sed -u -n 's/^data: //p' || true
      sleep 1
    done
    ;;
  export)
    URL="$(running_url)"
    # Its own browser session, so the export leaves the agent's open tab alone
    agent-browser --session "$SESSION-export" open "$URL?user=export" >/dev/null
    agent-browser --session "$SESSION-export" wait --fn "window.editor != null" >/dev/null
    shoot_html_mocks "$SESSION-export"
    agent-browser --session "$SESSION-export" eval "(async () => { await document.fonts.ready; const e = window.editor; e.selectNone(); const r = await e.getSvgString([...e.getCurrentPageShapeIds()], { background: true, padding: 64 }); return await fetch('/api/export', { method: 'POST', body: r.svg }).then((response) => response.text()) })()"
    agent-browser --session "$SESSION-export" close >/dev/null
    ;;
  texts)
    document_cli texts
    ;;
  migrate)
    if find_server; then
      echo "stop the canvas's start task before migrating its document" >&2
      exit 1
    fi

    document_cli migrate
    ;;
  *)
    echo "unknown command: $COMMAND" >&2
    exit 1
    ;;
esac
