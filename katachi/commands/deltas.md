---
description: Extract deltas from the project vision
---

# Delta Extraction Workflow

Extract deltas from VISION.md into DELTAS.md.

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles

### Required files
- `docs/planning/VISION.md` - Project vision to extract deltas from
- `docs/planning/DELTAS.md` - Current delta inventory (if exists)

## General Guidance

Follow the collaborative workflow principles from the framework-core skill.

**Deltas-specific guidance:**

**Use a scratchpad** - Track state in `/tmp/deltas-state.md`:
- Raw deltas identified with source traceability
- Agent validation findings
- Refinements to apply

**Extract all at once** - Review entire vision and extract all deltas in one pass.

**Detect gaps proactively** - Challenge completeness:
- "What handles errors here?"
- "What validates this input?"
- "Should we consider security/logging/configuration?"

## Process

### 0. Check Existing State

If `docs/planning/DELTAS.md` exists:
- Read current delta inventory
- Read current vision (check for changes)
- Compare: Are there new workflows? Changed scope?
- Ask: "Should we review for new deltas, or refine existing ones?"
- Enter iteration mode as appropriate

If no deltas exist: proceed with initial extraction

### 1. Extract All Deltas at Once

Review the vision document thoroughly. Extract all deltas in a single pass:

Consider all aspects:
- User-facing capabilities (what users can DO)
- Core workflows and interactions
- Foundational user needs
- Cross-cutting user concerns (security, privacy, error handling from user perspective)

**Each delta represents a bounded piece of work:**
- Can be a new capability, modification, or improvement
- Should be implementable in a reasonable timeframe
- May affect one or more areas of the system

For each delta, document source traceability (which vision section).

### 2. Agent Validation #1: Raw Delta List

Dispatch the delta-validator agent to review the raw delta list.

```python
Task(
    subagent_type="katachi:delta-validator",
    prompt=f"""
Validate this raw delta list.

## Vision Document
{vision_content}

## Raw Delta List
{raw_deltas}
"""
)
```

Review agent findings with user.

### 3. User Iteration on Raw Deltas

Based on agent validation:
- Split deltas that are too large or deliver multiple capabilities
- Merge or remove redundant deltas
- Add missing deltas identified
- Ensure each delta is traceable to vision

### 4. Organize and Number

Assign sequential IDs (DLT-001, DLT-002, etc.) to all deltas.

**For each delta:**
- Show: proposed ID, description, complexity
- User reviews each delta
- Validate/adjust as needed

### 5. Agent Validation #2: Complete Delta Inventory

Dispatch the delta-validator agent to review the completed inventory.

```python
Task(
    subagent_type="katachi:delta-validator",
    prompt=f"""
Validate this complete delta inventory.

## Delta Inventory
{deltas_md_content}
"""
)
```

Review agent findings with user.

### 6. User Iteration and Finalization

Ask: "Should we iterate based on this feedback, or is the inventory complete?"

If gaps to address → refine deltas
If complete → finalize and write to `docs/planning/DELTAS.md`

## Workflow

**This is a collaborative process:**
- Extract deltas systematically
- Challenge gaps and completeness
- User confirms complexity, IDs
- Challenge deltas that are too large or too small
- Never add deltas without user agreement
- Iterate until complete
