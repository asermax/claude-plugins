---
name: capture
description: Quick-append an experiment idea to the project's BACKLOG.md without breaking flow. Trigger when the user drops an idea worth keeping ("idea:", "we should try...", "capture this") that shouldn't interrupt current work.
---

# capture

Load `zenku:framework-core` first — it holds the workflow principles and the project's conventions (where the artifacts live).

Cheap by design: an idea enters the backlog as a couple of lines, no interview, no scaffolding. Rigor is paid later, at `/experiment-start`.

## Steps

1. Distill what the user said into: **bold title** — the question it would answer (phrased as a question if possible) + one line of why/how.
2. Append it to the right section of `BACKLOG.md` (`Ideas` by default; `Next up` only if the user says it's next; `Later / deferred` if they're explicitly parking it, with the reason).
3. If it overlaps an existing entry, merge into that entry instead of duplicating.
4. Confirm in one line and return to whatever was being worked on. Don't expand the idea, don't start designing it.
