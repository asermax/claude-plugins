# A Vite dev server serving a stale transform

verified: 2026-11-23

Answers why a Vite 8 dev server keeps throwing a ReferenceError for a name a file no longer uses after the file was edited twice in quick succession, and how to clear it without restarting the server.

## Knowledge

- After two writes to one module less than a second apart (for example an import line changed by one edit and the line using it by the next), the dev server can keep serving a transform that mixes both versions: the new import list with the old body. The browser then fails on load with a ReferenceError for the name the old body still uses, while the file on disk, the type checker and the test runner are all fine.
- `curl` the module's URL from the dev server (`http://localhost:5173/src/...ts`) to see what it serves; a stale transform shows the old line.
- Updating the file's modification time (`touch` on the edited files) makes the watcher transform it again, and the next page load gets the current code. No server restart is needed.
- A browser that already threw keeps the old errors in its error log; read the latest entries or reload before judging whether the fix worked.

## Sources

- A Vite 8.3 dev server started by a framework's dev command, with files edited by scripted writes, observed with curl and agent-browser on 2026-11-23; touching the files cleared it.
