---
name: codex
description: Load first when working with any zenku skill. Carries the vocabulary, the two rules, how to find the project's vault and conventions, and the habits for writing into it.
user-invocable: false
---

# What every zenku skill shares

**The plugin owns the process. The project owns the structure.**

The process is the vocabulary below and the two rules with it. Everything else belongs to the project: which folders exist and what each holds, every template body, every index, the tags, the headings, the commands, the code style, the branch pattern, the trunk name.

## The vocabulary

A **quest** is one session's work. Solving it either answers something or builds a slice.

An **adventure** is too big and too foggy for one session. It carries a **destination** — what reaching the end looks like — plus its **bearings**, its trials, and an index of the quests already **solved**. The destination settles first, because it is what makes something **out of scope** rather than a trial.

Adventures come in two kinds, and an adventure's `kind` says which. **Always write it.** A reader should not have to know a default to tell what they are looking at, and a missing field is indistinguishable from one somebody forgot.

**Every record carries a `kind`, and the tag says which vocabulary applies.** An adventure's is `journey` or `raid`; a quest's is `research`, `design`, `spike` or `build`. One field name rather than two, because a reader should not have to remember which record type carries `kind` and which carries something else.

An adventure with no kind is in **neither** the journeys nor the raids, which is how you find one: it is missing from both lists rather than defaulting into one. Fill it in when you meet it.

- A **journey** clears ground. Its destination is knowing how to build the thing, and it holds research, design and spike quests. Never a build quest. `zenku:travel` runs it.
- A **raid** builds. Its destination is the thing working, and it holds build quests almost exclusively. `zenku:raid` runs it.

A journey is usually followed by a raid, which reads its solved quests, reconciles them into one shape and slices that into the build quests it then lands. Either can stand alone: ground worth clearing that nobody builds on is still cleared, and a feature with no open questions is a raid with no journey behind it.

A **trial** is an ordeal you can sense standing between here and the destination but cannot yet phrase as a single quest. The test is whether you can state the question precisely *now*, not whether you can answer it: a sharp question you cannot act on yet is a blocked quest, a vague sense that sync is going to hurt is a trial. A trial *graduates* into a quest the moment it can be stated, and a quest is how a trial gets faced.

The quests **in reach** are the ones open, unblocked and unclaimed. They are what you choose from.

Two rules go with this:

**Find the path.** Decisions come before deliverables. The two kinds are what make this hold without anyone enforcing it: a journey cannot contain a build quest, so the pull to just build has nowhere to land until the ground is clear. Feeling that pull inside a journey is the signal you have reached the edge of what is known.

**Keep the pace.** One quest per session, research excepted. A session that solves three quests has usually guessed at two of them. A journey's quests and a raid's are different sizes, which is why they do not share an adventure: an investigation can fill a session that three slices would also fill.

## An effort ends by striking its records

The **effort** is the journey, the raid that followed it, and every quest under both. When it ends, its records are **struck**: deleted, in one commit named after the effort. There is no archive folder and no archived status. **git is the archive.** `zenku:strike` owns this, and it is the only thing that deletes a record.

An effort that ended reads exactly like one that is live to anything searching by name or content, which is most of what a session does before it decides anything. Emptying the folder is what keeps that search honest, and it is why a status alone is not enough: it hides a dead record from an index without hiding it from a search.

Which puts two obligations on everything upstream of the ending:

**Nothing outside the effort may depend on a record surviving.** Lore never links one. Before striking, check what links in from outside the effort and fix or drop those links, because a dangling link is the one cost git does not cover.

**Whatever has to outlive the effort leaves through Loot first**, while the records are still there to read. For an effort that stopped short and built nothing, Loot is the *only* survivor, and that includes the condition that would reopen it.

A record already on the trunk is kept by git the moment it is struck: `git log --diff-filter=D` finds the commit, `git show <sha>^:<path>` reads the record. One that never reached the trunk had a single session's life, and its output is the lore and the code, so there is nothing to archive.

## Finding the project

The vault's charter READMEs are the authority on structure. CLAUDE.md's `## The vault` section carries the pointers, the commands and the conventions. **If they disagree the charter is right, and both get fixed.**

**Never assume the structure.** A skill does not assert a folder name, a heading, a frontmatter field or a template shape — it reads the charter and the target folder's README first and adapts to what it finds, including the parts it did not expect. Where the project differs from anything a skill sketches as an example, the project is right.

