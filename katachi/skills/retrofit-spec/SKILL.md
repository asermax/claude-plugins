---
name: retrofit-spec
description: Create a feature specification from existing code
argument-hint: "<path>"
disable-model-invocation: true
---

# Retrofit Spec

Create a feature specification from existing code implementation.

## Input

Path to file or module: $ARGUMENTS

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:retrofit-existing` - Retrofit workflow

### Feature documentation structure
- `docs/feature-specs/` - Existing feature documentation to understand organization
- `docs/feature-specs/README.md` - Top-level feature index (if exists)
- Domain README files in feature-specs/ folders

### Vision (if present)
- `docs/planning/VISION.md` - Project context for inference

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

### 5. Determine Feature Organization

Analyze existing feature-specs/ structure:
```
"Looking at existing feature documentation, where should this belong?

Existing capability domains:
- auth/ - [description]
- api/ - [description]
- [etc.]

Should this be:
A) New sub-capability in existing domain (e.g., auth/new-feature.md)
B) New capability domain (create new folder)
C) Standalone feature (top-level .md file)

Which organization makes sense?"
```

### 6. Save Feature Spec

Write spec to appropriate location in `docs/feature-specs/`:
- If domain/sub-capability: `docs/feature-specs/[domain]/[feature].md`
- If new domain: Create folder with README.md + feature.md
- If standalone: `docs/feature-specs/[feature].md`

Include retrofit note:

```markdown
# [Feature Name]

## Retrofit Note

This spec was created from existing code at `[path]`.
Original implementation date: [Unknown / from git history if available]

---

[Rest of spec content]

## Related Deltas
(To be added when deltas implement changes to this feature)
```

### 7. Update Domain README

If adding to existing domain:
- Update `docs/feature-specs/[domain]/README.md`
- Add entry to sub-capabilities table

If creating new domain:
- Create `docs/feature-specs/[domain]/README.md`
- Add domain to top-level `docs/feature-specs/README.md`

### 8. Summary and Next Steps

```
"Feature spec created for existing code:

File: docs/feature-specs/[path]
Type: [Domain/Sub-capability/Standalone]

The feature documentation has been created. You can now:
- Retrofit design rationale: /katachi:retrofit-design [path]
- Retrofit another module: /katachi:retrofit-spec <path>
- Document a specific decision: /katachi:retrofit-decision <topic>

**Recommended next step:** Run `/katachi:retrofit-design [path]` to:
- Capture the design rationale behind the implementation
- Automatically discover and document undocumented ADR/DES patterns
- Create a complete design document from the existing code"
```

## Workflow

This is a collaborative process:
- Read and analyze code
- Present draft spec from agent
- Iterate with user corrections
- Determine feature organization (domain/sub-capability)
- Save spec in appropriate location
- Update domain READMEs
- Offer next steps
