---
argument-hint: [DELTA-ID]
description: Create step-by-step implementation plan for a delta
---

# Implementation Plan Workflow

Create an implementation plan for a specific delta.

## Input

Delta ID: $ARGUMENTS (e.g., "DLT-001")

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles
- `katachi:working-on-delta` - Per-feature workflow

### Delta inventory
- `docs/planning/DELTAS.md` - Delta definitions
- `docs/planning/DEPENDENCIES.md` - Delta dependencies

### Delta documents
- `docs/delta-specs/$ARGUMENTS.md` - What to build (requirements)
- `docs/delta-designs/$ARGUMENTS.md` - Why/how (design rationale)

### Project decisions
- `docs/architecture/README.md` - Architecture decisions (ADRs)
- `docs/design/README.md` - Design patterns (DES)

### Feature documentation (for reconciliation planning)
- Read affected feature specs from delta-spec's "Detected Impacts" section
- Read affected feature designs from delta-design's "Detected Impacts" section
- Plan should note which feature docs will need reconciliation after implementation

### Existing plan (if present)
- `docs/delta-plans/$ARGUMENTS.md` - Current plan to update or create

### Template
- `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/implementation-plan.md` - Structure to follow

## Pre-Check

Verify spec and design exist:
- If `docs/delta-specs/$ARGUMENTS.md` doesn't exist, suggest `/katachi:spec-delta $ARGUMENTS` first
- If `docs/delta-designs/$ARGUMENTS.md` doesn't exist, suggest `/katachi:design-delta $ARGUMENTS` first
- Plan requires both spec and design

## Process

### 1. Check Existing State

If `docs/delta-plans/$ARGUMENTS.md` exists:
- Read current plan
- Check for drift: Have spec or design changed?
- Summarize: steps, pre-implementation items, files to change
- Ask: "What aspects need refinement? Or should we review the whole plan?"
- Enter iteration mode as appropriate

If no plan exists: proceed with initial creation

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS "⧗ Plan"
```

### 2. Research Phase (Silent)

- Read delta spec (`docs/delta-specs/$ARGUMENTS.md`)
- Read delta design (`docs/delta-designs/$ARGUMENTS.md`)
- Read relevant ADRs and DES patterns (not just indexes)
- Read dependency code as needed
- Explore codebase for implementation patterns
- Build complete understanding without asking questions

### 3. Draft Complete Plan (Silent)

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

### 4. External Validation (Silent)

Dispatch the plan-reviewer agent to validate the draft:

```python
Task(
    subagent_type="katachi:plan-reviewer",
    prompt=f"""
Review this implementation plan.

## Delta Spec
{spec_content}

## Delta Design
{design_content}

## Implementation Plan
{plan_content}

## Relevant ADR/DES Summaries
{adr_des_summaries}
"""
)
```

### 5. Apply Validation Feedback (Silent)

Review the plan-reviewer findings and apply improvements:
- Address any coverage gaps (missing acceptance criteria)
- Fix dependency ordering issues
- Resolve ADR/DES conflicts
- Incorporate suggested improvements

If the reviewer identified critical issues that require clarification, note them for discussion with the user.

### 6. Present Validated Plan

Show the complete, validated plan document to user.
Include summary of validation findings that were applied.
Highlight any unresolved issues that need user input.
Invite feedback: "What needs adjustment in this plan?"

### 7. Iterate Based on Feedback

Apply user corrections, additions, or changes.
Re-run validation if significant changes are made.
Repeat until user approves the plan.

### 8. Finalize

Once user approves, save to `docs/delta-plans/$ARGUMENTS.md`

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS "✓ Plan"
```

Present summary:
```
"Delta plan complete:

ID: $ARGUMENTS

Next step: /katachi:implement-delta $ARGUMENTS
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
