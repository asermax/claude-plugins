---
name: plan-delta
description: Create step-by-step implementation plan for a delta
argument-hint: "[DELTA-ID]"
disable-model-invocation: true
---

# Implementation Plan Workflow

Create an implementation plan for a specific delta.

## Input

Delta ID from: $ARGUMENTS (e.g., "DLT-001")

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles
- `katachi:working-on-delta` - Per-feature workflow

### Delta inventory
- `docs/planning/DELTAS.md` - Delta definitions

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
- Summarize: batches, steps, context entries
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

### 3. Scope Batches (Present All at Once)

Identify natural implementation boundaries and define all batches. Present them together to the user for validation before expanding any steps.

For each batch, define:
- **Scope name**: What part of the feature it covers (model layer, service logic, API endpoint, frontend, etc.)
- **Context & Research list**: Specific entries with reasoning — project docs (spec sections, design sections, ADRs, DES), code files to read, and external research pointers (library docs, existing patterns to investigate). Each entry must explain *why* it's needed for this batch.
- **Out of scope**: What this batch explicitly does not cover
- **Dependencies**: Which batches must complete before this one starts (`Depends on:` field)

Present the batch definitions to the user. The user validates:
- Batch boundaries make sense (logical grouping, clear scope)
- Context is appropriately scoped (not too broad, not missing obvious things)
- Dependencies and ordering are correct
- Research pointers are concrete and relevant

Iterate on batch definitions until the user approves them.

### 4. Expand Steps and Research (One Batch at a Time)

For each batch individually, draft the implementation details:

**Steps:**
- Draft implementation steps following the same granularity rules as before (atomic, verifiable, in dependency order)
- Each step specifies: files to create/modify, what to do, how to verify

**Research pointers:**
- Identify where the implementing agent should look things up (library docs, patterns to extend, design questions to investigate)
- Add these as entries in the batch's Context & Research list
- Re-check: does this batch's context actually match its steps? Add missing entries, remove entries that don't apply

**Code snippets:**
- Use snippets to indicate implementation points (where to add code)
- Include brief comments explaining what should happen at each point
- Do NOT include complete implementation logic
- The implementation agent has access to spec, design, ADRs, and DES patterns — the plan provides structural guidance, not code

Example of appropriate snippet usage:
```python
# In src/services/auth.py, after the existing validate_token function:

# Add new function here to handle token refresh
# - Should follow DES-002 error handling pattern
# - Must validate refresh token expiry per spec AC-3
```

Present each batch's expanded steps to the user before moving to the next batch. This allows focused review and prevents context overload.

### 5. External Validation (Silent)

Dispatch the plan-reviewer agent to validate the complete plan:

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

### 6. Apply Validation Feedback (Silent)

Review the plan-reviewer findings and apply improvements:
- Address coverage gaps (missing acceptance criteria)
- Fix dependency ordering issues between steps and between batches
- Fix batch context scoping issues (over-scoped or under-scoped entries)
- Resolve ADR/DES conflicts
- Incorporate suggested improvements

If the reviewer identified critical issues that require clarification, note them for discussion with the user.

### 7. Present Validated Plan

Present the complete validated plan to the user in its entirety.
Highlight any unresolved issues that need user input.

Invite feedback: "What needs adjustment in this plan?"

### 8. Iterate Based on Feedback

Apply user corrections, additions, or changes.
Re-run validation if significant changes are made.
Repeat until user approves the plan.

### 9. Finalize

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

**This is a validate-first process with progressive disclosure:**
- Research silently, then scope batches
- Present all batches for user validation
- Expand steps one batch at a time, presenting each
- Validate complete plan with plan-reviewer agent
- Apply validation feedback
- Present validated plan to user
- User provides feedback
- Iterate until approved
- Finalize after user approval
