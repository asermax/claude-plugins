---
argument-hint: [FEATURE-ID]
description: Implement a feature following its plan
---

# Implementation Workflow

Implement a feature following its plan.

## Input

Feature ID: $ARGUMENTS (e.g., "CORE-001")

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles
- `katachi:working-on-feature` - Per-feature workflow

### Feature inventory
- `docs/planning/FEATURES.md` - Feature definitions
- `docs/planning/DEPENDENCIES.md` - Feature dependencies

### Feature documents
- `docs/feature-specs/$ARGUMENTS.md` - What to build (requirements)
- `docs/feature-designs/$ARGUMENTS.md` - Why/how (design rationale)
- `docs/feature-plans/$ARGUMENTS.md` - Implementation steps to follow

### Backlog
- `docs/planning/BACKLOG.md` - Items to address during implementation

### Project decisions
- `docs/architecture/README.md` - Architecture decisions (ADRs)
- `docs/design/README.md` - Design patterns (DES)

Read dependency code as specified in plan's pre-implementation checklist.

## Pre-Check

Verify all documentation exists:
- If spec/design/plan missing, suggest running appropriate commands first
- Plan is the primary guide for implementation

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py status set $ARGUMENTS "⧗ Implementation"
```

## Process

### 1. Review Plan and Decisions (Silent)

- Read implementation plan (`docs/feature-plans/$ARGUMENTS.md`)
- Check implementation plan for "Related Backlog Items" section
- These items were already approved during planning - no need to ask again
- Note which items should be automatically resolved after implementation
- Read spec and design
- **Read full ADR/DES documents:**
  - Identify ADRs/DES listed in pre-implementation checklist
  - Read the full documents, not just indexes
- Read dependency code from checklist
- Understand constraints and patterns to follow

### 2. Implement All Steps Autonomously

Work through all steps in the plan without asking questions.
Documentation is the source of truth.

For each step:
- Implement the code following relevant decisions
- **Add code comments** referencing decisions when:
  - Implementation choice might seem arbitrary without context
  - Decision significantly impacts the approach
  - Format: `// See ADR-003 for why we use X instead of Y`
- **If a different approach is needed for valid reasons:**
  - Update the relevant document (spec/design/plan) immediately
  - Then proceed with implementation
- Verify the step works before proceeding
- Track issues in scratchpad

Use scratchpad `/tmp/implement-$ARGUMENTS-state.md`:
- Current step
- Steps completed
- Issues encountered
- Patterns detected
- Deviations from plan

### 3. Verify Acceptance Criteria

- Run all tests
- Run linting and type checking (fix any issues)
- Perform manual checks against spec
- Ensure all acceptance criteria are met

### 4. External Validation

Dispatch the code-reviewer agent:

```python
Task(
    subagent_type="katachi:code-reviewer",
    prompt=f"""
Review this implementation.

## Feature Spec
{spec_content}

## Feature Design
{design_content}

## Implementation Plan
{plan_content}

## Implemented Code
{code_diff_or_files}

## Relevant ADR/DES Documents
{adr_des_content}
"""
)
```

### 5. Fix All Issues Found by Agent

Automatically address ALL issues identified in validation:
- Missing acceptance criteria coverage
- Design misalignment
- Pattern violations
- Code quality issues
- Missing decision references
- Missing documentation updates

Re-run tests after fixes.
Do NOT ask user - fix everything autonomously.

### 6. Present for User Review

Show complete implementation to user:
- Summarize what was implemented
- Highlight any deviations from plan (with rationale)
- Note any emergent patterns detected

Invite feedback: "What needs adjustment in this implementation?"

### 7. Iterate Based on User Feedback

Apply user corrections or changes.
Re-test after changes.
**When user rejects code changes:** Update documents consistently.
Repeat until user approves.

### 8. Surface Patterns for DES Consideration

Present discovered patterns to user for selection.

**Suggest new DES if:**
- Same approach used 2+ times in this feature
- Solves common problem that will recur
- Pattern should be consistent across codebase

**Suggest updating existing DES if:**
- Found better approach than documented
- Discovered exception case or limitation

User selects which patterns to document.
Create/update DES documents as approved.

### 9. Finalize and Resolve Backlog

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py status set $ARGUMENTS "✓ Implementation"
```

**Automatically resolve backlog items from plan:**

For each item listed in the plan's "Related Backlog Items" section:
- `python ${CLAUDE_PLUGIN_ROOT}/scripts/backlog.py fix <ID> --commit <HASH>`

Report: "Implementation complete. Resolved N backlog items: BUG-002, DEBT-003, IMP-001"

**Note:** No user confirmation needed - items were already approved during `/plan-feature`.

Offer to commit: "Ready to commit this implementation?"

## Working with Decisions

**Using ADRs and DES:**
- Read all decisions listed in plan's checklist
- Follow constraints unless there's good reason to deviate
- If deviation needed: discuss with user, consider updating decision

**Referencing in Code:**
- Add comments ONLY when choice would be unclear without context
- Format: `// See [DECISION-ID]: [brief reason]`
- Don't reference obvious patterns

**Pattern Detection:**
- Watch for repeated code structures
- Notice cross-cutting concerns
- Suggest documentation when patterns should be consistent

## Workflow

**This is an autonomous implementation process:**
- Read documentation silently
- Implement all steps without asking questions
- Apply ADR and DES decisions
- Verify each step works
- Run code-reviewer validation
- Fix ALL issues automatically
- Present to user for final review
- Iterate based on feedback
- Surface patterns for DES
- Commit when approved
