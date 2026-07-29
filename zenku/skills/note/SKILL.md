---
name: note
description: Write or update a durable note in the project's vault — the narrative explanation of how one part works, following the project's own writing charter and templates. Trigger when the user wants to document how something works, write up a mechanism or a decision, or bring a note back in line with what the code now does.
---

# Write a note

The durable half of the vault. An experiment records what we tried; a note explains **how a part works** — and it is the thing someone reads instead of the code when they need to hold that part of the system in their head.

Resolve the vault and its folders per `zenku:framework-core` §1. **Read the vault's charter and the target folder's own README before writing a line.** The charter, not this skill, decides the shape: the headings, the callout conventions, the diagram conventions, the wrapping, the frontmatter. Where the charter is more specific than anything here, it wins.

## 1. Decide which folder, and say so

Use the recipe table in CLAUDE.md's lab section and the folder table in the charter. Most projects split along one seam — how a thing works versus what it is for — and which side a note belongs on is a question about its *subject*, not about who wrote it or why.

Announce the folder and the reasoning in one line before writing. A note in the wrong folder is worse than a missing one: it is findable, wrong, and nobody looks for a second copy.

A note that would be *mostly* about one side and partly the other goes where it is mostly about, and links across.

## 2. Prefer extending the note that already covers it

Search the folder by name and by summary first. A vault of near-duplicate notes is how an index stops being readable, and a new section in the right note is almost always better than a new note beside it.

Write a new one when the subject is genuinely its own part of the system. Then create it **from the project's template** — never from anything carried in this plugin, per §1 L3.

## 3. Write it

The charter owns the shape. The framework asserts three things about the content, and only these three:

**Mechanism first.** The shape of the data, what calls what, in what order. This is the bulk of the note. A reader should be able to follow the part without opening the source first.

**The reasoning goes in a callout beside the thing it justifies, never as the spine.** A note that opens with the argument for a design makes the reader meet the case for the architecture before the architecture itself — and the argument is not what they came for. It is still worth keeping, because it is what lets a decision be revisited rather than re-argued; it just sits next to the mechanism rather than in front of it. Where the charter names callout kinds, use them: typically one for a real choice, one for a failure mode, one for an alternative that was considered and not taken.

**No ceremony.** No acceptance criteria, no requirements table, no traceability table, no user story, no status ladder. Those describe work being planned; a note describes something that exists. If a section is doing bookkeeping rather than explaining, it does not belong.

One thing worth writing that is easy to skip, and that most charters ask for: **what is not built yet** — what is deliberately absent, and what would ask for it. Keeps the next person from reading an omission as an oversight.

Copy real declarations rather than paraphrasing them. Someone comparing the note to the code should find them identical.

## 4. Describe the present

The note says what the system does now. **No "used to", no "previously", no "no longer", no "replaced by".** A rejected alternative is *considered and not chosen, because…* inside a callout — a standing reason, not a history of the argument.

This applies hardest when **updating** a note, which is most of the time. Then the rule is surgical:

- Change only what the change actually changed. If a section still describes the code correctly, **leave it exactly as it is** — do not reword it, do not improve it, do not restructure it around your new section.
- Insert new behaviour without disturbing what was already there.
- **Remove behaviour that is gone.** Delete the passage; do not annotate it as removed.

The point of the constraint is that a reviewer can see what moved. A note rewritten wholesale to accommodate one new paragraph is a diff nobody can check.

## 5. Link the evidence from the callout carrying the reasoning

The experiment that settled it, the measurement, the discussion. That is what makes a decision revisitable rather than re-arguable a year from now, and it belongs beside the reasoning rather than in the prose.

The prose itself stands on its own terms. State the actual reason — *"a strict test would freeze a thing already overlapping a wall"* — not the provenance of the reason. A note that says "because the experiment showed" has moved its own content into a footnote, and it reads worse every year as the experiment gets less familiar.

## 6. Link it, and check its index

**Link the note from at least one existing note.** A note nothing links to does not get read, generated index or not.

Then check how the folder's index works and make sure this note lands in it:

- **A generated index** — the folder's README embedding a query over a tag — means the note appears by existing, *provided its tag is right.* Confirm the tag against the charter and the neighbouring notes. **A wrong tag drops a note out of its index silently**, with no error anywhere, which is exactly the failure the charter warns about.
- **A hand-maintained table** means adding or updating this note's row, and nothing else. Do not churn the other rows.

## 7. Say what you wrote

Which note, which folder, which sections are new or changed, and what you deliberately left untouched. If the reasoning went into a callout, quote it — it is the part written on the user's behalf, and it is short enough to read.
