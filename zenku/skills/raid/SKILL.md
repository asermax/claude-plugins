---
name: raid
description: Build the thing — turn cleared ground into a shape and a set of slices, then land them one per session.
disable-model-invocation: true
---

# Raid

One invocation, one session. Give it the name of a finished journey, an existing raid, or the feature itself.

A raid **builds**. Its destination is the thing working, and it holds build quests almost exclusively. The questions were answered before it started, either by a journey or because there were none.

One habit throughout: **refer to an adventure or a quest by its name**, never by a filename, a number or a slug.

## 1. Resolve the project

Load `zenku:codex`. No vault means the project is not initialized: offer `zenku:init` and stop.

## 2. Find the record

Search the quest log by filename and by content. Quote what matched and say which you think it is.

- **A raid already exists** → step 4, which decides whether it was ever sliced.
- **A finished journey** → step 3. This is the usual way in.
- **A journey still open** → say what is still in reach or still a trial, and tell the user to run `zenku:travel`. Raiding over unanswered questions is the failure the two kinds exist to prevent.
- **Nothing** → **check the lore before writing a record.** A finished effort leaves no records behind, so a note already describing this thing in the present tense means it was already built. Say so, quote the note, and ask whether this is a change to it — which is a new raid, named for the change — rather than the original. Only once that is ruled out, run `zenku:log` and go to step 3. A feature clear enough to build without clearing ground first is a legitimate raid with no journey behind it.

## 3. Muster the raid

The one session that reads every solved quest in full. It settles the shape and slices it, and it builds nothing.

1. **Reconcile the shape.** Run `zenku:design` and take it all the way to the bottom: nothing is left that cannot be settled, so the descent reaches the types and signatures.

   With a journey behind it, each of its quests settled its own piece in its own note and nothing was ever copied up, so the work here is reading them together, making one coherent shape out of them, **naming where two of them disagree**, and filling whatever none of them covered. Without one, it is an ordinary descent.

   **Agree it in the conversation and leave it there.** It goes into no file of its own: the pieces stay on the quests that settled them, and the reconciliation becomes the slicing you do next. Writing it up now would document a shape nothing implements, which is the one thing lore cannot do.

   **A disagreement you cannot settle is a trial**, and it means the ground was not clear. Say so: it belongs back in a journey rather than being guessed at here.

2. **Write the raid** from the project's template, with its kind set accordingly.

   Its **destination** is the thing working, in a line or two. Its **bearings** carry the journey's forward, narrowed to what building needs, and **name the journey** so the reasoning behind every decision stays one link away. Its trials are normally empty, which is the point of having cleared them.

   **Never rewrite the journey into a raid.** They are separate records with separate destinations, and the journey's solved index is the evidence the raid rests on.

3. **Slice it into build quests**, each a vertical slice that leaves the thing working, each its own note carrying the detail for its own slice. Then link the blocking once every note exists, since a note cannot reference one that is not there yet. No quest may block one that blocks it, directly or through a chain — a cycle makes both permanently unreachable and nothing detects it.

   Where the whole thing genuinely fits one session, make it one build quest rather than none: it is what tells a later session this raid was mustered rather than abandoned before it started.

4. **Stop.** Run `zenku:loot`, then report the destination and what is in reach.

## 4. Land a slice

Read the raid and route on its state. Take the branches in order and take the first that matches:

- Anything in reach → run `zenku:take`.
- Nothing in reach, but a quest sits claimed → say which, and ask whether a session is still on it or the claim was abandoned. Abandoned means setting it back to open and starting this step again.
- Nothing in reach, quests still blocked → **audit the blockers**: a `blocked_by` naming a quest already solved or dropped is a clearing step somebody skipped. A cycle needs breaking by saying which one can actually go first.
- Nothing in reach and **no quest anywhere names this raid** → it was written but never sliced, which is what an interrupted muster leaves behind. Go to step 3 and muster it. Check this before the branch below, because a raid with no quests and a raid whose quests are all solved are indistinguishable from the in-reach count alone, and reading the first as the second strikes the whole effort.
- Nothing in reach, nothing left open → the raid is finished. Run the ending below.

## Or stop

Reachable from any step, the moment the user says this is not worth continuing. Write why, in a paragraph, plus **what would reopen it**. Then run the ending below.

## Ending a raid

Both endings run this, the one that shipped and the one that stopped short. In this order, because the lore is written from what the strike destroys.

1. **Write the lore, if it was built.** Load `zenku:lore`, once, with **every solved quest's design in hand**: the journey's, which settled the shape, and this raid's, which landed it. This is the whole effort's output as a durable page, written when the thing exists and can be described in the present tense, which is why no quest wrote one on the way here.

   A raid that **stopped short** built nothing coherent, so it writes no page. What it learned leaves through the next step instead.

2. **Set the statuses** — this raid's, and the journey's if it is somehow still open — and write how each of them ended.

3. **Strike the effort.** Run `zenku:strike`, and tell it the effort is this raid together with the journey behind it. It owns the order its own steps run in. Nothing of either stays in the quest log.

Then say what you wrote and what you struck.
