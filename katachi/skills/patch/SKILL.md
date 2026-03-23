---
name: patch
description: |
  Apply a focused change using a compressed delta workflow. Reads project context
  (specs, designs, decisions), plans inline via plan mode, implements, and reconciles
  feature documentation in a single session without creating intermediate delta files.
argument-hint: "<change description | DELTA-ID>"
---

# Patch Workflow

Apply a focused change to the project using a compressed delta workflow. This skill runs the full spec → design → plan → implement → reconcile process in a single session without creating intermediate files. Can also accept a tracked delta ID to use its description and mark it as reconciled when done.

## Input

Change description or delta ID: $ARGUMENTS (optional — will prompt if not provided)

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles

### Reference Guides
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/technical-diagrams.md` - ASCII diagram guidance
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/code-examples.md` - Code snippet guidance

### Delta inventory
- `docs/planning/DELTAS.md` - Delta definitions (used for delta matching in Pre-Check and conflict awareness in Phase 1)

### Project documentation (read during Phase 1)
- `docs/feature-specs/README.md` + relevant feature specs
- `docs/feature-designs/README.md` + relevant feature designs
- `docs/architecture/README.md` + relevant ADRs
- `docs/design/README.md` + relevant DES patterns

## When to Use Patch vs Full Delta

**Use `patch` when ALL apply:**
- The change affects at most 2-3 feature areas
- Requirements are expressible in 1-3 sentences
- No significant design unknowns requiring spikes or external research
- Builds on existing patterns (ADRs/DES), doesn't establish new ones
- Can be planned, implemented, and reconciled in a single session

**Escalate to a full delta when ANY apply:**
- Introduces a new user-facing capability or significantly alters existing ones
- Multiple valid approaches need investigation (spikes)
- Will likely produce new ADRs or DES patterns
- Spans many feature areas or introduces cross-cutting concerns
- Has complex dependencies on in-flight deltas

**Delta-driven patches**: You can run patch with a delta ID (e.g., `/katachi:patch DLT-042`). This uses the delta's description as the change description and marks it as `✓ Reconciled` when done. Best for Easy-Medium complexity deltas that don't need the full multi-session workflow.

## Pre-Check

Verify framework is initialized:
- If `docs/planning/` doesn't exist, suggest `/katachi:init-framework` first
- If feature documentation structure is missing, explain what's needed

If no $ARGUMENTS provided, ask the user to describe the change they want to make.

### Free-Text Path

If $ARGUMENTS is free text (not a delta ID):

1. **Delta matching**: Scan `docs/planning/DELTAS.md` (already loaded as context) for existing deltas whose description closely matches the provided change description. If a match is found, use `AskUserQuestion` to offer treating it as a delta-driven patch:

   - Option A: "Yes, use DLT-042" — continue to the Delta-Driven Path below with the matched delta ID
   - Option B: "No, continue as an untracked patch" — proceed with the free-text description

   Include the delta's name, description, status, and complexity in the question context so the user can make an informed choice.

### Delta-Driven Path

If $ARGUMENTS looks like a delta ID (e.g., "DLT-042"), or the Free-Text Path matched an existing delta:

1. Fetch delta info:
   ```bash
   python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status show DELTA-ID
   ```

2. If the delta is not found, report the error and stop.

3. Extract the description, complexity, and dependencies from the output.

4. Check for existing work files for this delta: `docs/delta-specs/DELTA-ID.md`, `docs/delta-designs/DELTA-ID.md`, `docs/delta-plans/DELTA-ID.md`. If any exist, note them — they'll be used as additional context during Phase 1 research and Phase 3 planning.

5. If the description is empty, prompt the user for a change description.

6. Use the delta description as the change description for the rest of the workflow.

7. Note the delta ID and any existing work file paths in the scratchpad.

### Patch Fitness Assessment

After resolving the input (whether free-text or delta-driven), evaluate whether the change is suitable for the compressed patch workflow. Consider the change description's scope, and — if delta-driven — the delta's complexity, number of dependencies, and whether existing work files suggest deeper investigation was needed.

If the change appears too complex for a single-session patch (e.g., spans many feature areas, suggests architectural unknowns, Hard complexity, many dependencies), warn the user:

- **Delta-driven**: Recommend the full delta workflow instead (`/katachi:spec-delta DLT-042`). Ask if they want to continue as a patch anyway.
- **Free-text**: Recommend creating a tracked delta via `/katachi:add-delta` instead. Ask if they want to continue as a patch anyway.

