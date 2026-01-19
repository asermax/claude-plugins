---
description: Extract user capability features from the project vision
---

# Feature Extraction Workflow

Extract user capability features from VISION.md into FEATURES.md.

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles

### Required files
- `docs/planning/VISION.md` - Project vision to extract features from
- `docs/planning/FEATURES.md` - Current feature inventory (if exists)

## General Guidance

Follow the collaborative workflow principles from the framework-core skill.

**Features-specific guidance:**

**Use a scratchpad** - Track state in `/tmp/features-state.md`:
- Raw features identified with source traceability
- Agent validation findings
- Refinements to apply
- Category decisions

**Extract all at once** - Review entire vision and extract all features in one pass.

**Detect gaps proactively** - Challenge completeness:
- "What handles errors here?"
- "What validates this input?"
- "Should we consider security/logging/configuration?"

## Process

### 0. Check Existing State

If `docs/planning/FEATURES.md` exists:
- Read current feature inventory
- Read current vision (check for changes)
- Compare: Are there new workflows? Changed scope?
- Ask: "Should we review for new features, or refine existing ones?"
- Enter iteration mode as appropriate

If no features exist: proceed with initial extraction

### 1. Extract All Features at Once

Review the vision document thoroughly. Extract all features in a single pass:

Consider all aspects:
- User-facing capabilities (what users can DO)
- Core workflows and interactions
- Foundational user needs
- Cross-cutting user concerns (security, privacy, error handling from user perspective)

**Focus on user capabilities, not technical layers:**
- Good: "User Login", "View Dashboard", "Export Report"
- Bad: "Login API", "Dashboard UI", "Report Service"

For each feature, document source traceability (which vision section).

### 2. Agent Validation #1: Raw Feature List

Dispatch the feature-validator agent to review the raw feature list.

```python
Task(
    subagent_type="katachi:feature-validator",
    prompt=f"""
Validate this raw feature list.

## Vision Document
{vision_content}

## Raw Feature List
{raw_features}
"""
)
```

Review agent findings with user.

### 3. User Iteration on Raw Features

Based on agent validation:
- Split features that deliver multiple user capabilities
- Merge or remove redundant features
- Add missing features identified
- Ensure each feature represents one user capability and is traceable to vision

### 4. Analyze and Categorize

Propose 3-7 natural groupings based on the features.

**For each category:**
- Present all features in that category together
- Show: proposed ID, description, complexity for each
- User reviews the full category
- Validate/adjust each feature
- Move to next category

### 5. Agent Validation #2: Categorized Features

Dispatch the feature-validator agent to review the completed inventory.

```python
Task(
    subagent_type="katachi:feature-validator",
    prompt=f"""
Validate this complete feature inventory.

## Feature Inventory
{features_md_content}
"""
)
```

Review agent findings with user.

### 6. User Iteration and Finalization

Ask: "Should we iterate based on this feedback, or is the inventory complete?"

If gaps to address → refine features
If complete → finalize and write to `docs/planning/FEATURES.md`

## Workflow

**This is a collaborative process:**
- Extract features systematically (focus on user capabilities)
- Challenge gaps and completeness
- User confirms categories, complexity, IDs
- Challenge features that aren't single user capabilities
- Never add features without user agreement
- Iterate until complete
