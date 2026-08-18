---
name: design
description: Lay out the current shape so the user can settle a new one — which modules exist, where the seams are, how data flows, and what earlier quests already decided. Use when the user wants to design a feature or a module, work out an interface, decide where a boundary belongs, or when another skill needs a shape agreed before code.
---

Load `zenku:codex`.

Design happens in text, before there is code. Types and signatures are the cheapest spike there is: a wrong interface is thrown away in a sentence, a wrong implementation in a week.

The shape is the user's to settle. Your job is to lay the ground under that decision, never to make it. You know no better than they do — you only know what you have read. So the moment you map the sides of a fork or say which way you lean, you have taken the decision out of their hands. Do not. Bring the state of things and let them decide on it. If they ask you to explore options, help then, and even then the call is theirs.

## What you bring

Read the code and the adventure, and put in front of the user what actually is — not what you would do about it.

- **What exists.** The modules already there and what each owns, the seams between them, how data crosses those seams, which structures carry it, and any pattern the project already uses for this kind of problem. Read it, do not invent it.
- **What this adventure already decided.** The design quests solved under it, quoted, so a decision made three sessions ago is on the table now instead of being re-litigated or quietly contradicted.
- **What a choice here depends on.** The constraints, the invariants, the facts a decision rests on. Where one is missing, say it is missing.

A fact you can find by looking is yours to go and find — the code, the git history, the docs. If it needs real digging, fire a background subagent for it and keep laying out the rest, folding the finding in when it lands. A fact you cannot find by looking, only by trying, is a trial, not a subagent.

## The descent is the order to work in

Whole thing → this change → the signatures. Each level is the user's to settle, and each is answerable only once the one above it is. Your part is to have the current state ready at each level before they reach it.

1. **The whole thing.** Which **modules** exist and what each owns, where the **seams** between them are, how **data flows** across those seams, and which **data structures** carry it.
2. **This change against it.** Which of those modules it actually touches: what gets added, what gets modified, what gets deleted. Deletion is the level people skip, and it is where most of the value is.
3. **Inside each one.** The classes, functions and modules to create, change or remove, and for each, the types and the signatures. This is the level the build is measured against.

Use these words exactly and do not substitute near-synonyms. A **module** is anything with an interface and an implementation, at any size. Its **interface** is everything a caller must know to use it correctly — the signature, but also the invariants, the ordering constraints, the error modes. A **seam** is a place where behaviour can be changed without editing in that place; it is where an interface lives, and it is where a test attaches.

**Go down until the user hits something they cannot settle.** That is the stopping rule, and it is the same thing as a trial: shaping a journey usually stops partway down level 1 or 2, because that is exactly where the trials surface. Building goes all the way to the bottom, because by then there are none left.

## Diagnostics you can run

Three checks on the code as it stands. Each is a **fact you run and report**, never a verdict: they describe the current shape so the user can weigh it, and none of them decides the change. Run one, say what it found, and stop there.

- **The deletion test.** Imagine deleting a module. If its complexity vanishes, it was a pass-through; if the same complexity reappears spread across its callers, it was earning its keep. Report which — the user decides what to do about a pass-through.
- **One adapter, two adapters.** One thing satisfying an interface is a hypothetical seam; two is a real one. Before a seam gets treated as settled, report how many things actually vary across it.
- **Depth.** How much behaviour sits behind the interface against how wide the interface is. A wide interface over a thin body is shallow. Report it; whether shallow is wrong here is the user's call.

## What the framework asserts

**Read before anyone invents.** Find what already exists so the user can prefer extending it. An existing seam over a new one, a new seam at the highest point it can go, the fewest seams that work — each one is a thing every future reader has to learn, so the count is worth the user knowing before they decide. This is ground you bring, not a choice you make for them.

**A decision the user cannot make yet is a trial, not a guess.** Say which it is out loud the moment you reach it. Inside an adventure it becomes a trial and the quest records the open question where the answer would have gone. On a loose quest it stops the build until it is answered.

**Draw it when it has a shape.** When the current state or the settled design has a shape, draw the diagram the project's charter asks for. A shape described in a paragraph is a shape nobody checks.

**Signatures yes, file paths no.** A type or a signature *is* the design and belongs in the record. Specific file paths and working implementations do not: they rot before the build finishes, and they turn a design into a plan nobody can follow. This is the mirror of the rule in `zenku:lore` — a signature earns its place before the code exists and loses it afterwards, once the compiler owns it.

One exception. When a spike produced a fragment that pins a decision more precisely than prose can — a state machine, a reducer, a schema, a type shape — inline that fragment where the decision lives, trimmed to the part that carries the decision, and say it came from a spike. A working demo still does not belong; only the piece that *is* the decision.

## Say what got settled

Which parts the user decided, which are still open and what would close them, and what they deliberately left for later.

Then write it into the **quest's own** design section and nowhere else. Nothing copies up into the adventure: one shape, one file, and the adventure's solved index points at it. If a quest record covers this, close it with `zenku:solve`.
