---
name: sync-upstream
description: Sync this plugin marketplace's skills, commands, and context from their upstream source repositories (superpowers, quint-code/haft, agentic-evolve, agent-browser). Use this skill whenever the user asks to "sync upstream", "pull upstream", "refresh skills from upstream", "update plugins from their source repos", or mentions wanting to pick up changes from `~/workspace/random/superpowers`, `~/workspace/random/quint-code`, `~/workspace/random/agentic-evolve`, or `~/workspace/random/agent-browser`. Trigger even when the user uses paraphrases like "let's see what's new upstream" or "pull the latest into the marketplace".
---

# Sync Upstream

This skill keeps the plugin marketplace in lockstep with its upstream sources while preserving plugin-specific customizations. The upstream repos and what we track from each:

- **superpowers** — `~/workspace/random/superpowers` — core workflow skills (currently: `systematic-debugging`)
- **haft** — `~/workspace/random/quint-code` (the local path still uses the old `quint-code` name; the project itself is now `haft`) — FPF reasoning methodology: the v8 skill catalog (`internal/cli/skill/h-*/SKILL.md`) and CLAUDE.md → PRINCIPLES.md context
- **agentic-evolve** — `~/workspace/random/agentic-evolve` — evolve commands (master dispatcher + perf/size/ml subskills)
- **agent-browser** — `~/workspace/random/agent-browser` — browser automation CLI skill (slim discovery stub)

## High-level flow

1. Pull latest from each upstream repo.
2. Identify which tracked files actually changed.
3. Summarize the changes for the user (high-level, not line-by-line).
4. Confirm before applying anything.
5. Apply updates with intelligent merging that preserves plugin customizations.
6. Report what landed.

The reason confirmation matters before applying is that some files in this plugin have hand-edited customizations (namespace prefixes, removed cross-skill references) that a blind copy would clobber. We let the user approve so they can intervene on the manual-merge cases.

## Step 1 — Pull latest changes from upstream

Pull each upstream repo independently. If any pull fails, surface the error and ask the user to resolve manually rather than guessing.

```bash
cd ~/workspace/random/superpowers && git pull origin main
cd ~/workspace/random/quint-code && git pull origin main
cd ~/workspace/random/agentic-evolve && git pull origin main
cd ~/workspace/random/agent-browser && git pull origin main
```

The pull output reveals the old → new commit range and the touched files, which is what later steps key off.

## Step 2 — Identify the tracked surface area

These are the only paths to consider when comparing upstream against this plugin. Anything else upstream changed is irrelevant.

**From `~/workspace/random/superpowers/`:**
- `skills/systematic-debugging/` (entire directory — includes supporting `.md` files)

**From `~/workspace/random/quint-code/`:**
- `internal/cli/skill/h-*/SKILL.md` → mirrored into `haft/skills/h-*/SKILL.md` (the full v8 skill catalog — one directory per skill). As of v8 there are no `internal/cli/commands/` files; the surface is skills only.
- `CLAUDE.md` → mirrored into `haft/context/PRINCIPLES.md`
- And: delete the cached MCP binary at `haft/bin/haft` so the SessionStart hook rebuilds it on next launch.

**From `~/workspace/random/agentic-evolve/.claude/commands/`:**
- `evolve.md`, `evolve-perf.md`, `evolve-size.md`, `evolve-ml.md` → mirrored into `superpowers/commands/`

**From `~/workspace/random/agent-browser/skills/agent-browser/`:**
- `SKILL.md` only. Upstream restructured this into a slim discovery stub that delegates to `agent-browser skills get core` at runtime, so any old `references/` or `templates/` directories under the plugin copy should be removed.

**Plugin-specific skills with no upstream — never touch these during sync:**
- `using-live-documentation`, `self-maintaining-claude-md`, `using-antigravity`, `agent-communication`, `financial-summary`, `using-code-directives`, `mermaid-validation`, `show-markdown`

## Step 3 — Identify what actually changed

For each repo, use the git pull output to find the old and new commits, then diff against the tracked surface area:

```bash
cd ~/workspace/random/superpowers
git diff <old>..<new> -- skills/systematic-debugging/
```

Only analyze files that are **both** in the pull output **and** in our tracked list. If nothing tracked changed for a repo, say so and skip it.

## Step 4 — Present a high-level summary

Show the user a summary, not line-by-line diffs. For each affected tracked file, mention:

- The skill/command name and its source repo
- The general nature of upstream changes (e.g. "content updates", "new section added", "rename")
- Whether this plugin has customizations on top that need manual merging

Plugin-side customizations to be aware of:

- **All skills**: use the `superpowers:` namespace prefix for any cross-skill reference
- **systematic-debugging**: removed references to skills not bundled here (`defense-in-depth`, `condition-based-waiting`, `verification-before-completion`)

Suggested format:

```
=== Skills with updates ===

systematic-debugging (from superpowers)
  Status: Has plugin customizations (removed skill references)
  Changes: Content updates in upstream version
  Action: Manual merge required to preserve simplified workflow
```

## Step 5 — Confirm before applying

Ask the user to approve. Surface which entries need manual merging vs straight copies so they know what they're approving:

```
Found differences in N items:
- systematic-debugging (requires manual merge)
- evolve-perf (direct copy)
- ...

Proceed with these updates? (yes/no)
```

## Step 6 — Apply updates by item type

Each item type has its own rule. Apply the right one and preserve the plugin's intent.

