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

A piece of work usually runs through the skills in this order: `explore` to build the understanding, `shape` to settle the decisions, `design` to settle the system, then the code gets written, then `code-blast-radius`, `agentic-review` and `human-review` look at it, `write-documentation` records what got built, and `commit-changes` lands it. Each stage is its own skill and you start each one yourself.

## Skills

Process, in the order work moves through them:

- `mahou:explore`. User-guided investigation. Reads only the context you give it, states the problem back, then answers one question at a time through scouts, so the reading stays out of your context. Writes nothing.
- `mahou:shape`. Settles the open decisions in a problem definition by working a design tree in rounds of questions until every branch is settled. Behavior and decisions only, never implementation.
- `mahou:design`. Designs the system for a settled definition, one area at a time as a design tree (data model, data flow, rules, component architecture, contract, UI, extensible), then hands the tree to `write-documentation`. Above endpoints, functions and files.
- `mahou:code-blast-radius`. Traces what an already-written change reaches, one tracer per changed element, and reports only where behavior changes for someone.
- `mahou:agentic-review`. Typed only. Runs five facet reviewers per repository (reuse, simplification, efficiency, altitude, conventions from the wiki), fixes what they find inside the change's own scope, up to three rounds. The one skill that edits without asking, and it leaves everything uncommitted.
- `mahou:human-review`. Typed only. Collects your annotations on the change, verifies each against the code, and settles every finding with you before anything is edited.
- `mahou:write-documentation`. Writes or updates a note in the project's `docs/`, following the project's own charter and templates. An overview first, then the sections from the project's template that the subject needs, reasoning in callouts beside the mechanism, present tense, a diagram whenever the subject has a shape.
- `mahou:commit-changes`. Typed only. Conventional commits, grouped by logical change, grouping confirmed with you before anything is committed. Never pushes.

Entry points and tooling:

- `mahou:guide`. Takes your goal in plain words and activates the matching skill.
- `mahou:init`. Typed only. Seeds a `docs/` folder the project then owns: a charter, one folder per kind of note with its index, a note template, and a `## Docs` block in `CLAUDE.md`. Never overwrites; re-run it to add a folder.
- `mahou:wiki`. Distilled knowledge about technologies, tools, and their gotchas, indexed for progressive discovery.
- `mahou:learn`. Typed only. The author's tool. Reconstructs a session (or takes your ask directly), and proposes new or iterated skills, agents, wiki entries and local files.

Loaded by other skills, never typed:

- `mahou:basics`. Philosophy, rules, the local layer.
- `mahou:docs`. How to find the project's docs folder, what its structure is made of, and the rule that the charter wins. Loaded by `write-documentation`, `explore`, `design`, `init` and the two docs agents.
- `mahou:design-tree`. The tree format, the frontier, the question and answer rules.
- `mahou:changeset`. Which repositories, which base, which diff, and the rule separating what a change introduced from what predates it.
- `mahou:prototype`. Shows a screen element as an interactive HTML prototype and iterates it with you, round by round. Loaded by `explore` when a question is about what something looks like, and by `design` for a UI branch.

## Agents

Dispatched by skills, never called directly. Every one writes findings and edits nothing.

- `reuse-reviewer`, `simplification-reviewer`, `efficiency-reviewer`, `altitude-reviewer`, `conventions-reviewer`: one angle each, dispatched by `agentic-review`. The conventions reviewer reads the wiki entries for the technologies the diff touches and cites them.
- `usage-tracer`: one changed element, every repository in scope, dispatched by `code-blast-radius`.
- `code-scout`, `docs-scout`: one question against one repository or the project's docs folder, dispatched by `explore` and `design`.
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

## Dependencies

- `superpowers:unslop` and `superpowers:mermaid-validation`, from the `superpowers` plugin in this marketplace, for the writing pass and diagram validation in `design` and `write-documentation`. Without them those skills say so and continue unvalidated.
- The `plannotator` CLI for `human-review`.

## Growing the toolbox

`mahou:learn` reads a conversation and proposes, ordered by confidence then impact: new skills, iterations on existing ones, agents, wiki entries, and local files. The skills above were brought in from real sessions rather than designed upfront, and the same loop grows them further.

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
