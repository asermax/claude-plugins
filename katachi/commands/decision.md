---
description: Document an architecture or design decision
argument-hint: [topic or existing ID]
---

# Decision Documentation Workflow

Document an architecture decision (ADR) or design pattern (DES).

## Input

$ARGUMENTS - Optional: topic to document or existing decision ID to update

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles and decision type guidance

### Feature documentation
- `docs/feature-specs/README.md` - Feature capability index
- `docs/feature-designs/README.md` - Feature design index
- Read specific feature-specs/ and feature-designs/ docs to understand affected features

### Decision indexes
- `docs/architecture/README.md` - Architecture decisions (ADRs)
- `docs/design/README.md` - Design patterns (DES)

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

### 5. Validate Classification (Silent)

Dispatch decision-reviewer to validate the classification:

```python
Task(
    subagent_type="katachi:decision-reviewer",
    prompt=f"""
Validate this decision document classification.

## Decision Type
{adr_or_des}

## Draft Document
{draft_content}

## User's Context
{user_context}

## Existing ADR Index
{adr_index}

## Existing DES Index
{des_index}
"""
)
```

Apply feedback:
- If classification is incorrect, adjust document type
- If decision overlaps with existing, consider updating instead of creating new
- If decision is too trivial, suggest keeping in feature-design only

### 6. Present for Review

Show draft document to user.
Highlight any uncertainties or validation feedback.
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

### 10. Save Document

Write to appropriate location:
- ADR: `docs/architecture/ADR-NNN-title.md`
- DES: `docs/design/DES-NNN-pattern-name.md`

### 11. Identify Affected Features

Ask:
```
"Which features are affected by this decision?

I'll update their design documents to reference this [ADR/DES]."
```

List affected features and update their designs to include decision references:
- Add reference in "Key Decisions" section
- Update "Related Decisions" if present
- Ensure design rationale reflects the decision

## Workflow

**This is a collaborative process:**
- Determine type (ADR vs DES)
- Understand the decision
- Research alternatives if needed
- Draft document
- Validate classification with decision-reviewer agent
- Present and iterate with user
- Save and update index
- Identify affected features
