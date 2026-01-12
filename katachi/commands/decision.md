---
description: Document an architecture or design decision
argument-hint: [topic, existing ID, or backlog ID]
---

# Decision Documentation Workflow

Document an architecture decision (ADR) or design pattern (DES).

## Input

$ARGUMENTS - Optional: topic to document, existing decision ID to update, or **backlog item ID** (Q-XXX)

## Backlog Integration

If a backlog item ID is provided (e.g., `/decision Q-001`):

1. **Load item context**
   - Run `python ${CLAUDE_PLUGIN_ROOT}/scripts/backlog.py show <ID>` to get item details
   - Use title and notes as initial context for the decision
   - If item has related features, consider how they're affected

2. **After decision documented**
   - Prompt: "Mark <ID> as resolved?"
   - If yes: Run `python ${CLAUDE_PLUGIN_ROOT}/scripts/backlog.py fix <ID>` (questions are resolved by documenting a decision)

## Context

**Skill to load:**
Load the `katachi:framework-core` skill for workflow principles and decision type guidance.

**Feature inventory:**
`@docs/planning/FEATURES.md` - Feature definitions (to check for affected features)

**Backlog:**
`@docs/planning/BACKLOG.md` - Questions and related items

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

### 2. Identify Related Backlog Items

1. Search BACKLOG.md for related items:
   - Q- items that might be answered by this decision
   - Other items whose resolution depends on this decision

2. If related items found (beyond the Q-XXX being documented if any), present them:
   ```
   "Found N backlog items that might be resolved by this decision:

   [ ] Q-003: Should we use library X or Y?
   [ ] Q-007: What's our caching strategy?

   Which items will this decision resolve? (select numbers, 'all', or 'none')"
   ```

3. Track selected items for automatic resolution at the end

### 3. Understand the Decision

Ask about the decision:
- What problem led to this decision?
- What approach did you choose?
- What alternatives were considered?
- What are the consequences?

For DES, also ask:
- Where is this pattern used?
- When should it be applied?
- What are the exceptions?

### 4. Research if Needed

If user is uncertain about alternatives or consequences:
- Use Task tool to research options
- Synthesize findings
- Present alternatives with trade-offs

### 5. Draft Document

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

### 6. Present for Review

Show draft document to user.
Highlight any uncertainties.
Ask: "What needs adjustment?"

### 7. Iterate Based on Feedback

Apply user corrections.
Repeat until approved.

### 8. Assign ID

Determine next available ID:
- For ADR: Check existing ADRs in `docs/architecture/`
- For DES: Check existing DES in `docs/design/`

### 9. Update Index

Add to appropriate README index:

For ADR in `docs/architecture/README.md`:
- Add to ADR table
- Update quick reference if applicable
- Note affected areas

For DES in `docs/design/README.md`:
- Add to DES table
- Update quick reference if applicable
- Note when to use

### 9. Save Document and Resolve Backlog

Write to appropriate location:
- ADR: `docs/architecture/ADR-NNN-title.md`
- DES: `docs/design/DES-NNN-pattern-name.md`

**Automatically resolve selected backlog items:**

For each Q- item the user selected to include (from step 2):
- `python ${CLAUDE_PLUGIN_ROOT}/scripts/backlog.py fix <ID>` (answered by decision)

Report: "Resolved N backlog items: Q-003, Q-007"

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
