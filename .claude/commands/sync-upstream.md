---
description: Sync plugins from upstream repositories (superpowers, claudekit-skills, quint)
---

# Sync Upstream

This command synchronizes plugins with their upstream repositories:
- **superpowers**: `~/workspace/random/superpowers` - Core workflow skills
- **claudekit-skills**: `~/workspace/random/claudekit-skills` - Browser automation and other utilities
- **quint**: `~/workspace/random/quint-code` - FPF reasoning methodology

## Process Overview

1. **Pull Latest Changes**: Update upstream repositories
2. **Sync Superpowers**: Compare and update skills with intelligent merging
3. **Sync Claudekit**: Copy skills directly from upstream
4. **Sync Quint**: Copy commands and build MCP binary
5. **Report Summary**: Display successful updates

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

If any git pull fails, inform the user about the error and ask them to resolve it manually.

### Step 2: Identify Skills to Update

**From superpowers repository (`~/workspace/random/superpowers/skills/`):**
- brainstorming
- executing-plans
- receiving-code-review
- requesting-code-review (SKILL.md only - agent is maintained separately)
- systematic-debugging (includes supporting techniques as .md files)
- test-driven-development (includes supporting documentation as .md files)
- writing-plans
- writing-skills (includes supporting documentation as .md files)

**From claudekit-skills repository (`~/workspace/random/claudekit-skills/.claude/skills/`):**
- chrome-devtools (entire directory - includes scripts/ and references/)

**From quint-code repository (`~/workspace/random/quint-code/src/mcp/cmd/commands/`):**
- All 13 command files (q0-init, q1-hypothesize, q1-add, q2-verify, q3-validate, q4-audit, q5-decide, q-status, q-query, q-decay, q-actualize, q-reset, q-audit)

**MCP Binary:**
- Build from `~/workspace/random/quint-code/src/mcp` and install to `~/.local/bin/quint-code`

**Plugin-specific skills (not synced from upstream):**
- using-beads
- using-live-documentation
- self-maintaining-claude-md
- testing-skills-activation
- using-gemini
- agent-communication
- financial-summary

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
- `skills/brainstorming/SKILL.md`
- `skills/executing-plans/SKILL.md`
- `skills/receiving-code-review/SKILL.md`
- `skills/requesting-code-review/SKILL.md`
- `skills/systematic-debugging/` (entire directory - includes supporting .md files)
- `skills/test-driven-development/` (entire directory - includes supporting .md files)
- `skills/writing-plans/SKILL.md`
- `skills/writing-skills/` (entire directory - includes supporting .md files)
- `agents/code-reviewer.md` (synced to our `agents/code-reviewer.md`)
- `skills/requesting-code-review/code-reviewer.md` (synced to our `skills/requesting-code-review/code-reviewer.md`)

**Files we track from claudekit-skills:**
- `.claude/skills/chrome-devtools/` (entire directory - includes scripts/ and references/)

**Files we track from quint-code:**
- `src/mcp/cmd/commands/*.md` (all 13 command files - synced to our `quint/commands/`)

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

This plugin maintains customized versions of certain base skills to integrate with the beads task management system and remove dependencies on skills not included in the plugin:

- **All skills**: Use `superpowers:` namespace prefix for all skill references
- **brainstorming**: Merges design and implementation into single "plan implementation" phase that creates epic beads with design docs and child task beads; removed git worktree dependencies
- **writing-plans**: Uses epic-task hierarchy (parent-child beads) to document design in epic beads and implementation in task beads
- **executing-plans**: Simplified completion workflow (removed finishing-a-development-branch skill dependency); aware of epic-task hierarchy
- **systematic-debugging**: Removed references to skills not included in plugin (defense-in-depth, condition-based-waiting, verification-before-completion)
- **requesting-code-review**: Intentionally broadened to "ANY task that modifies code" instead of "major features"; simplified SHA commands to run directly without variable assignment (use `git rev-parse HEAD~1` and `git rev-parse HEAD` directly instead of assigning to variables)

Format the output clearly:

