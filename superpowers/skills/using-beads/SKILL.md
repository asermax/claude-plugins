---
name: Using-Beads
description: Use when starting work in a new codebase, discovering work during implementation, receiving feedback, or working in codebases using bd - dependency-aware task management with bd for tracking all work and modeling dependencies
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

# If it blocks other work or is blocked by something
bd create "Add tests for auth error paths" -d "Missing test coverage found during payment-1"
bd dep add payment-1 auth-tests-1 --type discovered-from
```

**Rule:** ALL discovered work gets tracked. No exceptions.

### 2. Finding Next Work → Use bd ready

**When you have time to pick up new work:**

```bash
# Find unblocked work ready to claim
bd ready

# NOT this:
bd list  # Wrong - shows all issues, not just ready ones
# NOT this either: just start coding without checking
```

**`bd ready` shows issues with `status='open'` AND no blocking dependencies.**

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

## Dependency Types

| Type | When to Use | Example |
|------|-------------|---------|
| `blocks` | Task B must complete before task A | Middleware blocks endpoint implementation |
| `related` | Soft connection, doesn't block | Tests related to feature |
| `parent-child` | Epic/subtask hierarchy | Feature epic with implementation subtasks |
| `discovered-from` | Found during other work | Bug found while implementing feature |

## Quick Reference

| Task | Command | When |
|------|---------|------|
| **Create issue** | `bd create "description"` | Immediately when discovering work |
| **Create with priority** | `bd create "description" -p 0` | For critical/urgent issues |
| **Find next work** | `bd ready` | When choosing what to work on |
| **Add dependency** | `bd dep add issue-1 issue-2 --type blocks` | When creating issues with dependencies |
| **Check dependencies** | `bd dep tree issue-1` | Before starting work on issue |
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
