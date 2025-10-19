---
description: Sync superpowers plugin skills from upstream repositories
---

# Update Superpowers Skills

This command synchronizes the skills in the superpowers plugin with two upstream repositories:
- **superpowers**: `~/workspace/random/superpowers` - Core workflow skills
- **anthropic_skills**: `~/workspace/random/anthropic_skills` - Official Anthropic skills

## Process Overview

1. **Pull Latest Changes**: Update both upstream repositories
2. **Compare Skills**: Check differences between upstream and plugin skills
3. **Show Differences**: Display general comparison summary
4. **Update Skills**: Intelligently merge updates while preserving plugin customizations

## Implementation Steps

### Step 1: Pull Latest Changes from Upstream

Navigate to each upstream repository and pull the latest changes:

**Superpowers repository:**
```bash
cd ~/workspace/random/superpowers
git pull origin main
```

**Anthropic Skills repository:**
```bash
cd ~/workspace/random/anthropic_skills
git pull origin main
```

If either git pull fails, inform the user about the error and ask them to resolve it manually.

### Step 2: Identify Skills to Update

**From superpowers repository (`~/workspace/random/superpowers/skills/`):**
- brainstorming
- executing-plans
- receiving-code-review
- requesting-code-review
- root-cause-tracing
- systematic-debugging
- test-driven-development
- testing-skills-with-subagents
- writing-plans
- writing-skills

**From anthropic_skills repository (`~/workspace/random/anthropic_skills/`):**
- skill-creator

**Plugin-specific skills (not synced from upstream):**
- using-beads
- using-live-documentation
- self-maintaining-claude-md

### Step 3: Compare Each Skill

For each skill, compare the files between the upstream source and the plugin destination.

**For superpowers skills:**
- **Source**: `~/workspace/random/superpowers/skills/<skill-name>/`
- **Destination**: `~/workspace/asermax/claude-plugins/superpowers/skills/<skill-name>/`

```bash
diff -r ~/workspace/random/superpowers/skills/<skill-name> \
       ~/workspace/asermax/claude-plugins/superpowers/skills/<skill-name>
```

**For anthropic_skills skills:**
- **Source**: `~/workspace/random/anthropic_skills/<skill-name>/`
- **Destination**: `~/workspace/asermax/claude-plugins/superpowers/skills/<skill-name>/`

```bash
diff -r ~/workspace/random/anthropic_skills/<skill-name> \
       ~/workspace/asermax/claude-plugins/superpowers/skills/<skill-name>
```

### Step 4: Present Differences to User

**IMPORTANT**: Do NOT show detailed line-by-line diffs. Instead, provide a high-level summary.

For each skill with differences, show:
- Skill name
- Source repository (superpowers or anthropic_skills)
- General nature of changes (e.g., "content updates", "new test cases added", "workflow improvements")
- Whether the skill has plugin customizations that need special handling

**General explanation of plugin modifications:**

This plugin maintains customized versions of certain base skills to integrate with the beads task management system and remove dependencies on skills not included in the plugin:

- **brainstorming** and **writing-plans**: Modified to use beads issues for task tracking instead of markdown documents and git worktrees
- **executing-plans**: Simplified completion workflow (removed finishing-a-development-branch skill dependency)
- **systematic-debugging**: Removed references to skills not included in plugin (defense-in-depth, condition-based-waiting, verification-before-completion)

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

**Type 1: Skills with beads integration (brainstorming, writing-plans)**
- Read both upstream and plugin versions
- Identify conceptual improvements in upstream (better explanations, workflow enhancements, etc.)
- Manually adapt those improvements to preserve beads integration
- Example: If upstream adds better guidance about design validation, add that guidance but keep the beads issue creation approach

**Type 2: Skills with simplified workflows (executing-plans, systematic-debugging)**
- Read both upstream and plugin versions
- Identify conceptual improvements in upstream
- Manually adapt improvements while maintaining simplified workflow (without removed skill references)
- Example: If upstream improves debugging guidance, incorporate that while keeping removed skill references out

**Type 3: Unmodified skills (receiving-code-review, requesting-code-review, root-cause-tracing, test-driven-development, testing-skills-with-subagents, writing-skills)**
- Copy directly from upstream:
  ```bash
  cp -r ~/workspace/random/superpowers/skills/<skill-name> \
        ~/workspace/asermax/claude-plugins/superpowers/skills/
  ```

**Type 4: Anthropic skills (skill-creator)**
- Copy directly from upstream:
  ```bash
  cp -r ~/workspace/random/anthropic_skills/<skill-name> \
        ~/workspace/asermax/claude-plugins/superpowers/skills/
  ```

**Type 5: Plugin-specific skills (using-beads, using-live-documentation, self-maintaining-claude-md)**
- Never modify (no upstream source)

**Process for manual merge:**
1. Read the upstream version completely
2. Read the plugin version completely
3. Identify what changed conceptually in upstream
4. Edit the plugin version to incorporate those concepts while preserving plugin-specific approaches
5. Verify the merged version maintains both upstream improvements and plugin customizations

Confirm successful update:

```
✅ Skills updated successfully:
- skill-1 (adapted from superpowers, beads integration preserved)
- skill-2 (adapted from superpowers, simplified workflow preserved)
- skill-3 (copied directly from superpowers)
- skill-creator (copied directly from anthropic_skills)

⚠️ Plugin customizations preserved:
- brainstorming: beads integration maintained
- writing-plans: beads workflow maintained
- executing-plans: simplified completion workflow maintained
- systematic-debugging: skill references removed
```

## Error Handling

- **Upstream repository not found**: Inform user and provide the expected path
- **Git pull fails**: Show error message and suggest manual resolution
- **Permission issues**: Check file permissions and suggest fixes
- **No differences found**: Inform user that all skills are up to date
- **Manual merge conflicts**: If adaptation is unclear, ask user for guidance

## Examples

When no differences are found:

```
User: /update-superpowers-skills
Claude: Checking for updates...
        All skills are up to date with upstream repositories.
```

When differences are found:

```
User: /update-superpowers-skills
Claude: Found updates in 3 skills:
        - brainstorming (requires manual merge for beads integration)
        - systematic-debugging (requires manual merge for simplified workflow)
        - receiving-code-review (can auto-update)

        Would you like me to proceed? (yes/no)
User: yes
Claude: [Reads upstream changes, adapts to plugin, updates files]
        ✅ All skills updated successfully with customizations preserved.
```

## Important Notes

- **Never lose plugin customizations**: The beads integration and simplified workflows are critical features
- **Conceptual merging**: Focus on understanding what improved upstream, then apply those improvements to the plugin's approach
- **Manual review**: For modified skills, always read both versions completely before merging
- **Test after update**: Verify updated skills work correctly by checking their SKILL.md files for correctness
- **Preserve formatting**: Maintain consistent markdown formatting and style in updated skills
