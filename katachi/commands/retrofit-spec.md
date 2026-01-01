---
description: Create a feature specification from existing code
argument-hint: <path>
---

# Retrofit Spec

Create a feature specification from existing code implementation.

## Input

Path to file or module: $ARGUMENTS

## Context

**Skill to load:**
Load the `katachi:retrofit-existing` skill for retrofit workflow.

**Feature inventory:**
`@planning/FEATURES.md` - To add new feature entry
`@planning/DEPENDENCIES.md` - To update dependency matrix

**Vision (if present):**
`@planning/VISION.md` - Project context for inference

## Pre-Check

Verify:
- The specified path exists
- Framework is initialized (or offer to initialize)
- User understands this creates documentation for existing code

## Process

### 1. Read and Analyze Code

Read the target file(s):
- If single file: Read the file
- If directory: Read key files in the module

### 2. Dispatch Codebase Analyzer

```python
Task(
    subagent_type="katachi:codebase-analyzer",
    prompt=f"""
Analyze this code to create a feature specification.

## Analysis Type
spec

## Target Files
{file_contents}

## Project Context
{vision_content if exists else "No VISION.md - infer project context from code"}

Infer requirements from the code and create a draft spec document.

Focus on:
- What user/system action triggers this code
- What behaviors are implemented
- What error conditions are handled
- What dependencies are required
"""
)
```

### 3. Present Draft Spec

Show the agent's draft spec:

```
## Draft Specification

Based on analyzing [path], here's a draft spec:

[Draft spec content]

---

### Notes from Analysis
- [Assumptions made]
- [Uncertainties]
- [Areas needing clarification]

What needs adjustment in this spec?
```

### 4. Iterate on Spec

User provides corrections:
- Clarify user story
- Adjust acceptance criteria
- Add missing scenarios
- Correct misunderstandings

Continue iteration until user approves.

### 5. Determine Category and ID

Present existing categories:
```
"Which category should this feature belong to?

Existing categories:
- CORE: [description]
- API: [description]
- [etc.]

Or suggest a new category."
```

Assign next available ID in the chosen category.

### 6. Update FEATURES.md

Add feature entry:

```markdown
| CATEGORY-NNN | [Description from spec user story] | [Complexity] | ✓ Implementation |
```

Note: Status is "✓ Implementation" since code already exists.

### 7. Update DEPENDENCIES.md

Add to dependency matrix:

```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py deps add-feature CATEGORY-NNN
```

Ask about dependencies:
```
"Looking at the code, I noticed it imports/uses:
- [module X]
- [module Y]

Do any of these correspond to existing features?
Or are there other features this depends on?"
```

Add identified dependencies:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py deps add-dep CATEGORY-NNN DEP-ID
```

### 8. Ask About Reverse Dependencies

```
"Does any existing feature depend on this code?

If so, we should update the dependency matrix to reflect that."
```

Add reverse dependencies if identified.

### 9. Save Spec

Write spec to `specs/CATEGORY-NNN.md`

Include retrofit note:

```markdown
# CATEGORY-NNN: [Feature Name]

## Retrofit Note

This spec was created from existing code at `[path]`.
Original implementation date: [Unknown / from git history if available]

---

[Rest of spec content]
```

### 10. Update Status

```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/features.py status set CATEGORY-NNN "✓ Implementation"
```

### 11. Summary and Next Steps

```
"Spec created for existing code:

File: specs/CATEGORY-NNN.md
Status: ✓ Implementation (code exists)

The feature has been added to the framework. You can now:
- Retrofit design rationale: /katachi:retrofit-design CATEGORY-NNN
- Retrofit another module: /katachi:retrofit-spec <path>
- Document a specific decision: /katachi:retrofit-decision <topic>

**Recommended next step:** Run `/katachi:retrofit-design CATEGORY-NNN` to:
- Capture the design rationale behind the implementation
- Automatically discover and document undocumented ADR/DES patterns
- Create a complete design document from the existing code"
```

## Workflow

This is a collaborative process:
- Read and analyze code
- Present draft spec from agent
- Iterate with user corrections
- Assign category and ID
- Update framework files
- Save spec with retrofit note
- Offer next steps
