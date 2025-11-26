---
name: using-beads
description: Use when user explicitly mentions beads or bd, when user asks to run a bd command (invoke skill first, then run command), or when project CLAUDE.md indicates beads/bd is used for tracking. Do NOT use when project uses other task tracking mechanisms (GitHub Issues, Jira, Linear, TODO.md, README todos, etc.)
---

# Using Beads for Issue Tracking

## Overview

**Beads (bd) is a dependency-aware issue tracker designed for AI-supervised workflows.** Track all discovered work immediately, model dependencies explicitly, and use `bd ready` to find unblocked work.

**Core principle:** Every piece of work gets tracked as an issue with proper dependencies. No work is too small to track.

## When to Use

Use bd when:
- Discovering new work while implementing a feature
- Receiving feedback after completing implementation
- Finding bugs, missing tests, or documentation issues
- Planning new features that need task breakdown
- Looking for next task to work on
- Working in any codebase that uses bd for tracking

**Critical symptoms that mean you should use bd:**
- "This is too simple to create an issue for"
- "I'll just fix this quickly without tracking"
- "I can add dependencies later"
- "Let me just start coding, I'll document it after"
- "Partner feedback is just tweaks, I'll fix them now"

## Core Workflows

### 0. First Time in Codebase → Check for bd Database

**Before using ANY bd commands in a new codebase/directory:**

```bash
# Check if local bd database exists
ls .beads/*.db 2>/dev/null

# If no .db file exists in .beads/:
bd init

# Now you can use bd normally
bd create "Your first issue"
```

**Rule:** ALWAYS check for `.beads/*.db` before using bd. Without this check, bd will use a global database instead of project-local tracking.

**Why this matters:** Using the global database mixes issues from different projects, making tracking meaningless.

### 1. Discovering Work → Create Issue Immediately

**When you discover ANY work (bugs, missing tests, tech debt, improvements):**

```bash
# Create issue immediately
bd create "Fix inconsistent error handling in auth module"

# Set priority if not default (0-4, where 0=highest, 2=default)
bd create "Critical security vulnerability in auth" -p 0
bd create "Nice-to-have UI polish" -p 4

# Set issue type (bug, feature, task, epic, chore)
bd create "Fix auth bug" -t bug -p 1
bd create "Add dark mode" -t feature -p 2
bd create "Epic: User Management" -t epic

# Add labels for categorization
bd create "Fix login timeout" -l "backend,urgent"

# Add description
bd create "Fix bug" -d "Detailed description of the issue"

# Create with dependencies in one command
bd create "Fix edge case bug" -t bug -p 1 --deps discovered-from:bd-20

# Get JSON output for programmatic use
bd create "Fix bug" --json
```

**Rule:** ALL discovered work gets tracked. No exceptions.

### 2. Finding Next Work → Use bd ready

**When you have time to pick up new work:**

```bash
# Find unblocked work ready to claim
bd ready

# Get JSON output for programmatic use
bd ready --json

# Find blocked work to understand blockers
bd blocked

# Get statistics about the tracker
bd stats

# NOT this:
bd list  # Wrong - shows all issues, not just ready ones
# NOT this either: just start coding without checking
```

**`bd ready` shows issues with `status='open'` AND no blocking dependencies.**
**`bd blocked` shows issues that have open blockers.**

**When to use priority:**

Priority is optional. Use it when you need to distinguish urgency within ready work:

**Priority levels (0-4, where 0=highest, 2=default):**
- `0` = Highest priority (critical bugs, security issues, production blockers)
- `1` = High priority (important features, significant bugs)
- `2` = Medium priority (default - most work lives here)
- `3` = Low priority (nice-to-have improvements)
- `4` = Lowest priority (future ideas, polish)

```bash
# Set priority when creating critical issues
bd create "Security vulnerability in auth" -p 0

# Or update priority later when urgency changes
bd update issue-1 -p 0
```

