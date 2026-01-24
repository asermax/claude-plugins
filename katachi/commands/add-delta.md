---
description: Add a new delta on-the-go without full upfront planning
argument-hint: "[description]"
---

# Add Delta

Add a new delta to the project without requiring full upfront planning.

## Input

Delta description: $ARGUMENTS (optional - will prompt if not provided)

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:iterative-development` - Workflow guidance

### Delta inventory
- `docs/planning/DELTAS.md` - Existing delta definitions
- `docs/planning/DEPENDENCIES.md` - Delta dependencies

### Existing documentation patterns
- `docs/delta-specs/` - Existing delta specs (for pattern reference)
- `docs/delta-designs/` - Existing delta designs (for pattern reference)

### Feature documentation (for categorization)
- `docs/feature-specs/README.md` - Feature capability index
- Read to understand existing capabilities and help categorize new delta
- Helps identify which features the delta might affect

## Pre-Check

Verify framework is initialized:
- If `docs/planning/` doesn't exist, suggest `/katachi:init-framework` first
- If DELTAS.md or DEPENDENCIES.md missing, explain what's needed

## Process

### 1. Capture Delta Description

If not provided in arguments, ask:
```
"Describe the delta you want to add:
- What does this change or add to the system?
- What user capability does this provide or modify?
- Why is it needed? (the benefit or problem it solves)

This can be a new capability, modification to existing functionality, bug fix, or improvement."
```

### 2. Research Existing Deltas

Read DELTAS.md to understand:
- Existing delta patterns
- Next available ID number
- Complexity patterns for similar deltas

### 3. Propose Delta Details

Based on the description and existing patterns, draft a complete proposal:

```
"Based on your description, I propose:

**ID**: DLT-NNN (next available)
**Name**: [concise delta name]
**Complexity**: [Easy/Medium/Hard] - [reason based on scope]
**Dependencies**: [proposed deps or 'None'] - [reason based on analysis]

Does this look right? What needs adjustment?"
```

### 4. Validate Delta Quality

Dispatch the delta-validator agent to validate the proposed delta.

```python
Task(
    subagent_type="katachi:delta-validator",
    prompt=f"""
Validate this proposed delta (single delta mode).

## Proposed Delta
**ID**: {proposed_id}
**Name**: {proposed_name}
**Complexity**: {proposed_complexity}
**Description**: {proposed_description}
"""
)
```

If validation finds issues, refine the delta based on recommendations before presenting to user.

Optionally, dispatch impact analyzer to suggest dependencies:
```python
Task(
    subagent_type="katachi:impact-analyzer",
    prompt=f"""
Analyze likely dependencies for this new delta:

## Delta Description
{delta_description}

## Existing Deltas
{deltas_list}

Suggest which existing deltas this likely depends on, with rationale.
"""
)
```

### 5. Iterate Based on Feedback

- Apply user corrections to complexity or dependencies
- Re-present if significant changes
- Repeat until user approves

### 6. Update DELTAS.md

Add new delta entry:

```markdown
### DLT-NNN: Delta name
**Status**: ✗ Defined
**Complexity**: [complexity]
**Description**: [Comprehensive description explaining what the delta does and why it's needed]
```

### 7. Update DEPENDENCIES.md

Add to dependency matrix:

```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py deps add-delta DLT-NNN
```

If dependencies identified:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py deps add-dep DLT-NNN DEP-ID
```

### 8. Summary and Next Steps

Present summary:
```
"Delta added:

ID: DLT-NNN
Description: [description]
Complexity: [complexity]
Dependencies: [list or 'None']

Next steps:
- Create spec: /katachi:spec-delta DLT-NNN
- Or continue adding more deltas

Create spec now? [Y/N]"
```

If user says yes, transition to `/katachi:spec-delta DLT-NNN`.

## Error Handling

**Framework not initialized:**
- Suggest `/katachi:init-framework` first
- Don't attempt to create files manually

**Invalid dependency:**
- Delta ID doesn't exist
- Show available deltas
- Ask user to correct

**ID conflict:**
- ID already exists
- Show what exists
- Assign next available number

## Workflow

This is a collaborative process:
- Capture description
- Research existing patterns
- Propose complete delta details (ID, complexity, dependencies)
- Iterate based on user feedback
- Update framework files
- Offer next steps
