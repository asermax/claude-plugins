# Mahou

Mahou (魔法) is magic. The agent is the magic: tireless, fast, and exactly as wise as the instructions it is given. You are the spellcaster. You draw the circle, you provide the mana, you choose the spell, and the agent pours itself into the shape you drew.

No spell casts itself. No skill picks a library for you, no skill chooses between two designs, no skill guesses what you meant. Every decision stays with you, and the skills are built to keep it that way.

## Philosophy

Four commitments, mirrored in `mahou:basics`:

- You decide, the agent executes. Skills bring facts and state; decisions stay with you.
- One skill, one job. Skills stay small. A skill that needs a second job becomes two skills.
- Process lives in skills, knowledge lives in the wiki. A skill is how to work; a fact about a technology is a wiki entry.
- Nothing is committed unprompted.

## How to use it

Not sure which skill fits? Describe the goal in plain words to `mahou:guide` and it routes you to the right skill. Know the skill you want? Name it directly.

## Skills

- `mahou:guide`. Entrypoint. Takes your goal in plain words and activates the matching skill.
- `mahou:wiki`. Distilled knowledge about technologies, tools, and their gotchas, indexed for progressive discovery.
- `mahou:learn`. The author's tool. Inspects a conversation, extracts learnings, and proposes new or iterated skills and wiki entries, global or local.
- `mahou:basics`. The foundation every skill loads first: philosophy and rules. Loaded, never typed.

## Wiki

The wiki holds knowledge, not process: facts about technologies and tools, their gotchas, their patterns. It is organized as one index per folder, each index listing only its own level, so entries load on demand. Entries carry a `verified` date, and stale knowledge gets re-verified before it is relied on.

## Global and local

The plugin is the global store: skills live in `skills/`, wiki entries in `skills/wiki/references/`. A project can add its own layer in a `.mahou/` folder at its root:

- `.mahou/basics.md` for project-level standing rules.
- `.mahou/<skill>.md` to change how a skill behaves in this project.
- `.mahou/wiki/` for local wiki entries, with the same index-per-level shape.

Local wins over global when the two conflict, and whether `.mahou/` is committed is each project's call.

## Growing the toolbox

`mahou:learn` reads a conversation and proposes, ordered by confidence then impact: new skills, iterations on existing ones, wiki entries, and local files. The idea → design → plan → build pipeline is expected to be grown this way, from real sessions, rather than designed upfront.

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