```
=== Skills with Updates ===

brainstorming (from superpowers)
  Status: Has plugin customizations (beads integration)
  Changes: Content updates in upstream version
  Action: Manual merge required to preserve beads workflow

writing-plans (from superpowers)
  Status: Has plugin customizations (beads integration)
  Changes: Content updates in upstream version
  Action: Manual merge required to preserve beads workflow

systematic-debugging (from superpowers)
  Status: Has plugin customizations (removed skill references)
  Changes: Content updates in upstream version
  Action: Manual merge required to preserve simplified workflow

executing-plans (from superpowers)
  Status: Has plugin customizations (simplified completion)
  Changes: Content updates in upstream version
  Action: Manual merge required to preserve simplified workflow

receiving-code-review (from superpowers)
  Status: No customizations
  Changes: Minor content updates
  Action: Direct copy from upstream

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

**Type 1: Skills with beads integration (brainstorming, writing-plans, executing-plans)**
- Read both upstream and plugin versions
- Identify conceptual improvements in upstream (better explanations, workflow enhancements, etc.)
- Manually adapt those improvements to preserve beads integration and epic-task hierarchy pattern
- Remove all git worktree references and workflows
- Apply `superpowers:` namespace prefix to all skill references
- Example: If upstream adds better guidance about design validation, add that guidance but keep the beads epic-task structure

**Type 2: Unmodified skills (receiving-code-review, requesting-code-review, test-driven-development, writing-skills)**
- Copy directly from upstream (entire directory to include supporting documentation):
  ```bash
  cp -r ~/workspace/random/superpowers/skills/<skill-name> \
        ~/workspace/asermax/claude-plugins/superpowers/skills/
  ```

**Type 3: Skills with minor customizations (systematic-debugging)**
- Copy directly from upstream (entire directory):
  ```bash
  cp -r ~/workspace/random/superpowers/skills/systematic-debugging \
        ~/workspace/asermax/claude-plugins/superpowers/skills/
  ```
- Remove any references to skills not in plugin (e.g., verification-before-completion)

**Type 4: Plugin-specific skills (using-beads, using-live-documentation, self-maintaining-claude-md, testing-skills-activation, using-gemini, agent-communication, financial-summary)**
- Never modify (no upstream source)

**Type 5: Code-reviewer agent and template**
- Copy directly from upstream (no customizations):
  ```bash
  cp ~/workspace/random/superpowers/agents/code-reviewer.md \
     ~/workspace/asermax/claude-plugins/superpowers/agents/code-reviewer.md
  cp ~/workspace/random/superpowers/skills/requesting-code-review/code-reviewer.md \
     ~/workspace/asermax/claude-plugins/superpowers/skills/requesting-code-review/code-reviewer.md
  ```

**Type 6: Claudekit skills (direct copy)**
- Copy entire skill directories without modification
- Preserves original frontmatter (includes license, allowed-tools, etc.)
- Copy entire directory to include scripts/ and references/:
  ```bash
  cp -r ~/workspace/random/claudekit-skills/.claude/skills/<skill-name> \
        ~/workspace/asermax/claude-plugins/superpowers/skills/
  ```
- Current skills: chrome-devtools

**Type 7: Quint commands and MCP binary**
- Copy command files directly from upstream (no customization):
  ```bash
  cp ~/workspace/random/quint-code/src/mcp/cmd/commands/*.md \
     ~/workspace/asermax/claude-plugins/quint/commands/
  ```
- Apply patch to remove Claude setup from init command:
  ```bash
  cd ~/workspace/random/quint-code
  git apply ~/workspace/asermax/claude-plugins/quint/patches/init-skip-claude-setup.patch
  ```
- Build and install MCP binary:
  ```bash
  cd ~/workspace/random/quint-code/src/mcp
  go build -o ~/.local/bin/quint-code -trimpath .
  ```
- Reset patch after building:
  ```bash
  cd ~/workspace/random/quint-code
  git checkout -- src/mcp/cmd/init.go
  ```
- Commands use MCP tools directly, no modification needed

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
- skill-1 (adapted from superpowers, beads integration preserved)
- skill-2 (adapted from superpowers, simplified workflow preserved)
- skill-3 (copied directly from superpowers)

Claudekit:
- chrome-devtools (copied directly from claudekit-skills)

Quint:
- 13 command files synced (Q0-Q5 cycle + utilities)
- MCP binary built and installed to ~/.local/bin/quint-code

⚠️ Plugin customizations preserved:
- All skills: superpowers: namespace prefix applied to skill references
- brainstorming: merged design and planning into epic-task bead structure, worktree dependencies removed
- writing-plans: epic-task hierarchy pattern for design documentation
- executing-plans: simplified completion workflow, epic-task hierarchy awareness
- systematic-debugging: removed reference to verification-before-completion skill
```

## Error Handling

- **Upstream repository not found**: Inform user and provide the expected path
- **Git pull fails**: Show error message and suggest manual resolution
- **Permission issues**: Check file permissions and suggest fixes
- **No differences found**: Inform user that all skills are up to date
- **Manual merge conflicts**: If adaptation is unclear, ask user for guidance

## Important Notes

- **Never lose plugin customizations**: The beads integration and simplified workflows are critical features
- **Conceptual merging**: Focus on understanding what improved upstream, then apply those improvements to the plugin's approach
- **Manual review**: For modified skills, always read both versions completely before merging
- **Test after update**: Verify updated skills work correctly by checking their SKILL.md files for correctness
- **Preserve formatting**: Maintain consistent markdown formatting and style in updated skills
