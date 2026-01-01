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
`@planning/FEATURES.md` - Feature definitions
`@planning/DEPENDENCIES.md` - Feature dependencies

**Existing spec (if present):**
`@specs/$ARGUMENTS.md` - Current spec to update or create

## Process

### 0. Check Existing State

If `specs/$ARGUMENTS.md` exists:
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

### 1. Research Phase (Silent)

- Read feature description from `planning/FEATURES.md`
- Read dependencies from `planning/DEPENDENCIES.md`
- Explore related codebase areas if needed
- For features involving libraries/frameworks/APIs:
  - Research typical usage patterns
  - Understand standard behaviors and edge cases
- Build complete understanding without asking questions

### 2. Draft Complete Spec Proposal

Create full spec document following template:
- User story (who/what/why - specific and clear)
- Behavior description (inputs, outputs, what can go wrong)
- Acceptance criteria (Given/When/Then format, include error cases)
- Dependencies (features that must exist first)

Note any uncertainties or assumptions clearly.

### 3. Present Proposal for Review

Show complete spec document to user.
Highlight any uncertainties and ask about them.
Invite feedback: "What needs adjustment in this spec?"

### 4. Iterate Based on Feedback

Apply user corrections, additions, or changes.
Re-present updated sections if significant changes.
Repeat until user approves the spec.

### 5. External Validation

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

Provide structured critique covering:
- User story completeness
- Acceptance criteria testability
- Edge cases and error scenarios
- Dependencies correctness
- Gaps in coverage
"""
)
```

Review agent findings with user.
Discuss which recommendations to accept.

### 6. Finalize with Iteration Check

Ask: "Should we iterate based on validation feedback, or is the spec complete?"

If gaps to address → refine relevant sections (go back to step 4)
If complete → finalize document to `specs/$ARGUMENTS.md`

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py status set $ARGUMENTS "✓ Spec"
```

## Workflow

**This is a collaborative process:**
- Research silently, then draft
- Present complete proposal
- User provides feedback
- Iterate until approved
- Validate with spec-reviewer agent
- Finalize after user approval
