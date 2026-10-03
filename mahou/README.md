# Mahou

Mahou (魔法) is magic. The agent is the magic: tireless, fast, and exactly as wise as the instructions it is given. You are the spellcaster. You draw the circle, you provide the mana, you choose the spell, and the agent pours itself into the shape you drew.

No spell casts itself. No skill picks a library for you, no skill chooses between two designs, no skill guesses what you meant. Every decision stays with you, and the skills are built to keep it that way.

## Philosophy

Four commitments, mirrored in `mahou:basics`:

- You decide, the agent executes. Skills bring facts and state; decisions stay with you.
- One skill, one job. Skills stay small. A skill that needs a second job becomes two skills.
- Process lives in skills, knowledge lives in the wiki, and the project's own documentation lives in the project. A skill is how to work; a fact about a technology is a wiki entry; how this system works is a note in the project's `docs/`.
- Nothing is committed unprompted.

## How to use it

Not sure which skill fits? Describe the goal in plain words to `mahou:guide` and it routes you to the right skill. Know the skill you want? Name it directly.

A piece of work usually runs through the skills in this order: `explore` to build the understanding, `shape` to settle the decisions, `design` and `program-design` to settle the system and the program, `test-design` to settle what proves it, `implement` to get it written (or you write it yourself), `validate` to see it working, then `code-blast-radius`, `agentic-review` and `human-review` look at it, `write-documentation` records what got built, and `commit-changes` lands it. When the change spans repositories, `release-check` says what breaks in which deploy order and `land` takes it through the merges in the safe order. Each stage is its own skill and you start each one yourself.

## Skills

Process, in the order work moves through them:

- `mahou:explore`. User-guided investigation. Reads only the context you give it, states the problem back, then answers one question at a time through scouts, so the reading stays out of your context. Writes nothing.
- `mahou:shape`. Settles the open decisions in a problem definition by working a design tree in rounds of questions until every branch is settled. Behavior and decisions only, never implementation.
- `mahou:design`. Designs the system for a settled definition, one area at a time as a design tree (data model, schema, data flow, rules, lifecycle, component architecture, contract, UI, extensible), then hands the tree to `write-documentation`. Above endpoints, functions and files.
- `mahou:program-design`. Turns a settled design, or a change proposed in the conversation, into a program design, one repository at a time. Reads the code and the conventions, then proposes each branch (a package, a screen or an entry point) part by part, and you correct each part before the next opens. Every part is a representation, never code: package layout, screen layout, component tree, derivation ledger, callstack, control flow, interfaces as JSON Schema, class diagram, module list. The one skill that proposes instead of asking, because the design already made the decisions. Records each root in the change's scratch folder and reconciles departures with the design notes at the end.
- `mahou:spike`. Answers a design question by building the smallest working version of the real thing and running it against reality. Throwaway code that never merges; the answered question and the findings are the product, and both live in the change's scratch folder.
- `mahou:test-design`. Turns a settled design into the test cases and manual validations that prove it, before any code exists, with the Classification Tree Method: one tree per repository, entry points or flows as roots, classifications, partitions, then a combination matrix whose rows are marked test, manual or both. You settle every level. The settled trees and matrices are written to the change's scratch folder for `implement` to read across sessions.
- `mahou:implement`. Gets a designed and test-designed change written by one subagent per repository, each briefed with the tasks, the design notes, its matrix rows, the repository rules and the report shape. Relays results and flags as decisions, then runs `agentic-review` per repository and `validate` one repository at a time. Moves tasks through whatever tracker the project declares. Writes no code and pushes nothing.
- `mahou:implement-with-tdd`. Runs `implement` as written, but writes each repository's code test first: a tester subagent writes the failing tests and validates each round, an implementer subagent writes the code, and the session relays every exchange between them. Nothing is committed until the tester approves.
- `mahou:validate`. Runs the manual rows against the running system, through a browser, over HTTP or on an Android device, with before and after state as evidence, and leaves an HTML report. Fixes nothing; every failure comes back as a decision.
- `mahou:code-blast-radius`. Traces what an already-written change reaches, one tracer per changed element, and reports only where behavior changes for someone.
- `mahou:agentic-review`. Typed, or invoked by `implement`. Runs four facet reviewers (reuse, simplification, efficiency, altitude) and one conventions reviewer per wiki entry and project rule file on each repository, fixes what they find inside the change's own scope, up to three rounds. The one skill that edits without asking, and it leaves everything uncommitted.
- `mahou:human-review`. Typed only. Collects your annotations on the change, verifies each against the code, and settles every finding with you before anything is edited.
- `mahou:address-pr-review`. Works the review left on an open pull request: fetches the live threads, verifies each finding against the code, settles them with you, applies what you approve, then commits, pushes and resolves the threads. Never posts to the PR. Typed, or run by `land` when a review arrives.
- `mahou:write-documentation`. Writes or updates a note in the project's `docs/`, following the project's own charter and templates. An overview first, then the sections from the project's template that the subject needs, reasoning in callouts beside the mechanism, present tense, a diagram whenever the subject has a shape.
- `mahou:commit-changes`. Conventional commits, grouped by logical change, grouping confirmed with you before anything is committed. Never pushes.
- `mahou:release-check`. Says what breaks when the repositories of a change are released in a given order, and gives the order that breaks nothing. Finds the service boundaries from the diff and from you, including services the change does not touch, dispatches one `compat-checker` per boundary and `code-blast-radius` alongside, and reports the findings and the release order. Changes nothing.
- `mahou:land`. Takes a written, reviewed change from its branches to merged pull requests, in the order that keeps production safe. Runs `release-check`, opens every pull request, watches them in parallel with one loop each (`address-pr-review` on a review, `rebase` when behind, stop on a failed check, record on merge), then walks the confirmed order, watching each merge's CI run and stopping for your production confirmation before the next. Never merges a pull request; the release follows each project's own process. Proposes skipping `release-check` for a one-repository change that crosses no service boundary, and cleans up the merged local branches at the end.

