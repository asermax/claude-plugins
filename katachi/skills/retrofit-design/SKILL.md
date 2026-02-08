---
name: retrofit-design
description: Create design documentation from existing implementation
argument-hint: "<ID>"
disable-model-invocation: true
---

# Retrofit Design

Create design documentation from existing implementation code.

## Input

Feature path: $ARGUMENTS (e.g., "auth/login" for docs/feature-specs/auth/login.md)

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:retrofit-existing` - Retrofit workflow

### Feature documentation
- `docs/feature-designs/README.md` - Feature design index
- Read feature-specs/$ARGUMENTS.md (feature path) for spec context

### Retrofitted spec
- `docs/feature-specs/$ARGUMENTS.md` - The feature specification (created by retrofit-spec, e.g., auth/login.md)

### Project decisions
- `docs/architecture/README.md` - Architecture decisions (ADRs)
- `docs/design/README.md` - Design patterns (DES)

### Existing design (if present)
- `docs/feature-designs/$ARGUMENTS.md` - Current design to update or create

### Vision (if present)
- `docs/planning/VISION.md` - Project context for inference

### Reference Guides
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/technical-diagrams.md` - Technical diagram guidance
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/code-examples.md` - Code snippet guidance

## Pre-Check

Verify prerequisites:
- Feature spec exists at `docs/feature-specs/$ARGUMENTS.md`
- Implementation code exists for this feature
- If spec doesn't exist, suggest running `/katachi:retrofit-spec` first

## Process

### 0. Check Existing State

If `docs/feature-designs/$ARGUMENTS.md` exists:
- Read current design
- Summarize: design approach, key decisions, modeling choices
- Ask: "What aspects need refinement? Or should we re-analyze the code?"
- Enter iteration mode as appropriate

If no design exists: proceed with creation

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS "⧗ Design"
```

### 1. Research Phase (Silent)

- Read retrofitted spec (`docs/feature-specs/$ARGUMENTS.md`)
- Extract the source code path from spec's "Retrofit Note"
- Read the implementation code
- Read dependencies from `docs/planning/DEPENDENCIES.md`
- Read ADR index (`docs/architecture/README.md`)
- Read DES index (`docs/design/README.md`)
- Read VISION.md if exists
- Build complete understanding of what was built and why

### 2. Dispatch Codebase Analyzer

```python
Task(
    subagent_type="katachi:codebase-analyzer",
    prompt=f"""
Analyze this code to create a design document.

## Analysis Type
design

## Retrofitted Spec
{spec_content}

## Implementation Code
{code_content}

## Project Context
{vision_content if exists else "Infer from code"}

## Existing ADR Index
{adr_index}

## Existing DES Index
{des_index}
"""
)
```

### 3. Present Draft Design

Show the agent's draft design document.

Highlight uncertainties and assumptions made during inference.

Ask: "What needs adjustment in this inferred design?"

### 4. Iterate Based on Feedback

Apply user corrections:
- Clarify problem context
- Adjust modeling
- Correct data flow
- Add missing decisions
- Fix rationale

Re-present updated sections if significant changes.
Repeat until user approves the core design.

### 5. Integrated Decision Discovery

Review the Key Decisions section for ADR/DES candidates.

Present discovered decisions:
```
"I identified these undocumented decisions while analyzing the design:

1. **[Decision Name]** (architectural choice)
   [Brief description]
   Recommendation: Create ADR

2. **[Pattern Name]** (repeatable pattern)
   [Brief description]
   Recommendation: Create DES

3. **[Minor Choice]** (design choice)
   [Brief description]
   Recommendation: Document inline only

Which decisions should become formal ADR/DES documents?"
```

For each decision the user agrees to document:

```python
# Spawn retrofit-decision inline
Task(
    subagent_type="katachi:codebase-analyzer",  # Initial analysis
    prompt=f"""
Analyze this code to document a specific decision.

## Analysis Type
decision

## Topic
{decision_topic}

## Relevant Code
{code_related_to_decision}

## Project Context
{vision_content}
"""
)
```

After each ADR/DES is created:
- Capture the assigned ID (ADR-XXX or DES-XXX)
- Update the design document to reference it

### 6. External Validation

Dispatch the design-reviewer agent:

```python
Task(
    subagent_type="katachi:design-reviewer",
    prompt=f"""
Review this retrofitted feature design.

## Feature Spec (Retrofitted)
{spec_content}

## Completed Design
{design_content}

## ADR Index Summary
{adr_summary}

## DES Index Summary
{des_summary}

Note: This design was inferred from existing code.
"""
)
```

Review agent findings with user.
Discuss which recommendations to accept.

### 7. Finalize with Iteration Check

Ask: "Should we iterate based on validation feedback, or is the design complete?"

If gaps to address → refine relevant sections (go back to step 4)
If complete → finalize document

Write design to `docs/feature-designs/$ARGUMENTS.md`:

```markdown
# Design: [FEATURE-ID] - [Feature Name]

**Feature Spec**: [../feature-specs/FEATURE-ID.md](../feature-specs/FEATURE-ID.md)
**Status**: Approved

## Retrofit Note

This design was created from existing code at `[path from spec]`.
Original implementation date: [from git history or "Unknown"]
Decisions documented during retrofit: [ADR-XXX, DES-YYY, ...]

---

## Purpose

This document captures the design rationale inferred from the existing implementation.

## Problem Context

[Inferred from what the code solves]

## Design Overview

[High-level approach extracted from code]

## Modeling

[Entities/relationships from code structure]

## Data Flow

[Traced from execution paths]

## Key Decisions

### [Decision Name]
**Choice**: [What the code shows]
**Why**: [Inferred rationale]
**Related**: [ADR-XXX if created during retrofit]

## System Behavior

[Documented from code paths]

## Notes

- Assumptions made during analysis: [list]
```

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS "✓ Design"
```

### 8. Summary and Next Steps

```
"Design retrofitted for existing code:

File: docs/feature-designs/$ARGUMENTS.md
Status: ✓ Design
Decisions created: [ADR-XXX, DES-YYY, ...]

The feature now has both specification and design documentation.

You can now:
- Retrofit another spec: /katachi:retrofit-spec <path>
- Retrofit another design: /katachi:retrofit-design <ID>
- Document additional decisions: /katachi:retrofit-decision <topic>
- Run gap analysis: /katachi:analyze"
```

## Workflow

**This is a collaborative process:**
- Research silently (code, spec, ADRs, DES)
- Draft design from code analysis
- Present and iterate with user
- Discover and document ADR/DES patterns inline
- Validate with design-reviewer agent
- Finalize after user approval
