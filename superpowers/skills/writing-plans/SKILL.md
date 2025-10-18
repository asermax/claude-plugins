---
name: writing-plans
description: Use when design is complete and you need detailed implementation tasks for engineers with zero codebase context - creates comprehensive implementation plans with exact file paths, complete code examples, and verification steps assuming engineer has minimal domain knowledge
---

# Writing Plans

## Overview

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Context:** This should be run after design is complete (from brainstorming skill).

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

## Creating Issues

Track your implementation plan as beads issues with dependencies:

1. **Verify local database:** Check for `.beads/*.db` in the directory (see superpowers:using-beads workflow 0)

2. **Create issues for each task:** For every bite-sized step group, create a beads issue with full context
   ```bash
   bd create "Task N: Component Name - [full description with files and steps]"
   ```

3. **Model dependencies:** Link tasks in order (see superpowers:using-beads workflow 4)
   ```bash
   bd dep add task-2 task-1 --type blocks
   ```

Document in each issue:
- **Which files** to create/modify
- **Step-by-step instructions** (write test → run → implement → run → commit)
- **Exact commands** with expected output
- **File paths** precisely
- **Complete code** (not "add validation")
- Principles: DRY, YAGNI, TDD, frequent commits

## Remember
- Tasks are discoverable by `bd ready` for execution
- Dependencies show what blocks what
- Each issue is one atomic unit of work

## Execution Handoff

After issues are created and dependencies modeled:

**"Issues created and tracked in beads. You can:**

**1. Execute with superpowers:executing-plans** - Batch execution with review checkpoints

**2. Use `bd ready`** - Find next unblocked task and implement

**Which approach?"**

**If executing-plans chosen:**
- Switch to superpowers:executing-plans
- Execute in controlled batches

**If manual execution:**
- Use `bd ready` to find unblocked work
- Implement tasks one at a time
