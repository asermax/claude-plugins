# Design: [Capability Name]

<!-- This design describes the current implementation approach. Updated through delta reconciliation. -->

**Feature Spec**: [../feature-specs/[domain]/[capability].md](../feature-specs/[domain]/[capability].md)
**Status**: Current | Deprecated

## Purpose

This document explains the design rationale for this capability: the modeling choices, data flow, system behavior, and architectural approach.

## Problem Context

[What specific problem does this capability solve? What constraints exist?]

## Design Overview

[High-level description of the design approach. What are the main components/concepts?]

## UI Structure

<!--
CONDITIONAL SECTION - Visual representation of this capability's interface components.
DELETE this section for features with no UI components.
Updated through delta reconciliation.

For wireframing guide, see:
${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/wireframing.md
-->

### [Screen/View Name]

```
[ASCII wireframe]
```

**Purpose**: [What this screen does]

**Key elements**: [Main UI elements and their purpose]

**Key interactions**: [Primary user actions available]

**State variations**: [Loading, empty, error states if relevant]

## Components

### Implementation Structure

| Layer/Component | Responsibility | Key Decisions |
|-----------------|----------------|---------------|
| [e.g., API] | [What this layer does] | [Technology, patterns, constraints] |

### Cross-Layer Contracts

[How different parts of the system communicate]

### Shared Logic

What's shared between components and why:
- [e.g., Validation rules]: [Rationale for sharing]

## Modeling

[How is the domain modeled? What are the key entities/concepts?]

## Data Flow

[How does data move through the system?]

## Key Decisions

### [Decision Name]

**Choice**: [What was chosen]
**Why**: [Rationale for this choice]
**Alternatives Considered**:
- [Alternative 1]: [Why not chosen]

**Consequences**:
- Pro: [benefit]
- Con: [tradeoff]

## System Behavior

### Scenario: [Name]

**Given**: [context]
**When**: [trigger]
**Then**: [expected behavior]
**Rationale**: [why this behavior]

---

## Notes

<!--
Visual Documentation Guidelines:

Technical Diagrams: Embed ASCII diagrams inline within relevant sections (Modeling, Data Flow, System Behavior)
where they aid understanding. See: ${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/technical-diagrams.md

Code Examples: Include code snippets inline only when they genuinely clarify the design (API contracts,
shared validation). Keep minimal and generic. See: ${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/code-examples.md

Do NOT create standalone "Diagrams" or "Code Examples" sections. Embed visual aids where they help.
-->

[Any additional context, links to research, related decisions]
