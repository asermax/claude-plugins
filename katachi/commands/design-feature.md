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
`@docs/planning/FEATURES.md` - Feature definitions
`@docs/planning/DEPENDENCIES.md` - Feature dependencies

**Feature spec:**
`@docs/feature-specs/$ARGUMENTS.md` - The specification we're designing for

**Backlog:**
`@docs/planning/BACKLOG.md` - Related bugs, ideas, improvements, questions

**Project decisions:**
`@docs/architecture/README.md` - Architecture decisions (ADRs)
`@docs/design/README.md` - Design patterns (DES)

**Existing design (if present):**
`@docs/feature-designs/$ARGUMENTS.md` - Current design to update or create

## Pre-Check

Verify spec exists:
- If `docs/feature-specs/$ARGUMENTS.md` doesn't exist, suggest running `/katachi:spec-feature $ARGUMENTS` first
- Design requires a spec to design against

## Process

### 1. Check Existing State

If `docs/feature-designs/$ARGUMENTS.md` exists:
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

### 2. Identify Related Backlog Items

1. Read BACKLOG.md and identify items related to this feature:
   - Items with `--related $ARGUMENTS`
   - Q- items that might be answered by design decisions
   - DEBT- items that might be addressed by the design approach
   - IMP- items that could be incorporated

2. If related items found, present them:
   ```
   "Found N backlog items related to this feature's design:

   [ ] Q-002: What caching strategy should we use?
   [ ] DEBT-001: Refactor data access layer
   [ ] IMP-004: Support batch operations

   Which items should be addressed in this design? (select numbers, 'all', or 'none')"
   ```

3. Track selected items for automatic resolution at the end

### 3. Research Phase (Silent)

- Read feature spec (`docs/feature-specs/$ARGUMENTS.md`)
- Read dependencies from `docs/planning/DEPENDENCIES.md`
- Read dependency specs if they exist
- Read relevant ADRs from index
- Read relevant DES patterns from index
- Explore related codebase areas if needed
- Research libraries/frameworks/APIs involved
- Build complete understanding without asking questions

### 4. Draft Complete Design Proposal

Create full design document following template:
- Problem context (what problem, constraints, interactions)
- Design overview (high-level approach, main components)
- Modeling (entities, relationships, domain model)
- Data flow (inputs → processing → outputs)
- Key decisions (choice, why, alternatives, consequences)
- System behavior (scenarios, edge cases)

Note any uncertainties or assumptions.

### 5. Present Proposal for Review

Show complete design document to user.
Highlight uncertainties and ask about them.
Invite feedback: "What needs adjustment in this design?"

### 6. Iterate Based on Feedback

Apply user corrections, additions, or changes.
Re-present updated sections if significant changes.
Repeat until user approves the design.

### 7. External Validation

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
"""
)
```

Review agent findings with user.
Discuss which recommendations to accept.

### 8. Detect Patterns for DES

If agent or user identifies repeatable patterns:
- Ask if pattern should become a DES
- Offer to create DES document
- Update design to reference new DES

### 9. Finalize with Iteration Check

Ask: "Should we iterate based on validation feedback, or is the design complete?"

If gaps to address → refine relevant sections (go back to step 6)
If complete → proceed to finalization (step 10)

### 10. Finalize and Resolve Backlog

Finalize document to `docs/feature-designs/$ARGUMENTS.md`

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py status set $ARGUMENTS "✓ Design"
```

**Automatically resolve selected backlog items:**

For each item the user selected to include (from step 2):
- Q- items: `python ${CLAUDE_PLUGIN_ROOT}/scripts/backlog.py fix <ID>` (answered by design)
- DEBT- items: `python ${CLAUDE_PLUGIN_ROOT}/scripts/backlog.py fix <ID>` (addressed in design)
- IMP- items: Note in item that it's incorporated in feature design

Report: "Resolved N backlog items: Q-002, DEBT-001"

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