Wait for user response. If they decline, stop.

## Scratchpad

Use `/tmp/patch-<animal-adjective>-state.md` for state tracking (animal-adjective pattern for parallel execution support).

Track:
- Delta ID (if patching a tracked delta)
- Existing delta work files found (if any)
- Change description
- Affected features discovered
- Plan file path
- Implementation progress
- Reconciliation decisions
- Issues encountered

## Process

### Phase 1: Research Context (Silent)

Read project documentation to understand the current state:

1. **Delta awareness**: Review `docs/planning/DELTAS.md` (already loaded as context) for in-flight work. Check for conflicts — if the patch modifies files being worked on by an in-flight delta (status is `⧗ ...`), warn the user about potential conflicts.

2. **Feature documentation**: Read `docs/feature-specs/README.md` and `docs/feature-designs/README.md` to identify affected features. Read the specific feature specs and designs relevant to the change.

3. **Project decisions**: Read `docs/architecture/README.md` and `docs/design/README.md`. Read full ADR/DES documents that are relevant to the affected areas.

4. **Existing delta work files** (delta-driven only): If the scratchpad notes existing work files (spec, design, plan) for this delta, read them. These provide valuable context from prior analysis — use them to inform scope assessment and planning.

5. **Source code**: Explore relevant source code in the affected areas to understand current implementation.

### Phase 2: Scope Assessment (Checkpoint)

After research, evaluate whether this change fits the patch model:

- Count affected feature areas (if > 3, likely too broad)
- Assess design clarity (are there unknowns that need spikes?)
- Check for potential new ADR/DES needs (new architectural decisions → full delta)
- Check for conflicts with in-flight deltas

If the change exceeds patch scope, present the finding to the user:

```
"This change appears more complex than a patch can handle:
- [reasons: e.g., 'affects 5 feature areas', 'needs investigation for approach X']

I recommend creating a delta instead. Based on what I've learned, the delta description would be:

[proposed delta description]

Would you like to:
A) Create a delta with /katachi:add-delta
B) Continue as a patch anyway"
```

### Phase 3: Inline Planning (Plan Mode)

Enter Claude's plan mode via `EnterPlanMode`. Research the codebase and draft a plan that compresses spec + design + plan into a single document.

The plan file follows this structure:

```markdown
# Patch: [change description]

## Change Summary
[1-3 sentences: what changes, why, who benefits]

## Requirements
- R1: [requirement]
- R2: ...

## Acceptance Criteria
- AC1: Given [context] When [action] Then [result]
- AC2: ...

## Affected Features
- [feature-spec path] — [Adds/Modifies/Removes]: [description]
- [feature-design path] — [Adds/Modifies/Removes]: [description]

## Design Approach
[How the change will be implemented. Reference existing ADR/DES where applicable.]

### Key Decisions
[Any decisions being made, with rationale. Reference existing ADR/DES.]

## Implementation Steps
1. [file]: [change description]
2. [file]: [change description]
3. ...

## Verification
- [ ] [how to verify each AC]

## Reconciliation Notes
- [feature-spec path]: [what to update]
- [feature-design path]: [what to update]
- [ADR/DES to update, if any]
```

Exit plan mode via `ExitPlanMode`.

### Phase 3b: Sequential Validation (Silent)

After exiting plan mode, validate the plan incrementally through 3 sequential reviews. All reviews are autonomous — the user only sees the final validated plan.

**Step 1: Spec Validation**

Dispatch `katachi:spec-reviewer` to validate the spec sections of the plan (Change Summary, Requirements, Acceptance Criteria, Affected Features):

```python
Task(
    subagent_type="katachi:spec-reviewer",
    prompt=f"""
Review this patch specification.

## Delta Description
{change_summary}

## Completed Spec
### Requirements
{requirements}

### Acceptance Criteria
{acceptance_criteria}

### Affected Features
{affected_features}

Note: This is a compressed patch spec (not a full delta spec). Review for
completeness, testability, and clarity at the level appropriate for a focused change.
There is no shape parts table or user flow — skip the Shape Quality and
UI Documentation review sections entirely. Focus on requirements and acceptance criteria quality.
"""
)
```

Apply all fixes to the plan. If reviewer feedback changes scope or requirements, note the adjustments for the next step.

**Step 2: Design Validation**

Dispatch `katachi:design-reviewer` to validate the design sections (Design Approach, Key Decisions), including the validated spec as context:

