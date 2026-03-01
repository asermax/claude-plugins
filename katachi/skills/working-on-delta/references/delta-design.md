# Design: [DLT-ID] - [Title]

<!--
NOTE: This is a DELTA design template (working document for implementing changes).
For FEATURE design templates (long-lived documentation), see feature-design.md.
For detailed design guidelines, see design-template.md.
-->

**Delta Spec**: [../delta-specs/DLT-ID.md](../delta-specs/DLT-ID.md)
**Status**: Draft | Approved | Superseded

## Purpose

This document explains the design rationale for this delta: the modeling choices, data flow, system behavior, and architectural approach.

After implementation, the "Detected Impacts" section will guide reconciliation into feature design docs.

## Problem Context

[What specific problem does this delta solve? What constraints exist?]

## Design Overview

[High-level description of the design approach. What are the main components/concepts?]

## Shape

<!--
Mechanisms that make up the solution. Seeded during spec phase, evolved during design.
Parts describe what to build/change (mechanisms), not constraints (those belong in spec's Requirements).
Flag column: empty = mechanism is understood, ⚠️ = unknown that needs investigation (spike or research).
Flagged parts must have a description in the "Flagged Unknowns" section below the table.
Flagged parts should be resolved during design phase. Spikes may surface new requirements — update the spec if so.
-->

| Part | Mechanism | Flag |
|------|-----------|:----:|
| **S1** | [description of what to build/change] | |
| **S2** | [description] | ⚠️ |

### Flagged Unknowns

#### S2 — [short label]
[Detailed description of what needs investigation — the specific question or uncertainty, with as much context as needed]

## Components

<!-- This is where implementation structure lives. Specs describe WHAT users can do; design decides HOW to implement it -->

### Implementation Structure

| Layer/Component | Responsibility | Key Decisions |
|-----------------|----------------|---------------|
| [e.g., API] | [What this layer does] | [Technology, patterns, constraints] |
| [e.g., UI] | [What this layer does] | [Framework, state management] |
| [e.g., Validation] | [Shared logic across layers] | [Where it runs, how it's shared] |

### Cross-Layer Contracts

<!--
For integration flows between components, consider using sequence diagrams.
See: ${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/technical-diagrams.md
-->

**API Contract** (if applicable):
<!--
Keep API contracts minimal and generic. Show request/response structure, not implementation.
See: ${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/code-examples.md
-->
```
[Method] [Endpoint]
Request: { ... }
Response: { ... } | { error: ..., code: ... }
```

**Integration Points**:
- [How layers communicate]
- [Error handling strategy across layers]
- [Loading states and optimistic updates]

### Shared Logic

What's shared between components and why:
- [e.g., Validation rules]: [Rationale for sharing]
- [e.g., Error codes]: [How consistency is maintained]
- [e.g., Types/interfaces]: [Sharing mechanism - codegen, manual sync, etc.]

## UI Layout

<!--
CONDITIONAL SECTION - Include ONLY if this delta involves visual interface changes.
DELETE this entire section for: technical deltas, backend-only changes, non-UI features.

For complete wireframing guide, see:
${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/wireframing.md
-->

### [Screen/Component Name]

```
[ASCII wireframe using box drawing characters]
```

### Layout Explanation

<!-- REQUIRED: The wireframe alone is not enough - explain the layout decisions -->

**Purpose**: [What is this screen/component for? Which breadboard place does it represent?]

**Key elements**: [Explain the main UI elements shown and their purpose]

**Layout rationale**: [Why are elements positioned this way? What hierarchy is being communicated?]

**Interactions**: [What happens when user interacts with key elements?]

### State Variations (if applicable)

<!-- Include ONLY if this screen has meaningful state changes -->

**[State name]** (e.g., Loading, Empty, Error):
```
[Wireframe for this state]
```
[Brief explanation of when this state occurs and how it differs]

## Modeling

<!--
Consider using ERD diagrams for entity relationships, state diagrams for lifecycle transitions.
See: ${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/technical-diagrams.md
-->

[How is the domain modeled? What are the key entities/concepts? What relationships exist?]

## Data Flow

<!--
Consider using sequence diagrams for component interactions, flow diagrams for complex processes.
See: ${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/technical-diagrams.md
-->

[How does data move through the system? What are the key paths?]

## Key Decisions

### [Decision Name]

**Choice**: [What was chosen]
**Why**: [Rationale for this choice]
**Alternatives Considered**:
- [Alternative 1]: [Why not chosen]
- [Alternative 2]: [Why not chosen]

**Consequences**:
- Pro: [benefit]
- Con: [tradeoff]

## System Behavior

<!--
Consider using state diagrams for lifecycle/state transitions in system behavior.
See: ${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/technical-diagrams.md
-->

[How does the system behave in important scenarios? Edge cases?]

### Scenario: [Name]

**Given**: [context]
**When**: [trigger]
**Then**: [expected behavior]
**Rationale**: [why this behavior]

## Open Questions

- [ ] [Question that needs resolution]

---

## Detected Impacts

<!-- This section is populated automatically during design phase -->

### Affected Feature Designs
- **[path/to/feature-design.md]** - [Modifies/Adds/Removes]: [description]

### Notes for Reconciliation
- [What needs to change in feature design docs]
- [New design sections that need to be created]
- [Design decisions that need to be documented]

## Notes

[Any additional context, links to research, related decisions]
