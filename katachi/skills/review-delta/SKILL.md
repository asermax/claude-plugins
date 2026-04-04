---
name: review-delta
description: Review a delta's implemented code against specs, designs, and decisions
argument-hint: "[DELTA-ID]"
---

# Review Delta Workflow

Review a delta's implementation for spec compliance, design alignment, and code quality.

## Input

Delta ID: $ARGUMENTS (e.g., "DLT-001")

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles
- `katachi:working-on-delta` - Per-feature workflow

### Delta inventory
- `docs/planning/DELTAS.md` - Delta definitions

### Delta documents
- `docs/delta-specs/$ARGUMENTS.md` - What to build (requirements)
- `docs/delta-designs/$ARGUMENTS.md` - Why/how (design rationale)
- `docs/delta-plans/$ARGUMENTS.md` - Implementation plan with batches

### Project decisions
- `docs/architecture/README.md` - Architecture decisions (ADRs)
- `docs/design/README.md` - Design patterns (DES)

### Feature documentation (for acceptance criteria and architecture)
- Read affected feature specs from delta-spec (use as acceptance criteria source)
- Read affected feature designs from delta-design (use as architecture guidance)

## Pre-Check

Verify delta is implemented:
- If delta status is not "✓ Implementation", suggest `/katachi:implement-delta $ARGUMENTS` first
- Review requires completed implementation

## Process

### 1. Gather Context (Silent)

Read all relevant documentation:
- Delta spec, design, and plan
- Full ADR/DES documents (not just indexes) for all decisions referenced in the delta
- Affected feature specs and designs

Gather the implemented code:
- If the delta is on a feature branch, diff against main:
  ```bash
  git diff origin/main...HEAD
  ```
- If working on main with uncommitted changes, use working tree diff:
  ```bash
  git diff
  git diff --staged
  ```

### 2. Review Loop

Repeat until the code-reviewer returns `PASS`:

#### 2a. Dispatch Code Reviewer

```python
Task(
    subagent_type="katachi:code-reviewer",
    prompt=f"""
Review this implementation.

## Delta Spec
{spec_content}

## Delta Design
{design_content}

## Implementation Plan
{plan_content}

## Implemented Code
{code_diff_or_files}

## Relevant ADR/DES Documents
{adr_des_content}
"""
)
```

#### 2b. Fix All Issues

If assessment is `NEEDS_WORK`, automatically address ALL issues identified:
- Missing acceptance criteria coverage
- Design misalignment
- Pattern violations
- Code quality issues
- Missing decision references
- Missing documentation updates
- Unintended effects / regression risks

Do NOT ask user about fixes — fix everything autonomously.

#### 2c. Verify Fixes

After fixing:
- Re-run all tests
- Re-run linting and type checking
- Fix any new issues introduced by fixes

#### 2d. Re-dispatch

If issues were fixed, loop back to step 2a with the updated code. Continue until the code-reviewer returns `PASS`.

### 3. Present Findings to User

Once the code-reviewer returns `PASS`:

Show the validated implementation:
- Summarize what was reviewed
- List issues found and fixed during the review loop
- Highlight any deviations from spec/design (with rationale from the code)
- Note any emergent patterns detected during review

Invite feedback: "What needs adjustment in this implementation?"

### 4. Iterate Based on User Feedback

Apply user corrections or changes.
Re-run review loop if changes are significant.
Repeat until user approves.

### 5. Finalize

Present summary:

```
"Implementation review complete for $ARGUMENTS.

[Brief summary of review findings and fixes applied]

Files reviewed:
- [file]: [status and notes]
- ...

Issues found and fixed: [count]
Review iterations: [count]"
```

## Workflow

**This is a review-and-fix loop:**
- Gather all context silently
- Loop: dispatch code-reviewer → fix all issues → verify → re-dispatch (until PASS)
- Present validated implementation to user
- Iterate based on feedback
- Finalize
