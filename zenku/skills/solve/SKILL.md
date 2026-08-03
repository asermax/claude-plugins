---
name: solve
description: Close a quest out once its answer exists — write the answer on it, set its status, gist it into the adventure's solved index, and clear it from every blocked_by list that named it. Use when a question has just been answered or a slice has just been built, or when another skill has produced the result a quest was waiting on.
---

Load `zenku:codex`.

A quest that has been answered but not closed is worse than one nobody started: it still shows as in reach, it still blocks whatever waited on it, and the next session does the work again.

If no quest record covers what was just done, say so and stop. This closes records; it does not create them.

## 1. Write the answer on the quest

What was found or built, how far it reaches (how many inputs, whose machine, which version), and what would make it stop being true. Long enough to be worth rereading, short enough that someone does.

## 2. Set its status

Answered or built → solved. No longer worth doing → dropped, with the line saying why.

## 3. Clear it from every blocked_by list that names it

**Every terminal outcome, not only a solved one.** A quest dropped or ruled out of scope still has to release what waited on it, and this is the step most easily skipped because nothing about a dropped quest feels like progress.

Nothing else moves a quest into reach. The index reads that field directly instead of following a chain, so a closed quest left in a blocked_by list keeps its dependants invisible with no error anywhere. The order things actually happened survives in the solved index and in git, which is why the field empties instead of accumulating.

**A loose quest stops here.** Steps 4 and 5 are an adventure's bookkeeping, and what happens to the record afterwards belongs to whoever dispatched the session.

## 4. Gist it into the adventure's solved index

Follow the shape the index itself asks for. Two things the framework needs from the line whatever that shape is: it **points rather than restates**, and it **names anything the quest left behind** that someone may need to open.

**Nothing copies up.** The reasoning and the shape stay on the quest, in one place, and the index carries only enough to decide whether to open it. An adventure that accumulates its quests' detail stops being readable at about the sixth one, which is the point where a session most needs to read it.

Naming the artifact is what makes it findable later, and an adventure has later sessions to make it findable for.

## 5. Graduate what the answer made visible

A trial you can now phrase becomes a quest, and comes out of the trials section so it lives in exactly one place.

A quest the answer puts beyond the destination gets **ruled out of scope**: drop it, giving out of scope as the reason, and add the line to the adventure's own out-of-scope section. There is no fifth status for this. The record of why sits where someone reading the destination will meet it.

A quest the answer invalidates gets updated or deleted. Either way, clear it from the lists that named it, per step 3.

## When the session ends without an answer

**Set the quest back to open.** A claimed quest appears in no index view, so an abandoned claim hides the work from everyone including you. Write whatever the session did establish onto the quest before stopping, even when it falls short of an answer.
