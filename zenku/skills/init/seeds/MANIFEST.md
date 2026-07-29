# What each seed is, where it lands, and what to substitute

Read this before writing anything. These files are **seed material**: once written, they belong to the project, and every other skill reads what the project has rather than what is here.

## The two token syntaxes, and why the distinction is hard

**`{{title}}` and `{{date:YYYY-MM-DD}}` are Obsidian's.** They pass through **untouched**. That is what lets one file serve both a human using "Insert template" and an agent scaffolding a note. Never substitute them.

**`<<TOKEN>>` is yours.** Every one gets replaced during `init`.

**Post-condition: zero `<<` remain in anything you wrote.** Check it before reporting. Token substitution is used rather than "adapt this prose to the project" precisely because it is checkable: a generative adaptation produces different output every run, and different output makes the never-overwrite comparison impossible on a re-run.

## Where each seed lands

| Seed | Lands at | Instantiated |
|---|---|---|
| `vault-README.md` | `<<VAULT>>/README.md` | once |
| `lab-README.md` | `<<VAULT>>/<<LAB>>/README.md` | once |
| `note-folder-README.md` | `<<VAULT>>/<<FOLDER>>/README.md` | **once per note folder** |
| `template-note.md` | `<<VAULT>>/_templates/note.md` | once |
| `template-idea.md` | `<<VAULT>>/_templates/idea.md` | once |
| `template-experiment.md` | `<<VAULT>>/_templates/experiment.md` | once |
| `template-work.md` | `<<VAULT>>/_templates/work.md` | once |
| `base-notes.base` | `<<VAULT>>/_bases/<<FOLDER>>-notes.base` | **once per note folder** |
| `base-ideas.base` | `<<VAULT>>/_bases/ideas.base` | once |
| `base-experiments.base` | `<<VAULT>>/_bases/experiments.base` | once |
| `base-work.base` | `<<VAULT>>/_bases/work.base` | once |

Plus a `.gitkeep` in each lab folder that starts empty.

The two per-folder seeds are what make an arbitrary number of project-chosen folders work. **There is no built-in set of note folders anywhere in this plugin**: there are only instantiations of these two files.

## Which tokens get substituted

Vault-wide, decided once in the interview:

| Token | Is |
|---|---|
| `<<PROJECT>>` | The project's name, as its repository calls it |
| `<<VAULT>>` | The vault directory, relative to the repository root (e.g. `docs`) |
| `<<LAB>>` | The lab directory, relative to the vault (e.g. `lab`) |
| `<<IDEAS>>` `<<EXPERIMENTS>>` `<<WORK>>` | The three lab subdirectory names |
| `<<FOLDER_ROWS>>` | The rows of the charter's folder table, one per folder including the lab and the two support folders |
| `<<FOLDER_SPLIT>>` | A paragraph naming the seam between the note folders and giving **one worked example from this project** of a subject that could look like either and belongs on one side. Without a concrete example the rule does not survive contact with a real note. |
| `<<FIRST_TAG>>` | The tag of the first note folder: the default in the note template, which someone swaps by hand for the other |

Per note folder, in `note-folder-README.md` and `base-notes.base`:

| Token | Is |
|---|---|
| `<<FOLDER>>` | The directory name |
| `<<TAG>>` | The tag that puts a note in this folder's index |
| `<<HOLDS>>` | One line on what this folder holds: the charter's row for it, expanded |
| `<<DISPLAY>>` | The human name for this folder's index, e.g. `Technical design` |
| `<<EXPLAINS>>` | What the index's summary column should be called: what a note here *does*, in one word or two: `Explains`, `Describes`, `Covers` |

## Rules while writing

**Never overwrite.** A target that exists is `kept`, untouched, regardless of whether it matches a seed.

**Do not add a folder or a template nobody asked for.** A template for a kind the project does not use is a shape someone will feel obliged to fill.

**Leave a field out rather than guessing it.** An unanswered interview question means the line is omitted, not filled with a plausible default. A later skill will ask at the moment it matters and offer to record the answer.

**The seeds are minimal on purpose.** Each one is instructional prose in place of placeholder content: the template *is* the writing guide, which is why there is no separate reference explaining how to write a note. Resist expanding them during `init`; the project will expand what it actually needs.
