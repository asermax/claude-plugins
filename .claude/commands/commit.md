---
description: Commits changes with semantic versioning for plugins
allowed-tools: Read, Edit, Bash(git diff:*), Bash(git status:*), Bash(git add:*), Bash(git commit:*), Bash(jq:*), Bash(mv:*), AskUserQuestion
---

# Commit with Version Bump

Creates conventional commits with automatic semantic versioning for the marketplace and affected plugins.

## Usage

```bash
/commit
```

## Overview

This command automates the commit process for the plugin marketplace by:
1. Analyzing all changed files (staged and unstaged)
2. Grouping related changes into logical commits
3. Determining affected scopes (marketplace, aur, superpowers)
4. Auto-proposing semantic version bumps based on change significance
5. Creating conventional commits with version updates

## Version Files

| Scope | File Path | Current Version |
|-------|-----------|-----------------|
| Marketplace | `.claude-plugin/marketplace.json` | Read from file |
| aur | `aur/.claude-plugin/plugin.json` | Read from file |
| superpowers | `superpowers/.claude-plugin/plugin.json` | Read from file |

## Semantic Versioning Rules

### Major (Breaking Changes)
- Adding or removing a plugin from the marketplace
- Removing a command, agent, or skill entirely
- Renaming a command (breaks existing `/command` usage)
- Changing command arguments in a breaking way
- Removing significant functionality

### Minor (Features)
- Adding a new command, agent, or skill
- Adding new functionality to existing commands
- Adding new templates or guides
- Significant improvements to prompts that change behavior
- Adding new configuration options

### Patch (Fixes)
- Small prompt tweaks/improvements
- Typo fixes in documentation
- Bug fixes in command logic
- Minor clarifications in instructions
- Updating catalog references
- Formatting improvements
- Comment updates

## Process

### 1. Gather Changes

Run git commands to understand the current state:

```bash
git status --short
git diff --cached --name-only  # staged files
git diff --name-only           # unstaged files
```

Parse the output to get:
- Modified files (M)
- Added files (A)
- Deleted files (D)
- Renamed files (R)

### 2. Group Related Changes

Use these heuristics to cluster files into logical commit groups:

#### Auto-grouping Rules

| Pattern | Grouping Logic |
|---------|----------------|
| `aur/commands/*.md` | Group by command (each command = separate commit) |
| `superpowers/commands/*.md` | Group by command (each command = separate commit) |
| `superpowers/agents/*.md` | Group by agent (each agent = separate commit) |
| `superpowers/skills/*/` | Group by skill directory |
| `superpowers/hooks/*` | Group hooks together unless clearly unrelated |
| `.claude/commands/*.md` | Each command file = separate commit |
| `.claude-plugin/marketplace.json` | Separate commit unless part of plugin add/remove |
| Root config files | Separate commits unless clearly related |

#### Example Groupings

**Scenario 1**: Changed `SKILL.md` and related test cases in same skill directory
→ **Single commit**: These are related changes (same skill)

**Scenario 2**: Added new command `bump-version.md` and modified unrelated command `create-aur-package.md`
→ **Two commits**: Separate features

**Scenario 3**: Modified `superpowers/skills/brainstorming/SKILL.md` and `superpowers/agents/code-reviewer.md`
→ **Two commits**: Different features

### 3. Present Proposed Groups

Display the proposed commit groupings to the user:

```
Proposed commit groups:
1. [superpowers/patch] Update agent communication skill
   - superpowers/skills/agent-communication/SKILL.md
   - superpowers/skills/agent-communication/scripts/chat.py

2. [marketplace/feat] Add commit command
   - .claude/commands/commit.md

Would you like to adjust these groupings?
```

