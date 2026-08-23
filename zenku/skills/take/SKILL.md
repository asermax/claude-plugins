---
name: take
description: Take one quest and see it through in a single session — claim it, get onto the right branch, read it in full, present the work and settle what its record leaves open, solve it by its kind, and close it out. Use when the user wants to work the next thing on an adventure, or when a dispatcher needs one session's work done against one record.
---

Load `zenku:codex`.

One session, one quest. This is the loop both `zenku:travel` and `zenku:raid` run, and it is the same loop whichever kind of adventure it sits under.

## 1. Load the adventure, at low resolution

Its destination, its **bearings**, its trials, its solved index. Not every quest body: fetch a solved quest in full only when you need what it actually decided, and the index line is what tells you whether you do.

The bearings are the part to act on rather than skim. Read what they say to read before deciding anything, and take their warnings as settled instead of re-deriving them.

A **raid** carries the journey it came from. Its bearings say so, and that journey's solved quests are where the reasoning behind the shape lives.

A **loose quest** has no adventure at all. Read the quest and go on.

## 2. Take one

The one named, else the first in reach. **Claim it before any work**, so a concurrent session skips it. If the session ends without an answer, `zenku:solve` sets it back to open: a claim left behind hides the quest from every view.

**Get onto the branch this work belongs on** — the adventure's, creating it if this is the first quest to touch code, or one of its own on the project's pattern for a loose quest. Nothing else in the framework does this, and code written on the trunk is caught only at commit time, after it is written.

## 3. Read your way in

The quest's full body, whatever it links or names, and any solved quest its index suggests it rests on. Enough to work it, not merely to summarize it: the presentation that follows is only as good as this reading.

## 4. Present it

Present the quest, so the user is up to speed on what it is and the two of you hold the same picture of it: what it asks for, in your own words anchored to the record's — quote its wording where the exact phrasing carries the intent — what is already settled and where, and how you mean to go at it. The understanding runs both ways: this is where the user catches your reading gone wrong, and where you catch a quest that no longer says what they meant.

Then raise what the record leaves open: a decision it never made, wording that reads two ways, a contradiction with the bearings, an assumption you would otherwise make silently. A fact you can find by looking is yours to fetch. The decisions are the user's: run `zenku:parley` over them, however small they look from here. Under a raid, a design question surfacing now is one the muster missed — settle it there if the user can, and name it a trial if they cannot, because it means the ground was not clear.

A quest with nothing open still gets the presentation, and the user's word to go on before any solving starts.

## 5. Solve it by kind

`research` → `zenku:research` · `design` → `zenku:design` · `spike` → `zenku:spike` · `build` → `zenku:build`. Anything that resolves by talking → `zenku:parley`.

A quest that needs a person to do something outside the repo, provision access, sign up, move data, is solved when that is done and the facts it produced are written down.

## 6. Close it out

With `zenku:solve`. The solving skill may end by saying it is done building or done reading; that ends the work, not the session. **The quest is not solved until `zenku:solve` has run.**

Then stop. Keep the pace.
