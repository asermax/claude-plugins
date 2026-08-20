---
name: sync-upstream
description: Sync this plugin marketplace's skills, commands, and context from their upstream source repositories (superpowers, quint-code/haft, agentic-evolve, agent-browser, dmmulroy-skills, plannotator, cursor-plugins). Use this skill whenever the user asks to "sync upstream", "pull upstream", "refresh skills from upstream", "update plugins from their source repos", or mentions wanting to pick up changes from `~/workspace/random/superpowers`, `~/workspace/random/quint-code`, `~/workspace/random/agentic-evolve`, `~/workspace/random/agent-browser`, `~/workspace/random/dmmulroy-skills`, `~/workspace/random/plannotator`, or `~/workspace/random/cursor-plugins`. Trigger even when the user uses paraphrases like "let's see what's new upstream" or "pull the latest into the marketplace".
---

# Sync Upstream

This skill keeps the plugin marketplace in lockstep with its upstream sources while preserving plugin-specific customizations. The upstream repos and what we track from each:

- **superpowers** — `~/workspace/random/superpowers` (clone of `github.com/obra/superpowers`) — core workflow skills (currently: `systematic-debugging`, which is mirrored into the **lesserpowers** plugin, not superpowers)
- **haft** — `~/workspace/random/quint-code` (clone of `github.com/m0n0x41d/quint-code`; the local path still uses the old `quint-code` name, the project itself is now `haft`) — FPF reasoning methodology: the v8 skill catalog (`internal/cli/skill/h-*/SKILL.md`) and CLAUDE.md → PRINCIPLES.md context
- **agentic-evolve** — `~/workspace/random/agentic-evolve` (clone of `github.com/ericksoa/agentic-evolve`) — evolve commands (master dispatcher + perf/size/ml subskills)
- **agent-browser** — `~/workspace/random/agent-browser` (clone of `github.com/vercel-labs/agent-browser`) — browser automation CLI skill (slim discovery stub)
- **dmmulroy-skills** — `~/workspace/random/dmmulroy-skills` (clone of `github.com/dmmulroy/skills`) — the `bro` and `herdr` skills, mirrored into **superpowers**
- **plannotator** — `~/workspace/random/plannotator` (clone of `github.com/backnotprop/plannotator`) — the three Claude-flavoured skills under `apps/skills/claude/`, mirrored into **superpowers**
- **cursor-plugins** — `~/workspace/random/cursor-plugins` (clone of `github.com/cursor/plugins`) — the `unslop` skill from the `pstack` plugin, mirrored into **superpowers**

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
cd ~/workspace/random/dmmulroy-skills && git pull origin main
cd ~/workspace/random/plannotator && git pull origin main
cd ~/workspace/random/cursor-plugins && git pull origin main
```

The pull output reveals the old → new commit range and the touched files, which is what later steps key off.

## Step 2 — Identify the tracked surface area

These are the only paths to consider when comparing upstream against this plugin. Anything else upstream changed is irrelevant.

**From `~/workspace/random/superpowers/`:**
- `skills/systematic-debugging/` (entire directory — includes supporting `.md` files) → mirrored into `lesserpowers/skills/`

**From `~/workspace/random/quint-code/`:**
- `internal/cli/skill/h-*/SKILL.md` → mirrored into `haft/skills/h-*/SKILL.md` (the full v8 skill catalog — one directory per skill). As of v8 there are no `internal/cli/commands/` files; the surface is skills only.
- `CLAUDE.md` → mirrored into `haft/context/PRINCIPLES.md`
- And: delete the cached MCP binary at `haft/bin/haft` so the SessionStart hook rebuilds it on next launch.

**From `~/workspace/random/agentic-evolve/.claude/commands/`:**
- `evolve.md`, `evolve-perf.md`, `evolve-size.md`, `evolve-ml.md` → mirrored into `lesserpowers/commands/`

**From `~/workspace/random/agent-browser/skills/agent-browser/`:**
- `SKILL.md` only. Upstream restructured this into a slim discovery stub that delegates to `agent-browser skills get core` at runtime, so any old `references/` or `templates/` directories under the plugin copy should be removed.

**From `~/workspace/random/dmmulroy-skills/`:**
- `bro/SKILL.md` → `superpowers/skills/bro/SKILL.md`
- `herdr/SKILL.md` → `superpowers/skills/herdr/SKILL.md`

That repo holds more skills than these two. Ignore the rest — the collection is opinionated toward Effect and Cloudflare TypeScript work, and it vendors its own copies of Matt Pocock's skills. Only add another one when the user asks for it by name.

**From `~/workspace/random/plannotator/apps/skills/claude/`:**
- `plannotator-review/SKILL.md` → `superpowers/skills/plannotator-review/SKILL.md`
- `plannotator-annotate/SKILL.md` → `superpowers/skills/plannotator-annotate/SKILL.md`
- `plannotator-last/SKILL.md` → `superpowers/skills/plannotator-last/SKILL.md`

Track the `apps/skills/claude/` copies, never `apps/skills/core/` — the core ones are the agent-agnostic fallbacks that tell the agent to run the CLI itself, while the Claude copies use `!` preprocessing and `$ARGUMENTS` so the CLI runs at skill load. The repo also ships `apps/skills/extra/` (`plannotator-compound`, `plannotator-setup-goal`, `plannotator-visual-explainer`), which upstream installs separately via `npx skills add`. They are not tracked; add one only on explicit request.

**From `~/workspace/random/cursor-plugins/pstack/skills/`:**
- `unslop/SKILL.md` → `superpowers/skills/unslop/SKILL.md`

`cursor/plugins` is a monorepo of Cursor plugins, and `pstack` alone ships around forty skills (the `principle-*` family, `tdd`, `architect`, `why`, `swarm`, and more), plus other plugins at the repo root. Only `unslop` is tracked. Ignore everything else unless the user asks for a specific skill by name.

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
- **agent-browser**: local-only `## Visible browser inside herdr` section plus two extra `allowed-tools` entries — always a manual merge, never a copy

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
      ~/workspace/asermax/claude-plugins/lesserpowers/skills/
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
   ~/workspace/asermax/claude-plugins/lesserpowers/commands/evolve.md
