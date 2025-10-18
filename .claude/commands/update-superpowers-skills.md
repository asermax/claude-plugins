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
3. **Show Differences**: Display file-by-file comparison for each repository
4. **Update Skills**: Copy updated skills to plugin (with user confirmation)

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

For each skill with differences, show:
- Skill name
- Source repository (superpowers or anthropic_skills)
- Which files changed (added, modified, removed)
- Detailed diff output for each changed file

Format the output clearly:

```
=== Skill: systematic-debugging (from superpowers) ===

Modified files:
- SKILL.md

New files:
- test-pressure-4.md

Detailed diff for SKILL.md:
[show diff output]

---

=== Skill: skill-creator (from anthropic_skills) ===

Modified files:
- SKILL.md

Detailed diff for SKILL.md:
[show diff output]

---
```

### Step 5: Confirm Updates

After showing all differences, ask the user:

```
Found differences in N skills:
- skill-1
- skill-2
- ...

Would you like to update these skills in the plugin? (yes/no)
```

### Step 6: Copy Updated Skills with Custom Modifications Preserved

**IMPORTANT:** This plugin has custom modifications that must be preserved:

1. **Brainstorming skill**: Line 47 references "Create beads issues in the worktree with dependencies"
2. **Writing-plans skill**: Entire content uses beads issues instead of markdown plan documents
3. **Additional skills** (not in upstream): using-beads, using-live-documentation, self-maintaining-claude-md

**Update procedure:**

If user confirms, for each changed skill:

1. **For brainstorming** (from superpowers):
   - Copy updated content from upstream
   - Re-apply the beads modification to line 47:
     ```
     - Create beads issues in the worktree with dependencies
     ```

2. **For writing-plans** (from superpowers):
   - **DO NOT** copy from upstream (custom beads integration)
   - Show differences to user
   - Ask if they want to manually merge changes
   - Warn that copying would lose beads integration

3. **For other superpowers skills** (executing-plans, receiving-code-review, requesting-code-review, root-cause-tracing, systematic-debugging, test-driven-development, testing-skills-with-subagents, writing-skills):
   - Copy directly from upstream:
     ```bash
     cp -r ~/workspace/random/superpowers/skills/<skill-name> \
           ~/workspace/asermax/claude-plugins/superpowers/skills/
     ```

4. **For anthropic_skills skills** (skill-creator):
   - Copy directly from upstream:
     ```bash
     cp -r ~/workspace/random/anthropic_skills/<skill-name> \
           ~/workspace/asermax/claude-plugins/superpowers/skills/
     ```

5. **Additional skills** (using-beads, using-live-documentation, self-maintaining-claude-md):
   - Never copy from upstream (they don't exist there)
   - These are plugin-specific additions

Confirm successful update:

```
✅ Skills updated successfully:
- skill-1 (from superpowers)
- skill-2 (from superpowers)
- skill-creator (from anthropic_skills)
- brainstorming (from superpowers, with beads modification preserved)
- writing-plans (skipped - custom beads integration preserved)

⚠️ Custom modifications preserved:
- brainstorming: beads integration maintained
- writing-plans: custom beads workflow maintained
- Additional skills (using-beads, using-live-documentation, self-maintaining-claude-md) unchanged
```

## Error Handling

- **Upstream repository not found**: Inform user and provide the expected path
- **Git pull fails**: Show error message and suggest manual resolution
- **Permission issues**: Check file permissions and suggest fixes
- **No differences found**: Inform user that all skills are up to date

## Examples

When no differences are found:

```
User: /superpowers:update-skills