Use AskUserQuestion to offer options:
- Proceed with proposed groups
- Merge groups (combine into fewer commits)
- Split groups (separate into more commits)
- Exclude files (don't commit yet)

### 4. Process Each Commit Group

For each commit group, execute these steps:

#### a. Determine Affected Scopes

Map file paths to scopes:

| Path Pattern | Scope |
|--------------|-------|
| `aur/**` | `aur` (AUR plugin) |
| `superpowers/**` | `superpowers` (superpowers plugin) |
| `.claude-plugin/**` | `marketplace` |
| `.claude/commands/**` | `marketplace` |
| Root files (`README.md`, etc.) | `marketplace` |

A commit can affect multiple scopes (e.g., adding a plugin affects both the plugin AND marketplace).

#### b. Analyze Change Significance

For each affected scope, determine the change type:

**Check for Major changes**:
- Files deleted in `commands/`, `agents/`, `skills/` → Removing feature (major)
- Command file renamed → Breaking change (major)
- Plugin added/removed from `marketplace.json` → Breaking change (major)

**Check for Minor changes**:
- New files in `commands/`, `agents/`, `skills/` → New feature (minor)
- New templates or guides added → New feature (minor)
- Significant prompt rewrites (use git diff to check size) → Feature (minor)

**Default to Patch**:
- Small changes, typos, formatting → Patch
- Catalog updates → Patch
- Documentation improvements → Patch

#### c. Read Current Versions

Parse JSON files to get current versions:

```bash
jq -r '.metadata.version' .claude-plugin/marketplace.json
jq -r '.version' aur/.claude-plugin/plugin.json
jq -r '.version' superpowers/.claude-plugin/plugin.json
```

#### d. Calculate New Versions

For each affected scope, calculate the new version using semantic versioning:

```
Current: X.Y.Z

Major bump: (X+1).0.0
Minor bump: X.(Y+1).0
Patch bump: X.Y.(Z+1)
```

#### e. Propose Version Bump

Present the analysis to the user:

```
Commit: Update agent communication skill
Affected: superpowers plugin
Changes:
  - Updated SKILL.md documentation
  - Modified chat.py script
Detected change type: PATCH

Proposed version bump:
- superpowers: 1.0.0 → 1.0.1

Proposed commit message:
fix(superpowers): update agent communication documentation

Updated agent-communication skill documentation to clarify
the notify→receive pattern and added examples.

Version bump: superpowers 1.0.0 → 1.0.1
```

Use AskUserQuestion to confirm or adjust:
- Confirm and proceed
- Change version type (major/minor/patch)
- Edit commit message
- Skip this commit

#### f. Update Version Files

If version bump approved, update the JSON file(s):

**For marketplace** (`.claude-plugin/marketplace.json`):
```bash
jq '.metadata.version = "X.Y.Z"' .claude-plugin/marketplace.json > /tmp/marketplace.json
mv /tmp/marketplace.json .claude-plugin/marketplace.json
```

**For plugins** (`aur/.claude-plugin/plugin.json`, `superpowers/.claude-plugin/plugin.json`):
```bash
jq '.version = "X.Y.Z"' aur/.claude-plugin/plugin.json > /tmp/aur.json
mv /tmp/aur.json aur/.claude-plugin/plugin.json

jq '.version = "X.Y.Z"' superpowers/.claude-plugin/plugin.json > /tmp/superpowers.json
mv /tmp/superpowers.json superpowers/.claude-plugin/plugin.json
```

#### g. Stage Files

Stage the changed files plus any updated version files:

```bash
git add <changed-file-1> <changed-file-2> ... <version-file>
```

#### h. Create Commit

Create the conventional commit using the approved message:

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <description>

<body explaining what changed and why>

Version bump: <scope> X.Y.Z → X.Y.Z

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

### 5. Repeat for Each Group

Continue processing each commit group until all approved groups are committed.

## Commit Message Format

Each commit follows conventional commits specification:

```
<type>(<scope>): <short description>

<longer description explaining the change>

Version bump: <scope-name> X.Y.Z → X.Y.Z

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Type Mapping

| Change Significance | Commit Type | Notes |
|-------------------|-------------|--------|
| Major (breaking) | Include `BREAKING CHANGE:` in commit body | Breaking changes must be clearly marked |
| Minor (feature) | `feat` | New functionality, backward compatible |
| Patch (fix) | `fix`, `docs`, `refactor`, `style`, `chore` | Bug fixes and improvements |

### Scope Values

| Scope | Description |
|-------|-------------|
| `aur` | Changes to aur plugin |
| `superpowers` | Changes to superpowers plugin |
| `marketplace` | Changes to marketplace config or root commands |

### Examples

**Patch commit**:
```
fix(superpowers): correct agent communication documentation

Fixed unclear instructions in agent-communication SKILL.md
regarding the notify→receive pattern.

Version bump: superpowers 1.0.0 → 1.0.1

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Minor commit**:
```
feat(marketplace): add commit command with version management

Introduces /commit command that automates conventional commits
with semantic versioning for the marketplace and plugins.

Features:
- Automatic change grouping
- Semantic version bump detection
- Multi-commit support for unrelated changes

Version bump: marketplace 1.0.0 → 1.1.0

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Major commit**:
```
feat(aur): remove deprecated bump-version command

BREAKING CHANGE: The /aur:bump-version command has been removed.
Use /aur:update-package instead which provides better functionality.

Version bump: aur 1.0.0 → 2.0.0

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## Error Handling

### No Changes Detected
If `git status` shows no changes:
- Inform user: "No changes to commit. Working directory is clean."
- Exit gracefully

### Merge Conflicts
If files have merge conflicts:
- List conflicted files
- Instruct user to resolve conflicts first
- Exit without committing

### Invalid Version Format
If JSON files have malformed version strings:
- Report the issue
- Ask user to fix manually
- Exit without committing

### Git Command Failures
If any git command fails:
- Show the error message
- Explain what went wrong
- Provide guidance on how to recover

## Notes

- **Always use conventional commits format** for consistency
- **Version bumps are per-scope**, not global (marketplace and plugins version independently)
- **Multiple commits for unrelated changes** keeps history clean and focused
- **User confirmation required** before any version bump or commit
- **Git must be in clean state** (no unresolved conflicts)
- **Staged and unstaged changes** are both analyzed and can be included
- **File grouping is intelligent** but user has final say on what goes together
