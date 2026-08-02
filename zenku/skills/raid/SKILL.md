---
name: raid
description: Build the thing — turn cleared ground into a shape and a set of slices, then land them one per session.
disable-model-invocation: true
---

# Raid

One invocation, one session. Give it the name of a finished venture, an existing raid, or the feature itself.

A raid **builds**. Its destination is the thing working, and it holds build quests almost exclusively. The questions were answered before it started, either by a venture or because there were none.

One habit throughout: **refer to an adventure or a quest by its name**, never by a filename, a number or a slug.

## 1. Resolve the project

Load `zenku:codex`. No vault means the project is not initialized: offer `zenku:init` and stop.

## 2. Find the record

Search the quest log by filename and by content. Quote what matched and say which you think it is.

- **A raid already exists** → step 4.
- **A finished venture** → step 3. This is the usual way in.
- **A venture still open** → say what is still in reach or still a trial, and tell the user to run `zenku:venture`. Raiding over unanswered questions is the failure the two kinds exist to prevent.
- **Nothing** → say so, run `zenku:log`, then step 3. A feature clear enough to build without clearing ground first is a legitimate raid with no venture behind it.

## 3. Muster the raid

The one session that reads every solved quest in full. It settles the shape and slices it, and it builds nothing.

1. **Reconcile the shape.** Run `zenku:design` and take it all the way to the bottom: nothing is left that cannot be settled, so the descent reaches the types and signatures.

   With a venture behind it, each of its quests settled its own piece in its own note and nothing was ever copied up, so the work here is reading them together, making one coherent shape out of them, **naming where two of them disagree**, and filling whatever none of them covered. Without one, it is an ordinary descent.

   **Agree it in the conversation and leave it there.** It goes into no file of its own: the pieces stay on the quests that settled them, and the reconciliation becomes the slicing you do next. Writing it up now would document a shape nothing implements, which is the one thing lore cannot do.

   **A disagreement you cannot settle is a trial**, and it means the ground was not clear. Say so: it belongs back in a venture rather than being guessed at here.

2. **Write the raid** from the project's template, with its kind set accordingly.

   Its **destination** is the thing working, in a line or two. Its **bearings** carry the venture's forward, narrowed to what building needs, and **name the venture** so the reasoning behind every decision stays one link away. Its trials are normally empty, which is the point of having cleared them.

   **Never rewrite the venture into a raid.** They are separate records with separate destinations, and the venture's solved index is the evidence the raid rests on.

3. **Slice it into build quests**, each a vertical slice that leaves the thing working, each its own note carrying the detail for its own slice. Then link the blocking once every note exists, since a note cannot reference one that is not there yet. No quest may block one that blocks it, directly or through a chain — a cycle makes both permanently unreachable and nothing detects it.

   Where the whole thing genuinely fits one session, make it one build quest rather than none: it is what tells a later session this raid was mustered rather than abandoned before it started.

4. **Stop.** Loot, then report the destination and what is in reach.

## 4. Land a slice

Read the raid and route on its state. Take the branches in order and take the first that matches:

- Anything in reach → run `zenku:take`.
- Nothing in reach, but a quest sits claimed → say which, and ask whether a session is still on it or the claim was abandoned. Abandoned means setting it back to open and starting this step again.
- Nothing in reach, quests still blocked → **audit the blockers**: a `blocked_by` naming a quest already solved or dropped is a clearing step somebody skipped. A cycle needs breaking by saying which one can actually go first.
- Nothing in reach, nothing left open → the raid is finished. Run the ending below.

## Or stop

Reachable from any step, the moment the user says this is not worth continuing. Write why, in a paragraph, plus **what would reopen it**. Then run the ending below.

## Ending a raid

Both endings run this, the one that shipped and the one that stopped short. In this order, because each step destroys what the one before it reads.

1. **Write the lore, if it was built.** Load `zenku:lore`, once, with **every solved quest's design in hand**: the venture's, which settled the shape, and this raid's, which landed it. This is the whole effort's output as a durable page, written when the thing exists and can be described in the present tense, which is why no quest wrote one on the way here.

   A raid that **stopped short** built nothing coherent, so it writes no page. What it learned goes out through Loot instead.

2. **Close out everything still open**, under this raid and under the venture behind it. Every quest still open, blocked or claimed goes through `zenku:solve` as dropped, with the ending as the reason. Nothing anywhere joins a quest to its adventure's status, so a quest left behind sits in reach forever pointing at a destination nobody is walking to.

3. **Set the statuses** — this raid's, and the venture's if it is somehow still open — and write how it ended.

4. **Strike the worktree.** The spike tree, inherited from the venture, stops being reference and starts being clutter. Remove it and delete its branch, forcing the delete, which git will require because that branch was never merged and never going to be.

   Nothing that lives only in that tree survives this, which is why it comes after the lore. Check the page and the solved quests carry whatever mattered, because this is the last moment it is recoverable.

Then say what you wrote and what you struck. The lines stay in the solved indexes as the record of what was tried.

## Loot

Last, whichever way the session ended and before you report: nothing may live only in this conversation.

- Work that is now decided → `zenku:log`
- A finding about how something already works, carried by no code → `zenku:lore`
- Something learned about how we work → the section the quest log's charter keeps for it. Offer to add one if there is none.
