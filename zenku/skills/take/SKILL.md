---
name: take
description: Take one quest and see it through in a single session — claim it, get onto the right branch, solve it by its kind, and close it out. Use when the user wants to work the next thing on an adventure, or when a dispatcher needs one session's work done against one record.
---

Load `zenku:codex`.

One session, one quest. This is the loop both `zenku:venture` and `zenku:raid` run, and it is the same loop whichever kind of adventure it sits under.

## 1. Load the adventure, at low resolution

Its destination, its **bearings**, its trials, its solved index. Not every quest body: fetch a solved quest in full only when you need what it actually decided, and the index line is what tells you whether you do.

The bearings are the part to act on rather than skim. Read what they say to read before deciding anything, and take their warnings as settled instead of re-deriving them.

A **raid** carries the venture it came from. Its bearings say so, and that venture's solved quests are where the reasoning behind the shape lives.

A **loose quest** has no adventure at all. Read the quest and go on.

## 2. Take one

The one named, else the first in reach. **Claim it before any work**, so a concurrent session skips it. If the session ends without an answer, `zenku:solve` sets it back to open: a claim left behind hides the quest from every view.

**Get onto the branch this work belongs on** — the adventure's, creating it if this is the first quest to touch code, or one of its own on the project's pattern for a loose quest. Nothing else in the framework does this, and code written on the trunk is caught only at commit time, after it is written.

## 3. Solve it by kind

`research` → `zenku:research` · `design` → `zenku:design` · `spike` → `zenku:spike` · `build` → `zenku:build`. Anything that resolves by talking → `zenku:parley`.

A quest that needs a person to do something outside the repo, provision access, sign up, move data, is solved when that is done and the facts it produced are written down.

## 4. Close it out

With `zenku:solve`. The solving skill may end by saying it is done building or done reading; that ends the work, not the session. **The quest is not solved until `zenku:solve` has run.**

Then stop. Keep the pace.
