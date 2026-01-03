---
description: Sync plugins from upstream repositories (superpowers, claudekit-skills, quint, agentic-evolve)
---

# Sync Upstream

This command synchronizes plugins with their upstream repositories:
- **superpowers**: `~/workspace/random/superpowers` - Core workflow skills
- **claudekit-skills**: `~/workspace/random/claudekit-skills` - Browser automation and other utilities
- **quint**: `~/workspace/random/quint-code` - FPF reasoning methodology
- **agentic-evolve**: `~/workspace/random/agentic-evolve` - Evolutionary algorithm discovery

## Process Overview

1. **Pull Latest Changes**: Update upstream repositories
2. **Sync Superpowers**: Compare and update skills with intelligent merging
3. **Sync Claudekit**: Copy skills directly from upstream
4. **Sync Quint**: Copy commands and build MCP binary
5. **Sync Agentic-Evolve**: Copy evolve command directly from upstream
6. **Report Summary**: Display successful updates

## Implementation Steps

### Step 1: Pull Latest Changes from Upstream

Navigate to the upstream repositories and pull the latest changes:

**Superpowers repository:**
```bash
cd ~/workspace/random/superpowers
git pull origin main
```

**Claudekit-skills repository:**
```bash
cd ~/workspace/random/claudekit-skills
git pull origin main
```

**Quint-code repository:**
```bash
cd ~/workspace/random/quint-code
git pull origin main
```

**Agentic-evolve repository:**
```bash
cd ~/workspace/random/agentic-evolve
git pull origin main
```

If any git pull fails, inform the user about the error and ask them to resolve it manually.

### Step 2: Identify Skills to Update

**From superpowers repository (`~/workspace/random/superpowers/skills/`):**
- requesting-code-review (SKILL.md only - agent is maintained separately)
- systematic-debugging (includes supporting techniques as .md files)

**From quint-code repository (`~/workspace/random/quint-code/src/mcp/cmd/commands/`):**
- All 13 command files (q0-init, q1-hypothesize, q1-add, q2-verify, q3-validate, q4-audit, q5-decide, q-status, q-query, q-decay, q-actualize, q-reset, q-audit)

**MCP Binary:**
- Build from `~/workspace/random/quint-code/src/mcp` and install to `~/.local/bin/quint-code`

**From agentic-evolve repository (`~/workspace/random/agentic-evolve/.claude/commands/`):**
- evolve.md (master dispatcher)
- evolve-perf.md (runtime speed optimization)
- evolve-size.md (code size/bytes optimization)
- evolve-ml.md (ML accuracy optimization)

**Plugin-specific skills (not synced from upstream):**
- using-live-documentation
- self-maintaining-claude-md
- testing-skills-activation
- using-gemini
- agent-communication
- financial-summary
- using-code-directives

**Agents (separate from skills):**
- code-reviewer agent: Synced from `~/workspace/random/superpowers/agents/code-reviewer.md`
- code-reviewer template: Synced from `~/workspace/random/superpowers/skills/requesting-code-review/code-reviewer.md`

### Step 3: Identify What Changed in Upstream Repository

**Process:**

1. **Capture the current commit** before pulling (this was already done in Step 1, the output shows the old and new commits)
2. **Analyze the git pull output** to identify which files changed
3. **Filter for files we track** in our plugin
4. **Show the actual upstream changes** using git diff
5. **Analyze how these changes affect our customized skills**

**For superpowers repository:**

The git pull output from Step 1 shows:
- Old commit: First part of "Updating XXX..YYY"
- New commit: Second part of "Updating XXX..YYY"
- Changed files: Listed in the output

Example pull output:
```
Updating 7fc125e..e3d881b
Fast-forward
 agents/code-reviewer.md                     | 47 +++++++++++++++++++++++++++++
 skills/requesting-code-review/SKILL.md      |  8 ++---
```

From this we can see:
- Old commit: `7fc125e`
- New commit: `e3d881b`
- Changed files: `agents/code-reviewer.md` (new), `skills/requesting-code-review/SKILL.md` (modified)

To see what actually changed in upstream:
```bash
cd ~/workspace/random/superpowers
git diff 7fc125e..e3d881b -- skills/requesting-code-review/SKILL.md
git show e3d881b:agents/code-reviewer.md  # For new files
```

**Files we track from superpowers:**
- `skills/requesting-code-review/SKILL.md`
- `skills/systematic-debugging/` (entire directory - includes supporting .md files)
- `agents/code-reviewer.md` (synced to our `agents/code-reviewer.md`)
- `skills/requesting-code-review/code-reviewer.md` (synced to our `skills/requesting-code-review/code-reviewer.md`)

**Files we track from quint-code:**
- `src/mcp/cmd/commands/*.md` (all 13 command files - synced to our `quint/commands/`)

**Files we track from agentic-evolve:**
- `.claude/commands/evolve.md` (master dispatcher - synced to `superpowers/commands/evolve.md`)
- `.claude/commands/evolve-perf.md` (synced to `superpowers/commands/evolve-perf.md`)
- `.claude/commands/evolve-size.md` (synced to `superpowers/commands/evolve-size.md`)
- `.claude/commands/evolve-ml.md` (synced to `superpowers/commands/evolve-ml.md`)

**Important**: Only analyze files that:
1. Are in the changed files list from git pull output
2. Are files we actually track in our plugin

### Step 4: Present Differences to User

**IMPORTANT**: Do NOT show detailed line-by-line diffs. Instead, provide a high-level summary.

For each skill with differences, show:
- Skill name
- General nature of changes (e.g., "content updates", "new test cases added", "workflow improvements")
- Whether the skill has plugin customizations that need special handling

**General explanation of plugin modifications:**

