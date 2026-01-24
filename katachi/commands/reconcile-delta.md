---
argument-hint: [DELTA-ID]
description: Reconcile delta implementation into feature documentation
---

# Delta Reconciliation Workflow

Reconcile a completed delta implementation into the long-lived feature documentation.

## Input

Delta ID: $ARGUMENTS (e.g., "DLT-001")

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles
- `katachi:working-on-delta` - Per-feature workflow

### Delta documents
- `docs/delta-specs/$ARGUMENTS.md` - Delta specification with detected impacts
- `docs/delta-designs/$ARGUMENTS.md` - Delta design with detected impacts
- `docs/delta-plans/$ARGUMENTS.md` - Implementation plan
- Implementation code (git diff or recent commits)

### Feature documentation
- `docs/feature-specs/` - Long-lived feature specifications to update
- `docs/feature-designs/` - Long-lived feature designs to update

## Pre-Check

Verify delta is implemented:
- If delta status is not "✓ Implementation", suggest `/katachi:implement-delta $ARGUMENTS` first
- Reconciliation requires completed implementation

## Process

### 1. Gather Delta Context (Silent)

Read all delta working documents:
- `docs/delta-specs/$ARGUMENTS.md`
- `docs/delta-designs/$ARGUMENTS.md`
- `docs/delta-plans/$ARGUMENTS.md`

Extract **Detected Impacts** sections from spec and design.
Build complete picture of what was implemented and what features are affected.

### 2. Analyze Implementation (Silent)

Review actual implementation:
- Get recent commits or git diff for this delta
- Identify what was actually built
- Compare with planned impacts
- Note any deviations or additional impacts discovered during implementation

### 3. Read Affected Feature Documentation (Silent)

For each feature path identified in detected impacts:
- Read current feature-specs/ files
- Read current feature-designs/ files
- Understand current state of documentation

### 4. Draft Feature Documentation Updates

For each affected feature:

**Determine update type:**
- **Adds**: Create new sub-capability doc or add new section to existing doc
- **Modifies**: Update existing behavior descriptions, acceptance criteria, design approach
- **Removes**: Mark capabilities as deprecated or remove sections

**Handle missing feature documentation:**
- If detected impacts reference a feature that doesn't exist, CREATE it
- If feature domain doesn't exist, create domain folder with README.md
- Create both spec and design for new features
- Follow nested structure (domain/sub-capability.md)

**Draft complete updates:**

For feature specs:
- Update user stories if needed
- Add/modify behaviors and acceptance criteria
- Update overview sections
- Add delta reference in "Related Deltas" section

For feature designs:
- Update design overview, components, data flow as needed
- Add/modify key decisions
- Update system behavior scenarios
- Add delta reference in related changes

For domain READMEs:
- Update sub-capability tables
- Add new capabilities to index
- Update status indicators

**Create new feature docs if needed:**
- When delta creates an entirely new capability domain
- Follow nested structure: feature-specs/[domain]/README.md + sub-capability docs
- Mirror structure in feature-designs/

### 5. Validate Updates (Silent)

Dispatch reviewer agent to validate the proposed updates:

```python
Task(
    subagent_type="katachi:spec-reviewer",
    prompt=f"""
Review these feature documentation updates from delta reconciliation.

## Delta Spec
{delta_spec}

## Delta Design
{delta_design}

## Implementation Summary
{implementation_summary}

## Proposed Feature Spec Updates
{proposed_spec_updates}

## Proposed Feature Design Updates
{proposed_design_updates}

Verify that updates:
- Accurately reflect what was implemented
- Maintain consistency with existing documentation
- Follow documentation patterns
- Preserve coherent narrative
"""
)
```

Apply validation feedback to improve proposed updates.

### 6. Present Proposal for Review

Show complete update proposal to user:

```
"Reconciliation plan for DLT-XXX:

## Feature Specs to Update:
- [domain/capability.md]: [summary of changes]
- ...

## Feature Designs to Update:
- [domain/capability.md]: [summary of changes]
- ...

## New Feature Docs to Create:
- [domain/README.md]: [description]
- [domain/capability.md]: [description]
- ...

[Show detailed diffs or full updated content for each file]

What needs adjustment in this reconciliation?"
```

Invite feedback and discuss any questions.

### 7. Iterate Based on Feedback

Apply user corrections or changes to proposed updates.
Re-present updated sections if significant changes.
Repeat until user approves the reconciliation.

### 8. Apply Updates

Once approved, update all affected feature documentation files:
- Write/update feature-specs/ files
- Write/update feature-designs/ files
- Update README.md indexes

### 9. Mark Delta as Reconciled

Update delta status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS "✓ Reconciled"
```

Present summary:
```
"Reconciliation complete for DLT-XXX:

Updated feature specs:
- [list of files]

Updated feature designs:
- [list of files]

Created new feature docs:
- [list of files]

Feature documentation is now current with implementation."
```

## Workflow

**This is a validate-first process:**
- Gather all delta context silently
- Read affected feature docs
- Draft complete updates
- Validate with reviewer agent
- Apply validation feedback
- Present to user for approval
- Iterate based on feedback
- Apply all updates when approved
- Mark delta as reconciled
