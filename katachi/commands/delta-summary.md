---
description: Display a summary table of available deltas
argument-hint: "[status]"
---

# Delta Summary

Display a summary table of all deltas with optional filtering by status.

## Input

Status filter: $ARGUMENTS (optional - if provided, filters deltas by partial phase name match)

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles

### Delta inventory
- `docs/planning/DELTAS.md` - Delta inventory
- `docs/planning/DEPENDENCIES.md` - Dependency matrix

## Pre-Check

Verify framework is initialized:
- If `docs/planning/` doesn't exist, suggest `/katachi:init-framework` first
- If DELTAS.md or DEPENDENCIES.md missing, explain what's needed

## Process

### 1. Validate Framework

Check for required files:
- `docs/planning/DELTAS.md`
- `docs/planning/DEPENDENCIES.md`

If missing, suggest `/katachi:init-framework` first.

### 2. Execute Summary Command

Call the deltas.py script with the summary subcommand:

```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py summary $ARGUMENTS
```

This will:
- Display a formatted markdown table with ID, Name, Status, Complexity, and Dependencies
- If no status filter provided: show all deltas
- If status filter provided: filter by partial phase name match (case-insensitive)
  - Example: `Spec` matches both `⧗ Spec` and `✓ Spec`
  - Example: `Implementation` matches `⧗ Implementation` and `✓ Implementation`

### 3. Display Results

The command outputs a formatted table directly to the console.

## Error Handling

**Framework not initialized:**
- Suggest `/katachi:init-framework` first
- Don't attempt to create files manually

**No matching deltas:**
- The command will display "No deltas found matching status: {filter}"
- This is expected behavior when filter doesn't match any delta status

**Invalid status filter:**
- The command accepts any text as filter and performs partial match
- If filter matches nothing, it will show "No deltas found" message

## Examples

```bash
# Show all deltas
/katachi:delta-summary

# Show only Spec-related deltas (both in-progress and complete)
/katachi:delta-summary Spec

# Show only Implementation-related deltas
/katachi:delta-summary Implementation

# Exact match also works
/katachi:delta-summary "⧗ Spec"
```

## Workflow

This is a read-only command for viewing delta status:
- No modifications to framework files
- No user iteration required
- Displays current state and exits
