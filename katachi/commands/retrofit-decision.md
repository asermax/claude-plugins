---
description: Document an existing decision from code as an ADR or DES
argument-hint: "<topic>"
---

# Retrofit Decision

Document an existing architectural decision or design pattern from the codebase.

## Input

Topic or pattern: $ARGUMENTS

## Context

**Skill to load:**
Load the `katachi:retrofit-existing` skill for retrofit workflow.

**Decision indexes:**
`@docs/architecture/README.md` - Architecture decisions (ADRs)
`@docs/design/README.md` - Design patterns (DES)

**Vision (if present):**
`@docs/planning/VISION.md` - Project context for inference

## Pre-Check

Verify:
- The docs/architecture/ and docs/design/ directories exist
- User understands this documents existing choices, not new decisions

## Process

### 1. Understand the Topic

If topic is vague, ask for clarification:
```
"You mentioned: [topic]

Can you point me to:
- A specific file or module that uses this pattern?
- Or describe how this decision manifests in the code?"
```

### 2. Read Relevant Code

Read files that demonstrate the decision:
- Look for patterns in the code
- Check comments for rationale
- Examine git history if helpful

### 3. Dispatch Codebase Analyzer

```python
Task(
    subagent_type="katachi:codebase-analyzer",
    prompt=f"""
Analyze the codebase to document this decision.

## Analysis Type
decision

## Topic
{topic_description}

## Relevant Code
{code_content}

## Project Context
{vision_content if exists else "Infer from code"}

Determine if this is:
- ADR (one-time architectural choice)
- DES (repeatable pattern)

Create a draft document with:
- Context inferred from code
- Alternatives that weren't chosen (infer from what exists)
- Consequences observed in the implementation
"""
)
```

### 4. Determine Document Type

Based on analysis, present recommendation:

```
"Based on the code analysis, this appears to be a [ADR/DES]:

[If ADR]:
This is an architectural decision - a one-time choice that would be expensive
to change. Examples: database choice, framework, authentication approach.

[If DES]:
This is a design pattern - a repeatable approach used in multiple places.
Examples: error handling, logging conventions, test structure.

Do you agree with this classification, or should it be the other type?"
```

### 5. Present Draft Document

Show the agent's draft:

```
## Draft [ADR/DES]

[Draft content]

---

### Notes from Analysis
- Context inferred from: [source]
- Alternatives inferred because: [reasoning]
- Consequences observed in: [locations]

What needs adjustment?
```

### 6. Iterate on Document

User provides corrections:
- Clarify context
- Add known alternatives
- Correct consequences
- Add details

Continue until user approves.

### 7. Assign ID

Check existing documents:

For ADR:
```bash
ls docs/architecture/ADR-*.md
# Determine next number: ADR-NNN
```

For DES:
```bash
ls docs/design/DES-*.md
# Determine next number: DES-NNN
```

### 8. Update Index

**For ADR:**

Update `docs/architecture/README.md`:
- Add to ADR table
- Add to quick reference if applicable
- Note what areas it affects

**For DES:**

Update `docs/design/README.md`:
- Add to DES table
- Add to quick reference if applicable
- Note when to use this pattern

### 9. Save Document

Write to appropriate location:

For ADR:
```markdown
# ADR-NNN: [Title]

## Retrofit Note

This ADR documents an existing decision discovered in the codebase.
Decision likely made: [date from git history or "Unknown"]

---

[Rest of ADR content with status: Accepted]
```

For DES:
```markdown
# DES-NNN: [Pattern Name]

## Retrofit Note

This DES documents an existing pattern discovered in the codebase.
Pattern established in: [files where first used]

---

[Rest of DES content]
```

### 10. Identify Affected Features

Ask:
```
"Which existing features use this [decision/pattern]?

I'll update their specs/designs to reference this document."
```

For each affected feature, note to update:
- Design document (reference the ADR/DES)
- Plan (add to pre-implementation checklist for future features)

### 11. Summary and Next Steps

```
"Decision documented:

File: docs/[architecture/design]/[ADR/DES]-NNN-title.md
Type: [ADR/DES]
Status: Accepted

The [decision/pattern] is now part of the documented framework.

Future features should:
- Reference this in their designs
- Follow this [decision/pattern] unless superseding

Would you like to:
- Retrofit another decision: /katachi:retrofit-decision <topic>
- Update a feature design to reference this: /katachi:design-feature <ID>
- Retrofit a spec: /katachi:retrofit-spec <path>"
```

## Workflow

This is a collaborative process:
- Understand the topic
- Read relevant code
- Agent creates draft
- Determine ADR vs DES
- Iterate with user corrections
- Assign ID and save
- Update indexes
- Identify affected features
- Offer next steps
