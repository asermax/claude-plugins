---
name: eject
description: Eject katachi plugin into self-contained project structure
disable-model-invocation: true
---

# Eject Katachi Plugin

Copy all katachi plugin components (skills, agents, scripts, docs) into the current project, making it self-contained and independent of the plugin.

## What Gets Copied

- **Skills** → `.claude/skills/`
- **Agents** → `.claude/agents/`
- **Scripts** → `scripts/` (deltas.py)
- **Framework docs** → `docs/` (framework.md, command-guidance.md)
- **Templates** → `docs/templates/`
- **Index files** → `docs/architecture/README.md`, `docs/design/README.md`

## Process

### 1. Pre-flight Checks

Check if `.claude/skills/` directory already exists:

```bash
ls -la .claude/skills/ 2>/dev/null
```

If it exists, ask user:
```
"Warning: .claude/skills/ directory already exists.

This will overwrite all existing skills with katachi skills.

Do you want to:
A) Continue and overwrite
B) Cancel
"
```

If user chooses cancel, stop here.

Check if `docs/planning/` already exists:

```bash
ls -la docs/planning/ 2>/dev/null
```

If it exists, note that framework docs structure already exists (no action needed).

### 2. Create Directory Structure

Create all necessary directories:

```bash
mkdir -p .claude/skills .claude/agents scripts docs/templates docs/planning docs/delta-specs docs/delta-designs docs/delta-plans docs/feature-specs docs/feature-designs docs/architecture docs/design
```

### 3. Copy and Transform Skills

For each skill in `${CLAUDE_PLUGIN_ROOT}/skills/*/SKILL.md` (except eject itself):

1. Read the SKILL.md file
2. Apply transformations:
   - Replace `${CLAUDE_PLUGIN_ROOT}/scripts/` with `scripts/`
   - Remove skill loading sections (lines starting with `**Skill to load:**` and the Load instruction)
   - Replace skill references with framework doc references:
     - `katachi:framework-core` → `@docs/framework.md`
     - Add `@docs/command-guidance.md` reference where appropriate
   - Replace agent namespace: `katachi:` prefix → no prefix (e.g., `katachi:spec-reviewer` → `spec-reviewer`)
3. Create directory `.claude/skills/<skill-name>/`
4. Write to `.claude/skills/<skill-name>/SKILL.md`

**Transformation Examples:**

Script paths:
```markdown
# Before:
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py deps tree

# After:
python scripts/deltas.py deps tree
```

Skill loading sections (REMOVE):
```markdown
# Before:
**Skill to load:**
Load the `katachi:framework-core` skill for workflow principles and state detection.

# After:
(removed entirely)
```

Framework references (ADD where skill was removed):
```markdown
# After skill removal, add:
**Framework reference:**
@docs/framework.md - Development workflow principles
@docs/command-guidance.md - Collaborative workflow guidance
```

Agent dispatch:
```markdown
# Before:
Task(subagent_type="katachi:spec-reviewer", ...)

# After:
Task(subagent_type="spec-reviewer", ...)
```

Skills to copy (all skills except eject itself):
- add-delta
- analyze
- analyze-impact
- commit
- decision
- dependencies
- design-delta
- delta-summary
- deltas
- framework-core
- implement-delta
- init-framework
- iterative-development
- migrate-to-deltas
- optimize-docs
- plan-delta
- reconcile-delta
- retrofit-decision
- retrofit-design
- retrofit-existing
- retrofit-spec
- review-code
- review-priorities
- spec-delta
- vision
- working-on-delta

### 4. Copy and Transform Agents

For each agent in `${CLAUDE_PLUGIN_ROOT}/agents/*.md`:

1. Read the agent file
2. Apply transformations:
   - If frontmatter has `name: katachi:agent-name`, change to `name: agent-name`
   - Remove `katachi:` prefix from name field
3. Write to `.claude/agents/<agent-name>.md`

Agents to copy:
- spec-reviewer.md
- design-reviewer.md
- plan-reviewer.md
- code-reviewer.md
- impact-analyzer.md
- codebase-analyzer.md

### 5. Copy Scripts

Copy scripts directly without transformations:

```bash
cp ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py scripts/deltas.py
cp ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py scripts/deltas.py
chmod +x scripts/deltas.py scripts/deltas.py
```

### 6. Generate Framework Documentation

**Create docs/framework.md:**

Combine content from skill files to create comprehensive framework documentation:

1. Read `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/SKILL.md`
2. Read `${CLAUDE_PLUGIN_ROOT}/skills/iterative-development/SKILL.md`
3. Read `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/SKILL.md`
4. Read `${CLAUDE_PLUGIN_ROOT}/skills/retrofit-existing/SKILL.md`
5. Synthesize into a single framework document covering:
   - Overview of the katachi framework
   - Core principles (spec-driven, iterative growth)
   - Project structure
   - Document types (VISION, FEATURES, specs, designs, plans, ADRs, DES)
   - Workflow patterns
   - State detection
   - Working with features
   - Retrofit approaches

