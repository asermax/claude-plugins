---
argument-hint: [FEATURE-ID]
description: Write a specification for a feature
---

# Feature Specification Workflow

Write a spec for a specific feature.

## Input

Feature ID: $ARGUMENTS (e.g., "CORE-001")

## Context

**Skills to load:**
- `katachi:framework-core` - Workflow principles
- `katachi:working-on-feature` - Per-feature workflow

**Feature inventory:**
`@docs/planning/FEATURES.md` - Feature definitions
`@docs/planning/DEPENDENCIES.md` - Feature dependencies

**Backlog:**
`@docs/planning/BACKLOG.md` - Related bugs, ideas, improvements, questions

**Existing spec (if present):**
`@docs/feature-specs/$ARGUMENTS.md` - Current spec to update or create

## Process

### 1. Check Existing State

If `docs/feature-specs/$ARGUMENTS.md` exists:
- Read current spec
- Check for drift: Has FEATURES.md description changed?
- Summarize to user: user story, key acceptance criteria, known edge cases
- Ask: "What aspects need refinement? Or should we review the whole spec?"
- Enter iteration mode as appropriate

If no spec exists: proceed with initial creation

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py status set $ARGUMENTS "⧗ Spec"
```

### 2. Identify Related Backlog Items

1. Read BACKLOG.md and identify items related to this feature:
   - Items with `--related $ARGUMENTS`
   - Items whose description mentions this feature
   - Q- items that might be answered by the spec
   - IDEA- items that might be captured in this feature

2. If related items found, present them:
   ```
   "Found N backlog items related to this feature:

   [ ] Q-001: How should X behave when Y?
   [ ] IDEA-003: Support additional format Z
   [ ] BUG-005: Edge case with empty input

   Which items should be addressed in this spec? (select numbers, 'all', or 'none')"
   ```

3. Track selected items for automatic resolution at the end

### 3. Research Phase (Silent)

- Read feature description from `docs/planning/FEATURES.md`
- Read dependencies from `docs/planning/DEPENDENCIES.md`
- Explore related codebase areas if needed
- For features involving libraries/frameworks/APIs:
  - Research typical usage patterns
  - Understand standard behaviors and edge cases
- Build complete understanding without asking questions

### 4. Draft Complete Spec Proposal

Create full spec document following template:
- User story (who/what/why - specific and clear)
- Behavior description (inputs, outputs, what can go wrong)
- Acceptance criteria (Given/When/Then format, include error cases)
- Dependencies (features that must exist first)

Note any uncertainties or assumptions clearly.

### 5. Present Proposal for Review

Show complete spec document to user.
Highlight any uncertainties and ask about them.
Invite feedback: "What needs adjustment in this spec?"

### 6. Iterate Based on Feedback

Apply user corrections, additions, or changes.
Re-present updated sections if significant changes.
Repeat until user approves the spec.

### 7. External Validation

Dispatch the spec-reviewer agent:

```python
Task(
    subagent_type="katachi:spec-reviewer",
    prompt=f"""
Review this feature specification.

## Feature Description (from FEATURES.md)
{feature_description}

## Completed Spec
{spec_content}
"""
)
```

Review agent findings with user.
Discuss which recommendations to accept.

### 8. Finalize with Iteration Check

Ask: "Should we iterate based on validation feedback, or is the spec complete?"

If gaps to address → refine relevant sections (go back to step 6)
If complete → proceed to finalization (step 9)

### 9. Finalize and Resolve Backlog

Finalize document to `docs/feature-specs/$ARGUMENTS.md`

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py status set $ARGUMENTS "✓ Spec"
```

**Automatically resolve selected backlog items:**

For each item the user selected to include (from step 2):
- Q- items: `python ${CLAUDE_PLUGIN_ROOT}/scripts/backlog.py fix <ID>` (answered by spec)
- IDEA- items: `python ${CLAUDE_PLUGIN_ROOT}/scripts/backlog.py promote <ID> --feature $ARGUMENTS`
- BUG-/IMP- items: Note in item that it's tracked in feature spec

Report: "Resolved N backlog items: Q-001, IDEA-003, BUG-005"

## Workflow

**This is a collaborative process:**
- Research silently, then draft
- Present complete proposal
- User provides feedback
- Iterate until approved
- Validate with spec-reviewer agent
- Finalize after user approval
