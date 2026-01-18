# Design: [FEATURE-ID] - [Feature Name]

<!-- Not all sections are required. Adapt this structure to the feature's complexity. Simple features may skip sections like "Cross-Layer Contracts" or "Shared Logic". -->

**Feature Spec**: [../feature-specs/FEATURE-ID.md](../feature-specs/FEATURE-ID.md)
**Status**: Draft | Approved | Superseded

## Purpose

This document explains the design rationale for this feature: the modeling choices, data flow, system behavior, and architectural approach.

## Problem Context

[What specific problem does this feature solve? What constraints exist?]

## Design Overview

[High-level description of the design approach. What are the main components/concepts?]

## Components

<!-- This is where implementation structure lives. Specs describe WHAT users can do; design decides HOW to implement it -->

### Implementation Structure

| Layer/Component | Responsibility | Key Decisions |
|-----------------|----------------|---------------|
| [e.g., API] | [What this layer does] | [Technology, patterns, constraints] |
| [e.g., UI] | [What this layer does] | [Framework, state management] |
| [e.g., Validation] | [Shared logic across layers] | [Where it runs, how it's shared] |

### Cross-Layer Contracts

**API Contract** (if applicable):
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

## Modeling

[How is the domain modeled? What are the key entities/concepts? What relationships exist?]

Example:
```
User
├─ has many Sessions
└─ has many Snippets

Session
└─ belongs to User
```

## Data Flow

[How does data move through the system? What are the key paths?]

Example:
```
1. User triggers action
2. System reads from storage
3. UI displays result
4. User makes selection
5. System updates state
```

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

[How does the system behave in important scenarios? Edge cases?]

### Scenario: [Name]

**Given**: [context]
**When**: [trigger]
**Then**: [expected behavior]
**Rationale**: [why this behavior]

## Open Questions

- [ ] [Question that needs resolution]

## Notes

[Any additional context, links to research, related decisions]

---

## When This Design Should Be Promoted

If the approach proves reusable across multiple features, extract the pattern into a DES document.

Signs to promote:
- Similar modeling needed in 2+ features
- Data flow pattern could apply broadly
- Decision establishes convention worth following
