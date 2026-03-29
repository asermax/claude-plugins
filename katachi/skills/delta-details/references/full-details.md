# Full Details Mode

Present the gathered delta information as a structured, scannable view with the following sections.

## 1. Overview

Display the delta's core metadata:
- **ID and Name**
- **Status** - current status with symbol
- **Priority** - level and label (e.g., `2 (High)`)
- **Complexity** - Easy/Medium/Hard
- **Description** - the full description from DELTAS.md

## 2. Progress

Show where the delta is in its lifecycle and which documents exist:

| Phase | Status | Document |
|-------|--------|----------|
| Spec | Complete/In Progress/Not Started | exists/missing |
| Design | Complete/In Progress/Not Started | exists/missing |
| Plan | Complete/In Progress/Not Started | exists/missing |
| Implementation | Complete/In Progress/Not Started | - |

Derive the phase status from the delta's current status marker (e.g., `✓ Spec` means spec is complete, `⧗ Design` means design is in progress).

## 3. Dependencies

List what this delta depends on. For each dependency, include:
- Delta ID and name
- Current status
- Whether it's complete or still blocking

Show the full dependency tree from the `deps tree` output.

If the delta has no dependencies, state "No dependencies - this delta can be started independently."

## 4. Dependents

List what depends on this delta. For each dependent, include:
- Delta ID and name
- Current status

This shows the impact of completing (or delaying) this delta.

If nothing depends on this delta, state "No dependents - no other deltas are waiting on this one."

## 5. Blockers

Highlight any incomplete dependencies that prevent this delta from advancing. If all dependencies are complete (or there are none), state that the delta is unblocked and ready for its next phase.

## 6. Documents

For each existing document (spec, design, plan), provide a brief summary (2-3 sentences) of its key content:
- **Spec**: Main requirements and acceptance criteria
- **Design**: Chosen approach and key decisions
- **Plan**: Number of batches and overall implementation strategy

## 7. Next Steps

Based on the delta's current status, suggest the appropriate next command:

| Current Status | Next Command |
|---------------|-------------|
| ✗ Defined | `/katachi:spec-delta <ID>` |
| ✓ Spec | `/katachi:design-delta <ID>` |
| ✓ Design | `/katachi:plan-delta <ID>` |
| ✓ Plan | `/katachi:implement-delta <ID>` |
| ✓ Implementation | `/katachi:reconcile-delta <ID>` |
| ✓ Reconciled | `/katachi:land-delta <ID>` |

For in-progress statuses (⧗), suggest continuing the current phase.