**Key principle:** Dependencies model "what must happen first" (technical ordering). Priority models "what should happen first given equal readiness" (value/urgency ordering). Both matter, but dependencies are mandatory while priority is for tie-breaking.

### 3. Receiving Feedback → Create Issues, Don't Fix Immediately

**When partner provides feedback after implementation:**

```bash
# Partner says: "This works but the error messages need improvement
# and the retry logic should be exponential backoff"

# WRONG: Start fixing immediately
# "I'll just update these quickly since I'm already in the code"

# RIGHT: Create issues first
bd create "Improve error messages in payment flow"
bd create "Change retry logic to exponential backoff"
bd dep add payment-retry-1 payment-impl-1 --type discovered-from

# THEN decide: fix now or later?
# If fixing now, claim the issues
bd update payment-errors-1 --status in_progress
# Work on it
bd close payment-errors-1
```

**Feedback = new work. Track it first, THEN decide whether to do it now.**

**Why this matters:**
- Feedback scope can expand ("quick fix" becomes multi-file refactor)
- Other priorities may be more urgent (use `bd ready` to decide)
- Tracking shows real effort, not just "implemented feature"
- You can model dependencies if feedback reveals blockers

### 4. Creating Issues for Features → Model Dependencies

**When breaking down a feature into tasks:**

```bash
# Create all issues with proper dependencies
bd create "Update profile data model"
bd create "Create PUT /users/:id endpoint"
bd create "Add validation middleware"
bd create "Add edit button to profile page"
bd create "Write tests for profile editing"

# Model dependencies (what blocks what)
bd dep add api-endpoint-1 data-model-1 --type blocks  # endpoint needs model first
bd dep add validation-1 api-endpoint-1 --type blocks  # validation needed before endpoint complete
bd dep add tests-1 api-endpoint-1 --type related      # tests related but can be parallel
```

**Dependencies are mandatory, not optional metadata.**

### 5. Using Epic-Task Hierarchy → Parent-Child Relationships

**For complex features with multiple components, use epic beads as design documentation:**

```bash
# Create epic bead for the component (not executable)
bd create "Epic: User Profile Management - Design and architecture for profile editing feature"

# Create task beads for implementation (executable)
bd create "Update profile data model with new fields"
bd create "Create PUT /users/:id endpoint"
bd create "Add validation middleware"

# Link tasks to epic using parent-child relationship (task → epic)
bd dep add profile-model-1 profile-epic-1 --type parent-child
bd dep add profile-endpoint-1 profile-epic-1 --type parent-child
bd dep add profile-validation-1 profile-epic-1 --type parent-child

# Also model execution dependencies between tasks
bd dep add profile-endpoint-1 profile-model-1 --type blocks
bd dep add profile-validation-1 profile-endpoint-1 --type blocks
```

**Epic bead structure:**
- Contains comprehensive design decisions and architecture rationale
- Documents trade-offs, patterns, and component-level principles
- NOT executable - use `bd ready` finds only task beads
- **Can have dependencies** to indicate when blocked by prerequisite work
- Close epic when all child tasks are completed

**Task bead structure:**
- Contains bite-sized implementation steps
- Links to parent epic for design context
- Executable - appears in `bd ready` when unblocked
- May have dependencies on other tasks (even from different epics)

**When to use epic structure:**
- Feature spans multiple components or phases
- Design decisions need documentation at component level
- Multiple related tasks share design context

**When to use flat structure (no epics):**
- Simple, single-component changes
- Quick bug fixes
- Tasks naturally share the same context

**Epic dependencies - indicating when epics are blocked:**

Epics can have dependencies just like tasks. Epics can be blocked by other epics or by tasks. Use this to indicate when an entire feature is blocked by prerequisite work:

