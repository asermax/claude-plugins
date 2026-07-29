---
title: "<<PROJECT>> — docs"
tags:
  - index
summary: "The vault: what each folder holds, how files are named, and how to write a note."
---

# <<PROJECT>> — docs

This folder is an Obsidian vault. Open `<<VAULT>>/` as the vault root.

## The folders

| Folder | Holds | Index |
|---|---|---|
<<FOLDER_ROWS>>

<<FOLDER_SPLIT>>

`<<LAB>>/` holds records rather than notes, and the writing charter below does not apply to it — see its own index for what does. The distinction that matters is that a note explains how something *is*, while a record says what we tried or what we intend to do. When an experiment settles something, the outcome moves into a note; the experiment stays where it is, as the evidence behind it.

`_templates/` and `_bases/` hold no notes. The underscore is a sorting convention and nothing more: it floats them to the top of the file explorer. Obsidian gives it no meaning and neither folder is hidden.

## Naming, and why it matters

Wikilinks resolve by note name rather than by path, so `[[some-note]]` works from anywhere and nobody has to track where a file sits. That holds **only while file names are unique across the whole vault**, which is the constraint behind the naming rule:

A note is named after the aspect it explains, in kebab-case. Not after its folder, not numbered, not dated — an experiment's date is a frontmatter field, which is what its index sorts on.

Before adding a note, check the name is not taken. A collision does not error; it silently makes every link to that name ambiguous.

## Frontmatter

Every file carries `title`, `tags` and `summary`, plus `aliases` where a short name is useful. The summary is what shows up in search, in hover previews and in the indexes, so write it as a sentence about the subject rather than about the note.

**Tags carry the whole classification.** A note's tag is what puts it in its folder's index; `index` marks an index itself. There is no separate property for any of it, so a query and a reader are looking at the same field.

The indexes are generated from that: each one embeds a base out of `_bases/` that queries the tag. **A note appears in its index by existing** — there is no row to remember to add. The folder table above is the exception that stays by hand, because its rows describe folders and a base has only notes to query.

The corollary is the failure mode worth knowing: **a wrong tag drops a note out of its index silently.** Nothing errors, the note is simply not there.

## How to write a note

**A note explains how one part works.** Mechanism first: the shape of the data, what calls what, in what order, with a diagram when the subject is a flow, a tree or a sequence. A reader should be able to hold that part of the system in their head without opening the source first.

**Reasoning goes in a callout, beside the thing it justifies** — not as the spine of the note:

```markdown
> [!note] Why it is this way and not the obvious alternative
> The reasoning, next to the mechanism it justifies.
```

A note that opens with the argument for a design makes the reader meet the case for the architecture before the architecture itself, and the argument is not what they came for. It is still worth keeping — it is what lets a decision be revisited rather than re-argued — it just is not the spine. Per-decision *why* is also the one thing the code already has, densely, at the point of each decision; what code cannot give anyone is the shape of the whole.

Three callout kinds, and they mean different things:

- `> [!note]` — a real choice, and why it went that way.
- `> [!warning]` — a failure mode: what breaks, how it presents, and whether anything catches it. Prefer failures that have actually happened.
- `> [!info]` — an alternative considered and not taken, with the reason it was not.

**A note is not a decision record.** There is no requirements table, no acceptance criteria, no user story, no status ladder. Those describe work being planned; a note describes something that exists.

**A note describes the present.** No "used to", no "previously", no "no longer". An alternative that was rejected is *considered and not chosen, because…* — a standing reason, not a history of the argument.

Create a note from `_templates/note.md`. Point Settings → Templates at `_templates` once, and "Insert template" fills in the title and date. Then **link it from at least one existing note**: a note nothing links to does not get read, generated index or not.

## House style

- **No hard wrapping.** One line per paragraph; let the editor wrap. Diffs then show changed sentences rather than reflowed blocks.
- **Headings name what they cover.** "The four phases" gives a reader nothing to search for; "the four phases of a request's life" does.
- **Write about our implementation.** A comparison with some other tool is allowed inside a callout that justifies a decision, and nowhere else — a note is not a literature review.
- **Mermaid, not ASCII**, for anything with a shape.
- Close a note with a `---` rule and a `Related:` line linking the notes it actually touches.

## Adding a folder

A folder is four things, and they have to agree:

1. The directory.
2. A `README.md` in it, tagged `index`, carrying that folder's charter and embedding its base.
3. A `.base` in `_bases/` filtering on the folder's tag.
4. A row in the folder table above.

`zenku:init` will do all four and leave anything that already exists alone, or do it by hand from this list — the skills read what is here either way. What breaks is doing three of the four: a folder with no row is invisible to anyone reading this file, and a row with no folder sends people looking for something that is not there.