```python
Task(
    subagent_type="katachi:design-reviewer",
    prompt=f"""
Review this patch design.

## Delta Spec
{validated_spec_sections}

## Completed Design
### Design Approach
{design_approach}

### Key Decisions
{key_decisions}

## ADR Index Summary
{adr_index}

## DES Index Summary
{des_index}

Note: This is a compressed patch design (not a full delta design). Review for
coherence, pattern alignment, and completeness at the level appropriate for a
focused change. There is no shape parts table or UI Layout — focus on design
approach and decision quality.
"""
)
```

Apply fixes. If reviewer feedback reveals spec-level issues, go back to Step 1 and re-validate the spec.

**Step 3: Plan Validation**

Dispatch `katachi:plan-reviewer` to validate the implementation sections (Implementation Steps, Verification), including validated spec + design as context:

```python
Task(
    subagent_type="katachi:plan-reviewer",
    prompt=f"""
Review this patch implementation plan.

## Delta Spec
{validated_spec_sections}

## Delta Design
{validated_design_sections}

## Implementation Plan
### Implementation Steps
{implementation_steps}

### Verification
{verification}

## Relevant ADR/DES Summaries
{adr_des_summaries}

Note: This is a compressed patch plan (not a full delta plan with batches).
Review for acceptance criteria coverage, step completeness, and correct ordering.
There are no batches — all steps form a single sequence. Skip the Batch Context
Issues and Batch Boundary Issues review sections entirely. Focus on whether the
steps will satisfy the acceptance criteria and follow the design.
"""
)
```

Apply fixes. If reviewer feedback reveals design or spec issues, cascade back to the appropriate step and re-validate.

### Phase 4: User Review of Plan

Present the fully validated plan to the user. This is the single collaborative checkpoint — it replaces the multiple review rounds in separate spec/design/plan phases.

- Show the complete validated plan
- Highlight any assumptions or uncertainties
- Note any adjustments made during validation
- Ask: "Does this plan look right? What needs adjustment?"
- Iterate until approved

### Phase 5: Implementation

Implement the change following the approved plan:

1. Follow implementation steps from the plan
2. Follow relevant ADRs and DES patterns
3. Add code comments referencing decisions only when the choice would be unclear without context (`// See ADR-003 for why we use X instead of Y`)
4. Run tests, linting, and type checking
5. Fix any issues

Use scratchpad to track progress, issues encountered, and deviations from plan.

### Phase 6: Code Validation

Dispatch the code-reviewer agent to validate the implementation:

```python
Task(
    subagent_type="katachi:code-reviewer",
    prompt=f"""
Review this implementation.

## Delta Spec
{spec_sections_from_plan}

## Delta Design
{design_sections_from_plan}

## Implementation Plan
{implementation_steps_from_plan}

## Implemented Code
{code_diff}

## Relevant ADR/DES Documents
{adr_des_content}
"""
)
```

Auto-fix ALL issues identified by the reviewer. Re-run tests after fixes.
Do NOT ask user about fixes — fix everything autonomously.

Present the validated implementation to the user:
- Summarize what was implemented
- Highlight any deviations from plan (with rationale)
- Note any emergent patterns detected
- Invite feedback: "What needs adjustment in this implementation?"

Iterate based on user feedback until approved.

### Phase 7: Reconciliation

Update long-lived feature documentation and identify decisions.

#### 7.1 Analyze What Changed (Silent)

Compare implementation against the plan's "Affected Features" and "Reconciliation Notes":
- Review git diff or recent commits for this patch
- Identify what was actually built
- Note any deviations or additional impacts discovered during implementation

#### 7.2 Read Affected Feature Documentation (Silent)

For each feature path identified in affected features:
- Read current feature-specs/ files
- Read current feature-designs/ files
- Understand current state of documentation

#### 7.3 Draft Feature Documentation Updates

For each affected feature, determine update type:

- **Adds**: Create new sub-capability doc or add new section to existing doc
- **Modifies**: Update specific sub-sections that changed
- **Removes**: Mark capabilities as deprecated or remove sections

**Surgical change principle:**
- Focus changes on what the patch actually implemented
- For Adds: Insert new content without touching existing sections
- For Modifies: Update the specific sub-sections that changed; reorganize if relevant to the changes
- For Removes: Remove the deprecated items
- AVOID rewording or adjusting content "just because" — only change what's necessary
- Preserve existing narrative voice and structure for unchanged areas
- DO update any outdated information discovered during reconciliation

**Handle missing feature documentation:**
- If affected features reference a feature that doesn't exist, CREATE it
- If feature domain doesn't exist, create domain folder with README.md
- Create both spec and design for new features
- Follow nested structure (domain/sub-capability.md)

