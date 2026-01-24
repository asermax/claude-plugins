---
argument-hint: [DELTA-ID]
description: Write a specification for a delta
---

# Delta Specification Workflow

Write a spec for a specific delta.

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

### Existing spec (if present)
- `docs/delta-specs/$ARGUMENTS.md` - Current spec to update or create

### Feature documentation (for context and impact discovery)
- `docs/feature-specs/README.md` - Feature capability index
- `docs/feature-specs/` - Existing feature specifications (read specific docs as needed)
- `docs/feature-designs/README.md` - Feature design index (optional, for design context)
- Use existing feature specs to understand current behavior that delta extends/modifies

### Template
- `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/delta-spec.md` - Structure to follow

## Process

### 1. Check Existing State

If `docs/delta-specs/$ARGUMENTS.md` exists:
- Read current spec
- Check for drift: Has DELTAS.md description changed?
- Summarize to user: user story, key acceptance criteria, known edge cases
- Ask: "What aspects need refinement? Or should we review the whole spec?"
- Enter iteration mode as appropriate

If no spec exists: proceed with initial creation

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS "⧗ Spec"
```

### 2. Research Phase (Silent)

- Read delta description from `docs/planning/DELTAS.md`
- Read dependencies from `docs/planning/DEPENDENCIES.md`
- Explore related codebase areas if needed
- For deltas involving libraries/frameworks/APIs:
  - Research typical usage patterns
  - Understand standard behaviors and edge cases
- Build complete understanding without asking questions

### 3. Impact Discovery (Silent)

**Auto-discover affected features by:**

1. **Analyze delta description** - identify capability areas mentioned
2. **Search feature-specs/** - find related feature documentation:
   - Glob for all feature docs: `docs/feature-specs/**/*.md`
   - Grep for keywords from delta description
   - Identify overlapping or related capabilities

3. **Determine impact type** for each affected feature:
   - **Adds**: Creates new sub-capability within domain
   - **Modifies**: Changes existing behavior documented in feature
   - **Removes**: Deprecates or removes documented capability

4. **Note impacts** for later inclusion in "Detected Impacts" section

### 4. Draft Complete Spec Proposal

Create full spec document following template:
- User story (who/what/why - specific and clear)
- Behavior description (inputs, outputs, what can go wrong)
- Acceptance criteria (Given/When/Then format, include error cases)
- Dependencies (deltas that must exist first)

**Add Detected Impacts section:**
```markdown
## Detected Impacts

### Affected Features
- **[path/to/feature.md]** - [Adds/Modifies/Removes]: [description]

### Notes for Reconciliation
- [What needs to change in feature docs]
- [New feature docs that need to be created]
```

Note any uncertainties or assumptions clearly.

### 5. Present Proposal for Review

Show complete spec document to user, including detected impacts.
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
Review this delta specification.

## Delta Description (from DELTAS.md)
{delta_description}

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

### 9. Finalize

Finalize document to `docs/delta-specs/$ARGUMENTS.md`

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS "✓ Spec"
```

Present summary:
```
"Delta spec complete:

ID: $ARGUMENTS
Detected impacts: [list of affected feature docs]

Next step: /katachi:design-delta $ARGUMENTS
```

## Workflow

**This is a collaborative process:**
- Research silently, then draft
- Auto-discover affected features
- Present complete proposal with detected impacts
- User provides feedback
- Iterate until approved
- Validate with spec-reviewer agent
- Finalize after user approval
