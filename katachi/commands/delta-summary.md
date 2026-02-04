---
description: Display a summary table of available deltas or show recommended next deltas
argument-hint: "[filter|next work|critical|high|medium|low|backlog]"
---

# Delta Summary

Display a summary table of all deltas with optional filtering by status, priority, or show recommended next deltas to work on.

## Input

Filter: $ARGUMENTS (optional)
- **No filter**: Show all deltas sorted by priority
- **Status filter**: Partial match on status (e.g., "Spec", "Implementation", "Not Started")
- **Priority keywords**: "critical", "high", "medium", "low", "backlog" → filter by priority level
- **"next work"**: Show top 5 recommended deltas using the `next` command

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

### 2. Parse Input and Determine Mode

Analyze $ARGUMENTS to determine which command to run:

| Input Pattern | Command | Behavior |
|--------------|---------|----------|
| (empty) | `summary` | Show all deltas, sorted by priority |
| "next work" or "next" or "recommended" | `next --top 5` | Show top 5 recommended deltas |
| "critical" | `summary --priority 1` | Show only Critical priority |
| "high" | `summary --priority 2` | Show only High priority |
| "medium" | `summary --priority 3` | Show only Medium priority |
| "low" | `summary --priority 4` | Show only Low priority |
| "backlog" | `summary --priority 5` | Show only Backlog priority |
| Anything else | `summary <filter>` | Treat as status filter |

### 3. Execute Appropriate Command

#### Mode: Next Work (Recommended Deltas)

When user asks for "next work", "next", or "recommended":

```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py next --top 5
```

This shows the top 5 deltas recommended to work on next, ranked by:
- Priority level (Critical/High first)
- Impact (how many other deltas are blocked)
- Complexity (prefer easier wins)

#### Mode: Priority Filter

When user specifies a priority keyword:

```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py summary --priority <level>
```

#### Mode: Status Filter (Default)

For any other filter:

```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py summary $ARGUMENTS
```

### 4. Display Results

The command outputs directly to the console:
- **Summary mode**: Formatted table with ID, Name, Status, Priority, Complexity, and Impact
- **Next mode**: Numbered list of top recommended deltas with rationale

## Error Handling

**Framework not initialized:**
- Suggest `/katachi:init-framework` first
- Don't attempt to create files manually

**No matching deltas:**
- The command will display "No deltas found matching..."
- This is expected behavior when filter doesn't match any deltas

**Invalid input:**
- If the user types an unrecognized filter, treat it as a status filter
- The underlying command will handle unknown filters gracefully

## Examples

```bash
# Show all deltas (sorted by priority)
/katachi:delta-summary

# Show recommended next deltas (top 5)
/katachi:delta-summary next work

# Show only Critical priority deltas
/katachi:delta-summary critical

# Show only High priority deltas
/katachi:delta-summary high

# Show only Spec-related deltas (status filter)
/katachi:delta-summary Spec

# Show only Implementation-related deltas
/katachi:delta-summary Implementation

# Show only "Not Started" deltas
/katachi:delta-summary "Not Started"
```

## Workflow

This is a read-only command for viewing delta status:
- No modifications to framework files
- No user iteration required
- Displays current state and exits
- Smart parsing: detects priority keywords and "next work" automatically