**Handle UI documentation (if present):**

For feature specs with breadboards:
- Merge new flows into existing User Flows section (or create section if missing)
- Update existing flows if modified
- Preserve flow descriptions (entry points, decision points, exit points)

For feature designs with wireframes:
- Merge new wireframes into existing UI Structure section (or create section if missing)
- Update existing wireframes if layouts changed
- Preserve layout explanations and state variations

If patch has NO UI documentation (technical change):
- Do NOT add empty UI Flow or UI Structure sections to feature docs
- Leave existing UI sections in feature docs unchanged

**Handle technical diagrams (if present):**

For feature designs with technical diagrams:
- Validate and adjust diagrams per `technical-diagrams.md` reference guide
- Merge into feature-designs where they aid understanding
- Do NOT create standalone diagram sections; embed inline

**Handle code examples (if present):**

For feature designs with code snippets:
- Validate and adjust per `code-examples.md` reference guide
- Ensure examples are minimal and generic (not codebase-specific)
- Merge into feature-designs only where genuinely helpful

#### 7.4 Analyze Decisions (Silent)

Extract decisions from the plan's Design Approach and Key Decisions sections, plus implementation patterns:

**ADR Promotion Criteria** — a decision warrants ADR when ALL apply:
1. **Hard to reverse**: Technology choices, architectural patterns, integration approaches
2. **Project-wide impact**: Affects multiple features, establishes precedent
3. **Not already documented**: No existing ADR covers it

**DES Promotion Criteria** — a pattern warrants DES when ALL apply:
1. **Repeatable**: Used 2+ times or solves cross-cutting concern
2. **Prescriptive value**: Helps ensure consistency across codebase
3. **Not already documented**: No existing DES covers it

**Detection signals:**

| Signal | Suggests |
|--------|----------|
| Decision mentions technology/framework/library | ADR |
| Decision has significant negative consequences | ADR |
| Same code structure appears 2+ times | DES |
| Decision solves logging, error handling, config | DES |

**Lightweight principle:**
- If only relevant to this feature → keep in feature-design only
- If pattern used once → no DES needed
- If easily reversible and local → no documentation needed
- When in doubt, ask the user

**Check existing decisions:**
- Read ADR index (`docs/architecture/README.md`)
- Read DES index (`docs/design/README.md`)
- Check if any decisions should update existing ADR/DES
- Skip decisions already covered

Prepare candidates with justification.

#### 7.5 Validate Decisions (Silent)

Dispatch the decision-reviewer agent:

```python
Task(
    subagent_type="katachi:decision-reviewer",
    prompt=f"""
Review these decision candidates from patch reconciliation.

## Change Summary
{change_summary}

## Design Approach (with Key Decisions)
{design_sections_from_plan}

## Implementation Summary
{implementation_summary}

## ADR Candidates
{adr_candidates}

## DES Candidates
{des_candidates}

## Proposed Updates to Existing Decisions
{decision_updates}

## Existing ADR Index
{adr_index}

## Existing DES Index
{des_index}
"""
)
```

Apply validation feedback:
- Remove rejected candidates
- Adjust classifications per recommendations
- Add any missed decisions identified by reviewer

#### 7.6 Validate Feature Documentation Updates (Silent)

Dispatch reviewer agents in parallel:

**Validate spec updates:**

```python
Task(
    subagent_type="katachi:spec-reviewer",
    prompt=f"""
Review these feature spec updates from patch reconciliation.

## Change Summary
{change_summary}

## Patch Spec
{spec_sections_from_plan}

## Proposed Feature Spec Updates
{proposed_spec_updates}

Verify that updates:
- Accurately reflect what was implemented
- Maintain consistency with existing feature specs
- Follow spec documentation patterns (user stories, behaviors, acceptance criteria)
- Preserve coherent narrative
"""
)
```

**Validate design updates:**

```python
Task(
    subagent_type="katachi:design-reviewer",
    prompt=f"""
Review these feature design updates from patch reconciliation.

## Patch Spec
{spec_sections_from_plan}

## Patch Design
{design_sections_from_plan}

## Proposed Feature Design Updates
{proposed_design_updates}

## ADR Index Summary
{adr_index}

## DES Index Summary
{des_index}

Verify that updates:
- Accurately reflect what was implemented
- Maintain design coherence and pattern alignment
- Follow design documentation patterns (components, data flow, decisions)
- Properly reference relevant ADRs and DES patterns
- Preserve coherent narrative
"""
)
```

