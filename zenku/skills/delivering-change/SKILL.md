---
name: delivering-change
description: The shared discipline for building something that has already been decided: agree the shape, build to the project's bar, verify, review for fit, write the note, then stop for the user before anything is committed.
user-invocable: false
---

# Building something that has been decided

Resolve the project's conventions per `zenku:framework-core` §1 before starting.

What is *not* here is the decision. By the time this runs, someone has already decided the thing is worth building (at the idea, or when the work item was written down). This is about what happens between that decision and a commit.

## 1. Agree the shape

**This is a conversation, not a step to execute.** Do not propose a plan and start building it.

What the experiments learned usually changes the shape of the answer, and often changes what is worth building at all: the mechanism that proved a point is rarely the mechanism you want. For a work item the shape is usually smaller and more obvious, but it is still agreed rather than assumed. Work through, together:

- **What is actually being adopted.** What ships is frequently smaller than what was built, or larger, or somewhere else entirely.
- **Where it lives.** Read the recipe table in CLAUDE.md's lab section and the charter of the folder this touches, and follow them.
- **What the project's standing rules force.** Whatever the project records as non-negotiable (wherever it records it) walked against the proposed shape *before* writing code, not after. Each such rule tends to rule out a shape a spike was allowed to use. If the project records none, **say so** rather than inventing any.
- **What was deliberately faked**, and which of those fakes now needs to be real. Some do not: a hardcoded value is fine if there is only ever one of them.
- **What it drags in behind it.** What else has to change, what it constrains later, what it makes harder. Easier to name before building than after, and the fastest way to find out that the plan is wrong.

Agree the shape before writing anything. If the conversation reveals the change is larger than one branch, say so and stop: that is a finding, and it goes back through `zenku:capture-idea` or `zenku:capture-backlog` rather than being built anyway.

## 2. Build to the project's bar

The bar a spike was exempt from and this is not. Follow the project's code style as CLAUDE.md and the codebase state it; this skill restates none of it and should not be read as loosening any of it.

**New or changed behaviour gets new or updated automated coverage.** Running the existing suite is not the same as testing what you added.

Nothing that exists only to make a test pass: no test-mode branches, no environment checks in code that ships.

## 3. Verify

Run the project's `**Checks**`. Then do whatever its `**Seeing it work**` says: launch the thing and drive the real path a user or caller would.

If `Seeing it work` is not recorded, ask once (*"beyond the checks, how would you confirm this actually works, and what fails silently here?"*) and offer to record the answer for next time. If the change genuinely has no runtime surface, say so and rely on the automated coverage rather than faking the step.

Anything red: say which, and stop. Do not proceed to a review with failing checks.

Stay in the local or development environment throughout. Never touch production, and never run a destructive or irreversible command to demonstrate that something works.

## 4. Review it for fit

Dispatch `zenku:change-reviewer` with the diff, the notes covering the parts touched, and whatever standing rules the project records.

Apply everything mechanical it finds. Anything that is a genuine choice (two defensible shapes, a trade-off someone has to pick) goes to the user rather than being decided quietly.

This runs on every built change. **A work item is not a smaller class of change**: the reviewer's job is to catch a change that contradicts a recorded rule, reimplements something that already exists, or drifts from the shape of the code around it, and none of those correlate with how big the change was.

## 5. Write the note

Load `zenku:note` and follow it. **A change to how something works that leaves no note is half done.**

Write it now rather than after approval, because the note is part of what gets reviewed. A note written after the user has already said yes is a note nobody reads.

## 6. Stop. The user reviews before anything is committed

**Nothing built in steps 2 to 5 gets committed until the user has looked at it and said so.** Leave the whole change uncommitted, report what is there, and wait.

Green checks are not a review. Passing checks mean the code runs; they say nothing about whether this is the thing the user wanted built, and the shape agreed in step 1 is a sketch that the writing always changes in ways worth seeing. Committing first does not technically prevent a review, but it changes the question from "is this right" to "is this worth undoing", and those get different answers.

So report, in one message:

- **What was built and where.**
- **Anything that came out differently from what step 1 agreed**: this is the part most worth their attention, and the part you are most likely to skip.
- **What the reviewer found and what you changed in response**, including anything you decided not to change.
- **What is still not done**, if anything.

Then hand it over and wait.

This step exists because it was missed in practice: an implementation reached a merged trunk before the user had seen a line of it, and undoing it cost a five-commit rewind.

## 7. Iterate until they are done, then offer to commit

If they asked for changes, make them and come back to step 6. That loop runs as many times as it needs to; the change stays uncommitted throughout.

When they are done, **offer** to commit via `zenku:commit`. Never commit as a matter of course: approval of a diff is not an instruction to commit it, and the user may want to keep iterating, fold this into other work, or handle the commit themselves. Offer, and wait.
