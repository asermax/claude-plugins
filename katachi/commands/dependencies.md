---
description: Build the dependency matrix for deltas
---

# Dependency Matrix Workflow

Build the dependency matrix in docs/planning/DEPENDENCIES.md.

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles

### Required files
- `docs/planning/DELTAS.md` - Delta inventory to analyze
- `docs/planning/DEPENDENCIES.md` - Current matrix (if exists)

## General Guidance

Follow the collaborative workflow principles from the framework-core skill.

**Dependencies-specific guidance:**

**Use a scratchpad** - Track state in `/tmp/dependencies-state.md`:
- Current analysis phase
- Proposed dependencies with reasoning
- Validation findings
- Phase derivation state

**Propose complete matrix first** - Analyze all deltas and propose complete matrix in one pass. Do NOT ask about each pair individually.

## Process

### 0. Check Existing State

If `docs/planning/DEPENDENCIES.md` exists:
- Read current dependency matrix
- Read current deltas (check for new deltas)
- Ask: "Should we update for new deltas, refine existing, or rebuild?"
- Enter iteration mode as appropriate

If no dependencies exist: proceed with initial analysis

### 1. Analyze Deltas and Propose Complete Matrix

For each delta, analyze:
- What data/capabilities does it consume?
- What other deltas must exist for this to work?
- What does it share with other deltas?
- What must be initialized before this can start?
- What must work for this to be testable?

**Apply dependency priority principles:**
- Core capabilities before workflows
- Core workflows before enhancements
- Foundation before configuration
- Functionality before polish
- Configuration deltas are enhancements, not prerequisites

Build complete proposed dependency matrix with reasoning.

### 2. Present Dependencies

Present all proposed dependencies with reasoning for each.

### 3. User Iteration on Dependencies

User reviews proposed dependencies.
Discuss and adjust based on user knowledge.

Surface hidden dependencies with gap detection questions:
- "Does X need data from Y?"
- "What must work before X can be tested?"
- "Do X and Y share configuration or state?"

### 4. Validate for Cycles

Check for circular dependencies.
If found, work with user to resolve:
- Re-examine if dependency is really needed
- Revise feature scope
- Split features

### 5. Agent Validation #1: Dependency Matrix

Dispatch a general-purpose subagent to review the matrix.

Include user's explicit decisions made during analysis.

Request critique on:
- **Missing implicit dependencies**
- **Hidden coupling** (shared config, state, resources)
- **Dependency rationale**
- **Over-specification** (unnecessary dependencies)
- **Initialization order**
- **Priority violations**

Review findings with user. Iterate if needed.

### 6. Derive Implementation Phases

Use topological sort:
- Phase 1: Deltas with no dependencies
- Phase 2: Deltas depending only on Phase 1
- Continue until all deltas are phased

Present proposed phases to user.

### 7. Agent Validation #2: Phase Ordering

Dispatch a general-purpose subagent to review phases.

Request critique on:
- **Implementation feasibility**
- **Testing order**
- **Developer experience**
- **Parallel opportunities**
- **Phase balance**
- **Priority alignment**

Review findings with user.

### 8. Phase Iteration and Finalization

Ask: "Should we adjust phases based on validation, or are they ready?"

If adjustments needed → discuss and adjust
If complete → finalize and write to `docs/planning/DEPENDENCIES.md`

## Gap Detection Questions

Use during user iteration:

**Data flow:** "Does X need data that Y produces?"
**Initialization:** "What must be initialized before X can start?"
**Shared resources:** "Do X and Y access the same configuration?"
**Testing:** "What must work for X to be testable?"
**Error handling:** "If Y fails, does X need to know?"

## Workflow

**This is a collaborative process:**
- Propose complete matrix first, then iterate
- Challenge gaps and hidden coupling
- Work together to resolve cycles
- User confirms phases before finalizing
- Iterate until complete