### Type 1 — Skills with minor customizations (currently: `systematic-debugging`)

Copy the whole directory from upstream, then strip references to skills not bundled in this plugin (such as `verification-before-completion`).

```bash
cp -r ~/workspace/random/superpowers/skills/systematic-debugging \
      ~/workspace/asermax/claude-plugins/superpowers/skills/
```

Re-apply the plugin-side edits afterwards. Read the file end-to-end and remove any lingering cross-skill references to things this plugin doesn't ship.

### Type 2 — Plugin-specific skills

Skip entirely. They have no upstream.

### Type 3 — Haft skill catalog and context

Direct copy, no plugin customization needed. v8 surfaces haft as a catalog of skills (one directory per skill), not slash commands. Mirror the whole catalog so newly-added skills land and removed ones are dropped, then refresh the context and clear the cached binary.

```bash
SRC=~/workspace/random/quint-code
DST=~/workspace/asermax/claude-plugins/haft

# Mirror the full skill catalog (adds new skills, drops removed ones)
rm -rf "$DST/skills"
for d in "$SRC"/internal/cli/skill/*/; do
  name=$(basename "$d")
  mkdir -p "$DST/skills/$name"
  cp "$d/SKILL.md" "$DST/skills/$name/SKILL.md"
done

# If a haft/commands/ directory still exists from a pre-v8 layout, remove it
rm -rf "$DST/commands"

cp "$SRC/CLAUDE.md" "$DST/context/PRINCIPLES.md"

rm -f "$DST/bin/haft"
```

The skill SKILL.md files reference MCP tools via `allowed-tools: mcp__haft__haft_*`; the `.mcp.json` server key `haft` matches that namespace, so no rewriting is needed. Manual-only skills carry `disable-model-invocation: true` — preserve it verbatim.

Deleting `haft/bin/haft` is intentional — the SessionStart hook (`haft/hooks/session-init.sh`) rebuilds it on next launch from cached source in `~/.cache/claude-plugins/haft/`.

### Type 4 — Agentic-evolve commands

Direct copy of all four files.

```bash
cp ~/workspace/random/agentic-evolve/.claude/commands/evolve.md \
   ~/workspace/asermax/claude-plugins/superpowers/commands/evolve.md
cp ~/workspace/random/agentic-evolve/.claude/commands/evolve-perf.md \
   ~/workspace/asermax/claude-plugins/superpowers/commands/evolve-perf.md
cp ~/workspace/random/agentic-evolve/.claude/commands/evolve-size.md \
   ~/workspace/asermax/claude-plugins/superpowers/commands/evolve-size.md
cp ~/workspace/random/agentic-evolve/.claude/commands/evolve-ml.md \
   ~/workspace/asermax/claude-plugins/superpowers/commands/evolve-ml.md
```

`evolve.md` is a master dispatcher; the other three are mode-specific subskills it routes to.

### Type 5 — Agent-browser skill (slim stub)

Upstream is now a discovery stub that calls `agent-browser skills get core` at runtime for the full workflow content. Sync only `SKILL.md` and remove any leftover supporting directories from earlier sync runs.

```bash
rm -rf ~/workspace/asermax/claude-plugins/superpowers/skills/agent-browser/references \
       ~/workspace/asermax/claude-plugins/superpowers/skills/agent-browser/templates
cp ~/workspace/random/agent-browser/skills/agent-browser/SKILL.md \
   ~/workspace/asermax/claude-plugins/superpowers/skills/agent-browser/SKILL.md
```

### Manual-merge procedure (used by Type 1 when upstream changed)

1. Read upstream version end-to-end.
2. Read plugin version end-to-end.
3. Identify what changed conceptually in upstream (not just textually).
4. Edit the plugin version to incorporate those concepts while keeping the plugin-specific approach.
5. Verify the merged file preserves both the upstream improvement and the local customization.

## Step 7 — Confirm what landed

Print a clear summary of what was updated and which customizations were preserved:

```
✅ Plugins synced successfully:

Superpowers:
- systematic-debugging (adapted from superpowers, skill references removed)

Haft:
- skill catalog synced (15 skills: auto-triggering + manual-only + subroutines)
- PRINCIPLES.md context updated from upstream CLAUDE.md
- Cached MCP binary deleted (rebuilds on next session start)

Agentic-Evolve:
- evolve commands synced (4 files: dispatcher + perf/size/ml)

Agent-Browser:
- agent-browser SKILL.md synced

⚠️ Plugin customizations preserved:
- All skills: superpowers: namespace prefix applied
- systematic-debugging: references to non-bundled skills removed
```

## Error handling

- **Upstream repo missing**: report the expected path and stop.
- **`git pull` fails**: show the error, suggest manual resolution, stop. Don't try to recover automatically — the user might have local changes upstream you'd lose.
- **Permission issues**: report and suggest fixes.
- **Nothing tracked changed**: tell the user everything is already in sync.
- **Manual merge ambiguous**: ask the user how they'd like it resolved rather than guessing.

## What never to do

- **Don't lose plugin customizations.** The simplified workflows and namespace prefixes are deliberate.
- **Don't show line-by-line diffs in the summary.** It's too noisy and obscures what actually matters.
- **Don't skip the confirmation step.** Even when changes look harmless, the user is the one who knows whether they want the merge now.
- **Don't blindly overwrite a file with plugin customizations** without re-applying them.
