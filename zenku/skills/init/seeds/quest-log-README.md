---
title: "<<PROJECT>>: the quest log"
tags:
  - index
summary: "The backlog: adventures, quests, and how work moves through them."
---

# The quest log

Everything not yet done lives here, in one list. These are **records rather than notes**: they say what we did and what we intend to do, they go stale by design, and the writing charter in [[the vault index]] does not apply to them.

A **quest** is one session's work. An **adventure** is too big and too foggy for that, and carries a destination plus the **trials** standing between here and it. Most things captured here are quests; an adventure appears when something turns out to have trials in it, and `zenku:venture` is what turns one into the other.

An embed shows one view at a time. This is what is takeable now; the others are at the bottom of this page.

![[quest-log.base]]

## How work moves

```
log ─┬─ a loose quest ── design ── build ── a note
     │
     └─ an adventure ── destination ── bearings ── trials ── quests
                                                              │
                                    one per session, each     │
                                    settling its own piece ───┘
                                              │
                              no trials left, nothing in reach
                                              │
                                  reconcile ── build quests
                                              │
                              one note ── strike the worktree
```

Two rules govern that, and both belong to the framework rather than to this project: **find the path** — while an adventure still has trials, the work produces decisions, not deliverables — and **keep the pace**, one quest per session, research excepted.

## Where the shape lives

A quest carries a `## Design`: the technical detail it settles or builds, down to the types and signatures.

**An adventure carries none.** A decision lives in exactly one place, the quest that settled it, and nothing is ever copied upward. The adventure's solved index points at those quests instead, one line each, which is what keeps it short enough to read on the twelfth session as easily as the second.

The whole shape gets reconciled **once**, when the last trial is gone: every solved quest read together, the disagreements between them settled, and the result sliced into build quests. That reconciliation goes into no file. It is agreed in the conversation and it becomes the slices.

**The durable note is written at the very end, out of every quest's design at once**, when the thing is built and can be described in the present tense. No quest writes one on the way there, not even a build quest, because a page per slice describes parts of a shape nobody has seen whole and reconciling those afterwards costs more than writing it once.

So a mid-flight adventure has no single place its shape lives, deliberately: it does not have a coherent design yet, and a section pretending otherwise gets read as one.

## Which quests are takeable

A quest is **in reach** when it is open, unclaimed, and nothing is blocking it. That is the first view of the index, and it is the only list worth reading when choosing what to do next.

`blocked_by` names the quests that must be solved first, as **bare kebab-case filenames**, no brackets and no path. One fixed form matters because clearing the field is a search: a mix of `[[fetch-schema]]` and `fetch-schema` across sessions means the search misses and the dependant stays invisible with nothing to show why. `adventure` takes the same bare form, for the same reason.

It **empties as its blockers close**, instead of accumulating history. That is what lets the index answer "what can I take" without following a chain, and the order things actually happened is preserved in the solved index and in git.

**Emptied means `blocked_by: []`, never a bare `blocked_by:`.** The In-reach and Blocked views split on whether that list is empty, and a null is neither: a quest written that way disappears from both at once, which is the one failure nothing here will show you.

## Naming and frontmatter

Named in kebab-case after the thing itself, unique across the whole vault, per [[the vault index]].

**The tag is what classifies a record.** `adventure` or `quest`, and the index reads nothing else to tell them apart, so a record with the wrong tag lands in the wrong views or in none. Per [[the vault index]], that failure is silent.

Every record carries `title` and `summary` like everything else in the vault. **The summary is what the index shows**, in the one column a reader scans, so write it as a line about the work rather than about the note.

An **adventure** carries `status`, `priority` and `created`. Its statuses:

- `open` — being worked, or waiting to be.
- `done` — the destination was reached and built.
- `closed` — the destination stopped being worth reaching. The note says why, and **what would reopen it**.

A **quest** carries `status`, `type`, `adventure`, `blocked_by`, `priority` and `created`. Its statuses:

- `open` — not started.
- `claimed` — a session is on it. Claimed before any work, so a concurrent session skips it.
- `solved` — answered or built. The answer is on the quest itself.
- `dropped` — no longer worth doing, with a line saying why.

A quest's `type` says how it gets solved:

| Type | Solved by |
|---|---|
| `research` | Reading primary sources. The one type that runs several at once. |
| `design` | Settling a shape in text: modules, seams, data flow, types. |
| `spike` | Throwaway code in the adventure's worktree, to find something out. |
| `build` | Writing a vertical slice of the real thing. |

Anything that resolves by talking it through is a `design` quest most of the time; where it is genuinely just a decision, say so in the quest and settle it in conversation. Work that has to happen outside the repo before a decision can be made — provisioning access, signing up for something, moving data — is a `build` quest whose slice is that errand.

**`priority` is `1-now`, `2-soon` or `3-later`.** The numbers are there so the index sorts on them: the values are text, and without a prefix an ascending sort puts `later` above `now`.

## What is not written here

**No ordering artifact and no planning document.** Order comes from `priority` and from what is in reach.

**An adventure is never converted into a quest, or the reverse by hand.** `zenku:venture` rewrites the note from the other template and says it did, so the change is visible in one diff.

**The explanation of how something works does not live here.** When a quest settles something durable, the explanation goes into the notes, per [[the vault index]], and the quest stays where it is as the record of how we found out.

## How we work

Anything learned about the *process* instead of the product lands in this section: a convention that keeps biting, a step that turned out to matter, a kind of quest this project keeps needing.

## Spikes outlive the quest that made them

**An adventure owns one spike worktree**, on a branch that is never merged, and every spike under it works in there. The first one creates it. Spikes compound, and a fresh checkout each time orphans whatever the last one fetched or cached, so the second question ends up paying for the first one twice.

It **stays checked out for as long as the adventure is open**. Each spike names what it added to the tree in its solved-index line, so the answer and the place to go and look at it sit together. A prose answer loses whatever nobody thought to write down, and the later questions, what exactly did we run and did we try the other adapter, are answerable in seconds from a live checkout.

When the adventure ends the worktree is struck and the branch deleted, after its durable note is written and never before. Anything that mattered has to be in that note or in the solved quests by then, because that is the last moment it is recoverable.

## The rest of the index

- **Blocked** — open, waiting on something. `![[quest-log.base#Blocked]]`
- **Adventures** — the efforts under way. `![[quest-log.base#Adventures]]`
- **Claimed** — a session took it and has not come back. `![[quest-log.base#Claimed]]`
- **History** — solved and dropped. `![[quest-log.base#History]]`

Embed any of those under a heading of its own to have it on this page. Claimed is the one worth checking when something seems to have vanished: a quest claimed and never finished sits in no other view.
