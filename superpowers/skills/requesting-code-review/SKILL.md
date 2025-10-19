---
name: requesting-code-review
description: Use when starting ANY task that modifies code (bug fixes, features, refactors - all sizes) or before merging to verify work meets requirements - dispatches code-reviewer subagent to review implementation against plan or requirements before proceeding
---

# Requesting Code Review

Dispatch code-reviewer subagent to catch issues before they cascade.

**Core principle:** Review early, review often.

## When to Request Review

**Mandatory:**
- After completing ANY task that modifies code (all sizes: bug fixes, features, refactors)
- After each task in subagent-driven development
- Before merge to main

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## How to Request

**1. Get git SHAs:**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. Dispatch code-reviewer agent:**

Dispatch the code-reviewer agent with the following information:

- **What was implemented**: Brief description of what you just built
- **Requirements/Plan**: What it should do (reference file path or describe the requirements)
- **Git range to review**:
  - Base SHA: [BASE_SHA]
  - Head SHA: [HEAD_SHA]

The agent will analyze the git diff and provide a comprehensive code review.

**3. Act on feedback:**
- Fix Critical issues immediately
- Fix Important issues before proceeding
- Note Minor issues for later
- Push back if reviewer is wrong (with reasoning)

## Example

```
[Just completed Task 2: Add verification function]

You: Let me request code review before proceeding.

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[Dispatch code-reviewer agent]
  What was implemented: Verification and repair functions for conversation index
  Requirements/Plan: Task bead #42 "add-verification-functions"
  Base SHA: a7981ec
  Head SHA: 3df7661

[Agent returns]:
  Strengths: Clean architecture, real tests
  Issues:
    Important: Missing progress indicators
    Minor: Magic number (100) for reporting interval
  Assessment: Ready to proceed

You: [Fix progress indicators]
[Continue to Task 3]
```

## Integration with Workflows

**Subagent-Driven Development:**
- Review after EACH task
- Catch issues before they compound
- Fix before moving to next task

**Executing Plans:**
- Review after each batch (3 tasks)
- Get feedback, apply, continue

**Ad-Hoc Development:**
- Review before merge
- Review when stuck

## Red Flags

**Never:**
- Skip review because "it's simple" or "just a bug fix"
- Skip review because "the change is only 10 lines"
- Skip review because "time pressure"
- Ignore Critical issues
- Proceed with unfixed Important issues
- Argue with valid technical feedback

**If reviewer wrong:**
- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification
