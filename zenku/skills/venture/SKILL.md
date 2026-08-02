---
name: venture
description: Work on something — decide whether it needs mapping out first or can be built now, then do that.
disable-model-invocation: true
---

# Venture

One invocation, one session. Give it a name from the quest log or just describe the thing.

One habit throughout: **refer to an adventure or a quest by its name**, never by a filename, a number or a slug. A wall of slugs is illegible.

## 1. Resolve the project

Load `zenku:codex` — it carries the vocabulary this skill is written in and the two rules it works under. No vault means the project is not initialized: offer `zenku:init` and stop.

## 2. Find the record

Search the quest log by filename and by content. Quote what matched and say which you think it is.

No plausible match → say so plainly and run `zenku:log` to write it down, then continue at step 3 with what it wrote. Nothing gets worked on without a record.

## 3. Judge the path

**A quest already under way** — one carrying a written design or a part-written answer — is being resumed. Go to **step 5** and do not re-interview it.

**An adventure** is read, never re-interviewed, and routed on its own state. Take the branches in order and take the first that matches:

- Anything in reach → **step 5**.
- Nothing in reach, but a quest sits claimed → you cannot tell from the note whether a session is on it. Say which quest, and ask: still live elsewhere, in which case there is nothing to take and you stop; or abandoned, in which case set it back to open and start this step again. Without this the adventure reads as empty and gets built against a question nobody answered.
- Nothing in reach, trials left → every remaining quest is blocked, or every remaining trial is still too vague to phrase. Say which. **If anything is blocked, audit the blockers first**: a `blocked_by` naming a quest that is already solved or dropped is a clearing step somebody skipped, and clearing it now is usually the whole fix. A cycle, where each quest waits on another that waits back, makes all of them permanently unreachable and nothing detects it; break it by saying which one can actually go first. Only once the blockers are honest, run **steps 4.4 to 4.6** against the note that exists. Never re-run 4.3: it writes the adventure from a blank template and would erase its solved index.
- Nothing in reach, no trials, and **no build quest has been solved** → **step 6**. It never got consolidated.
- Nothing in reach, no trials, and **build quests have been solved** → the adventure is finished. Run the ending below. Without this branch a finished adventure gets re-sliced into build quests for work already shipped.

**Anything else** — a fresh quest, or something only just written down — gets judged. Run `zenku:parley` to fan out across the whole space, never deep on one thread, surfacing what is open and what could be started today. Stop as soon as the classification is clear; this is a routing question, not the full interview.

- **Anything you cannot yet phrase as a single quest** → step 4, shape an adventure.
- **Nothing** → **step 5**. It is one session's work, so take it as one: claimed, and solved by its type like any other quest.

Turning up nothing is a real outcome, not a failure to look hard enough. Say so and go to step 5 rather than manufacturing a trial to justify the session.

## 4. Shape an adventure

This session finds the path and solves nothing.

1. **Name the destination** via `zenku:parley`. What reaching the end of this looks like, in a line or two. It settles first because it is what fixes the scope, and everything ruled beyond it is out of scope rather than a trial.
2. **Find the trials** with `zenku:design`, going down only as far as it holds. You are **not writing the design here** — the descent is a way of finding out what you do not know, and the level you stop at is where the trials are. Whatever it does settle becomes a design quest, so the shape gets settled by a quest like everything else.
3. **Write the adventure** from the project's template: the destination, its bearings, the trials the descent surfaced, what is out of scope. Write a trial as loosely as the view allows — it is coarser than a quest on purpose, and one trial may graduate into several or into none.

   **The bearings are what makes the next session cheap.** Which part of the system this works in and which it does not touch, what to read before deciding anything, and the standing preferences including the warnings. A branch that looks related and is not, an approach already ruled out elsewhere, a tool this project will not take on: whatever a fresh session would otherwise assume wrongly and spend a session finding out. Take them from what the parley already surfaced rather than asking again.

   **If this started as a quest, rewrite that note in place** rather than writing a second one beside it. Keep its filename and whatever the project's template shares between the two kinds; swap the tag that classifies it, drop the fields only a quest carries, and say you converted it. A new note under a new name leaves the original sitting open and in reach forever, and reusing the name breaks every wikilink pointing at it.
4. **Create the quests you can phrase now**, each its own note, each carrying its type. **A trial that becomes a quest here comes out of the trials list**, so it lives in exactly one place; left in both, it gets written a second time the next session that reaches this step. Then link the blocking once every note exists, since a note cannot reference one that is not there yet. No quest may block one that blocks it, directly or through a chain — a cycle makes both permanently unreachable and nothing detects it.
5. **Fire the research** — a `zenku:research` subagent for each research quest. **Claim each one as you fire it**, and tell each subagent which quest note its findings belong to. Left open, they show as in reach and the next session re-runs reading that is already under way.
6. **Stop.** Loot, then report the destination, what is in reach, and what is still a trial.

