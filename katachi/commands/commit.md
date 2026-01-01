---
description: Analyze uncommitted changes and create grouped conventional commits
---

# Commit Workflow

Analyze changes and create appropriate conventional commits.

## Context

**Skill to load:**
Load the `katachi:framework-core` skill for workflow principles.

## Process

### 1. Analyze Changes

Run in parallel:
```bash
git status
git diff --staged
git diff
git log -5 --oneline
```

### 2. Understand the Changes

Analyze what's changed:
- New files added
- Files modified
- Files deleted
- Which features are affected

### 3. Group Changes Logically

Group changes that should be committed together:
- Related to same feature
- Part of same logical change
- Following conventional commit types

**Commit types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code change without feature/fix
- `test`: Adding/updating tests
- `chore`: Build, tooling, maintenance

### 4. Draft Commit Messages

For each group, draft commit message:

```
type(scope): brief description

Longer explanation if needed.
- Detail 1
- Detail 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### 5. Present Plan

Show user the commit plan:

```
## Proposed Commits

### Commit 1
feat(CORE-002): add audio capture functionality

Files:
- src/audio/capture.py (new)
- src/audio/__init__.py (modified)
- tests/test_audio.py (new)

### Commit 2
docs: update CLAUDE.md with current focus

Files:
- CLAUDE.md (modified)

Proceed with these commits? [Y/N/Adjust]
```

### 6. User Confirmation

Wait for user to:
- Approve as-is
- Request adjustments
- Cancel

### 7. Execute Commits

For each approved commit:
```bash
git add [files]
git commit -m "$(cat <<'EOF'
type(scope): description

Details...

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### 8. Verify Success

After commits:
```bash
git status
git log -N --oneline  # N = number of commits made
```

Show results to user.

## Guidelines

**Commit message quality:**
- Present tense ("add" not "added")
- No period at end of subject line
- Subject line under 50 chars
- Body wrapped at 72 chars

**Grouping rules:**
- Don't mix features in one commit
- Separate formatting from logic changes
- Separate tests from implementation (unless closely related)
- Keep commits atomic but meaningful

**Safety:**
- Never force push
- Never modify git config
- Never skip hooks unless explicitly requested
- Warn before committing to main/master

## Workflow

**This is a collaborative process:**
- Analyze changes
- Group logically
- Draft messages
- User approves
- Execute commits
- Verify success
