# What each seed is, where it lands, and what to substitute

These files are **seed material**: once written, they belong to the project, and every other skill reads what the project has rather than what is here.

## The two token syntaxes

**`{{title}}` and `{{date:YYYY-MM-DD}}` are Obsidian's.** They pass through **untouched**, so one file serves both a human using "Insert template" and an agent scaffolding a note. Never substitute them. In a project that does not use Obsidian they are still the placeholders `mahou:write-documentation` fills in.

**`<<TOKEN>>` is yours.** Every one gets replaced during `init`.

**Post-condition: zero `<<` remain in anything you wrote.** Check it before reporting. Token substitution is used rather than "adapt this prose to the project" because it is checkable: a generative adaptation produces different output every run, and different output makes the never-overwrite comparison impossible on a re-run.

## Where each seed lands

| Seed | Lands at | Instantiated |
|---|---|---|
| `charter-README.md` | `<<DOCS>>/README.md` | once |
| `folder-README.md` | `<<DOCS>>/<<FOLDER>>/README.md` | **once per note folder** |
| `template-note.md` | `<<DOCS>>/_templates/note.md` | once |

The per-folder seed is what makes an arbitrary number of project-chosen folders work. **There is no built-in set of note folders anywhere in this plugin**: there are only instantiations of that one file.

**On a re-run, the charter's folder table gets a row appended for any folder missing one**, and nothing else in that file is touched. It is the one existing file this skill writes into.

## Which tokens get substituted

Docs-wide, decided once in the interview:

| Token | Is |
|---|---|
| `<<PROJECT>>` | The project's name, as its repository calls it |
| `<<DOCS>>` | The docs directory, relative to the repository root (for example `docs`) |
| `<<FOLDER_ROWS>>` | The rows of the charter's folder table, one per note folder. Leave `_templates` out: the charter explains it in prose directly below the table |
| `<<FOLDER_SPLIT>>` | A paragraph naming the seam between the note folders and giving **one worked example from this project** of a subject that could look like either and belongs on one side. Without a concrete example the rule does not survive contact with a real note. With a single folder, one sentence saying every note goes there |
| `<<CODE>>` | The code roots a reader would otherwise open, for the charter's "without opening" sentence (for example `src/`) |

Per note folder, in `folder-README.md`:

| Token | Is |
|---|---|
| `<<FOLDER>>` | The directory name |
| `<<HOLDS>>` | What this folder holds, as a **lowercase noun phrase with no full stop**: `the shape of the system and how each part works`. It is read into a sentence in two places and into the charter's table in a third, so any other form comes out wrong in at least one |
| `<<DISPLAY>>` | The human name for this folder's index, for example `Technical design` |

## Rules while writing

**Do not add a folder or a template nobody asked for.** A template for a kind the project does not use is a shape someone will feel obliged to fill.

**The seeds are minimal on purpose.** Each one is instructional prose in place of placeholder content: the template *is* the writing guide, which is why there is no separate reference explaining how to write a note. Resist expanding them during `init`; the project will expand what it actually needs.

**Links are relative markdown links, not wikilinks**, so the same file renders on GitHub and in Obsidian. Callouts use the `> [!NOTE]` form for the same reason: GitHub reads the uppercase kinds, Obsidian reads either.
