---
name: framework-core
description: Load first when working with any zenku skill. Provides the runtime-resolution contract for finding the project's vault and conventions, the rule against assuming structure, the shape of the CLAUDE.md section every skill reads and maintains, the three writing habits, and the framework's non-negotiables.
user-invocable: false
---

# The shared spine

**The plugin owns the process. The project owns the structure.**

The process is this framework's: an idea is an objective plus the unknowns standing between us and it; experiments clear those unknowns one at a time; acceptance criteria are written before the code; a decision about the objective happens once, at the idea, and it is the user's. That much is carried in the skills.

Everything else belongs to the project: which folders exist and what each holds, every template body, every index, the tag names, the note headings, the naming conventions, the commands, what "seeing it work" means here, the code style, the branch pattern, the trunk name. **This file contains no doc structure of its own** — structure comes from the project, which is what §1 is for.

## §1 The resolution contract

### The three authorities, and which one wins

| Layer | Authority over | How you get it |
|---|---|---|
| CLAUDE.md's lab section | Where the vault is · the commands · the spike model · the branch pattern · what "seeing it work" means · the recipe for where a kind of change goes | Already in your context. Read it; do not grep for it. |
| The vault's charter READMEs | Which folders exist · what each holds · naming · frontmatter · which template a kind uses · how to write a note · house style · the full lifecycles | `Read <vault>/README.md`, then the relevant folder's `README.md` |
| Frontmatter | A note's classification (`tags`), its lifecycle (`status`), and its cross-links | Read the note |

CLAUDE.md carries the pointers and the commands; the charter carries the structure. **If they disagree, the charter is right, and both get fixed.**

### Never assume the structure

A skill does not assert a folder name, a note kind, a section heading, a frontmatter field, or a template shape. It reads the charter and the target folder's own README first, and adapts to what it finds — **including the parts it did not expect.**

- Frontmatter fields come off the project's template, not off any list in a skill. A project that carries an extra field gets it proposed like every other one.
- Sections come off the template and off the notes already in that folder.
- Where the project's shape differs from anything a skill sketches as an example, **the project is right.**

Two exceptions, and they are stated as exceptions where they appear: the lab's **status vocabularies**, because the lifecycles *are* the process and the decision skills are defined in terms of them, and the **`## Acceptance criteria`** heading on an experiment, because writing it before the code is the one rule the framework will not bend.

### L1 — Find the vault

1. The `**Vault**` field in CLAUDE.md's lab section.
2. If absent: a directory at depth ≤ 2 holding both a `README.md` and a templates folder. Exactly one → use it, and offer to record it.
3. Several → ask which.
4. None → **the project is not initialized.** Say so, offer `zenku:init`, and stop. Never create a vault as a side effect of another skill.

### L2 — Find the folders and what they hold

`Read <vault>/README.md`. Its folder table is the authority. Then list the vault and **cross-check the two**:

- A table row with no directory, or a directory carrying an index README with no row → the structure changed in one place only. Report both lists in one message, ask which is right, and offer to fix *the table*. **Never create a folder to satisfy a stale row.**
- No charter at all, but a vault directory → say plainly *"this vault has no charter, so I am inferring its shape from what is on disk"*, infer from the directory listing plus the heading structure of one existing note per folder, and **do not write a note into an inferred folder without confirming the folder in the conversation.** Then offer `zenku:init`, which can add a charter without touching a single note.

This is deliberately also the behaviour when someone renames a folder. The rename is theirs, the table is theirs, and the skill's job is to notice the half-done state loudly and cheaply rather than to guess or to "fix" the vault.

### L3 — Find the template for a note kind

1. The target folder's `README.md` names the template it uses.
2. Failing that, the charter's how-to-write section.
3. Confirm against the templates folder listing.

**If no template exists for the kind you were asked to write:** mirror the heading structure of the closest existing note in that folder and say in one line that you did. If the folder is empty too, ask for the shape, or offer `zenku:init` to seed the kind. **Never fall back to a body carried in this plugin** — a plugin-side shape written into a project's vault is indistinguishable from something the project chose, and that is the single failure this design exists to prevent.

The one exception: if the project's experiment template has no `## Acceptance criteria` heading, add the heading and say you added it.

### L4 — Find the commands

The `**Run**` and `**Checks**` fields. Absent → detect from the lockfile or manifest, propose what you found, **run nothing until it is confirmed**, and offer to record it so the next skill does not re-ask. Never infer a package manager from a language.

### L5 — Find the spike model and the branch convention

`**Spikes**` is either `throwaway` — the spike is discarded at promotion and the real thing rebuilt with the answers in hand — or `graduate-in-place`, where the spike is hardened into the real thing. `**Branch**` gives the pattern, commonly one branch per idea. Absent → assume `throwaway` and one branch per idea, say so in one line, and offer to record it.

`throwaway` is the default because the argument for it belongs to the framework: the permission to hardcode, skip tests and ignore structure is what made the spike cheap, and auditing that back out afterwards is slower and less reliable than writing the real thing once the answers are known. A project choosing otherwise should say why in its own charter, and should know the trade-off — a spike you intend to keep grows scope by gravity, which weakens the criteria-before-code rule.

