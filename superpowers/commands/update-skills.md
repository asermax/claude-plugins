---
description: Pull latest changes from the upstream superpowers repository and show differences
---

# Update Superpowers Skills

This command synchronizes the skills in this plugin with the upstream superpowers repository located at `~/workspace/random/superpowers`.

## Process Overview

1. **Pull Latest Changes**: Update the upstream repository
2. **Compare Skills**: Check differences between upstream and plugin skills
3. **Show Differences**: Display file-by-file comparison
4. **Update Skills**: Copy updated skills to plugin (with user confirmation)

## Implementation Steps

### Step 1: Pull Latest Changes from Upstream

Navigate to the upstream repository and pull the latest changes:

```bash
cd ~/workspace/random/superpowers
git pull origin main
```

If git pull fails, inform the user about the error and ask them to resolve it manually.

### Step 2: Identify Skills to Update

The following skills should be synchronized:
- brainstorming
- executing-plans
- receiving-code-review
- requesting-code-review
- root-cause-tracing
- systematic-debugging
- writing-plans
- writing-skills

### Step 3: Compare Each Skill

For each skill directory, compare the files between:
- **Source**: `~/workspace/random/superpowers/skills/<skill-name>/`
- **Destination**: `~/workspace/asermax/claude-plugins/superpowers/skills/<skill-name>/`

Use `diff -r` to compare directories and show differences:

```bash
diff -r ~/workspace/random/superpowers/skills/<skill-name> \
       ~/workspace/asermax/claude-plugins/superpowers/skills/<skill-name>
```

### Step 4: Present Differences to User

For each skill with differences, show:
- Skill name
- Which files changed (added, modified, removed)
- Detailed diff output for each changed file

Format the output clearly:

```
=== Skill: systematic-debugging ===

Modified files:
- SKILL.md

New files:
- test-pressure-4.md

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

1. **For brainstorming**:
   - Copy updated content from upstream
   - Re-apply the beads modification to line 47:
     ```
     - Create beads issues in the worktree with dependencies
     ```

2. **For writing-plans**:
   - **DO NOT** copy from upstream (custom beads integration)
   - Show differences to user
   - Ask if they want to manually merge changes
   - Warn that copying would lose beads integration

3. **For other base skills** (executing-plans, receiving-code-review, requesting-code-review, root-cause-tracing, systematic-debugging, writing-skills):
   - Copy directly from upstream:
     ```bash
     cp -r ~/workspace/random/superpowers/skills/<skill-name> \
           ~/workspace/asermax/claude-plugins/superpowers/skills/
     ```

4. **Additional skills** (using-beads, using-live-documentation, self-maintaining-claude-md):
   - Never copy from upstream (they don't exist there)
   - These are plugin-specific additions

Confirm successful update:

```
✅ Skills updated successfully:
- skill-1 (copied from upstream)
- skill-2 (copied from upstream)
- brainstorming (updated with beads modification preserved)
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