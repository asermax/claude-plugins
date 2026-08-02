---
name: design
description: Settle how something is put together before writing it — which modules exist, where the seams go, how data flows, and the actual types and signatures. Use when the user wants to design a feature or a module, work out an interface, decide where a boundary belongs, or when another skill needs a shape agreed before code.
---

Load `zenku:codex`.

Design happens in text, before there is code. Types and signatures are the cheapest spike there is: you can throw away a wrong interface in a sentence and a wrong implementation in a week.

## One descent, from the whole thing down to the signatures

Work top to bottom. Each level is answerable only once the one above it is settled, which is why skipping to the bottom produces signatures for modules nobody agreed on.

1. **The whole thing.** Which **modules** exist and what each one owns, where the **seams** between them are, how **data flows** across those seams, and which **data structures** carry it. Any pattern the project already uses for this kind of problem gets named here, never reinvented below.
2. **This change against it.** Which of those modules this actually touches: what gets added, what gets modified, what gets deleted. Deletion is the level people skip, and it is where most of the value is.
3. **Inside each one.** The classes, functions and modules to create, change or remove, and for each, the types and the signatures. This is the level the build is measured against.

Use these words exactly and do not substitute near-synonyms. A **module** is anything with an interface and an implementation, at any size. Its **interface** is everything a caller must know to use it correctly — the signature, but also the invariants, the ordering constraints, the error modes. A **seam** is a place where behaviour can be changed without editing in that place; it is where an interface lives, and it is where a test attaches.

**Go down until you hit something you cannot settle.** That is the stopping rule, and it is the same thing as a trial: shaping a venture usually stops partway down level 1 or 2, because that is exactly where the trials surface. Building goes all the way to the bottom, because by then there are none left.

## What the framework asserts, and nothing else

**Read before you invent.** Find what already exists and prefer extending it. Prefer an existing seam to a new one, put a new seam at the highest point it can go, and take the fewest seams that work — each one is a thing every future reader has to learn.

**A design question you cannot settle is a trial, not a guess.** Say which it is out loud the moment you hit it. Inside an adventure it becomes a trial and the quest records the open question where the answer would have gone. On a loose quest it stops the build until it is answered.

**Show it, agree it, then write it**, and draw the diagram the project's charter asks for whenever the subject has a shape. A shape described in a paragraph is a shape nobody checks.

**Signatures yes, file paths no.** A type or a signature *is* the design and belongs in the record. Specific file paths and working implementations do not: they rot before the build finishes, and they turn a design into a plan nobody can follow. This is the mirror of the rule in `zenku:lore` — a signature earns its place before the code exists and loses it afterwards, once the compiler owns it.

## Say what you settled

Which parts are decided, which are open and what would close them, and what you deliberately left for later.

Then write it into the **quest's own** design section and nowhere else. Nothing copies up into the adventure: one shape, one file, and the adventure's solved index points at it. If a quest record covers this, close it with `zenku:solve`.
