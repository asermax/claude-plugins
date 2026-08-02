# What each seed is, where it lands, and what to substitute

These files are **seed material**: once written, they belong to the project, and every other skill reads what the project has rather than what is here.

## The two token syntaxes, and why the distinction is hard

**`{{title}}` and `{{date:YYYY-MM-DD}}` are Obsidian's.** They pass through **untouched**. That is what lets one file serve both a human using "Insert template" and an agent scaffolding a note. Never substitute them.

**`<<TOKEN>>` is yours.** Every one gets replaced during `init`.

**Post-condition: zero `<<` remain in anything you wrote.** Check it before reporting. Token substitution is used rather than "adapt this prose to the project" precisely because it is checkable: a generative adaptation produces different output every run, and different output makes the never-overwrite comparison impossible on a re-run.

## Where each seed lands

| Seed | Lands at | Instantiated |
|---|---|---|
| `vault-README.md` | `<<VAULT>>/README.md` | once |
| `quest-log-README.md` | `<<VAULT>>/<<QUESTLOG>>/README.md` | once |
| `note-folder-README.md` | `<<VAULT>>/<<FOLDER>>/README.md` | **once per note folder** |
| `template-note.md` | `<<VAULT>>/_templates/note.md` | once |
| `template-adventure.md` | `<<VAULT>>/_templates/adventure.md` | once |
| `template-quest.md` | `<<VAULT>>/_templates/quest.md` | once |
| `base-notes.base` | `<<VAULT>>/_bases/<<FOLDER>>-notes.base` | **once per note folder** |
| `base-quest-log.base` | `<<VAULT>>/_bases/quest-log.base` | once |

The two per-folder seeds are what make an arbitrary number of project-chosen folders work. **There is no built-in set of note folders anywhere in this plugin**: there are only instantiations of these two files.

A folder for **records rather than notes**, if the interview turned one up, gets the same four parts as any other: the directory, a README tagged `index` carrying its own charter and embedding its base, the base, and a row in the vault charter's folder table. Write its charter to the shape of that folder, and leave out the reference to the note-writing charter, which does not govern records.

**On a re-run, the vault charter's folder table gets a row appended for any folder missing one**, and nothing else in that file is touched. It is the one existing file this skill writes into, because a folder with no row is invisible to anyone reading the charter.

## Which tokens get substituted

Vault-wide, decided once in the interview:

| Token | Is |
|---|---|
| `<<PROJECT>>` | The project's name, as its repository calls it |
| `<<VAULT>>` | The vault directory, relative to the repository root (for example `docs`) |
| `<<QUESTLOG>>` | The quest log directory, relative to the vault (for example `quest-log`) |
| `<<FOLDER_ROWS>>` | The rows of the charter's folder table, one per note folder plus the quest log. Leave `_templates` and `_bases` out: the table's third column is the folder's index and neither has one, and the charter already explains both in prose directly below it |
| `<<FOLDER_SPLIT>>` | A paragraph naming the seam between the note folders and giving **one worked example from this project** of a subject that could look like either and belongs on one side. Without a concrete example the rule does not survive contact with a real note. |
| `<<FIRST_TAG>>` | The tag of the first note folder: the default in the note template, which someone swaps by hand for the other |

Per note folder, in `note-folder-README.md` and `base-notes.base`:

| Token | Is |
|---|---|
| `<<FOLDER>>` | The directory name |
| `<<TAG>>` | The tag that puts a note in this folder's index |
| `<<HOLDS>>` | What this folder holds, as a **lowercase noun phrase with no full stop**: `the shape of the system and how each part works`. It is read into a sentence in two places and into the charter's table in a third, so any other form comes out wrong in at least one |
| `<<DISPLAY>>` | The human name for this folder's index, for example `Technical design` |
| `<<EXPLAINS>>` | What the index's summary column should be called: what a note here *does*, in one word or two — `Explains`, `Describes`, `Covers` |

## Rules while writing

**Do not add a folder or a template nobody asked for.** A template for a kind the project does not use is a shape someone will feel obliged to fill.

**The seeds are minimal on purpose.** Each one is instructional prose in place of placeholder content: the template *is* the writing guide, which is why there is no separate reference explaining how to write a note. Resist expanding them during `init`; the project will expand what it actually needs.
