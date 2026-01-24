---
argument-hint: [DELTA-ID]
description: Write design rationale for a delta
---

# Delta Design Workflow

Write design rationale for a specific delta.

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

### Delta spec
- `docs/delta-specs/$ARGUMENTS.md` - The specification we're designing for

### Project decisions
- `docs/architecture/README.md` - Architecture decisions (ADRs)
- `docs/design/README.md` - Design patterns (DES)

### Existing design (if present)
- `docs/delta-designs/$ARGUMENTS.md` - Current design to update or create

### Feature documentation (for context and impact discovery)
- `docs/feature-designs/README.md` - Feature design index
- `docs/feature-designs/` - Existing feature designs (read specific docs as needed)
- `docs/feature-specs/README.md` - Feature capability index (for understanding features)
- Reference existing feature designs to understand current architecture
- Use existing design patterns and decisions from feature docs

### Template
- `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/delta-design.md` - Structure to follow

## Pre-Check

Verify spec exists:
- If `docs/delta-specs/$ARGUMENTS.md` doesn't exist, suggest running `/katachi:spec-delta $ARGUMENTS` first
- Design requires a spec to design against

## Process

### 1. Check Existing State

If `docs/delta-designs/$ARGUMENTS.md` exists:
- Read current design
- Check for drift: Has spec changed?
- Summarize: design approach, key decisions, modeling choices
- Ask: "What aspects need refinement? Or should we review the whole design?"
- Enter iteration mode as appropriate

If no design exists: proceed with initial creation

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS "⧗ Design"
```

### 2. Research Phase (Silent)

- Read delta spec (`docs/delta-specs/$ARGUMENTS.md`)
- Read dependencies from `docs/planning/DEPENDENCIES.md`
- Read dependency specs if they exist
- Read relevant ADRs from index
- Read relevant DES patterns from index
- Explore related codebase areas if needed
- Research libraries/frameworks/APIs involved
- Build complete understanding without asking questions

### 3. Impact Discovery (Silent)

**Auto-discover affected feature designs by:**

1. **Read delta spec** - identify affected features from "Detected Impacts" section
2. **Search feature-designs/** - find related design documentation:
   - For each feature path identified in spec
   - Grep for overlapping design concepts or components

3. **Determine design impact type**:
   - **Adds**: Creates new components or patterns within domain
   - **Modifies**: Changes existing design approach documented in feature
   - **Removes**: Deprecates or removes documented patterns

4. **Note impacts** for later inclusion in "Detected Impacts" section

### 4. Draft Complete Design Proposal

Create full design document following template:
- Problem context (what problem, constraints, interactions)
- Design overview (high-level approach, main components)
- Modeling (entities, relationships, domain model)
- Data flow (inputs → processing → outputs)
- Key decisions (choice, why, alternatives, consequences)
- System behavior (scenarios, edge cases)

**Add Detected Impacts section:**
```markdown
## Detected Impacts

### Affected Feature Designs
- **[path/to/feature-design.md]** - [Adds/Modifies/Removes]: [description]

### Notes for Reconciliation
- [What needs to change in feature design docs]
- [New design sections that need to be created]
- [Design decisions that need to be documented]
```

Note any uncertainties or assumptions.

### 5. Present Proposal for Review

Show complete design document to user, including detected impacts.
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
Review this delta design.

## Delta Spec
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

### 10. Finalize

Finalize document to `docs/delta-designs/$ARGUMENTS.md`

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS "✓ Design"
```

Present summary:
```
"Delta design complete:

ID: $ARGUMENTS
Detected impacts: [list of affected feature design docs]

Next step: /katachi:plan-delta $ARGUMENTS
```

## Decision Detection

When design reveals hard-to-change choices:
- Offer to create ADRs
- Offer to create/update DES patterns
- Ensure design references existing ADRs/DES

## Workflow

**This is a collaborative process:**
- Research silently, then draft
- Auto-discover affected feature designs
- Present complete proposal with detected impacts
- User provides feedback
- Iterate until approved
- Validate with design-reviewer agent
- Surface patterns for DES
- Finalize after user approval
