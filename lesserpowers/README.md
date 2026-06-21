# lesserpowers

Secondary workflow skills and commands split out from the `superpowers` plugin.

## Description

This plugin holds the skills and commands that were factored out of `superpowers` to keep that plugin focused on its most-used surface. The functionality is unchanged — only the plugin (and therefore the namespace) is different. Skills here are referenced as `lesserpowers:<skill>`.

## Skills

### Debugging and Testing
- **systematic-debugging**: Four-phase debugging framework ensuring understanding before solutions (includes supporting techniques: root-cause-tracing, defense-in-depth, condition-based-waiting)

### Documentation
- **self-maintaining-claude-md**: Keep CLAUDE.md instruction file current with high-level project state

### Code Review
- **hunk-review**: Interactive terminal diff review via the `hunk` CLI. Inspect live review sessions, navigate files/hunks, reload contents, and add inline comments.

### Multi-Agent Collaboration
- **agent-communication**: Enable communication between multiple Claude Code instances across repositories

### Other
- **financial-summary**: Parse and analyze financial transaction CSV exports

## Commands

- `/lesserpowers:evolve <problem>`: Evolve novel algorithms through LLM-driven mutation, crossover, and selection
  - Uses 8 parallel mutation strategies: tweak, unroll, specialize, vectorize, memoize, restructure, hybrid, alien
  - Dynamically scales from 10-32 agents based on problem complexity
  - Supports configurable token budgets (e.g., `50k`, `20gen`, `unlimited`)
  - Adaptive stopping when improvements plateau
  - Resume capability via `--resume` flag
  - Example: `/lesserpowers:evolve "fibonacci sequence"` or `/lesserpowers:evolve "Optimize the string search in src/search.rs" --budget 50k`
- `/lesserpowers:evolve-perf`: Optimize runtime speed (ops/sec, latency)
- `/lesserpowers:evolve-size`: Optimize code size (bytes, chars) — code golf
- `/lesserpowers:evolve-ml`: Optimize ML metrics (F1, loss)

## Hooks

- `hooks/background-daemons.sh`: PreToolUse hook that auto-backgrounds `agent.py` commands for the agent-communication skill
- `hooks/auto-approve.sh`: PermissionRequest hook that auto-approves lesserpowers skill invocations and bash commands referencing lesserpowers paths

## Installation

### From Local Marketplace

1. Add this directory as a local marketplace:
   ```bash
   /plugin marketplace add local ~/workspace/asermax/claude-plugins
   ```

2. Install the plugin:
   ```bash
   /plugin install lesserpowers
   ```

### Direct Installation

```bash
/plugin install ~/workspace/asermax/claude-plugins/lesserpowers
```