Entry points and tooling:

- `mahou:guide`. Takes your goal in plain words and activates the matching skill.
- `mahou:init`. Typed only. Seeds a `docs/` folder the project then owns: a charter, one folder per kind of note with its index, a note template, and a `## Docs` block in `CLAUDE.md`. Never overwrites; re-run it to add a folder.
- `mahou:wiki`. Distilled knowledge about technologies, tools, and their gotchas, indexed for progressive discovery.
- `mahou:learn`. Typed only. The author's tool. Collects the points where a session generated friction (or takes your ask directly), and proposes new or iterated skills, agents, wiki entries and local files.

Asked for by name:

- `mahou:create-pull-request`. Opens a pull request from one branch, detecting its base from commit distance and writing the title and body from every commit on the branch. Waits for your confirmation before creating anything.
- `mahou:rebase`. Brings a branch up to date with its base, resolves, verifies against the suite, and reports what moved. Never pushes.
- `mahou:canvas`. Draws on a tldraw canvas served by a local app, with low-fidelity screen mockups, storage cylinders, arrows and free-text notes, in steps you can follow. You edit the same canvas live; a sticky note is a message to the agent, and "Send to Claude" says a batch of edits is ready. Unslops the canvas texts and exports an SVG. Mermaid stays the choice for diagrams that live as text in a note.
- `mahou:one-page-design`. Draws a settled design as one page on a `canvas`: the main element largest in the centre, close-ups, explainers and a legend for the arrows, showing what the user sees, what gets stored on the way and how it is read back.
- `mahou:telepathy`. A mode: the conversation moves out of the chat and into markdown files in the change's scratch folder, served as a page you edit in the browser. Click a block to edit it or `+` to write under it; Enter or clicking away sends, and each edit reaches the agent's pane through herdr as a message, which the agent answers by writing in the files. The server tracks who wrote each block in `.meta.json`, picks up the agent's writes by diffing against its last snapshot, and merges your edit with the agent's when both touched the same block, opening a merge editor only when the same lines changed. Requires herdr and Bun.

Loaded by other skills, never typed:

