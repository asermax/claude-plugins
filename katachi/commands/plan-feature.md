---
argument-hint: [FEATURE-ID]
description: Create step-by-step implementation plan for a feature
---

# Implementation Plan Workflow

Create an implementation plan for a specific feature.

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

### Backlog
- `docs/planning/BACKLOG.md` - Related bugs, improvements, tech-debt

### Project decisions
- `docs/architecture/README.md` - Architecture decisions (ADRs)
- `docs/design/README.md` - Design patterns (DES)

### Existing plan (if present)
- `docs/feature-plans/$ARGUMENTS.md` - Current plan to update or create

### Template
- `${CLAUDE_PLUGIN_ROOT}/skills/working-on-feature/references/implementation-plan.md` - Structure to follow

## Pre-Check

Verify spec and design exist:
- If `docs/feature-specs/$ARGUMENTS.md` doesn't exist, suggest `/katachi:spec-feature $ARGUMENTS` first
- If `docs/feature-designs/$ARGUMENTS.md` doesn't exist, suggest `/katachi:design-feature $ARGUMENTS` first
- Plan requires both spec and design

## Process

### 1. Check Existing State

If `docs/feature-plans/$ARGUMENTS.md` exists:
- Read current plan
- Check for drift: Have spec or design changed?
- Summarize: steps, pre-implementation items, files to change
- Ask: "What aspects need refinement? Or should we review the whole plan?"
- Enter iteration mode as appropriate

If no plan exists: proceed with initial creation

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py status set $ARGUMENTS "⧗ Plan"
```

### 2. Identify Related Backlog Items

1. Read BACKLOG.md and identify items related to this feature:
   - Items with `--related $ARGUMENTS`
   - BUG- items that might need fixing during implementation
   - DEBT- items that should be addressed while in this area
   - IMP- items that could be incorporated

2. If related items found, present them:
   ```
   "Found N backlog items that could be addressed during this feature's implementation:

   [ ] BUG-002: Null pointer when input is empty
   [ ] DEBT-003: Extract common validation logic
   [ ] IMP-001: Add progress indicator

   Which items should be included in the implementation plan? (select numbers, 'all', or 'none')"
   ```

3. Track selected items - they will be:
   - Incorporated into the implementation plan steps
   - Automatically resolved after implementation completes

### 3. Research Phase (Silent)

- Read feature spec (`docs/feature-specs/$ARGUMENTS.md`)
- Read feature design (`docs/feature-designs/$ARGUMENTS.md`)
- Read relevant ADRs and DES patterns (not just indexes)
- Read dependency code as needed
- Explore codebase for implementation patterns
- Build complete understanding without asking questions

### 4. Draft Complete Plan (Silent)

Create full implementation plan following template:

**Pre-Implementation Checklist:**
- Spec read
- Design read
- Dependency code to read (specific files)
- Relevant ADRs (specific documents)
- Relevant DES patterns (specific documents)

**Implementation Steps:**
For each step:
- Create/modify: specific file paths
- What to do: specific instructions
- Test: how to verify this step

Ensure:
- Every acceptance criterion has implementing steps
- Steps are in dependency order
- Steps are atomic and verifiable

**Files Changed:**
- List all files to be modified
- Include test files

**Related Backlog Items (if any selected in step 2):**
Include section in plan:
- BUG-002: Address in step N (validation logic)
- DEBT-003: Address in step M (refactoring step)
- IMP-001: Address in step P (UI enhancements)

These items will be automatically resolved when implementation completes.

### 5. External Validation (Silent)

Dispatch the plan-reviewer agent to validate the draft:

```python
Task(
    subagent_type="katachi:plan-reviewer",
    prompt=f"""
Review this implementation plan.

## Feature Spec
{spec_content}

## Feature Design
{design_content}

## Implementation Plan
{plan_content}

## Relevant ADR/DES Summaries
{adr_des_summaries}
"""
)
```

### 6. Apply Validation Feedback (Silent)

Review the plan-reviewer findings and apply improvements:
- Address any coverage gaps (missing acceptance criteria)
- Fix dependency ordering issues
- Resolve ADR/DES conflicts
- Incorporate suggested improvements

If the reviewer identified critical issues that require clarification, note them for discussion with the user.

### 7. Present Validated Plan

Show the complete, validated plan document to user.
Include summary of validation findings that were applied.
Highlight any unresolved issues that need user input.
Invite feedback: "What needs adjustment in this plan?"

### 8. Iterate Based on Feedback

Apply user corrections, additions, or changes.
Re-run validation if significant changes are made.
Repeat until user approves the plan.

### 9. Finalize

Once user approves, save to `docs/feature-plans/$ARGUMENTS.md`

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py status set $ARGUMENTS "✓ Plan"
```

## Workflow

**This is a validate-first process:**
- Research silently, then draft
- Validate with plan-reviewer agent
- Apply validation feedback
- Present validated plan to user
- User provides feedback
- Iterate until approved
- Finalize after user approval
