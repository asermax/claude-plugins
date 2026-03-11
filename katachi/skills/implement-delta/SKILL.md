---
name: implement-delta
description: Implement a delta following its plan
argument-hint: "[DELTA-ID]"
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
- Feature specs define what behavior to implement
- Feature designs define architectural patterns to follow

## Pre-Check

Verify all documentation exists:
- If spec/design/plan missing, suggest running appropriate commands first
- Plan is the primary guide for implementation

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS "⧗ Implementation"
```

## Working with Batches

The implementation plan is organized into batches — scoped groups of steps with their own context and dependencies. Before implementing, understand how to work with them:

### Context & Research entries

Each batch lists the documents, code files, and research pointers it needs. These are a **starting point, not a contract**:
- **Read** the listed entries before starting the batch
- **Adapt as you go**: remove entries that turn out to be irrelevant, add files you discover during implementation, update references if earlier batches produced different output than planned
- **Follow research pointers**: when a context entry points to library docs or an existing pattern, look it up. This is how you learn what you need to implement correctly
- **Write findings back**: when research reveals important information (API behavior, library patterns, design constraints), write those findings to the design doc (`docs/delta-designs/$ARGUMENTS.md`) for later reconciliation. This is critical — implementation knowledge must flow back to documentation

### Batch status tracking

Update each batch's status marker in the plan file (`docs/delta-plans/$ARGUMENTS.md`) as you progress:
- `⧗ Pending` — not yet started
- `⧗ Implementing` — currently in progress
- `✓ Done` — all steps completed and verified

### Living documents

If a different approach is needed for valid reasons during implementation:
- Update the relevant document (spec/design/plan) immediately
- Then proceed with the new approach
- This applies to batch context entries too — update them to reflect reality

## Execution Mode

Read the implementation plan and analyze batch dependencies (`Depends on:` fields).

- **If all batches are sequential** (each depends on the previous) → execute batches one at a time as the single agent
- **If independent batches exist** (batches with no cross-dependencies) → spawn parallel agents, one per independent batch

---

## Sequential Execution

Used when batches form a dependency chain. The lead agent implements everything directly.

### 1. Process Each Batch

For each batch in dependency order:

1. **Mark batch** as `⧗ Implementing` in the plan file
2. **Load context**: Read the batch's Context & Research entries. For ADRs/DES, read the full documents, not just indexes
3. **Research**: Follow research pointers — look things up, investigate patterns, read library docs. Write important findings to the design doc
4. **Implement steps**: Work through the batch's steps autonomously
   - Follow relevant decisions (ADRs/DES)
   - Add code comments referencing decisions when the choice would be unclear without context (`// See ADR-003 for why we use X instead of Y`)
   - Verify each step works before proceeding
5. **Mark batch** as `✓ Done` in the plan file
6. **Adapt next batches**: If this batch's output differs from what was planned, update context entries in subsequent batches before starting them

Use scratchpad `/tmp/implement-$ARGUMENTS-state.md` to track:
- Current batch and step
- Issues encountered
- Patterns detected
- Deviations from plan
- Research findings

### 2. Verify Acceptance Criteria

After all batches are done:
- Run all tests
- Run linting and type checking (fix any issues)
- Perform manual checks against spec
- Ensure all acceptance criteria are met

### 3. External Validation

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

### 4. Fix All Issues Found by Agent

Automatically address ALL issues identified in validation:
- Missing acceptance criteria coverage
- Design misalignment
- Pattern violations
- Code quality issues
- Missing decision references
- Missing documentation updates

Re-run tests after fixes.
Do NOT ask user — fix everything autonomously.

### 5. Present for User Review

Show complete implementation to user:
- Summarize what was implemented
- Highlight any deviations from plan (with rationale)
- Note any emergent patterns detected
- Note any research findings written back to design doc

Invite feedback: "What needs adjustment in this implementation?"

### 6. Iterate Based on User Feedback

Apply user corrections or changes.
Re-test after changes.
**When user rejects code changes:** Update documents consistently.
Repeat until user approves.

### 7. Surface Patterns for DES Consideration

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

### 8. Finalize

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

---

## Parallel Execution

Used when the plan contains independent batches (batches without cross-dependencies). The lead agent orchestrates agents rather than implementing directly.

### 1. Analyze Batch Dependencies

Read all batches and their `Depends on:` fields. Identify:
- **Independent batches**: No dependencies on each other — can run in parallel
- **Dependent batches**: Must wait for their dependencies to complete

Group into execution waves:
- Wave 1: All batches with no dependencies
- Wave 2: Batches that depend only on Wave 1 batches
- Continue until all batches are scheduled

### 2. Set Up Team and Tasks

1. Create team with `TeamCreate` (name: `dlt-<delta-id>-implementation`)
2. Create **one task per batch** using the batch scope as the task description
3. Set up task dependencies matching the batch `Depends on:` fields
4. Assign independent batches to separate agents

### 3. Spawn Agents for Independent Batches

Spawn agents **in parallel** (single message, multiple Agent tool calls) with:
- `subagent_type`: `"general-purpose"`
- `model`: `"sonnet"` (unless user specifies otherwise)
- `mode`: `"bypassPermissions"`
- `team_name`: the team name from step 2
- `run_in_background`: `true`

Each agent's prompt must include:
- Their batch assignment (e.g., "You are implementing Batch 2: Search Endpoint for DLT-054")
- Instructions to:
  - Read the plan (`docs/delta-plans/$ARGUMENTS.md`) — specifically their batch section
  - Read the spec and design documents
  - Load their batch's Context & Research entries (read full ADR/DES documents, not just indexes)
  - Follow research pointers and write findings to the design doc
  - Implement their batch's steps autonomously
  - Mark batch as `✓ Done` in the plan file when complete
  - Message `team-lead` for any decisions not covered by the documentation
  - Run verification for their area (test, typecheck, lint)
- The project's coding style guidelines (copy relevant sections from CLAUDE.md)

### 4. Monitor, Coordinate, and Execute Dependent Batches

After spawning agents:
- Respond to agent questions about decisions not covered by documentation
- Monitor task progress via `TaskList`
- When independent batches complete, spawn agents for newly unblocked dependent batches
- Does NOT implement code directly — delegate mode

### 5. Verify and Review

Once all batches are complete:
- Run full test suites for all affected areas
- Run linting and type checking across the whole project
- Fix any integration issues between agent outputs

Then follow steps 3-8 from Sequential Execution (external validation, fix issues, present to user, iterate, surface patterns, finalize).

---

## Working with Decisions

**Using ADRs and DES:**
- Read all decisions referenced in the current batch's context
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

**Batch-by-batch implementation:**
- Read plan and analyze batch dependencies
- For each batch: load context, research, implement steps, mark done
- If independent batches exist: spawn parallel agents per batch
- After all batches: verify acceptance criteria
- Run code-reviewer validation
- Fix ALL issues automatically
- Present to user for final review
- Iterate based on feedback
- Surface patterns for DES
- Commit when approved
