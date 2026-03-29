---
name: delta-details
description: Show comprehensive details for a specific delta or answer a question about it
argument-hint: "<DELTA-ID> [question]"
---

# Delta Details

Show comprehensive details for a specific delta, including its definition, dependencies, dependents, existing documents, and blockers. Optionally answer a focused question about the delta.

## Input

Arguments: $ARGUMENTS

- **First token**: DELTA-ID (required) - e.g., `DLT-001`
- **Remainder**: Optional freeform question about the delta

Examples:
- `DLT-001` - full details
- `DLT-001 what's the priority?` - focused answer
- `DLT-001 is this ready to implement?` - focused answer

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills

- `katachi:framework-core` - Workflow principles and status conventions

### Delta inventory

- `docs/planning/DELTAS.md` - Delta inventory

## Pre-Check

1. Verify framework is initialized:
   - If `docs/planning/` doesn't exist, suggest `/katachi:init-framework` first
   - If DELTAS.md missing, explain what's needed

2. Parse `$ARGUMENTS`:
   - Extract the first token as DELTA-ID
   - Everything after the first token is the optional question

3. Validate the delta exists:

```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status show <DELTA-ID>
```

If the delta is not found, show the error and suggest `/katachi:delta-summary` to see available deltas.

## Process

### 1. Gather Delta Information

Run the following commands to collect all delta data:

```bash
# Core info: name, status, priority, complexity, description, deps, dependents
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status show <DELTA-ID>

# Full dependency tree visualization
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py deps tree <DELTA-ID>
```

### 2. Check for Documents

Check existence of working documents:
- `docs/delta-specs/<DELTA-ID>.md`
- `docs/delta-designs/<DELTA-ID>.md`
- `docs/delta-plans/<DELTA-ID>.md`

For each document that exists, read it to extract key context.

### 3. Route to Mode

Based on whether a question was provided in the input:

- **No question** → Read `references/full-details.md` within this skill directory and follow its instructions to present a comprehensive view.
- **Question provided** → Read `references/question-mode.md` within this skill directory and follow its instructions to answer the specific question.

## Error Handling

**Framework not initialized:**
- Suggest `/katachi:init-framework` first
- Don't attempt to create files manually

**Delta not found:**
- Show the error from `status show`
- Suggest `/katachi:delta-summary` to see available deltas

**No arguments provided:**
- Ask the user which delta they want details for
- Suggest `/katachi:delta-summary` to browse available deltas

## Workflow

This is a read-only command:
- No modifications to framework files
- No user iteration required
- Displays information and exits
