---
description: Initialize the katachi framework in a project
argument-hint: [--quick]
---

# Initialize Framework

Initialize the katachi development framework in a project.

## Context

**Skill to load:**
Load the `katachi:framework-core` skill for workflow principles and state detection.

## Process

### 1. Detect Project State

Check what exists:
- Does `docs/planning/` directory exist?
- Does `docs/planning/VISION.md` exist?
- Does `docs/planning/FEATURES.md` exist?
- Does `docs/planning/DEPENDENCIES.md` exist?
- Does significant source code exist (check for `src/`, `lib/`, `app/` with code files)?

### 2. Present Appropriate Path

Based on state:

**New Project (no docs/planning/, no significant code):**
```
"This looks like a new project. I can help you get started.

Choose your approach:
A) Quick-start (MVP focus)
   - Minimal vision (problem + MVP scope)
   - 5-10 features for first iteration
   - Get coding faster

B) Full framework
   - Complete vision document
   - Comprehensive feature extraction
   - Dependency matrix and phases

Which approach fits your project?"
```

**Existing Project (no docs/planning/, has code):**
```
"I see you have existing code but no framework documentation.

Choose your approach:
A) Vision-first (top-down)
   - Define what you're building
   - Extract features from vision
   - Map existing code to features
   - Retrofit specs as needed

B) Code-first (bottom-up)
   - Start by documenting existing code
   - Create specs from implementations
   - Document existing decisions
   - Synthesize vision from features

Which approach fits your situation?"
```

**Partially Initialized (docs/planning/ exists but incomplete):**
```
"I see you started framework setup but it's incomplete.

Missing:
- [ ] VISION.md
- [x] FEATURES.md
- [ ] DEPENDENCIES.md

Would you like to complete the setup?"
```

**Already Initialized (all planning files exist):**
```
"Framework is already initialized!

Current state:
- Vision: [summary]
- Features: N features in M phases
- Current focus: [from CLAUDE.md]

Would you like to run gap analysis (/katachi:analyze)?"
```

### 3. Execute Chosen Path

**Quick-Start Mode:**
1. Create minimal directory structure
2. Create VISION.md with just:
   - Problem statement (1-2 sentences)
   - MVP scope (what's in, what's out)
   - Key workflows (top 3)
3. Extract MVP features (aim for 5-10)
4. Create simple DEPENDENCIES.md (Phase 1 = MVP)
5. Guide through first spec: "Ready to write your first spec?"

**Full Framework Mode:**
1. Create full directory structure
2. Run `/katachi:vision`
3. Run `/katachi:features`
4. Run `/katachi:dependencies`

**Vision-First Retrofit:**
1. Create directory structure
2. Run `/katachi:vision`
3. Run `/katachi:features`
4. For each feature with existing code:
   - Mark as "✓ Implementation"
   - Offer to retrofit spec

**Code-First Retrofit:**
1. Create directory structure
2. Identify key modules to document
3. For each module:
   - Run `/katachi:retrofit-spec <path>` (creates spec from code)
   - Run `/katachi:retrofit-design <ID>` (creates design, discovers decisions)
4. After specs and designs created:
   - Run `/katachi:features` (organize from retrofitted specs)
   - Run `/katachi:vision` (synthesize from features)

**Note:** The retrofit-design command automatically discovers undocumented
ADR/DES patterns during design creation. Use `/katachi:retrofit-decision <topic>`
for decisions that span multiple features or weren't captured during retrofit-design.

### 4. Create Directory Structure

```bash
mkdir -p docs/planning docs/feature-specs docs/feature-designs docs/feature-plans docs/architecture docs/design
```

Create CLAUDE.md if it doesn't exist:

```markdown
# Project: [Project Name]

## Quick Context

[TODO: Add 1-2 sentence description]

## Key Files

- `docs/planning/VISION.md` - Project vision
- `docs/planning/FEATURES.md` - Feature inventory
- `docs/planning/DEPENDENCIES.md` - Implementation phases

## Available Commands

Use `/katachi:` commands to work with the framework.

## Current Focus

[TODO: Update when starting a feature]
```

### 5. Copy Features Script

If using the script:
```
"The framework includes a features.py script for managing dependencies and status.
It's available at: ${CLAUDE_PLUGIN_ROOT}/scripts/features.py

You can run it with:
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py deps list
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py status list
"
```

## Workflow

This is a collaborative process:
- Detect state and present options
- User chooses approach
- Execute chosen path with user guidance
- Complete setup or guide to next command