```bash
# Create epic for user profile feature
bd create "Epic: User Profile Management" -t epic

# Create epic for authentication system (prerequisite)
bd create "Epic: User Authentication System" -t epic

# Profile management can't start until auth system exists
bd dep add profile-epic-1 auth-epic-1 --type blocks

# Or block an epic by a specific task
bd create "Design user data model" -t task
bd dep add profile-epic-1 data-model-task-1 --type blocks

# Create child tasks for auth epic
bd create "Task: Implement JWT tokens" -t task
bd dep add auth-task-1 auth-epic-1 --type parent-child

# Now auth-task-1 is ready, but ALL profile tasks are blocked
# even if you haven't created them yet, because their parent is blocked
```

**Why model epic dependencies:**
- **Communicates prerequisite work:** Shows when entire components depend on other epics or tasks
- **Prevents premature work:** Child tasks won't appear in `bd ready` until epic is unblocked
- **Documents architecture order:** Makes feature sequencing explicit
- **Enables better planning:** See what must happen before a feature can start

**Hierarchical blocking:**

When a parent (epic) is blocked, all of its children are automatically blocked, even if they have no direct blockers. This ensures subtasks don't show up as ready work when their parent epic is blocked:

```bash
# Create an epic and a child task
bd create "Epic: User Authentication" -t epic -p 1
bd create "Task: Add login form" -t task -p 1
bd dep add bd-2 bd-1 --type parent-child  # bd-2 is child of bd-1

# Block the epic
bd create "Design authentication system" -t task -p 0
bd dep add bd-1 bd-3 --type blocks  # bd-1 blocked by bd-3

# Now both bd-1 (epic) AND bd-2 (child task) are blocked
bd ready  # Neither will show up
bd blocked  # Shows both bd-1 and bd-2 as blocked
```

**Blocking propagation rules:**
- `blocks` + `parent-child` together create transitive blocking (up to 50 levels deep)
- Children of blocked parents are automatically blocked
- Grandchildren, great-grandchildren, etc. are also blocked recursively
- `related` and `discovered-from` do NOT propagate blocking

## Dependency Types

| Type | When to Use | Example |
|------|-------------|---------|
| `blocks` | Task B must complete before task A | Middleware blocks endpoint implementation |
| `related` | Soft connection, doesn't block | Tests related to feature |
| `parent-child` | Epic/subtask hierarchy | Feature epic with implementation subtasks |
| `discovered-from` | Found during other work | Bug found while implementing feature |

## Dependency Cycle Prevention

Beads maintains a DAG (directed acyclic graph) and prevents cycles across all dependency types:

```bash
# Detect cycles in your dependency graph
bd dep cycles

# Example cycle that would be prevented:
bd dep add bd-1 bd-2 --type blocks  # OK
bd dep add bd-2 bd-3 --type blocks  # OK
bd dep add bd-3 bd-1 --type blocks  # ERROR: Would create cycle
```

**Why cycles break things:**
- Ready work detection becomes impossible (circular dependencies)
- Tree traversals enter infinite loops
- No clear execution order

Attempting to add a cycle-creating dependency returns an error immediately.

## Quick Reference

| Task | Command | When |
|------|---------|------|
| **Check for database** | `ls .beads/*.db 2>/dev/null \|\| bd init` | First command in new codebase |
| **Create issue** | `bd create "description"` | Immediately when discovering work |
| **Create with details** | `bd create "description" -t bug -p 0 -l "urgent"` | With type, priority, labels |
| **Create with deps** | `bd create "Fix bug" --deps discovered-from:bd-20` | Create and link in one command |
| **Get JSON output** | `bd create "Fix bug" --json` | For programmatic use |
| **Find next work** | `bd ready` or `bd ready --json` | When choosing what to work on |
| **Find blocked work** | `bd blocked` | Understand what's blocked |
| **Get statistics** | `bd stats` | Overview of tracker state |
| **Add dependency** | `bd dep add issue-1 issue-2 --type blocks` | When creating issues with dependencies |
| **Check dependencies** | `bd dep tree issue-1` | Before starting work on issue |
| **Detect cycles** | `bd dep cycles` | Verify dependency graph health |
| **Update status** | `bd update issue-1 --status in_progress` | When starting work |
| **Update priority** | `bd update issue-1 -p 0` | When urgency changes |
| **Close issue** | `bd close issue-1` | When work is complete |

