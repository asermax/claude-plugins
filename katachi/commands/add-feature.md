---
description: Add a new feature on-the-go without full upfront planning
argument-hint: "[description]"
---

# Add Feature

Add a new feature to the project without requiring full upfront planning.

## Input

Feature description: $ARGUMENTS (optional - will prompt if not provided)

## Context

**Skill to load:**
Load the `katachi:iterative-development` skill for workflow guidance.

**Feature inventory:**
`@planning/FEATURES.md` - Existing feature definitions
`@planning/DEPENDENCIES.md` - Feature dependencies and phases

## Pre-Check

Verify framework is initialized:
- If `planning/` doesn't exist, suggest `/katachi:init-framework` first
- If FEATURES.md or DEPENDENCIES.md missing, explain what's needed

## Process

### 1. Capture Feature Description

If not provided in arguments, ask:
```
"Describe the feature you want to add:
- What does it do?
- Who uses it?
- Why is it needed?"
```

### 2. Research Existing Features

Read FEATURES.md to understand:
- Existing categories and their purposes
- Feature naming conventions
- Complexity patterns for similar features

### 3. Propose Feature Details

Based on the description and existing patterns, draft a complete proposal:

```
"Based on your description, I propose:

**Category**: [CATEGORY] - [reason based on existing patterns]
**ID**: CATEGORY-NNN (next available)
**Name**: [concise feature name]
**Complexity**: [Easy/Medium/Hard] - [reason based on scope]
**Dependencies**: [proposed deps or 'None'] - [reason based on analysis]

Does this look right? What needs adjustment?"
```

Optionally, dispatch impact analyzer to suggest dependencies:
```python
Task(
    subagent_type="katachi:impact-analyzer",
    prompt=f"""
Analyze likely dependencies for this new feature:

## Feature Description
{feature_description}

## Existing Features
{features_list}

Suggest which existing features this likely depends on, with rationale.
"""
)
```

### 4. Iterate Based on Feedback

- Apply user corrections to category, complexity, or dependencies
- Re-present if significant changes
- Repeat until user approves

### 5. Update FEATURES.md

Add new feature entry:

```markdown
### CATEGORY-NNN: Feature name
**Status**: ✗ Defined
**Complexity**: [complexity]
**Description**: [description]
```

### 6. Update DEPENDENCIES.md

Add to dependency matrix:

```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py deps add-feature CATEGORY-NNN
```

If dependencies identified:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py deps add-dep CATEGORY-NNN DEP-ID
```

### 7. Recalculate Phases

Update phase assignments based on new dependencies:

```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py deps recalculate-phases
```

Show user the phase assignment:
```
"CATEGORY-NNN has been assigned to Phase N.

Reason: [Depends on X which is in Phase M, so this goes in Phase M+1]
         OR [No dependencies, added to Phase 1]"
```

### 8. Summary and Next Steps

Present summary:
```
"Feature added:

ID: CATEGORY-NNN
Description: [description]
Complexity: [complexity]
Dependencies: [list or 'None']
Phase: N

Next steps:
- Create spec: /katachi:spec-feature CATEGORY-NNN
- Or continue adding more features

Create spec now? [Y/N]"
```

If user says yes, transition to `/katachi:spec-feature CATEGORY-NNN`.

## Error Handling

**Framework not initialized:**
- Suggest `/katachi:init-framework` first
- Don't attempt to create files manually

**Invalid dependency:**
- Feature ID doesn't exist
- Show available features
- Ask user to correct

**Category conflict:**
- ID already exists
- Show what exists
- Assign next available number

## Workflow

This is a collaborative process:
- Capture description
- Research existing patterns
- Propose complete feature details (category, complexity, dependencies)
- Iterate based on user feedback
- Update framework files
- Offer next steps
