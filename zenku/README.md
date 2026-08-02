# zenku

A way of working on things you do not yet understand, run out of an Obsidian vault the project owns.

**The plugin owns the process. The project owns the structure.**

That seam is the whole design. The process is zenku's: an adventure faces its trials one quest at a time, the destination is named before anything else so it can fix what is out of scope, the shape is settled in text before there is code, and a trial you cannot yet name is one you are not ready to face.

Everything else is the project's: which folders exist and what each holds, every template body, every index, the tags, the headings, the commands, the code style, the branch pattern. `zenku:init` seeds a sane default and then gets out of the way. From that moment the files belong to the project: edit a template, add a folder, rewrite the charter, and the skills read what is there rather than what was seeded.

The test applied to every line of every skill: **a skill that contains a string which would be wrong in a different repository is a bug.**

## Adventures, quests and trials

One backlog — the **quest log** — holding two kinds of thing.

A **quest** is one session's work. Solving it either answers something or builds a slice.

An **adventure** is too big and too foggy for that. It carries a **destination**, its **bearings** (the ground it works in, what to read first, and the standing warnings), the **trials** standing between here and it, and a **solved** index of the quests that have come back.

An adventure holds no design of its own. A decision lives in exactly one place, the quest that settled it, and the solved index points there rather than restating it. The whole shape is reconciled once, when the last trial is gone, and that reconciliation becomes the build quests. The durable note comes last of all, written out of every quest's design at once, when there is something built to describe.

A **trial** is an ordeal you can sense coming but cannot yet phrase as a single quest. The test is whether you can state the question precisely *now*, not whether you can answer it: a sharp question you cannot act on yet is a blocked quest, while a vague sense that sync is going to be a problem is a trial. A trial graduates into a quest the moment it can be stated, and the quests **in reach** — open, unblocked, unclaimed — are what you choose from.

Two rules the whole thing rests on. **Find the path**: while an adventure still has trials, the work produces decisions, not deliverables, and the pull to just build is the signal you have reached the edge of what is known. **Keep the pace**: one quest per session, research excepted.

## Which skill does what

You type three of them:

| Skill | Does |
|---|---|
| `zenku:venture` | Work on something. Decides whether it needs mapping out first or can be built now, then does that. |
| `zenku:init` | Seed a vault the project then owns; re-run to fill a gap or add a folder. |
| `zenku:commit` | Group the working changes into conventional commits. |

The rest are primitives. The skills above reach them by name, and so can you:

| Skill | Does |
|---|---|
| `zenku:parley` | Interview you relentlessly, one question at a time, until the thinking holds. |
| `zenku:log` | Write something into the quest log in seconds, committing to nothing. |
| `zenku:design` | Settle the shape in text: modules, seams, data flow, types, signatures. |
| `zenku:research` | Send a subagent at primary sources and capture what it finds. |
| `zenku:spike` | Throwaway code in the adventure's worktree, to find something out. |
| `zenku:solve` | Close a quest out: the answer, its status, and what it unblocks. |
| `zenku:build` | Build it with you, verify it, offer to commit. |
| `zenku:lore` | Write or update a durable note, per the project's own charter. |

`codex` is loaded rather than invoked: it carries the runtime-resolution contract every skill uses to find the project's vault and conventions.

## What the framework never bends on

**Nothing is committed unprompted.** Approval of the work is not an instruction to commit it.

## Getting started

1. `zenku:init` — answer the interview, read what it wrote, change whatever you disagree with. It is yours now.
2. `zenku:log` when something is worth not losing but you are not starting on it.
3. `zenku:venture` when you are. It works out whether the thing needs an adventure or just needs building.

## Two kinds of writing

**The quest log** records what we did and decided. It goes stale by design: a solved quest is history.

**Lore** explains how a part works, in the present tense, and is maintained, not accumulated. Mechanism first, with the reasoning in a callout beside the thing it justifies. No requirements tables, no acceptance criteria, no traceability columns, no status ladders — those describe work being planned, and lore describes something that exists.

The two meet at the design `zenku:design` settled: it is already mechanism-first prose with a diagram in it, so it becomes the durable page, minus the signatures the code now owns. A loose quest makes that move as it builds. An adventure makes it once, at the very end, out of every quest's design at once, so the page describes a thing that exists rather than a plan for one.

A project that wants a standing-rules list, a decision register or anything else keeps one **as its own structure**. zenku names no such artifact, which is why it cannot impose one.
