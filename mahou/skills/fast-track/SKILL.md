---
name: fast-track
description: Runs a canvas stage skill (shape-with-canvas, design-with-canvas, program-design-with-canvas, test-design-with-canvas) in fast-track mode. Every branch and part is laid out at once, decisions that earlier artifacts already show become settled leaves without a confirmation round, and only the open decisions are asked. Use when the user asks for a fast track, or asks for a canvas stage with no confirmations and every branch at once. Once on, it holds for every canvas stage run in the same session.
argument-hint: [the canvas stage skill to run, and its arguments]
---

Load mahou:basics first. Then read `.mahou/fast-track.md` if present.

# Fast track

The canvas stage skill keeps its procedure, its records and its ending except where a rule below replaces it. The user turning fast track on is the consent to rules 2 and 3, which replace the confirmation that mahou:basics rule 2 asks for while fast track is on.

## Turning it on

- When the user types it on its own, with or without a stage, fast track holds for every canvas stage skill run later in the session. When the argument names a stage skill, load it next and pass it the rest of the argument.
- Loaded by a canvas stage skill whose arguments ask for a fast track.

Say in one line that fast track is on.

## What changes

1. **Lay out the whole tree at once.** The first reply draws every branch, or every part of every branch, with its leaves, its prose and the representation the stage proposes for it. Drop the waits the stage skill puts between them: no approval of the opening tree before the branches open, no approval of a branch or part before the next one opens.
2. **Record what earlier artifacts settled without a confirmation round.** A decision that a file in the change's scratch folder already shows, such as the exploration's decisions, a prototype or `status.md`, becomes a ✓ leaf with its source written on it. A leaf the user corrects goes back to ❔.
3. **Settle single-answer decisions directly.** When a decision follows from leaves already settled or from how the code works today, it becomes a ✓ leaf marked "follows from <leaf or fact>" instead of a proposal asked for confirmation.
4. **Ask only the open decisions, all of them at once.** Every question whose prerequisites are settled goes on the canvas in the same round, each in its branch or part. The canvas skills' limit of two open questions does not apply.
5. **Record each answer as you read it.** Write the reading once in the branch's Agent note, so the user can correct the reading, and apply the correction in place when the user sends it.
6. **Settle a branch or part when its last question closes.** Relabel its area `settled`, draw its final representation as the stage skill describes, and delete its Agent note. Do not ask the user to approve it.

## What stays

- Anything that acts outside the change's scratch folder waits for the user's approval: switching or deleting a branch, writing to the docs folder, and the recording step.
- Anything else the stage skill says that a rule above does not replace.
