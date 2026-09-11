---
name: write-documentation
description: Write or update a note in the project's docs folder explaining how one part of the system works, following the project's own charter and templates. Use when the user wants something documented, a mechanism written up, a note brought back in line with the code, or when mahou:design hands over a settled tree to record.
argument-hint: <what to document, or the design tree to record>
---

Load mahou:basics first, then mahou:docs. Then read `.mahou/write-documentation.md` if present.

# Write documentation

A note explains how a part works, in the present tense, and it is what someone reads instead of the code when they need to hold that part in their head. This skill writes one, or brings one back in line with the code.

Resolve the docs folder as `docs` says, and **read the charter and the target folder's README before writing a line.** The charter decides the headings, the callouts, the diagrams, the wrapping, the frontmatter, the naming rule and how the indexes work. Where it is more specific than anything here, it wins. This skill carries no template body.

Most of the time a draft already exists. When mahou:design hands over a tree, each settled branch carries mechanism-first prose and a validated diagram, and writing the note is mostly a move. When the user asks for a mechanism to be written up, the code is the source and a `mahou:code-scout` reads it so the reading stays out of this conversation.

## 1. Pick the folder, and say which

Use the charter's folder table and, when the project's `CLAUDE.md` has a section on where each kind of change is documented, that section. Announce the folder and the reason in one line before writing. A note in the wrong folder is worse than a missing one: findable, wrong, and nobody looks for a second copy.

Search the folder first and **prefer extending the note that already covers it**. A new section in the right note beats a new note beside it, and near-duplicates are how an index stops being readable. Check the name against every file in the docs folder before creating one; the charter usually says why a collision matters.

## 2. Write it

The charter owns the shape. The content rules are the framework's:

**Overview, then mechanism.** The overview says what the part is and is responsible for, in a few sentences a reader can stop after. Then the shape of the data, what calls what, in what order, in the sections from the template's menu that the subject needs and in the order that reads best, as `docs` describes. This is the bulk of it. A reader should be able to follow the part without opening the source.

**Explain the code, do not reprint it.** A declaration belongs in the file it lives in, where it is typechecked and cannot rot. What a reader cannot get from that file is why each part exists and who asks it, so the surface goes in a table of what each member answers, and the behaviour goes in prose or a diagram. A snippet survives only where the code *is* the insight, at two to four lines.

**The reasoning goes beside the thing it justifies, never as the spine.** Opening with the argument makes the reader meet the case for the design before the design. Keep the argument, since it is what lets a decision be revisited rather than re-argued, in the callout form the charter names, next to the mechanism. State the actual reason, not its provenance: "a strict test would freeze a thing already overlapping a wall", not "because the investigation showed".

**No ceremony.** Every section explains something that exists. A section doing bookkeeping does not belong.

**A diagram whenever the subject has a shape.** A state machine, a data model, a sequence or a request's path all read faster drawn. Follow the charter's convention; where it names mermaid, do not draw in ASCII, and validate every diagram with superpowers:mermaid-validation before the draft is shown.

## 3. Describe the present

No "used to", no "previously", no "no longer", no "replaced by". A rejected alternative is *considered and not chosen, because…*, a standing reason, not a history of the argument.

This matters most when updating, which is most of the time, and then the rule is surgical. Change only what actually changed; if a section still describes the code correctly, **leave it exactly as it is**. Insert new behaviour without disturbing what is there. Delete behaviour that is gone; do not annotate it as removed. A note rewritten wholesale to accommodate one paragraph is a diff nobody can check.

## 4. Check the draft before anyone sees it

Run superpowers:unslop over the draft. It governs the prose; where it disagrees with the charter or the template about form, the charter wins. The known case is emoji heading prefixes, which unslop removes and the seeded template requires; the same holds for callout syntax and for bold on domain terms the charter asks for. Then dispatch a `mahou:documentation-reviewer` with the draft, the charter, the folder README and the template, and apply what it reports: those are departures from rules the project wrote for itself, so applying them is not a decision. Anything it reports that turns on the content rather than the form goes to the user as a question.

Then show the whole draft in the conversation and wait. Nothing lands in a file the user has not seen.

## 5. Land it in its index

Write the agreed draft. **Link it from at least one existing note**, or nobody reads it.

Then check how the folder's index works. A generated index means the note appears by existing, *provided its tag is right*: confirm the tag against the charter and the neighbouring notes, because a wrong tag drops a note out of its index silently, with no error anywhere. A hand-maintained table means adding this note's row and nothing else; do not churn the others.

## 6. Say what you wrote

Which note, which folder, which sections are new or changed, and what you deliberately left untouched. If reasoning went into a callout, quote it: it is the part written on the user's behalf, and it is short enough to read.
