---
name: lore
description: Write or update a durable note in the project's vault explaining how one part of the system works, following the project's own writing charter and templates. Use when the user wants something documented, a mechanism written up, a note brought back in line with the code, or when another skill has changed how something works and the explanation has to follow.
---

# Lore

The durable half of the vault. The quest log records what we did and decided and goes stale by design; **lore explains how a part works**, in the present tense, and it is what someone reads instead of the code when they need to hold that part in their head.

Load `zenku:codex`, and **read the charter and the target folder's own README before writing a line.** The charter decides the headings, the callouts, the diagrams, the wrapping, the frontmatter. Where it is more specific than anything here, it wins.

Most of the time a draft already exists: the design `zenku:design` settled is mechanism-first prose with a diagram in it. Writing lore is then mostly a move, minus the signatures, which the code now owns and typechecks.

At the end of an adventure the draft is several of them, one per solved quest, and this runs **once** for the whole effort: one shape out of many, with the disagreements between them settled rather than reproduced. Nothing was written on the way there, so this is where all of it lands at once, describing a thing that by now exists.

## 1. Pick the folder, and say which

Use CLAUDE.md's `### When adding something` and the folder table in the charter. Announce the folder and the reason in one line before writing. A note in the wrong folder is worse than a missing one: findable, wrong, and nobody looks for a second copy.

Search the folder first and **prefer extending the note that already covers it**. A new section in the right note beats a new note beside it, and near-duplicates are how an index stops being readable. When it is genuinely its own part of the system, create it from the project's template, never from anything carried in this plugin.

## 2. Write it

The charter owns the shape. The framework asserts four things about the content:

**Mechanism first.** The shape of the data, what calls what, in what order. This is the bulk of it. A reader should be able to follow the part without opening the source.

**Explain the code, do not reprint it.** Explanation is not transcription. A declaration belongs in the file it lives in, where it is typechecked and cannot rot. What a reader cannot get from that file is why each part exists and who asks it — so the surface goes in a table of what each member answers, and the behaviour goes in prose or a diagram. A snippet survives only where the code *is* the insight, at two to four lines. Written the other way a note comes out a third fenced code, and the copy rots.

**The reasoning goes in a callout beside the thing it justifies, never as the spine.** Opening with the argument makes the reader meet the case for the design before the design. Keep the argument — it is what lets a decision be revisited rather than re-argued — beside the mechanism, never in front of it, and link the evidence from inside it. State the actual reason, not its provenance: *"a strict test would freeze a thing already overlapping a wall"*, not "because the spike showed".

**No ceremony.** Every section explains something that exists. A section doing bookkeeping does not belong.

Two things worth writing that are easy to skip: **what is not built yet** — what is deliberately absent and what would ask for it, so an omission does not read as an oversight — and **a diagram whenever the subject has a shape**. A state machine, a data model, a sequence or a request's path all read faster drawn. Follow the charter's convention; where it names mermaid, do not draw in ASCII.

## 3. Describe the present

**No "used to", no "previously", no "no longer", no "replaced by".** A rejected alternative is *considered and not chosen, because…* inside a callout: a standing reason, not a history of the argument.

This bites hardest when updating, which is most of the time, and then the rule is surgical. Change only what actually changed; if a section still describes the code correctly, **leave it exactly as it is**. Insert new behaviour without disturbing what is there. Delete behaviour that is gone; do not annotate it as removed. A note rewritten wholesale to accommodate one paragraph is a diff nobody can check.

## 4. Land it in its index

**Link it from at least one existing note**, or nobody reads it.

Then check how the folder's index works. A generated index means the note appears by existing, *provided its tag is right* — confirm the tag against the charter and the neighbouring notes, because **a wrong tag drops a note out of its index silently**, with no error anywhere. A hand-maintained table means adding this note's row and nothing else; do not churn the others.

## 5. Say what you wrote

Which note, which folder, which sections are new or changed, and what you deliberately left untouched. If reasoning went into a callout, quote it: it is the part written on the user's behalf, and it is short enough to read.
