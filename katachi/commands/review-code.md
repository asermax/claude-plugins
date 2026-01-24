---
description: Review code against specs, designs, and decision compliance
argument-hint: "[context]"
---

# Code Review Workflow

Review code for spec compliance and pattern adherence.

## Input

Context: $ARGUMENTS (optional - can be: branch, files, or description)

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles

### Decision indexes
- `docs/architecture/README.md` - Architecture decisions (ADRs)
- `docs/design/README.md` - Design patterns (DES)

Read relevant docs/feature-specs/ and docs/feature-designs/ based on code being reviewed.

## Process

### 1. Determine Review Scope

Based on input, determine what to review:

**If branch specified:**
```bash
git diff main...$BRANCH
```

**If files specified:**
- Read the specified files
- Identify related specs/designs from path or content

**If description specified:**
- Interpret what user wants reviewed
- Ask for clarification if needed

**If no input:**
- Check for uncommitted changes
- Ask: "What would you like me to review?"

### 2. Identify Related Documentation

For the code being reviewed:
- Which feature does it belong to?
- What's the spec? Design?
- What ADRs/DES apply?

If documentation can't be identified:
```
"I see changes in [files]. Which feature is this for?
Or should I do a general code review without spec reference?"
```

### 3. Dispatch Code Reviewer

```python
Task(
    subagent_type="katachi:code-reviewer",
    prompt=f"""
Review this code.

## Code to Review
{code_content}

## Feature Spec (if applicable)
{spec_content or "No spec identified"}

## Feature Design (if applicable)
{design_content or "No design identified"}

## Relevant ADRs
{adr_content}

## Relevant DES Patterns
{des_content}
"""
)
```

### 4. Present Findings

Show review results organized by severity:

```
## Code Review Results

### Critical Issues
- [Issue]: [location] - [recommendation]

### Important Issues
- [Issue]: [location] - [recommendation]

### Suggestions
- [Suggestion]

### Pattern Compliance
- ADR-007 (logging): Compliant
- DES-003 (testing): Violation at tests/test_x.py:45

### Strengths
- [What's done well]
```

### 5. Discuss Findings

For each issue:
- Explain why it's an issue
- Reference the relevant spec/ADR/DES
- Provide concrete fix recommendation

Ask: "Would you like me to help fix any of these issues?"

### 6. Optionally Apply Fixes

If user wants fixes:
- Apply changes for agreed issues
- Re-run review to verify
- Show updated code

## Workflow

**This is a review process:**
- Determine what to review
- Identify related documentation
- Dispatch code-reviewer agent
- Present findings
- Discuss and optionally fix
