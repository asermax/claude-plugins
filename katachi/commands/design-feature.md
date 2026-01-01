---
argument-hint: [FEATURE-ID]
description: Write design rationale for a feature
---

# Feature Design Workflow

Write design rationale for a specific feature.

## Input

Feature ID: $ARGUMENTS (e.g., "CORE-001")

## Context

**Skills to load:**
- `katachi:framework-core` - Workflow principles
- `katachi:working-on-feature` - Per-feature workflow

**Feature inventory:**
`@planning/FEATURES.md` - Feature definitions
`@planning/DEPENDENCIES.md` - Feature dependencies

**Feature spec:**
`@specs/$ARGUMENTS.md` - The specification we're designing for

**Project decisions:**
`@docs/architecture/README.md` - Architecture decisions (ADRs)
`@docs/design/README.md` - Design patterns (DES)

**Existing design (if present):**
`@designs/$ARGUMENTS.md` - Current design to update or create

## Pre-Check

Verify spec exists:
- If `specs/$ARGUMENTS.md` doesn't exist, suggest running `/katachi:spec-feature $ARGUMENTS` first
- Design requires a spec to design against

## Process

### 0. Check Existing State

If `designs/$ARGUMENTS.md` exists:
- Read current design
- Check for drift: Has spec changed?
- Summarize: design approach, key decisions, modeling choices
- Ask: "What aspects need refinement? Or should we review the whole design?"
- Enter iteration mode as appropriate

If no design exists: proceed with initial creation

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py status set $ARGUMENTS "⧗ Design"
```

### 1. Research Phase (Silent)

- Read feature spec (`specs/$ARGUMENTS.md`)
- Read dependencies from `planning/DEPENDENCIES.md`
- Read dependency specs if they exist
- Read relevant ADRs from index
- Read relevant DES patterns from index
- Explore related codebase areas if needed
- Research libraries/frameworks/APIs involved
- Build complete understanding without asking questions

### 2. Draft Complete Design Proposal

Create full design document following template:
- Problem context (what problem, constraints, interactions)
- Design overview (high-level approach, main components)
- Modeling (entities, relationships, domain model)
- Data flow (inputs → processing → outputs)
- Key decisions (choice, why, alternatives, consequences)
- System behavior (scenarios, edge cases)

Note any uncertainties or assumptions.

### 3. Present Proposal for Review

Show complete design document to user.
Highlight uncertainties and ask about them.
Invite feedback: "What needs adjustment in this design?"

### 4. Iterate Based on Feedback

Apply user corrections, additions, or changes.
Re-present updated sections if significant changes.
Repeat until user approves the design.

### 5. External Validation

Dispatch the design-reviewer agent:

```python
Task(
    subagent_type="katachi:design-reviewer",
    prompt=f"""
Review this feature design.

## Feature Spec
{spec_content}

## Completed Design
{design_content}

## ADR Index Summary
{adr_summary}

## DES Index Summary
{des_summary}

Provide structured critique covering:
- Problem context clarity
- Design coherence
- Modeling completeness
- Data flow clarity
- Decision quality
- Pattern alignment with ADRs/DES
"""
)
```

Review agent findings with user.
Discuss which recommendations to accept.

### 6. Detect Patterns for DES

If agent or user identifies repeatable patterns:
- Ask if pattern should become a DES
- Offer to create DES document
- Update design to reference new DES

### 7. Finalize with Iteration Check

Ask: "Should we iterate based on validation feedback, or is the design complete?"

If gaps to address → refine relevant sections (go back to step 4)
If complete → finalize document to `designs/$ARGUMENTS.md`

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py status set $ARGUMENTS "✓ Design"
```

## Decision Detection

When design reveals hard-to-change choices:
- Offer to create ADRs
- Offer to create/update DES patterns
- Ensure design references existing ADRs/DES

## Workflow

**This is a collaborative process:**
- Research silently, then draft
- Present complete proposal
- User provides feedback
- Iterate until approved
- Validate with design-reviewer agent
- Surface patterns for DES
- Finalize after user approval
