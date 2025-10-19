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

## Epic and Task Structure

**For complex features, use parent-child beads hierarchy:**

- **Epic beads (parents)**: Represent major components or phases
  - Contain comprehensive design decisions for that component
  - Include architecture rationale, trade-offs considered
  - Document component-level patterns and principles
  - No implementation steps (those go in child tasks)
  - **Can have dependencies** to indicate when blocked by prerequisite work

- **Task beads (children)**: Represent atomic units of work
  - Contain bite-sized implementation steps (2-5 minutes each)
  - Reference parent epic for design context
  - Include exact file paths, code, and commands
  - Link via dependencies to show execution order

**When to use epic structure:**
- Feature spans multiple components or phases
- Design decisions need to be documented at component level
- Multiple related tasks need shared context

**When to use flat structure:**
- Simple, single-component changes
- Quick bug fixes or minor enhancements
- All tasks share the same design context

**Epic dependencies:**
- Epics can be blocked by other epics or tasks to show prerequisite work
- When an epic is blocked, all its child tasks are automatically blocked
- Use this to prevent premature work on features that depend on others

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

2. **Create epic beads (for complex features):** For each major component or phase
   ```bash
   bd create "Epic: Component Name - [design overview]"
   ```

   Document in epic:
   - **Design decisions** for this component
   - **Architecture rationale** and trade-offs
   - **Component patterns** and principles
   - **No implementation steps** (those go in child tasks)

3. **Create task beads:** For every bite-sized step group
   ```bash
   bd create "Task N: Specific Action - [full description with files and steps]"
   ```

   Document in each task:
   - **Which files** to create/modify
   - **Step-by-step instructions** (write test → run → implement → run → commit)
   - **Exact commands** with expected output
   - **File paths** precisely
   - **Complete code** (not "add validation")
   - Principles: DRY, YAGNI, TDD, frequent commits

4. **Model hierarchy and dependencies:** (see superpowers:using-beads workflows 4-5)
   ```bash
   # Link child task to parent epic (task → epic)
   bd dep add task-id epic-id --type parent-child

   # Block epics by prerequisite work (epics or tasks)
   bd dep add dependent-epic-id blocking-epic-id --type blocks
   bd dep add epic-id blocking-task-id --type blocks

   # Link tasks in execution order
   bd dep add task-2 task-1 --type blocks
   ```

## Remember
- Epic beads document design; task beads contain implementation
- Tasks are discoverable by `bd ready` for execution (epics are not executable)
- Parent-child relationships keep context organized
- Dependencies show execution order
- Each task bead is one atomic unit of work

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