### L6 — Find the trunk and the code roots

**Never hardcode a trunk name.** Resolve it — `git symbolic-ref --short refs/remotes/origin/HEAD`, falling back to the repository's default branch.

Code roots come from the `**Code**` field. If it is absent and you are about to run anything destructive, **ask** — getting this wrong destroys work.

## §2 The CLAUDE.md lab section

Every skill reads this section, and **every skill maintains it**: if you need a field and it is not there, resolve it as above and then offer to add it. A project can reach this framework without ever running `zenku:init` — an existing vault, a hand-written charter — and a field only becomes necessary at the moment something needs it. So the section grows as the project is used, and no interview has to anticipate it.

```markdown
## The lab

- **Vault**: `<path>` — an Obsidian vault. Read its `README.md` before adding, editing, renaming or moving anything under it. It is the authority on what each folder holds, how files are named, what frontmatter they carry, and how the indexes are generated; getting any of that wrong breaks links or silently drops a note out of its index.
- **Notes**: <one line per note folder — what each holds>
- **Records**: <where the ideas, the experiments and the work backlog live>
- **Code**: <the roots a change touches>
- **Run**: <how to launch it>
- **Checks**: <the commands that must be green before a change is done>
- **Seeing it work**: <how someone confirms a change works here, and what fails silently>
- **Spikes**: <throwaway | graduate-in-place>, one branch per idea, `<pattern>`

### When adding something

<a table or list: a kind of change → where it goes>
```

Every field is optional and every one is discovered lazily. Add a missing one when you need it; never rewrite a field someone has edited.

**`Seeing it work`** deserves a note, because it is the one field a project cannot be asked for in the abstract. It records how someone confirms a change actually works here *and what fails silently* — the failure mode that passes every check and still does not work. Ask for it once, after the first build, and record the answer. The framework asserts nothing about what "working" means; it only insists the project has said.

There is deliberately **no restatement of the lab process** in CLAUDE.md. The charter is the only authority on it, and a summary sitting beside it is a second thing to keep in step.

## §3 Nothing lands in a file the user has not seen

Every skill here writes to the vault, and a note carrying your assumptions is worse than a question — it is an assumption with a commit hash. Three habits, and they cost about one message each.

**Quote it, never refer to it.** The user has not read these notes recently and may never have read them at all; several were written by an earlier session. Paste the objective, the unknowns, the criteria **verbatim** into the conversation before discussing them. Never say "unknowns 1 and 2", "the sharp one", or a paraphrase of your own. An unknown the user cannot see is an unknown they cannot correct, and asking someone to choose between numbered items they have never read is asking them to rubber-stamp your reading of the note.

**Show the words, then write them.** Acceptance criteria, the scope of a build, a rewritten unknown, a conclusion, a verdict — draft it in the conversation, get it agreed, and only then put it in the file. Not the reverse with an offer to adjust afterwards: text that is already committed reads as settled, and it gets corrected far less often than it should.

**Write only what was actually said.** Do not add apparatus nobody asked for — a taxonomy of cases, a scoring table, a threshold, a constraint nobody mentioned. If a framing of your own seems useful, offer it as yours and let it be taken or left. A note that accumulates machinery nobody asked for stops being the user's, and it is the usual reason a cheap objective ends up looking expensive.

## §4 The non-negotiables

Four, and they are the whole of it. They belong to the framework, so a project extends them and never waives them; if a project's charter contradicts one, surface the conflict rather than quietly following the charter.

**Acceptance criteria are written before the code.** The reason is timing rather than rigor: decided afterwards, they will be met — not through dishonesty, but because a result is much easier to admire once it is the only one you have. A criterion does not have to be numeric and does not have to be designed to fail. It has to be **observable**: something a person could point at and agree on without having been in the room.

**Every note reaches the trunk before any code is discarded.** Code is expected to be thrown away; the record of what it taught is not. Disposal happens once, at the decision, and that is the last moment a missing note is recoverable.

**Promoting is not a cleanup.** A decision about the objective comes first and separately from the shape of what gets built, and under a throwaway spike model what gets built is written fresh with the answers in hand.

**What gets built is reviewed before it is committed.** Green checks say the code runs, not that it is the thing anyone wanted. See `zenku:delivering-change`.

## §5 The skills

| Skill | Does |
|---|---|
| `zenku:init` | Seed a vault the project then owns, and gap-fill one that exists |
| `zenku:capture-experiment` | Write an objective and its unknowns into the lab |
| `zenku:capture-backlog` | Write down work that is already decided |
| `zenku:experiment` | Define, run and conclude one experiment against one idea's unknowns |
| `zenku:promote` | Decide the objective is worth reaching, then reach it |
| `zenku:drop` | Decide it is not, and record what would reopen it |
| `zenku:work-on-backlog` | Build a defined work item |
| `zenku:note` | Write or update a durable note, per the project's own charter |
| `zenku:commit` | Group the working changes into conventional commits |

`zenku:delivering-change` is loaded by `promote` and `work-on-backlog` rather than invoked. Two reviewers exist: `zenku:idea-reviewer` for an idea's framing and `zenku:change-reviewer` for a built change.