- `mahou:basics`. Philosophy, rules, the scratch convention, the local layer.
- `mahou:docs`. How to find the project's docs folder, what its structure is made of, and the rule that the charter wins. Loaded by `write-documentation`, `explore`, `design`, `init` and the two docs agents.
- `mahou:design-tree`. The tree format, the frontier, the question and answer rules.
- `mahou:changeset`. Which repositories, which base, which diff, and the rule separating what a change introduced from what predates it.
- `mahou:lookup`. Where a fact comes from: the routing between the scouts and the researcher, the rule for facts outside the project, and how a verified fact is told apart from an asserted one. Loaded by `explore` and `design-tree`.
- `mahou:prototype`. Shows a screen element as an interactive HTML prototype and iterates it with you, round by round. Loaded by `explore` when a question is about what something looks like, and by `design` for a UI branch.

## Agents

Dispatched by skills, never called directly. Every one writes findings and edits nothing.

- `reuse-reviewer`, `simplification-reviewer`, `efficiency-reviewer`, `altitude-reviewer`, `conventions-reviewer`: one angle each, dispatched by `agentic-review`. Each conventions reviewer reads the one wiki entry or project rule file it is given and cites it.
- `usage-tracer`: one changed element, every repository in scope, dispatched by `code-blast-radius`.
- `code-scout`, `docs-scout`: one question against one repository or the project's docs folder, dispatched through `mahou:lookup` by `explore` and `design-tree`.
- `researcher`: one question about a library, tool or platform outside the project, answered with facts and sources and no recommendation, dispatched through `mahou:lookup`.
- `compat-checker`: one service boundary, testing the new side against the deployed other side in both directions, dispatched by `release-check`.
- `documentation-reviewer`: one draft against the project's charter and template, dispatched by `write-documentation`.

## The project's docs

Mahou has no shared knowledge base about your project. It assumes the project keeps one itself, in a `docs/` folder with a `README.md` charter that says what each folder holds and how a note is written, and one `README.md` per folder as its index. `init` seeds that shape; `write-documentation`, `explore` and `design` read whatever is there, through `mahou:docs`. The plugin owns the process, the project owns the structure: no skill carries a template body, and where the project's charter differs from anything a skill sketches, the charter wins.

## Wiki

The wiki holds knowledge, not process: facts about technologies and tools, their gotchas, their patterns. It is organized as one index per folder, each index listing only its own level, so entries load on demand. Entries carry a `verified` date, and stale knowledge gets re-verified before it is relied on. The conventions reviewer treats it as the standard a change is measured against.

## Global and local

The plugin is the global store: skills live in `skills/`, wiki entries in `skills/wiki/references/`. A project can add its own layer in a `.mahou/` folder at its root:

- `.mahou/basics.md` for project-level standing rules, and for naming the docs folder when it is not `docs/`.
- `.mahou/<skill>.md` to change how a skill behaves in this project.
- `.mahou/wiki/` for local wiki entries, with the same index-per-level shape.

Local wins over global when the two conflict, and whether `.mahou/` is committed is each project's call.

Separately, `.scratch/<change-slug>/` at the project's root holds the artifacts a skill produces for you and keeps between rounds: design handoffs, prototypes, drafts. It is meant to be gitignored; throwaways still go to `/tmp`.

## Dependencies

- `superpowers:unslop` and `superpowers:mermaid-validation`, from the `superpowers` plugin in this marketplace, for the writing pass and diagram validation in `design` and `write-documentation`. Without them those skills say so and continue unvalidated.
- The `plannotator` CLI for `human-review`.
- Node and npm, plus the `agent-browser` CLI, for `canvas`. The app installs into `~/.cache/mahou-canvas` on first run.
- herdr and Bun for `telepathy`. Its server's dependencies install next to the script on first run.

## Growing the toolbox

`mahou:learn` reads a conversation for the points where the user had to steer it (a format change, a request outside the running flow, a correction of something the agent produced) and proposes, ordered by confidence then impact: new skills, iterations on existing ones, agents, wiki entries, and local files. The skills above were brought in from real sessions rather than designed upfront, and the same loop grows them further.

## Installation

As a local marketplace:

```bash
/plugin marketplace add local ~/workspace/asermax/claude-plugins
/plugin install mahou
```

Or directly:

```bash
/plugin install ~/workspace/asermax/claude-plugins/mahou
```
