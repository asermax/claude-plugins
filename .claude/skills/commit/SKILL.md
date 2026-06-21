---
name: commit
description: Create conventional commits with automatic semantic version bumps for this plugin marketplace and the affected plugin(s). Use this skill whenever the user asks to "commit", "commit my changes", "make a commit", "bump versions and commit", "ship these changes", or otherwise wants to create one or more commits in this marketplace repo. Prefer this skill over a plain `git commit` because it groups related files, derives scopes, proposes semver bumps for both the marketplace and any affected plugin's `plugin.json`, and uses conventional commit format with reasoning the user can validate.
---

# Commit with Version Bump

Automates conventional commits for this plugin marketplace by:

1. Analyzing all changed files (staged and unstaged)
2. Grouping related changes into logical commits
3. Determining affected scopes (marketplace + any touched plugin)
4. Proposing semantic version bumps with reasoning
5. Creating the commits after the user signs off

## Version files

| Scope | Path | How to read |
|---|---|---|
| marketplace | `.claude-plugin/marketplace.json` | `jq -r '.metadata.version'` |
| aur | `aur/.claude-plugin/plugin.json` | `jq -r '.version'` |
| superpowers | `superpowers/.claude-plugin/plugin.json` | `jq -r '.version'` |
| haft | `haft/.claude-plugin/plugin.json` | `jq -r '.version'` |
| openspec | `openspec/.claude-plugin/plugin.json` | `jq -r '.version'` |
| katachi | `katachi/.claude-plugin/plugin.json` | `jq -r '.version'` |
| memu | `memu/.claude-plugin/plugin.json` | `jq -r '.version'` |
| kanshi | `kanshi/.claude-plugin/plugin.json` | `jq -r '.version'` |
| beads | `beads/.claude-plugin/plugin.json` | `jq -r '.version'` (present in repo but not currently shipped via marketplace.json — bump it only if its files actually change) |

If a new plugin lands in the marketplace without an entry above, treat it the same way: read `<plugin>/.claude-plugin/plugin.json`, follow the rules below for plugin scopes.

## Semantic versioning rules

These are **guidelines, not rigid rules** — the goal is that the version number tells consumers something honest about what changed. Use judgment.

### Marketplace versioning (consumer-focused)

The marketplace version is what someone installing this marketplace sees. Think about whether they need to care.

| Bump | When | Examples |
|---|---|---|
| **Major** | Something removed that could break existing setups | Plugin removed from marketplace, root command/skill deleted |
| **Minor** | New functionality available to consumers | New plugin added, new root skill, significant new capabilities |
| **Patch** | Improvements to existing functionality | Bug fixes in plugins, doc updates, small enhancements |

Heuristics for `.claude/` (root marketplace) changes:

- **New root command or skill** → typically Minor (new functionality available)
- **Existing root command/skill modified** → depends on scope:
  - Significant new capability → Minor
  - Bug fix or clarification → Patch
  - Major rewrite that changes behavior → Minor or Major if breaking
- **Plugin file modified** → typically Patch for marketplace (the plugin itself may bump higher independently)
- **New plugin added** → Minor
- **Plugin removed** → Major

### Plugin versioning (feature-focused)

Each plugin tracks its own feature trajectory independently of the marketplace.

**Major (breaking):**
- Removing a command, agent, or skill entirely
- Renaming a command/skill (breaks existing `/command` usage)
- Changing command arguments in a breaking way

**Minor (features):**
- Adding a new command, agent, or skill
- Adding new functionality to existing commands/skills
- Significant prompt rewrites that change behavior
- New configuration options

**Patch (fixes):**
- Small prompt tweaks
- Typo fixes
- Bug fixes in command logic
- Minor clarifications
- Formatting improvements

## Process

### 1. Gather changes

```bash
git status --short
git diff --cached --name-only
git diff --name-only
```

Parse modified (M), added (A), deleted (D), and renamed (R) files.

### 2. Group related changes

Cluster files into logical commits. Use these defaults but apply judgment — closely-related work belongs together even if it spans patterns.

| Pattern | Grouping |
|---|---|
| `aur/commands/*.md` | One commit per command |
| `superpowers/commands/*.md` | One commit per command |
| `superpowers/agents/*.md` | One commit per agent |
| `superpowers/skills/*/` | One commit per skill directory |
| `superpowers/hooks/*` | Group hooks together unless clearly unrelated |
| `beads/hooks/*` | Group hooks together unless clearly unrelated |
| `haft/commands/*.md` | One commit per command |
| `haft/skills/*/` | One commit per skill directory |
| `openspec/**` | Group by feature area |
| `katachi/commands/*.md` | One commit per command |
| `katachi/agents/*.md` | One commit per agent |
| `katachi/skills/*/` | One commit per skill directory |
| `kanshi/**` | Group by feature area |
| `memu/skills/*/` | One commit per skill directory |
| `.claude/commands/*.md` | One commit per command file |
| `.claude/skills/*/` | One commit per skill directory |
| `.claude-plugin/marketplace.json` | Separate commit unless part of a plugin add/remove |
| Root config files | Separate commits unless clearly related |