## Common Mistakes

### ❌ Using bd Without Checking for Local Database

**Wrong:**
```bash
# Start working in new project directory
cd /path/to/new-project
bd create "Implement feature X"
# Accidentally uses global database, mixing with other projects
```

**Right:**
```bash
# Start working in new project directory
cd /path/to/new-project

# Check for local database first
ls .beads/*.db 2>/dev/null || bd init

# Now create issues
bd create "Implement feature X"
```

**Why:** Without checking, bd falls back to a global database. Your issues get mixed with unrelated projects, dependencies break, and `bd ready` shows work from everywhere. Always verify `.beads/*.db` exists.

### ❌ Fixing Feedback Immediately Without Tracking

**Wrong:**
```bash
# Just finished implementing feature-1
# Partner: "Can you improve the error messages?"
# Immediately start editing code without creating issue
git commit -m "improve error messages based on feedback"
```

**Right:**
```bash
# Just finished implementing feature-1
# Partner: "Can you improve the error messages?"
bd create "Improve error messages in feature module"
bd dep add error-messages-1 feature-1 --type discovered-from

# Now decide: is this the highest priority?
bd ready  # Check what else is unblocked

# If yes, claim and fix
bd update error-messages-1 --status in_progress
# Make changes
bd close error-messages-1
```

**Why:** Feedback feels like "quick tweaks" but often expands in scope. Track first so you can:
- See true effort (not hidden in original feature)
- Model dependencies if feedback reveals blockers
- Compare priority with other ready work
- Prevent "one more thing" spiral where feedback accumulates without visibility

### ❌ "Too Simple to Track"

**Wrong:**
```bash
# Found typo in error message, just fix it without creating issue
git commit -m "fix: typo in error message"
```

**Right:**
```bash
# Create issue even for 2-character change
bd create "Fix error message typo in validation.ts"
# Then fix it
git commit -m "fix: typo in error message (closes typo-1)"
```

**Why:** "Too simple" issues accumulate into invisible technical debt. Tracking shows work actually done.

### ❌ "Dependencies Can Wait"

**Wrong:**
```bash
# Create issues quickly, will add dependencies later
bd create "Task 1"
bd create "Task 2"
bd create "Task 3"
# (dependency modeling postponed due to time pressure)
```

**Right:**
```bash
# Model dependencies when creating, even if tight on time
bd create "Task 1"
bd create "Task 2"
bd create "Task 3"
bd dep add task-2 task-1 --type blocks
bd dep add task-3 task-2 --type blocks
# Takes 2 extra minutes, prevents hours of rework
```

**Why:** Dependencies model reality. Wrong order = wasted effort, rework, or blocked progress.

### ❌ Using bd list Instead of bd ready

**Wrong:**
```bash
# Checking what to work on next
bd list
# Reading through all issues manually to find something unblocked
```

**Right:**
```bash
# Finding next work
bd ready
# Shows only unblocked work, ready to claim
```

**Why:** `bd ready` is designed for this. It filters by status and dependencies automatically.

## Red Flags - STOP and Create Issue

- "This is too simple to track"
- "I'll document it after I finish"
- "Just a quick fix, no issue needed"
- "Dependencies are just metadata"
- "I can add dependencies tomorrow"
- "Let me start coding, I'll create issues later"
- "Creating an issue costs more time than the fix"
- "Partner feedback is just tweaks, I'll fix them now"
- "I'm already in this code, might as well update it"
- "This is follow-up work, not new work"
- "I'll just use bd, it will work" (without checking for .beads/*.db)

**All of these mean: Create issue NOW. Model dependencies NOW. Check for local database FIRST.**

## Real-World Impact

From using bd in development workflows:
- Discovered work tracked immediately prevents forgotten technical debt
- Dependency modeling eliminates "blocked by surprise" situations
- `bd ready` reduces decision overhead for next-task selection
- Even "30-second fixes" tracked = visible work contribution
