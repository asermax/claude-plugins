---
description: Document an architecture or design decision
---

# Decision Documentation Workflow

Document an architecture decision (ADR) or design pattern (DES).

## Context

**Skill to load:**
Load the `katachi:framework-core` skill for workflow principles and decision type guidance.

**Feature inventory:**
`@planning/FEATURES.md` - Feature definitions (to check for affected features)

**Decision indexes:**
`@docs/architecture/README.md` - Architecture decisions (ADRs)
`@docs/design/README.md` - Design patterns (DES)

## Process

### 1. Determine Decision Type

Ask user what they want to document:

```
"What kind of decision are you documenting?

A) Architecture Decision (ADR)
   - Hard-to-change technical choices
   - Technology selections, patterns, approaches
   - One-time decisions with significant consequences

B) Design Pattern (DES)
   - Repeatable patterns across the codebase
   - Conventions, coding patterns, cross-cutting concerns
   - Patterns that should be consistent

Which type fits your decision?"
```

### 2. Understand the Decision

Ask about the decision:
- What problem led to this decision?
- What approach did you choose?
- What alternatives were considered?
- What are the consequences?

For DES, also ask:
- Where is this pattern used?
- When should it be applied?
- What are the exceptions?

### 3. Research if Needed

If user is uncertain about alternatives or consequences:
- Use Task tool to research options
- Synthesize findings
- Present alternatives with trade-offs

### 4. Draft Document

Create complete document following appropriate template.

For ADR:
- Context
- Decision
- Consequences (positive and negative)
- Alternatives considered

For DES:
- Pattern description
- Rationale
- Examples (do this, don't do this)
- Exceptions

### 5. Present for Review

Show draft document to user.
Highlight any uncertainties.
Ask: "What needs adjustment?"

### 6. Iterate Based on Feedback

Apply user corrections.
Repeat until approved.

### 7. Assign ID

Determine next available ID:
- For ADR: Check existing ADRs in `docs/architecture/`
- For DES: Check existing DES in `docs/design/`

### 8. Update Index

Add to appropriate README index:

For ADR in `docs/architecture/README.md`:
- Add to ADR table
- Update quick reference if applicable
- Note affected areas

For DES in `docs/design/README.md`:
- Add to DES table
- Update quick reference if applicable
- Note when to use

### 9. Save Document

Write to appropriate location:
- ADR: `docs/architecture/ADR-NNN-title.md`
- DES: `docs/design/DES-NNN-pattern-name.md`

### 10. Identify Affected Features

Ask:
```
"Which features should reference this decision?

I'll update their designs to reference this [ADR/DES]."
```

Note features to update.

## Workflow

**This is a collaborative process:**
- Determine type (ADR vs DES)
- Understand the decision
- Research alternatives if needed
- Draft and iterate
- Save and update index
- Identify affected features