This plugin maintains customized versions of certain base skills to remove dependencies on skills not included in the plugin:

- **All skills**: Use `superpowers:` namespace prefix for all skill references
- **systematic-debugging**: Removed references to skills not included in plugin (defense-in-depth, condition-based-waiting, verification-before-completion)
- **requesting-code-review**: Intentionally broadened to "ANY task that modifies code" instead of "major features"; simplified SHA commands to run directly without variable assignment (use `git rev-parse HEAD~1` and `git rev-parse HEAD` directly instead of assigning to variables)

Format the output clearly:

```
=== Skills with Updates ===

systematic-debugging (from superpowers)
  Status: Has plugin customizations (removed skill references)
  Changes: Content updates in upstream version
  Action: Manual merge required to preserve simplified workflow

requesting-code-review (from superpowers)
  Status: Has plugin customizations (broadened scope, simplified SHA commands)
  Changes: Content updates in upstream version
  Action: Manual merge required to preserve customizations

---
```

### Step 5: Confirm Updates

After showing all differences, ask the user:

```
Found differences in N skills:
- skill-1 (requires manual merge)
- skill-2 (can auto-update)
- ...

Would you like me to proceed with updating these skills? (yes/no)
```

### Step 6: Update Skills with Intelligent Merging

**Plugin Customization Strategy:**

The plugin maintains conceptual modifications to certain skills. When updating these skills, you must:
1. **Understand the base changes**: Read the upstream updates to understand what improved
2. **Preserve plugin concepts**: Maintain the plugin's approach (e.g., beads vs markdown, simplified workflows)
3. **Adapt, don't copy**: Bring improvements from upstream while keeping plugin-specific logic

**Update procedure by skill type:**

**Type 1: Unmodified skills (requesting-code-review)**
- Copy directly from upstream (entire directory to include supporting documentation):
  ```bash
  cp -r ~/workspace/random/superpowers/skills/requesting-code-review \
        ~/workspace/asermax/claude-plugins/superpowers/skills/
  ```

**Type 2: Skills with minor customizations (systematic-debugging)**
- Copy directly from upstream (entire directory):
  ```bash
  cp -r ~/workspace/random/superpowers/skills/systematic-debugging \
        ~/workspace/asermax/claude-plugins/superpowers/skills/
  ```
- Remove any references to skills not in plugin (e.g., verification-before-completion)

**Type 3: Plugin-specific skills (using-live-documentation, self-maintaining-claude-md, testing-skills-activation, using-gemini, agent-communication, financial-summary, using-code-directives)**
- Never modify (no upstream source)

**Type 4: Code-reviewer agent and template**
- Copy directly from upstream (no customizations):
  ```bash
  cp ~/workspace/random/superpowers/agents/code-reviewer.md \
     ~/workspace/asermax/claude-plugins/superpowers/agents/code-reviewer.md
  cp ~/workspace/random/superpowers/skills/requesting-code-review/code-reviewer.md \
     ~/workspace/asermax/claude-plugins/superpowers/skills/requesting-code-review/code-reviewer.md
  ```

**Type 5: Quint commands and context**
- Copy command files directly from upstream (no customization):
  ```bash
  cp ~/workspace/random/quint-code/src/mcp/cmd/commands/*.md \
     ~/workspace/asermax/claude-plugins/quint/commands/
  ```
- Copy CLAUDE.md to PRINCIPLES.md for context injection:
  ```bash
  cp ~/workspace/random/quint-code/CLAUDE.md \
     ~/workspace/asermax/claude-plugins/quint/context/PRINCIPLES.md
  ```
- MCP binary is built on-demand by the SessionStart hook (see `quint/hooks/session-init.sh`)
- Commands use MCP tools directly, no modification needed

**Type 6: Agentic-evolve commands (direct copy)**
- Copy all 4 command files directly from upstream (no customization):
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
- The evolve.md is a master dispatcher that routes to specialized subskills based on optimization goal

**Process for manual merge:**
1. Read the upstream version completely
2. Read the plugin version completely
3. Identify what changed conceptually in upstream
4. Edit the plugin version to incorporate those concepts while preserving plugin-specific approaches
5. Verify the merged version maintains both upstream improvements and plugin customizations

Confirm successful update:

```
✅ Plugins synced successfully:

Superpowers:
- requesting-code-review (copied directly from superpowers)
- systematic-debugging (adapted from superpowers, skill references removed)

Quint:
- 13 command files synced (Q0-Q5 cycle + utilities)
- PRINCIPLES.md context updated from upstream CLAUDE.md
- MCP binary builds on-demand via SessionStart hook

Agentic-Evolve:
- evolve commands synced (4 files: master dispatcher + perf/size/ml subskills)

⚠️ Plugin customizations preserved:
- All skills: superpowers: namespace prefix applied to skill references
- systematic-debugging: removed references to skills not in plugin
- requesting-code-review: broadened scope and simplified SHA commands
```

## Error Handling

- **Upstream repository not found**: Inform user and provide the expected path
- **Git pull fails**: Show error message and suggest manual resolution
- **Permission issues**: Check file permissions and suggest fixes
- **No differences found**: Inform user that all skills are up to date
- **Manual merge conflicts**: If adaptation is unclear, ask user for guidance

## Important Notes

- **Never lose plugin customizations**: The simplified workflows and namespace prefixes are critical features
- **Conceptual merging**: Focus on understanding what improved upstream, then apply those improvements to the plugin's approach
- **Manual review**: For modified skills, always read both versions completely before merging
- **Test after update**: Verify updated skills work correctly by checking their SKILL.md files for correctness
- **Preserve formatting**: Maintain consistent markdown formatting and style in updated skills
