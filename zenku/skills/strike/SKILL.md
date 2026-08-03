---
name: strike
description: End an effort and clear it away — close out whatever is still open, carry out anything worth keeping, remove the spike worktree, and delete the effort's records. Use when an adventure has shipped or stopped being worth continuing, when a loose quest has just landed, or when a finished effort was never cleared out of the quest log.
---

Load `zenku:codex`.

An **effort** is the journey, the raid that followed it, and every quest under both. Striking it deletes those records, so the quest log holds work in flight and nothing else, and a session searching it can trust what it finds. **git keeps everything this removes.**

## Check it has actually ended

Name which ending it is before touching anything:

- **It shipped.** Nothing is in reach, nothing is open, and the lore describing what got built is already written. **This skill does not write it** — if there is no page, run `zenku:lore` first and come back, because step 3 destroys what that page is written from.
- **It stopped short.** The user has said it is not worth continuing, and why is written on the record.
- **A loose quest landed**, solved or dropped. An effort of one.

Anything else: stop, and say what is still open. An effort with a quest in reach has not ended, and while git makes this recoverable in principle, nobody goes looking.

Say what you are about to strike — the records by name, the worktree, or both — and go on. The deletions land in the working tree uncommitted, which is what makes them reviewable.

## 1. Close out what is still open under it

Every quest still open, blocked or claimed goes through `zenku:solve` as dropped, with the ending as the reason.

Nothing anywhere joins a quest to its adventure's status, so a quest left behind sits in reach forever, pointing at a destination nobody is walking to and indistinguishable from a loose one.

## 2. Loot it

Run `zenku:loot`. It goes here because the next two steps delete what it reads: every quest, and whatever is still only in the spike tree.

This carries the most weight for an effort that **stopped short**. It built nothing and wrote no lore, so Loot is the only thing that survives it, and that includes the condition that would reopen it.

## 3. Strike the worktree

The spike tree stops being reference and starts being clutter. Remove it and delete its branch, forcing the delete, which git will require because that branch was never merged and never going to be.

A raid inherited its tree from the journey, so there is one either way; an effort that cut none has nothing to do here. Nothing that lives only in that tree survives this, so check the lore and the solved quests carry whatever mattered — this is the last moment it is recoverable.

## 4. Strike the records

Delete every record in the effort: the adventure, the journey behind it if there was one, and every quest under both.

Then **check what linked in from outside** — a note, an open record, another adventure — and fix or drop it. A dangling link is the one cost git does not cover, which is why lore never links a record to begin with.

## 5. Offer the commit

Group the deletions as **one commit named after the effort**: what shipped and where the lore page is, or that it was closed and why.

That commit is the effort's entry in the project's history and the only place its name survives, so the message carries more than a deletion usually does. `zenku:commit` is the user's to invoke — say the records are struck and ready, and leave it there.

Then say what you struck: the records, the worktree, and anything you had to unlink.