Four exceptions, because the process is defined in terms of them, and a skill may rely on these existing:

- The quest log's **status vocabulary**, the two **kind** vocabularies (`journey`/`raid` for an adventure, `research`/`design`/`spike`/`build` for a quest), and the **tag** that says which of the two a record is and therefore which vocabulary its kind comes from. These are process rather than structure: the dispatchers branch on them, so a project renaming one breaks the routing silently. A project that wants different words changes the framework, not just its vault.
- An **adventure's structural sections**: its destination, its bearings, its trials, its solved index, what it rules out of scope, and how it ended.
- A **quest's**: what it settles, its design, its answer — plus the four fields the routing runs on (`status`, `kind`, `adventure`, `blocked_by`).
- Every folder's index is called **`README.md`**. Vault detection depends on it, and no resolution step can find a charter whose name it has to guess first.

Read the section names off the project's **templates**, and the field vocabulary off its **charter**. The charter explains how the records work; the templates are what a record is actually made of, so they are where the headings are. What you may assume is that each exists, not what it is called.

| What | Where it comes from | When it is not there |
|---|---|---|
| The vault | `**Vault**` | A directory holding both a README and a templates folder. Several → ask. None → the project is not initialized: say so, suggest `zenku:init`, stop. **Never create a vault as a side effect.** |
| The quest log | `**Quest log**` | The charter's folder table names it. Failing that, the folder holding records tagged as adventures or quests. Several or none → ask. |
| The folders | The charter's folder table | Cross-check the table against what is on disk. When they disagree, report both and ask which is right; **never create a folder to satisfy a stale row.** No charter at all → say you are inferring the shape from disk, and confirm before writing into a folder you inferred. |
| A template | The folder's README, then the charter | Mirror the closest existing note in that folder and say you did. **Never fall back to a body carried in this plugin** — a plugin-side shape in a project's vault is indistinguishable from something the project chose, and that is the one failure this design exists to prevent. |
| The commands | `**Run**` and `**Checks**` | Detect from the lockfile or manifest, propose what you found, and run nothing until it is confirmed. Never infer a package manager from a language. |
| The branch | `**Branch**` | One branch per adventure. Spikes are separate and never a choice: one worktree, on a branch that is never merged, cut by the journey and **inherited by the raid that follows it**, which is what strikes it. See `zenku:spike`. |
| The trunk | `git symbolic-ref --short refs/remotes/origin/HEAD` | That errors on any clone nobody ran `git remote set-head` in, which is most of them, and means nothing is wrong. Then `git remote show origin`, then ask. **Never guess between `main` and `master`** by checking which exists — a repository can carry both. Resolve it each time and do not record it: it is a fact about the clone, and a stale copy in CLAUDE.md is worse than the lookup. |
| The code roots | `**Code**` | Ask, before running anything destructive. Getting this wrong destroys work. |

Whenever you resolve something that was not recorded, **offer to record it** so the next session does not re-ask.

## The CLAUDE.md section

Every skill reads this and every skill maintains it. Fields are discovered lazily: add one when you need it, and never rewrite one someone has edited.

```markdown
## The vault

- **Vault**: `<path>`, an Obsidian vault. Read its `README.md` before adding, editing, renaming or moving anything under it.
- **Notes**: <one line per note folder: what each holds>
- **Quest log**: <where the adventures and quests live>
- **Code**: <the roots a change touches>
- **Run**: <how to launch it>
- **Checks**: <the commands that must be green before a change is done>
- **Branch**: <the pattern>

### When adding something

<a table or list: a kind of change → where it goes>
```

## Nothing lands in a file the user has not seen

A note carrying your assumptions is worse than a question: it is an assumption with a commit hash. Three habits, about one message each.

**Quote it, never refer to it.** Paste the destination, the trials, the design verbatim into the conversation before discussing them. Never say "the first two trials" or a paraphrase of your own. A trial the user cannot see is one they cannot correct.

**Show the words, then write them.** Draft it in the conversation, get it agreed, and only then put it in the file. Text that is already committed reads as settled, and it gets corrected far less often than it should.

**Write only what was actually said.** No taxonomy, no scoring table, no threshold, no constraint nobody mentioned. Offer a framing of your own as yours, and let it be taken or left.