**Create docs/command-guidance.md:**

Extract collaborative workflow principles from the skills:

1. One question at a time
2. Propose don't decide
3. Use AskUserQuestion for structured options
4. Detect gaps proactively
5. Research triggers
6. Scratchpad usage
7. Bridge context gap

This file should provide guidance on how commands interact with users.

### 7. Copy Templates

Copy template files from skills to `docs/templates/`:

From `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/`:
- VISION-template.md
- FEATURES-template.md
- DEPENDENCIES-template.md
-
- ADR-template.md
- DES-template.md
- decision-types.md

From `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/`:
- spec-template.md
- feature-spec.md
- design-template.md
- feature-design.md
- plan-template.md
- implementation-plan.md

Copy these files directly to `docs/templates/` without transformations.

### 8. Create Index Files

**Create docs/architecture/README.md:**

```markdown
# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records documenting significant architectural choices.

## Quick Reference

| ADR | Title | Status | Tags |
|-----|-------|--------|------|
| (none yet) | | | |

## What is an ADR?

Architecture Decision Records document significant architectural choices that affect the system's structure, behavior, or development process.

**When to create an ADR:**
- Choosing between major architectural patterns
- Selecting core technologies or frameworks
- Defining system boundaries
- Making decisions with long-term consequences

**Template:** See `@docs/templates/ADR-template.md`

## ADR Lifecycle

- **Proposed**: Under consideration
- **Accepted**: Approved and active
- **Superseded**: Replaced by a newer decision
- **Deprecated**: No longer recommended but not replaced
```

**Create docs/design/README.md:**

```markdown
# Design Patterns (DES)

This directory contains Design Pattern documents describing reusable solutions to common problems.

## Quick Reference

| DES | Pattern | Context | Tags |
|-----|---------|---------|------|
| (none yet) | | | |

## What is a DES?

Design Patterns document reusable solutions to recurring problems. Unlike ADRs, patterns can evolve over time.

**When to create a DES:**
- Solving a recurring problem
- Establishing a code pattern
- Defining conventions
- Documenting best practices

**Template:** See `@docs/templates/DES-template.md`

## DES Evolution

DES documents can evolve:
- Add "Evolution" section with date and rationale
- Preserve original content for history
- Update examples and guidance
```

### 9. Show Summary

After all files are copied and transformed:

```
## Eject Complete!

The katachi plugin has been ejected into your project. Here's what was created:

### Skills (.claude/skills/)
- All skills copied to individual directories
- All plugin references updated to local paths
- Agent namespaces updated (katachi:* → local)

### Agents (.claude/agents/)
- All reviewer agents copied
- spec-reviewer, design-reviewer, plan-reviewer
- code-reviewer, impact-analyzer, codebase-analyzer

### Scripts (scripts/)
- deltas.py - Feature dependency and status management
- deltas.py - Delta tracking

### Framework Docs (docs/)
- framework.md - Core workflow principles
- command-guidance.md - Collaborative workflow guidance

### Templates (docs/templates/)
- Template files for specs, designs, plans, decisions

### Index Files
- docs/architecture/README.md - ADR index
- docs/design/README.md - DES index

### Next Steps

1. **Uninstall the katachi plugin** (optional but recommended):
   ```
   /plugin uninstall katachi
   ```

2. **Test a skill**:
   ```
   Load skill: vision
   ```

3. **Verify scripts work**:
   ```
   python scripts/deltas.py --help
   ```

Your project is now self-contained and doesn't need the katachi plugin!
```

## Important Notes

- The eject skill does NOT copy itself (eject) to the project
- All `${CLAUDE_PLUGIN_ROOT}` references are replaced with local paths
- All `katachi:` agent namespace prefixes are removed
- Skill loading sections are removed and replaced with framework doc references
- Scripts are copied without modification (they use relative paths by default)
- Framework docs are synthesized from multiple skill files
- Templates are copied directly without transformation
- User can continue using katachi skills without the plugin

## Verification Steps

After ejection, verify:

1. `.claude/skills/` has all skill directories with SKILL.md files
2. `.claude/agents/` has all agent files
3. `scripts/` has deltas.py and deltas.py
4. `docs/` has framework.md and command-guidance.md
5. `docs/templates/` has all template files
6. No `${CLAUDE_PLUGIN_ROOT}` references in copied files
7. No `katachi:` agent namespace references in skills
8. Test loading a skill (e.g., `vision`) runs successfully
9. Test `python scripts/deltas.py --help` runs successfully

## Workflow

This is an automated process:
- Run pre-flight checks and get user confirmation if needed
- Create all necessary directories
- Copy and transform all files in sequence
- Generate framework documentation
- Show completion summary
- Suggest next steps (uninstall plugin, test commands)