cp ~/workspace/random/agentic-evolve/.claude/commands/evolve-perf.md \
   ~/workspace/asermax/claude-plugins/lesserpowers/commands/evolve-perf.md
cp ~/workspace/random/agentic-evolve/.claude/commands/evolve-size.md \
   ~/workspace/asermax/claude-plugins/lesserpowers/commands/evolve-size.md
cp ~/workspace/random/agentic-evolve/.claude/commands/evolve-ml.md \
   ~/workspace/asermax/claude-plugins/lesserpowers/commands/evolve-ml.md
```

`evolve.md` is a master dispatcher; the other three are mode-specific subskills it routes to.

### Type 5 — Agent-browser skill (slim stub)

Upstream is now a discovery stub that calls `agent-browser skills get core` at runtime for the full workflow content. Sync only `SKILL.md` and remove any leftover supporting directories from earlier sync runs.

```bash
rm -rf ~/workspace/asermax/claude-plugins/superpowers/skills/agent-browser/references \
       ~/workspace/asermax/claude-plugins/superpowers/skills/agent-browser/templates
```

**This one is a manual merge, not a copy.** The plugin file carries a local-only `## Visible browser inside herdr` section that does not exist upstream, so a straight `cp` deletes it. Diff upstream against the plugin copy, port whatever upstream changed, and leave that section standing. Also keep `Bash(herdr plugin:*)` and `Bash(bun run:*)` in `allowed-tools` — the section needs both and upstream declares neither.

```bash
diff ~/workspace/random/agent-browser/skills/agent-browser/SKILL.md \
     ~/workspace/asermax/claude-plugins/superpowers/skills/agent-browser/SKILL.md
```

### Type 6 — `bro` and `herdr` (dmmulroy)

Direct copy, verbatim. Neither skill references another skill, so the `superpowers:` prefix rule has nothing to apply to, and neither ships supporting files.

```bash
SRC=~/workspace/random/dmmulroy-skills
DST=~/workspace/asermax/claude-plugins/superpowers/skills

cp "$SRC/bro/SKILL.md" "$DST/bro/SKILL.md"
cp "$SRC/herdr/SKILL.md" "$DST/herdr/SKILL.md"
```

Two things to leave alone:

- **Upstream typos in the `herdr` description** ("terminl", "requies", "another skills"). Copy them as-is. Fixing them locally turns every future sync into a manual merge, and the description still routes correctly.
- **`disable-model-invocation: true` on `bro`.** It is a restate-my-last-message command, so it must only ever fire when the user types `/superpowers:bro`.

`herdr` overlaps with the "Visible browser inside herdr" section in `agent-browser`, but they do different jobs: `agent-browser` drives the `official.browser` plugin pane, `herdr` drives panes, tabs and sibling agents. Do not merge them or add cross-references between them.

### Type 7 — `plannotator-*` (plannotator)

Direct copy, verbatim. Each skill is a single `SKILL.md` with no supporting files and no cross-skill references.

```bash
SRC=~/workspace/random/plannotator/apps/skills/claude
DST=~/workspace/asermax/claude-plugins/superpowers/skills

for s in plannotator-review plannotator-annotate plannotator-last; do
  cp "$SRC/$s/SKILL.md" "$DST/$s/SKILL.md"
done
```

Three things to leave alone:

- **`disable-model-invocation: true` on all three.** Each one opens a browser UI and blocks until the user closes it, so it must only ever fire from an explicit `/superpowers:plannotator-*`.
- **`allowed-tools: Bash(plannotator:*)`.** The `!` preprocessing runs the CLI at skill load, and the skill is inert without that entry.
- **The `## Your task` output-handling cases.** They mirror the CLI's JSON contract (`approved` / `dismissed` / `annotated`), so they change when the CLI changes. Copy them as-is rather than editing for style.

If upstream adds a fourth skill under `apps/skills/claude/`, report it and ask before tracking it — the tracked list is deliberate, not a glob.

### Type 8 — `unslop` (cursor-plugins)

Direct copy, verbatim. Single `SKILL.md`, no supporting files and no cross-skill references, so the `superpowers:` prefix rule has nothing to apply to.

```bash
cp ~/workspace/random/cursor-plugins/pstack/skills/unslop/SKILL.md \
   ~/workspace/asermax/claude-plugins/superpowers/skills/unslop/SKILL.md
```

Leave the description alone. `Must always apply.` is upstream's wording and it is what makes the skill fire on every writing and editing task, which is the intent. Softening it locally would turn every future sync into a manual merge and would quietly narrow the routing.

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

Lesserpowers:
- systematic-debugging (adapted from superpowers, skill references removed)

Haft:
- skill catalog synced (15 skills: auto-triggering + manual-only + subroutines)
- PRINCIPLES.md context updated from upstream CLAUDE.md
- Cached MCP binary deleted (rebuilds on next session start)

Agentic-Evolve:
- evolve commands synced into lesserpowers (4 files: dispatcher + perf/size/ml)

Agent-Browser:
- agent-browser SKILL.md synced

Dmmulroy-Skills:
- bro, herdr synced into superpowers (verbatim)

Plannotator:
- plannotator-review, plannotator-annotate, plannotator-last synced into superpowers (verbatim)

Cursor-Plugins:
- unslop synced into superpowers (verbatim)

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