## 5. Solve a quest

1. **Load the adventure** at low resolution. Its destination, its **bearings**, its trials, its solved index — not every quest body. Fetch a solved quest in full only when you need what it actually decided; the index line says whether you do.

   The bearings are the part to actually act on: read what they say to read before deciding anything, and take their warnings as settled rather than re-deriving them.

   A **loose quest** has no adventure. Read the quest and go on.
2. **Take one.** The one named, else the first in reach. **Claim it before any work**, so a concurrent session skips it. If the session ends without an answer, `zenku:solve` sets it back to open — a claim left behind hides the quest from every view.

   **Get onto the branch this work belongs on**: the adventure's, creating it if this is the first quest to touch code, or one of its own on the project's pattern for a loose quest. Nothing else in the framework does this, and code written on the trunk is caught only at commit time, after it is written.
3. **Solve it by type.** `research` → `zenku:research` · `design` → `zenku:design` · `spike` → `zenku:spike` · `build` → `zenku:build`. Anything that resolves by talking → `zenku:parley`. A quest that needs a person to do something outside the repo — provision access, sign up, move data — is solved when that is done and the facts it produced are written down.
4. **Close it out** with `zenku:solve`. The solving skill above may end by saying it is done building or done reading; that ends the work, not the session. The quest is not solved until `zenku:solve` has run.

Then loot and stop. Keep the pace.

## 6. Consolidate, then build

An adventure with nothing in reach and no trials left. This is the one session that reads every solved quest in full.

1. **Reconcile the shape.** Run `zenku:design` and take it all the way to the bottom this time: nothing is left that cannot be settled, so the descent reaches the types and signatures. Each quest settled its own piece in its own note and nothing was ever copied up, so the work here is reading them together, making one coherent shape out of them, naming where two of them disagree, and filling whatever none of them covered.

   **Agree it in the conversation and leave it there.** It goes into no file of its own: the pieces stay on the quests that settled them, and the reconciliation becomes the slicing you do next. Writing it up now would document a shape nothing implements, which is the one thing lore cannot do.

2. **Then split on size**, on the same test used everywhere else: does the remaining work fit one session?

   - **It fits** → load `zenku:build`, then run the ending below in this same session. Slicing one afternoon into build quests is ceremony, and finishing in one go is why this path never has to be recognised again later.
   - **It does not** → slice it into **build quests**, each a vertical slice, linked the same way as in step 4.4. Each carries the detail for its own slice, in its own note, like every other quest, and each writes no lore as it lands. Then go back to step 5, one per session. The adventure is finished when those are solved, and step 3 takes it from there.

## Or stop

Reachable from any step, the moment the user says this is not worth continuing.

**An adventure** whose destination stops being worth reaching: write why, in a paragraph, plus **what would reopen it** — usually a condition rather than an argument, and the most valuable line in the whole note. Then run the ending below. Leave the trials in place, faced and unfaced alike.

**A quest** that is no longer worth doing: close it with `zenku:solve`, which sets it dropped and clears it from the lists that named it.

## Ending an adventure

Both endings run this, the one that reached its destination and the one that stopped short. In this order, because each step destroys what the one before it reads.

1. **Write the lore, if it was built.** Load `zenku:lore`, once, with **every solved quest's design in hand**: the ones that settled the shape and the build quests that landed it. This is the adventure's whole output as a durable page, written when the thing exists and can be described in the present tense, which is why no quest wrote one on the way here.

   An adventure that **stopped short** built nothing, so it writes no page. Whatever it did learn about how things already work goes out through Loot instead.

2. **Close out everything still open under it.** Every quest still open, blocked or claimed goes through `zenku:solve` as dropped, with the adventure's ending as the reason. Nothing anywhere joins a quest to its adventure's status: a quest left behind sits in reach forever, pointing at a destination nobody is walking to and indistinguishable from a loose one.

3. **Set the adventure's status** and write how it ended.

4. **Strike the worktree.** The adventure's spike tree stops being reference and starts being clutter. Remove it and delete its branch. Git will refuse the safe form of the branch delete, because that branch was never merged and never going to be, so use the force flag and expect to.

   Nothing that lives only in that tree survives this, which is why it comes after the lore rather than before. Check the page and the solved quests carry whatever mattered, because this is the last moment it is recoverable.

Then say what you wrote and what you struck. The lines stay in the solved index as the record of what was tried.

## Loot

Last, whichever way the session ended and before you report: nothing may live only in this conversation.

- Work that is now decided → `zenku:log`
- A finding about how something already works, carried by no code → `zenku:lore`
- Something learned about how we work → the section the quest log's charter keeps for it. Offer to add one if there is none.
