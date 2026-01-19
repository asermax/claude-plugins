---
description: Add a new feature on-the-go without full upfront planning
argument-hint: "[description]"
---

# Add Feature

Add a new feature to the project without requiring full upfront planning.

## Input

Feature description: $ARGUMENTS (optional - will prompt if not provided)

Can also be a **backlog item ID** (typically IDEA-XXX) to promote to a feature.

## Backlog Integration

If a backlog item ID is provided (e.g., `/add-feature IDEA-001`):

1. **Load item context**
   - Run `python ${CLAUDE_PLUGIN_ROOT}/scripts/backlog.py show <ID>` to get item details
   - Use title and notes as initial feature description
   - If item has related features, consider as potential dependencies

2. **After feature added**
   - Prompt: "Mark <ID> as promoted?"
   - If yes: Run `python ${CLAUDE_PLUGIN_ROOT}/scripts/backlog.py promote <ID> --feature <FEATURE-ID>`

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:iterative-development` - Workflow guidance

### Feature inventory
- `docs/planning/FEATURES.md` - Existing feature definitions
- `docs/planning/DEPENDENCIES.md` - Feature dependencies and phases

### Backlog
- `docs/planning/BACKLOG.md` - Related ideas, bugs, improvements

### Existing documentation patterns
- `docs/feature-specs/` - Existing specs (for pattern reference)
- `docs/feature-designs/` - Existing designs (for pattern reference)

## Pre-Check

Verify framework is initialized:
- If `docs/planning/` doesn't exist, suggest `/katachi:init-framework` first
- If FEATURES.md or DEPENDENCIES.md missing, explain what's needed

## Process

### 1. Capture Feature Description

If not provided in arguments, ask:
```
"Describe the feature you want to add:
- What user capability does this provide? (what can users DO)
- Who uses it? (user type or context)
- Why is it needed? (the benefit or problem it solves)

Focus on the user-facing capability, not implementation layers.
Good: 'User Login', 'Export Report', 'View Dashboard'
Bad: 'Login API', 'Report Service', 'Dashboard UI'"
```

**Guide users away from layer-specific features:**
- If description mentions "API", "UI", "frontend", "backend" → ask what user capability this enables
- If description is layer-focused → reformulate as user capability

### 2. Identify Related Backlog Items

1. Search BACKLOG.md for related items:
   - IDEA- items that might be part of this feature
   - BUG- items that might be fixed by this feature
   - Q- items that this feature might need to resolve

2. If related items found, present them:
   ```
   "Found N backlog items that might relate to this feature:

   [ ] IDEA-005: Support CSV export
   [ ] BUG-010: Export fails with special characters
   [ ] Q-004: What formats should export support?

   Which items should be included in this feature? (select numbers, 'all', or 'none')"
   ```

3. Track selected items:
   - IDEA- items will be promoted to this feature
   - BUG-/IMP- items will be linked as related
   - Q- items will be noted as needing resolution during spec

### 3. Research Existing Features

Read FEATURES.md to understand:
- Existing categories and their purposes
- Feature naming conventions
- Complexity patterns for similar features

### 4. Propose Feature Details

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

### 5. Validate Feature Quality

Dispatch the feature-validator agent to validate the proposed feature.

```python
Task(
    subagent_type="katachi:feature-validator",
    prompt=f"""
Validate this proposed feature (single feature mode).

## Proposed Feature
**ID**: {proposed_id}
**Name**: {proposed_name}
**Complexity**: {proposed_complexity}
**Description**: {proposed_description}
"""
)
```

If validation finds issues, refine the feature based on recommendations before presenting to user.

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

### 6. Iterate Based on Feedback

- Apply user corrections to category, complexity, or dependencies
- Re-present if significant changes
- Repeat until user approves

### 7. Update FEATURES.md

Add new feature entry:

```markdown
### CATEGORY-NNN: Feature name
**Status**: ✗ Defined
**Complexity**: [complexity]
**Description**: [Comprehensive description explaining what the feature does, who uses it, and why it's needed]
```

### 8. Update DEPENDENCIES.md

Add to dependency matrix:

```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py deps add-feature CATEGORY-NNN
```

If dependencies identified:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py deps add-dep CATEGORY-NNN DEP-ID
```

### 9. Recalculate Phases

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

### 10. Summary, Link Backlog, and Next Steps

Present summary including related backlog items:
```
"Feature added:

ID: CATEGORY-NNN
Description: [description]
Complexity: [complexity]
Dependencies: [list or 'None']
Phase: N
Related backlog items: IDEA-005 (promoted), BUG-010, Q-004 (linked)
```

**Automatically update backlog items:**

For each item the user selected to include (from step 2):
- IDEA- items: `python ${CLAUDE_PLUGIN_ROOT}/scripts/backlog.py promote <ID> --feature CATEGORY-NNN`
- BUG-/IMP-/Q- items: Update item with `--related CATEGORY-NNN`

Report: "Promoted IDEA-005, linked BUG-010 and Q-004 to CATEGORY-NNN"

```
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
