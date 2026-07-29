---
name: work-on-backlog
description: Build a defined work item from the work backlog (a defect, an agreed slice, a chore) through the same shape-build-verify-review discipline a promoted idea goes through. Trigger when the user wants to work on, pick up, fix or build a backlog item.
---

# Work on a backlog item

The build path for work that was already decided. No decision to make and no unknowns to clear: those are `zenku:promote` and `zenku:experiment`. What this adds over just doing the work is that the item gets closed honestly and the change goes through the same gate everything else does.

Resolve the vault, the work folder, the commands and the code roots per `zenku:framework-core` §1.

## 1. Pick it up and read it back

If the user named an item, read it. If they did not, list what is open (by priority, as the project's index orders it) and let them pick. Do not pick for them.

**Quote the item back** before starting: what it says happens, what it says should happen instead, what it says is already agreed. Items are often weeks old and written by someone who has since learned more, and a stale item is cheaper to correct now than to build against.

Then check it is still what it claims to be:

- **Already done?** It happens. Say so, close it, and move on.
- **No longer wanted?** Set it dropped with one line of why, and stop.
- **Turns out to carry a real unknown**: the fix depends on something nobody knows, or the "obvious" approach has a question in it? **Stop.** Leave the item open, say what the unknown is, and offer `zenku:capture-idea` so it gets an objective and an experiment. Do not grow the item into a research project; that is the failure this split exists to prevent.

Set the status to in-progress once you are actually starting.

## 2. Build it

Load `zenku:delivering-change` and follow it in full: agree the shape, build to the project's bar, verify, **review for fit**, write the note, stop for the user before anything is committed, then commit what they approved.

**A work item is not a smaller class of change.** It is tempting to skip the shape conversation on a one-line bug fix and the fit review on a small diff, and both are mistakes for the same reason: the reviewer's job is to catch a change that contradicts a recorded rule, reimplements something that already exists, or drifts from the shape of the code around it, and none of those correlate with how large the change was. A one-line fix in the wrong place is exactly the kind of thing nobody notices.

What scales down honestly is the *length* of each step, not whether it happens. For a small defect the shape conversation is often two sentences (here is where the bug is, here is the fix, here is why it belongs there), and that is fine. What is not fine is skipping it.

**For a defect specifically:** reproduce it first, and say you did. A fix for a bug you never saw fail is a guess. Then make the reproduction a test, so it stays fixed: that is the durable form of the bug report, and it is worth more than the item itself.

## 3. Close the item

Write what the item's template calls for: what was actually done, where it landed, and which notes moved. Where the fix differed from what the item proposed, say so; the item was a guess made before anyone looked.

Set the status to done.

If the work turned out to be partial (the defect is fixed for the reported case but not in general, the slice shipped without one piece), **do not mark it done.** Say what is left, and either leave the item open with that narrowed down or capture the remainder as its own item. A done item that is not done is worse than an open one.

## 4. Harvest what is left

Same four routes as the decision skills. Do not stop until nothing lives only in this conversation:

- **A new objective** → `zenku:capture-idea`.
- **More decided work** the change revealed → `zenku:capture-backlog`.
- **A rule that must not be broken again** → wherever the project records its standing rules, or the note explaining the mechanism if it records none.
- **Something about how we work** → a line in the project's lab charter.

A defect worth remembering has a fifth home, and it is usually the best one: the failure-mode section of the note for the mechanism that broke. A bug that actually happened is the most useful kind of documentation, and a note that names it stops the next person reintroducing it.
