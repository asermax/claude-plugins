---
argument-hint: [DELTA-ID]
description: Implement a delta following its plan
---

# Implementation Workflow

Implement a delta following its plan.

## Input

Delta ID: $ARGUMENTS (e.g., "DLT-001")

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles
- `katachi:working-on-delta` - Per-feature workflow

### Delta inventory
- `docs/planning/DELTAS.md` - Delta definitions
- `docs/planning/DEPENDENCIES.md` - Delta dependencies

### Delta documents
- `docs/delta-specs/$ARGUMENTS.md` - What to build (requirements)
- `docs/delta-designs/$ARGUMENTS.md` - Why/how (design rationale)
- `docs/delta-plans/$ARGUMENTS.md` - Implementation steps to follow

### Project decisions
- `docs/architecture/README.md` - Architecture decisions (ADRs)
- `docs/design/README.md` - Design patterns (DES)

### Feature documentation (for acceptance criteria and architecture)
- Read affected feature specs from delta-spec (use as acceptance criteria source)
- Read affected feature designs from delta-design (use as architecture guidance)
- Feature specs define what behavior to implement
- Feature designs define architectural patterns to follow

Read dependency code as specified in plan's pre-implementation checklist.

## Pre-Check

Verify all documentation exists:
- If spec/design/plan missing, suggest running appropriate commands first
- Plan is the primary guide for implementation

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS "⧗ Implementation"
```

## Process

### 1. Review Plan and Decisions (Silent)

- Read implementation plan (`docs/delta-plans/$ARGUMENTS.md`)
- Read spec and design
- **Read full ADR/DES documents:**
  - Identify ADRs/DES listed in pre-implementation checklist
  - Read the full documents, not just indexes
- Read dependency code from checklist
- Understand constraints and patterns to follow

### 2. Implement All Steps Autonomously

Work through all steps in the plan without asking questions.
Documentation is the source of truth.

For each step:
- Implement the code following relevant decisions
- **Add code comments** referencing decisions when:
  - Implementation choice might seem arbitrary without context
  - Decision significantly impacts the approach
  - Format: `// See ADR-003 for why we use X instead of Y`
- **If a different approach is needed for valid reasons:**
  - Update the relevant document (spec/design/plan) immediately
  - Then proceed with implementation
- Verify the step works before proceeding
- Track issues in scratchpad

Use scratchpad `/tmp/implement-$ARGUMENTS-state.md`:
- Current step
- Steps completed
- Issues encountered
- Patterns detected
- Deviations from plan

### 3. Verify Acceptance Criteria

- Run all tests
- Run linting and type checking (fix any issues)
- Perform manual checks against spec
- Ensure all acceptance criteria are met

### 4. External Validation

Dispatch the code-reviewer agent:

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

### 5. Fix All Issues Found by Agent

Automatically address ALL issues identified in validation:
- Missing acceptance criteria coverage
- Design misalignment
- Pattern violations
- Code quality issues
- Missing decision references
- Missing documentation updates

Re-run tests after fixes.
Do NOT ask user - fix everything autonomously.

### 6. Present for User Review

Show complete implementation to user:
- Summarize what was implemented
- Highlight any deviations from plan (with rationale)
- Note any emergent patterns detected

Invite feedback: "What needs adjustment in this implementation?"

### 7. Iterate Based on User Feedback

Apply user corrections or changes.
Re-test after changes.
**When user rejects code changes:** Update documents consistently.
Repeat until user approves.

### 8. Surface Patterns for DES Consideration

Present discovered patterns to user for selection.

**Suggest new DES if:**
- Same approach used 2+ times in this delta
- Solves common problem that will recur
- Pattern should be consistent across codebase

**Suggest updating existing DES if:**
- Found better approach than documented
- Discovered exception case or limitation

User selects which patterns to document.
Create/update DES documents as approved.

### 9. Finalize

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS "✓ Implementation"
```

Present summary:
```
"Delta implementation complete:

ID: $ARGUMENTS

Next step: /katachi:reconcile-delta $ARGUMENTS (to update feature documentation)
```

Offer to commit: "Ready to commit this implementation?"

## Working with Decisions

**Using ADRs and DES:**
- Read all decisions listed in plan's checklist
- Follow constraints unless there's good reason to deviate
- If deviation needed: discuss with user, consider updating decision

**Referencing in Code:**
- Add comments ONLY when choice would be unclear without context
- Format: `// See [DECISION-ID]: [brief reason]`
- Don't reference obvious patterns

**Pattern Detection:**
- Watch for repeated code structures
- Notice cross-cutting concerns
- Suggest documentation when patterns should be consistent

## Workflow

**This is an autonomous implementation process:**
- Read documentation silently
- Implement all steps without asking questions
- Apply ADR and DES decisions
- Verify each step works
- Run code-reviewer validation
- Fix ALL issues automatically
- Present to user for final review
- Iterate based on feedback
- Surface patterns for DES
- Commit when approved