**Examples of judgment calls:**

- Changed `SKILL.md` plus its scripts in the same skill directory → single commit (same feature).
- Added a new command and modified an unrelated one → two commits.
- Modified a skill in `superpowers/` and an agent in `superpowers/` → two commits (different features).

### 3. Present proposed groups

Show the user the proposed groups in a compact format and offer to adjust:

```
Proposed commit groups:
1. [lesserpowers/patch] Update agent communication skill
   - lesserpowers/skills/agent-communication/SKILL.md
   - lesserpowers/skills/agent-communication/scripts/chat.py

2. [marketplace/feat] Add commit skill
   - .claude/skills/commit/SKILL.md

Would you like to adjust these groupings?
```

Use `AskUserQuestion` with options:
- Proceed with proposed groups
- Merge groups (combine into fewer commits)
- Split groups (separate into more commits)
- Exclude files (don't commit yet)

### 4. Process each commit group

For each group, run steps a–h sequentially.

#### a. Determine affected scopes

| Path | Scope |
|---|---|
| `aur/**` | `aur` |
| `superpowers/**` | `superpowers` |
| `haft/**` | `haft` |
| `openspec/**` | `openspec` |
| `katachi/**` | `katachi` |
| `kanshi/**` | `kanshi` |
| `memu/**` | `memu` |
| `beads/**` | `beads` |
| `.claude-plugin/**` | `marketplace` |
| `.claude/**` | `marketplace` |
| Root files (`README.md`, `CLAUDE.md`, etc.) | `marketplace` |

**Marketplace is always an affected scope**, because every change shows up in the marketplace consumer's view — but the bump type varies (often patch for a plugin-internal change, sometimes minor or major). A single commit can touch multiple scopes (e.g., adding a plugin bumps both the plugin AND the marketplace).

#### b. Analyze change significance

For each affected scope, choose Major / Minor / Patch.

**Plugin scopes (aur, superpowers, haft, openspec, katachi, kanshi, memu, beads):**

- **Major signals**: deletions in `commands/`, `agents/`, `skills/`; renames of those files; significant functionality removed.
- **Minor signals**: new files in `commands/`, `agents/`, `skills/`; new templates or guides; significant prompt rewrites (check `git diff` size).
- **Patch (default)**: small changes, typos, formatting, doc improvements, catalog updates.

**Marketplace scope:**

- **Major (typical)**: a plugin removed from `marketplace.json`; a root command/skill deleted.
- **Minor (typical)**: new plugin added; new root command or skill added; significant new capability added to existing root content.
- **Patch (typical)**: any plugin file changes; small fixes to root files; root config tweaks.

#### c. Read current versions

```bash
jq -r '.metadata.version' .claude-plugin/marketplace.json
jq -r '.version' aur/.claude-plugin/plugin.json
jq -r '.version' superpowers/.claude-plugin/plugin.json
jq -r '.version' haft/.claude-plugin/plugin.json
jq -r '.version' openspec/.claude-plugin/plugin.json
jq -r '.version' katachi/.claude-plugin/plugin.json
jq -r '.version' kanshi/.claude-plugin/plugin.json
jq -r '.version' memu/.claude-plugin/plugin.json
jq -r '.version' beads/.claude-plugin/plugin.json
```

Only read the version files for the scopes this commit actually affects — no need to read all of them every time.

#### d. Calculate new versions

```
Current: X.Y.Z
Major bump: (X+1).0.0
Minor bump: X.(Y+1).0
Patch bump: X.Y.(Z+1)
```

#### e. Propose version bumps with reasoning

Present the analysis with brief reasoning so the user can sanity-check:

```
Commit: Update agent communication skill
Affected scopes:
  - superpowers plugin
  - marketplace

Changes:
  - Updated SKILL.md documentation
  - Modified chat.py script

Proposed version bumps:
- superpowers: 1.0.0 → 1.0.1 (patch: small fix)
- marketplace: 2.2.0 → 2.2.1 (patch: improvement to existing plugin)

Proposed commit message:
fix(superpowers): update agent communication documentation

Updated agent-communication skill documentation to clarify
the notify→receive pattern and added examples.

Version bump: superpowers 1.0.0 → 1.0.1, marketplace 2.2.0 → 2.2.1
```

Use `AskUserQuestion` to confirm or adjust. Offer alternatives based on what was proposed:

- **Proposing Major** → options: confirm / downgrade to minor / downgrade to patch
- **Proposing Minor** → options: confirm / downgrade to patch
- **Proposing Patch** → options: confirm / upgrade to minor (if it's actually a feature)

Example:

```
AskUserQuestion({
  questions: [{
    question: "Ready to commit with these version bumps?",
    header: "Commit",
    multiSelect: false,
    options: [
      { label: "Confirm and proceed (Recommended)",
        description: "Create commit with: katachi 1.3.0→1.4.0 (minor), marketplace 1.7.2→1.7.3 (patch)" },
      { label: "Downgrade to patch",
        description: "Make katachi 1.3.0→1.3.1 instead of minor bump" }
    ]
  }]
})
```

If the user changes the bump type, recalculate, re-present, ask again.

#### f. Update version files

`jq` doesn't edit in place, so write to a temp file and `mv`:

**Marketplace:**
```bash
jq '.metadata.version = "X.Y.Z"' .claude-plugin/marketplace.json > /tmp/marketplace.json
mv /tmp/marketplace.json .claude-plugin/marketplace.json
```

**Any plugin:**
```bash
jq '.version = "X.Y.Z"' <plugin>/.claude-plugin/plugin.json > /tmp/<plugin>.json
mv /tmp/<plugin>.json <plugin>/.claude-plugin/plugin.json
```

#### g. Stage files

Stage the original changes plus any updated version files:

```bash
git add <changed-file-1> <changed-file-2> ... <version-file-1> <version-file-2>
```

Prefer naming files explicitly over `git add -A` — `.claude-plugin/` changes and unrelated stray files can sneak in otherwise.

#### h. Create the commit

Use a heredoc so the message formats correctly:

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <description>

<body explaining what changed and why>

Version bump: <scope> X.Y.Z → X.Y.Z[, <other-scope> X.Y.Z → X.Y.Z]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

If you (the assistant running this skill) know your exact model identity, you can use it instead of bare "Claude" in the Co-Authored-By line (e.g., `Claude Opus 4.7 <noreply@anthropic.com>`). Otherwise, the generic form is fine.

### 5. Repeat for each group

Loop through every approved group. If the user excluded a group, skip it.

## Commit message format

Conventional commits, with the version-bump footer:

```
<type>(<scope>): <short description>

<longer description explaining the change>

Version bump: <scope-name> X.Y.Z → X.Y.Z

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Type mapping

| Significance | Type |
|---|---|
| Major (breaking) | Any type with `BREAKING CHANGE:` footer in body |
| Minor (feature) | `feat` |
| Patch (fix/doc/refactor/style/chore) | `fix`, `docs`, `refactor`, `style`, `chore` as appropriate |

### Scope values

`aur`, `superpowers`, `haft`, `openspec`, `katachi`, `kanshi`, `memu`, `beads`, `marketplace`.

### Examples

**Patch (plugin improvement):**
```
fix(superpowers): correct agent communication documentation

Fixed unclear instructions in agent-communication SKILL.md
regarding the notify→receive pattern.

Version bump: superpowers 1.0.0 → 1.0.1, marketplace 2.2.0 → 2.2.1

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Minor (new root skill):**
```
feat(marketplace): add commit skill with version management

Introduces a commit skill that automates conventional commits
with semantic versioning for the marketplace and plugins.

Features:
- Automatic change grouping
- Semantic version bump detection with reasoning
- Multi-commit support for unrelated changes

Version bump: marketplace 1.0.0 → 1.1.0

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Major (plugin removal):**
```
feat(aur): remove deprecated bump-version command

BREAKING CHANGE: The /aur:bump-version command has been removed.
Use /aur:update-package instead which provides better functionality.

Version bump: aur 1.0.0 → 2.0.0, marketplace 2.0.0 → 3.0.0

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Error handling

- **No changes detected** → say "No changes to commit. Working directory is clean." and stop.
- **Merge conflicts present** → list the conflicted files, ask the user to resolve, stop without committing.
- **Malformed version string in a `plugin.json`** → report the issue, ask the user to fix manually, stop.
- **`git` command fails** → show the error, explain the likely cause, suggest a recovery path.

## What to keep in mind

- Conventional commits format is non-negotiable — it's how the marketplace history stays readable.
- Versions bump per-scope, never globally. The marketplace and each plugin advance on their own clocks.
- Multiple commits for unrelated changes — keeping commits focused makes them easier to revert later.
- The user has the final say on grouping and on every version bump. Always ask before committing.
- Don't `git commit -a` or stage files you didn't analyze. Stage exactly the files in the current group plus the version file(s) you just bumped.
- Both staged and unstaged changes are fair game for analysis — the user might have started staging selectively before invoking this.