Apply validation feedback from both reviewers.

#### 7.7 Present Reconciliation Proposal

Show complete update proposal to user:

```
"Reconciliation plan for patch:

## Feature Specs to Update:
- [domain/capability.md]: [summary of changes]

## Feature Designs to Update:
- [domain/capability.md]: [summary of changes]

## New Feature Docs to Create:
- [domain/README.md]: [description]

## Decision Candidates

### ADR Candidates
[For each candidate:]
- **[Decision Name]**
  - Summary: [What was decided]
  - Justification: [Why this warrants an ADR]
  - Proposed ID: ADR-NNN

### DES Candidates
[For each candidate:]
- **[Pattern Name]**
  - Found in: [file paths where pattern appears]
  - Summary: [What pattern was used]
  - Justification: [Why this warrants a DES]
  - Proposed ID: DES-NNN

### Updates to Existing Decisions
[For each update:]
- **[ADR/DES-NNN]: [Title]**
  - What changes: [description]
  - Why: [What this patch revealed]

[Show detailed diffs or full updated content for each file]

Which decision candidates should we create? Which updates should we apply?
What else needs adjustment in this reconciliation?"
```

Iterate based on user feedback until approved.

#### 7.8 Apply Updates

Once approved, update all affected documentation:

**Feature documentation:**
- Write/update feature-specs/ files
- Write/update feature-designs/ files
- Update README.md indexes

**Decision documents (if any approved):**

For each approved ADR candidate:
- Determine next ADR ID from `docs/architecture/`
- Create `docs/architecture/ADR-NNN-title.md` using ADR template
- Add entry to `docs/architecture/README.md`
- Update affected feature-designs to reference ADR-NNN

For each approved DES candidate:
- Determine next DES ID from `docs/design/`
- Create `docs/design/DES-NNN-pattern.md` using DES template
- Add entry to `docs/design/README.md`
- Update affected feature-designs to reference DES-NNN

For each approved update to existing decision:
- Update the ADR/DES document with the new information

#### 7.9 Mark Delta as Reconciled (Delta-Driven Only)

If this patch was initiated with a delta ID, mark the delta as reconciled:

```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set DELTA-ID "✓ Reconciled"
```

This removes the delta from DELTAS.md, cleans dependency references, and deletes any work files (specs, designs, plans) that existed for the delta.

### Phase 8: Summary

Do NOT offer to commit — the user decides when to commit.

Present summary:

```
"Patch complete:

Change: [description]
Delta: [DLT-XXX — marked as ✓ Reconciled] (only if delta-driven)
Files modified: [list]

Feature docs updated:
- [list of files]

Decision documents:
- [list of ADRs/DES created or updated, if any]"
```

## Edge Cases

**Change turns out to be bigger than expected during implementation:**
If implementation reveals more complexity than planned (new unknowns, more files affected, design decisions needed), pause and present the situation: "Implementation is revealing more complexity than planned. Should I continue as a patch, or would you like to create a delta to track this properly?"

**No feature documentation exists yet:**
If `docs/feature-specs/` is empty, reconciliation has nothing to update. Note: "No feature documentation exists yet. Consider using `/katachi:retrofit-spec` to document existing code, or use the full delta workflow for new features."

**Patch conflicts with in-flight delta:**
Warning only, not blocking: "DLT-042 is currently in ⧗ Implementation and modifies the same files. Proceed with caution." The user decides whether to continue.

**Reconciliation produces zero updates:**
If the patch is purely internal (refactoring, bug fix) and doesn't change any documented behavior, reconciliation may produce no updates. Explicitly state: "This change doesn't affect any documented feature behavior. No reconciliation updates needed." This is a valid outcome.

**Delta-driven patch with existing work files:**
If the delta already has spec, design, or plan files from a partially completed full workflow, use them as additional context during research (Phase 1) and planning (Phase 3). Note to the user what was found: "DLT-042 has existing work files (spec/design/plan) from a prior workflow — using them as context." These files will be cleaned up automatically when the delta is marked as reconciled.

## Workflow

**This is a compressed validate-first process:**
- Research context and assess scope
- Enter plan mode, draft compressed spec + design + plan
- Exit plan mode, validate sequentially (spec-reviewer → design-reviewer → plan-reviewer)
- Present validated plan to user for approval
- Implement autonomously
- Validate with code-reviewer, fix all issues, present to user
- Full reconciliation: draft updates, validate decisions + feature docs, present to user
- Apply approved updates
