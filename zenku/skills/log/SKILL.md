---
name: log
description: Write something into the project's quest log in a few seconds — a bug, a chunk of work, a half-formed idea — without deciding anything about it. Use when the user says to note this down, add it to the backlog, capture this, or remember this for later, or when another skill turns something up that must not live only in the conversation.
---

Load `zenku:codex`.

This costs seconds and commits to nothing. Someone had a thought worth not losing; the whole job is getting it out of their head intact.

**Write a quest by default.** One session's worth of something, whatever kind it is. If what they are describing is plainly too big and too foggy for that, say so in one line and offer to log it as an adventure instead — but do not shape it here, because shaping is a session of its own.

## Writing it

Take the fields off the project's template, not off any list in this skill. A project carrying a field this skill has never heard of gets it filled in like every other one.

Name the file in kebab-case after the thing itself, and check the name is **unique across the whole vault** — wikilinks resolve by name, so a second `sync.md` anywhere silently breaks links to the first.

Then write what they said, and stop.

## What makes this go wrong

**Write their thing, not your improvement of it.** This is the rule this skill breaks most easily. An entry that arrives back subtly better than what they said is one they have to read carefully to correct, which defeats the point of it taking seconds.

**Check whether it is already there** before writing a second copy. Search by name and by content.

**One thing per entry.** Two things logged together get worked as one and half-finished as one.

**A constraint is not a second entry.** "It has to keep working offline" belongs inside the thing it constrains.

**Do not do it.** Log it and offer to go on.

Say what you wrote and where. If it sounds like they meant to start on it now rather than shelve it, say they can run `zenku:venture` to clear the ground, or `zenku:raid` if there is nothing to clear and it just needs building. Both are theirs to invoke, not yours.
