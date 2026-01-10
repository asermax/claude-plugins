---
argument-hint: [FEATURE-ID]
description: Create step-by-step implementation plan for a feature
---

# Implementation Plan Workflow

Create an implementation plan for a specific feature.

## Input

Feature ID: $ARGUMENTS (e.g., "CORE-001")

## Context

**Skills to load:**
- `katachi:framework-core` - Workflow principles
- `katachi:working-on-feature` - Per-feature workflow

**Feature inventory:**
`@docs/planning/FEATURES.md` - Feature definitions
`@docs/planning/DEPENDENCIES.md` - Feature dependencies

**Feature documents:**
`@docs/feature-specs/$ARGUMENTS.md` - What to build (requirements)
`@docs/feature-designs/$ARGUMENTS.md` - Why/how (design rationale)

**Project decisions:**
`@docs/architecture/README.md` - Architecture decisions (ADRs)
`@docs/design/README.md` - Design patterns (DES)

**Existing plan (if present):**
`@docs/feature-plans/$ARGUMENTS.md` - Current plan to update or create

## Pre-Check

Verify spec and design exist:
- If `docs/feature-specs/$ARGUMENTS.md` doesn't exist, suggest `/katachi:spec-feature $ARGUMENTS` first
- If `docs/feature-designs/$ARGUMENTS.md` doesn't exist, suggest `/katachi:design-feature $ARGUMENTS` first
- Plan requires both spec and design

## Process

### 0. Check Existing State

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

### 1. Research Phase (Silent)

- Read feature spec (`docs/feature-specs/$ARGUMENTS.md`)
- Read feature design (`docs/feature-designs/$ARGUMENTS.md`)
- Read relevant ADRs and DES patterns (not just indexes)
- Read dependency code as needed
- Explore codebase for implementation patterns
- Build complete understanding without asking questions

### 2. Draft Complete Plan Proposal

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

### 3. Present Proposal for Review

Show complete plan document to user.
Highlight any uncertainties.
Invite feedback: "What needs adjustment in this plan?"

### 4. Iterate Based on Feedback

Apply user corrections, additions, or changes.
Re-present updated sections if significant changes.
Repeat until user approves the plan.

### 5. External Validation

Dispatch the plan-reviewer agent:

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

Provide structured critique covering:
- Acceptance criteria coverage (map each to steps)
- Pre-implementation checklist completeness
- Step granularity
- Verification points
- Dependency order
- File changes completeness
"""
)
```

Review agent findings with user.
Discuss which recommendations to accept.

### 6. Finalize with Iteration Check

Ask: "Should we iterate based on validation feedback, or is the plan complete?"

If gaps to address → refine relevant sections (go back to step 4)
If complete → finalize document to `docs/feature-plans/$ARGUMENTS.md`

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py status set $ARGUMENTS "✓ Plan"
```

## Workflow

**This is a collaborative process:**
- Research silently, then draft
- Present complete proposal
- User provides feedback
- Iterate until approved
- Validate with plan-reviewer agent
- Finalize after user approval
