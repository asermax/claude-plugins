---
name: travel
description: Travel a journey — work on something whose shape is not clear yet, mapping what stands in the way and clearing it one question per session, without building.
disable-model-invocation: true
---

# Travel a journey

One invocation, one session. Give it a name from the quest log or just describe the thing.

A journey **clears ground**. Its destination is knowing how to build the thing, not having built it, and it holds no build quests: research, design, spikes and the occasional conversation. Building is `zenku:raid`, and a journey usually ends by handing over to one.

One habit throughout: **refer to an adventure or a quest by its name**, never by a filename, a number or a slug. A wall of slugs is illegible.

## 1. Resolve the project

Load `zenku:codex` — it carries the vocabulary this skill is written in and the two rules it works under. No vault means the project is not initialized: offer `zenku:init` and stop.

## 2. Find the record

Search the quest log by filename and by content. Quote what matched and say which you think it is.

No plausible match → **search the notes too, before writing anything.** A finished effort leaves no records behind, so ground already cleared and built shows up only as the note describing it, and an empty quest log is not evidence that nobody has been here. If a note covers it, quote it and ask whether this is a change to that rather than the original.

Otherwise say so plainly and run `zenku:log` to write it down, then continue at step 3 with what it wrote. Nothing gets worked on without a record.

**A raid is not this skill's.** If what matched is an adventure whose kind is a raid, say so and tell the user to run `zenku:raid` instead.

## 3. Judge the path

**A quest already under way** — one carrying a written design or a part-written answer — is being resumed. Run `zenku:take` and do not re-interview it.

**A journey** is read, never re-interviewed, and routed on its own state. Take the branches in order and take the first that matches:

- Anything in reach → run `zenku:take`.
- Nothing in reach, but a quest sits claimed → you cannot tell from the note whether a session is on it. Say which quest, and ask: still live elsewhere, in which case there is nothing to take and you stop; or abandoned, in which case set it back to open and start this step again. Without this the journey reads as empty and gets called finished over a question nobody answered.
- Nothing in reach, trials left → every remaining quest is blocked, or every remaining trial is still too vague to phrase. Say which. **If anything is blocked, audit the blockers first**: a `blocked_by` naming a quest that is already solved or dropped is a clearing step somebody skipped, and clearing it now is usually the whole fix. A cycle, where each quest waits on another that waits back, makes all of them permanently unreachable and nothing detects it; break it by saying which one can actually go first. Only once the blockers are honest, run **steps 4.4 to 4.6** against the note that exists. Never re-run 4.3: it writes the journey from a blank template and would erase its solved index.
- Nothing in reach, no trials left → **the ground is clear.** Go to step 5.

**Anything else** — a fresh quest, or something only just written down — gets judged. Run `zenku:parley` to fan out across the whole space, never deep on one thread, surfacing what is open and what could be started today. Stop as soon as the classification is clear; this is a routing question, not the full interview.

- **Anything you cannot yet phrase as a single quest** → step 4, shape a journey.
- **Nothing, and it is one session's work** → run `zenku:take`. Take it as the loose quest it is.
- **Nothing, and it is a feature to build** → say so and tell the user to run `zenku:raid`. There is no ground to clear here, so a journey would be ceremony.

Turning up nothing is a real outcome, not a failure to look hard enough. Say so rather than manufacturing a trial to justify the session.

**A loose quest ends when it lands**, by either route into it — the one resumed and the one taken fresh. It is an effort of one, so once `zenku:take` has closed it, run `zenku:strike`. Its output is the lore `zenku:build` wrote and the code; the record itself has nothing left to serve, and git keeps it.

## 4. Shape a journey

This session finds the path and solves nothing.

1. **Name the destination** via `zenku:parley`. What knowing enough looks like, in a line or two. It settles first because it is what fixes the scope, and everything ruled beyond it is out of scope rather than a trial.
2. **Find the trials** with `zenku:design`, going down only as far as it holds. You are **not writing the design here** — the descent is a way of finding out what you do not know, and the level you stop at is where the trials are. Whatever it does settle becomes a design quest, so the shape gets settled by a quest like everything else.
3. **Write the journey** from the project's template, with its kind set accordingly: the destination, its bearings, the trials the descent surfaced, what is out of scope. Write a trial as loosely as the view allows — it is coarser than a quest on purpose, and one trial may graduate into several or into none.

   **The bearings are what makes the next session cheap.** Which part of the system this works in and which it does not touch, what to read before deciding anything, and the standing preferences including the warnings. A branch that looks related and is not, an approach already ruled out elsewhere, a tool this project will not take on: whatever a fresh session would otherwise assume wrongly and spend a session finding out. Take them from what the parley already surfaced rather than asking again.

   **If this started as a quest, rewrite that note in place** rather than writing a second one beside it. Keep its filename and whatever the project's template shares between the two kinds; swap the tag that classifies it, drop the fields only a quest carries, and say you converted it. A new note under a new name leaves the original sitting open and in reach forever, and reusing the name breaks every wikilink pointing at it.
4. **Create the quests you can phrase now**, each its own note, each carrying its kind. **No build quests**: if something is already clear enough to build, it belongs to the raid this hands off to, not here. **A trial that becomes a quest here comes out of the trials list**, so it lives in exactly one place; left in both, it gets written a second time the next session that reaches this step. Then link the blocking once every note exists, since a note cannot reference one that is not there yet. No quest may block one that blocks it, directly or through a chain — a cycle makes both permanently unreachable and nothing detects it.
5. **Fire the research** — a `zenku:research` subagent for each research quest. **Claim each one as you fire it**, and tell each subagent which quest note its findings belong to. Left open, they show as in reach and the next session re-runs reading that is already under way.
6. **Stop.** Run `zenku:loot`, then report the destination, what is in reach, and what is still a trial.

## 5. Hand it over

Nothing in reach and no trials left: every question this journey existed to answer has an answer on a quest.

**Do not build, and do not reconcile the shape here.** Both belong to `zenku:raid`, which reads these solved quests as its first act. Doing it now would settle the shape in a conversation the raid cannot read.

Set the journey's status to done and write how it ended: what is now known, and anything that turned out to be unanswerable.

**Leave everything standing** — the spike worktree and every record. The raid inherits both and strikes them at its own ending, along with its own. A journey marked done is the one ending that clears nothing away, which is why `done` and `closed` mean different things here.

Say the ground is clear and tell the user to run `zenku:raid`.

A journey nobody raids is a finished journey, not a failure: its answers are on its quests either way. But **it does have to be struck by someone**, and marking it done drops it out of the index while leaving every record on disk for a search to find. So if the user says no build is coming, run `zenku:strike` now rather than leaving it: what the answers were worth has to reach a note first, which is what Loot inside the strike is for.

## Or stop

Reachable from any step, the moment the user says this is not worth continuing.

**A journey** whose destination stops being worth reaching: write why, in a paragraph, plus **what would reopen it** — usually a condition rather than an argument, and the most valuable line in the whole note. Set its status to closed and leave the trials in place, faced and unfaced alike.

Then **strike it.** Run `zenku:strike`. No raid is coming to inherit anything here, so the close-out, the loot, the worktree and the records all go now. The reopening condition you just wrote leaves through Loot as a record of its own, because the note holding it is about to go: a journey that stopped short built nothing, so that route is the only thing surviving it.

**A quest** that is no longer worth doing: close it with `zenku:solve`, which sets it dropped and clears it from the lists that named it. A loose one then goes through `zenku:strike` like any other effort that ended; one under an adventure stays where it is and goes with its effort.
