---
name: capture-backlog
description: Write down work that is already decided — a defect, an agreed slice, a chore — into the work backlog without breaking flow. Trigger when the user reports a bug or names something that plainly needs doing and should not interrupt what is currently being worked on.
---

# Capture a piece of work

Cheap by design. This takes seconds, commits to nothing, and gets out of the way. It holds work where **what to do is known and the only open question is whether it is done yet.**

Resolve the vault, the work folder and its template per `zenku:framework-core` §1 before writing anything.

## What belongs here, and what does not

A work item is decided. A bug someone hit, a slice the user has already agreed to build, a chore that has to happen. Nobody needs to learn anything before starting — they need to remember to start.

An **idea** is the opposite: something we want to be able to do, with unknowns standing between us and it. It goes through a shaping lifecycle because the unknowns have to be named before anything can clear them, and it ends in a decision about whether the objective is worth reaching at all.

**So check which one this is, and say which you concluded.** The test that works: *is there anything here we would have to find out before we could start?*

- Nothing to find out → a work item. Write it here.
- Something real to find out → **say so and offer `zenku:capture-experiment` instead.** A bug pushed through a shaping lifecycle produces states that mean nothing, and the decision skills have nothing sensible to do with it.
- A bug whose *fix* is unknown → usually still a work item, with the unknown named in it. It becomes an idea only when the objective behind it is genuinely unclear — "we cannot trust that this input is what it claims to be" is an objective with unknowns; "this crashes on an empty list" is not.

When it is a close call, say which way you went and why, in one line. Getting it wrong is cheap to fix and expensive to leave.

## What to write

A note in the project's work folder, created from the project's work template, kebab-case and **unique across the whole vault** — wikilinks resolve by name.

Read the fields and the sections off the template rather than off any list here. What the framework expects to find, whatever the project calls it:

- **For a defect** — what happens, how to reproduce it, and what should happen instead. Reproduction detail is the whole value of writing a bug down; a bug report nobody can reproduce is a bug report nobody will fix.
- **For a slice or a chore** — what gets built, and any ordering or dependency that has already been agreed. If the order was settled in a conversation on a date, say so; that is the part which evaporates.

**Short.** A few sentences. Anything longer usually means this is bigger than one item, or that it was an idea after all.

Then close and link it the way the project's house style does.

## Filling in the fields

Propose them all rather than asking, then say in one line what was guessed.

The values are the project's. Where it carries a priority, that is what decides order — this backlog has no separate ordering artifact, and the priority field plus the generated index *is* the queue. Where it distinguishes a kind, use it: a defect and an agreed slice read very differently a month later.

The framework asserts only the lifecycle: an item is open, or being worked on, or done, or dropped. `zenku:work-on-backlog` moves it.

## Rules

**Write what the user reported, not your diagnosis of it.** Especially for a bug. What they saw, what they expected, what they did — those are facts. Your theory about the cause is a theory, and a theory written into the item as though it were the report sends whoever picks it up down your path before they have looked. If you have one, offer it in the reply as yours, or put it in the item clearly marked as a guess.

**Check for an item that already covers it** and extend that one instead of writing a second. Two items for one bug is how a backlog stops being trusted.

**One thing per item.** Two bugs that share a cause are still two bugs; note the shared cause in both.

**Do not fix it.** No code, no investigation beyond what the user already told you. Write the item, confirm in one line, and return to whatever was happening. The exception is the obvious one: if the user asked you to fix it, they did not ask for a backlog item — use `zenku:work-on-backlog`, or just do the work.

## Confirming

The title, where it landed, the guessed fields, and — for a defect — the reproduction steps quoted back, because that is the part which has to be the user's. One line if you had to choose between this and an idea, saying which you chose.
