---
name: learn
description: Inspect the conversation so far, extract learnings, and propose new or iterated skills and wiki entries, split by global (the plugin) and local (.mahou) scope.
disable-model-invocation: true
---

Load mahou:basics first. Then read `.mahou/learn.md` if present.

## Procedure

1. Reread the conversation. Collect everything before judging what it is:
   - process that worked when followed by hand. Candidate for a new skill.
   - friction with an existing skill. Candidate for an iteration.
   - knowledge that surfaced: facts about tools, technologies, their gotchas. Candidate for a wiki entry.
   - decisions the user repeated or restated more than once. Candidate for a standing rule in a local file.
2. Classify each item. Process becomes a skill, new or iterated. Knowledge becomes a wiki entry.
3. Scope each item. Global means useful in any project. Local means true only for this project.
4. Order the proposals by confidence, then by impact, and present them one at a time, waiting for the user's call on each:
   - a new skill: a full draft, following the checklist below.
   - a skill iteration: the exact change and the reason.
   - a wiki entry: the draft plus its line in the index at the right level.
   - a local file: the draft and which skill it changes.
5. Write each approved proposal to its place, as listed under Where things land.

## Where things land

- A new skill: `skills/<name>/SKILL.md` in the plugin.
- A wiki entry: `skills/wiki/references/<topic>/<entry>.md`, plus its line in that folder's `INDEX.md`.
- A local file: `.mahou/<skill>.md`, or `.mahou/wiki/` for local entries, with the same index-per-level shape as the global store.

## New skill checklist

- A descriptive name. The magic vocabulary stays in mahou:basics and the README.
- One job. Two jobs means proposing two skills.
- A description precise enough to load when intended, and to let mahou:guide match goals to it.
- First lines of the body: load mahou:basics, then read `.mahou/<skill>.md` if present.
- No decisions delegated to the agent. It maps the state and asks; the user settles.
