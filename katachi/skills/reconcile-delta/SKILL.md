---
name: reconcile-delta
description: Reconcile delta implementation into feature documentation
argument-hint: "[DELTA-ID]"
disable-model-invocation: true
---

# Delta Reconciliation Workflow

Reconcile a completed delta implementation into the long-lived feature documentation.

## Input

Delta ID: $ARGUMENTS (e.g., "DLT-001")

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles
- `katachi:working-on-delta` - Per-feature workflow

### Reference Guides
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/technical-diagrams.md` - ASCII diagram guidance
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/code-examples.md` - Code snippet guidance

### Delta documents
- `docs/delta-specs/$ARGUMENTS.md` - Delta specification with detected impacts
- `docs/delta-designs/$ARGUMENTS.md` - Delta design with detected impacts
- `docs/delta-plans/$ARGUMENTS.md` - Implementation plan
- Implementation code (git diff or recent commits)

### Feature documentation
- `docs/feature-specs/` - Long-lived feature specifications to update
- `docs/feature-designs/` - Long-lived feature designs to update

## Pre-Check

Verify delta is implemented:
- If delta status is not "✓ Implementation", suggest `/katachi:implement-delta $ARGUMENTS` first
- Reconciliation requires completed implementation

## Process

### 1. Gather Delta Context (Silent)

Read all delta working documents:
- `docs/delta-specs/$ARGUMENTS.md`
- `docs/delta-designs/$ARGUMENTS.md`
- `docs/delta-plans/$ARGUMENTS.md`

Extract **Detected Impacts** sections from spec and design.
Build complete picture of what was implemented and what features are affected.

**Extract UI documentation (if present):**
- User Flow section from delta spec (breadboards and flow descriptions)
- UI Layout section from delta design (wireframes and layout explanations)
- Note: These may not be present for technical/non-UI deltas

### 2. Analyze Implementation (Silent)

Review actual implementation:
- Get recent commits or git diff for this delta
- Identify what was actually built
- Compare with planned impacts
- Note any deviations or additional impacts discovered during implementation

### 3. Read Affected Feature Documentation (Silent)

For each feature path identified in detected impacts:
- Read current feature-specs/ files
- Read current feature-designs/ files
- Understand current state of documentation

### 4. Draft Feature Documentation Updates

For each affected feature:

**Determine update type:**
- **Adds**: Create new sub-capability doc or add new section to existing doc
- **Modifies**: Update existing behavior descriptions, acceptance criteria, design approach
- **Removes**: Mark capabilities as deprecated or remove sections

**Surgical change principle:**
- Focus changes on what the delta actually implemented or discovered issues with
- For Adds: Insert new content without touching existing sections
- For Modifies: Update the specific sub-sections that changed; reorganize if relevant to the changes
- For Removes: Remove the deprecated items
- AVOID rewording or adjusting content "just because" - only change what's necessary
- Preserve existing narrative voice and structure for unchanged areas
- DO update any outdated information discovered during reconciliation (even if not explicitly part of the delta)

**Handle missing feature documentation:**
- If detected impacts reference a feature that doesn't exist, CREATE it
- If feature domain doesn't exist, create domain folder with README.md
- Create both spec and design for new features
- Follow nested structure (domain/sub-capability.md)

**Draft complete updates:**

For feature specs:
- Update user stories if needed
- Add/modify behaviors and acceptance criteria
- Update overview sections

For feature designs:
- Update design overview, components, data flow as needed
- Add/modify key decisions
- Update system behavior scenarios

For domain READMEs:
- Update sub-capability tables
- Add new capabilities to index
- Update status indicators

**Handle UI documentation (if present in delta):**

For feature specs with breadboards:
- Validate breadboards per `breadboarding.md` reference guide
- Merge new flows into existing User Flows section (or create section if missing)
- Update existing flows if modified
- Preserve flow descriptions (entry points, decision points, exit points)
- If feature spec doesn't have User Flows section and delta has breadboard, ADD the section

For feature designs with wireframes:
- Validate wireframes per `wireframing.md` reference guide
- Merge new wireframes into existing UI Structure section (or create section if missing)
- Update existing wireframes if layouts changed
- Preserve layout explanations and state variations
- If feature design doesn't have UI Structure section and delta has wireframes, ADD the section

If delta has NO UI documentation (technical delta):
- Do NOT add empty UI Flow or UI Structure sections to feature docs
- Leave existing UI sections in feature docs unchanged

**Handle technical diagrams (if present in delta):**

For feature designs with technical diagrams (state, flow, sequence, ERD):
- Validate and adjust diagrams per `technical-diagrams.md` reference guide
- Extract from delta-design sections: Modeling, Data Flow, System Behavior, Components
- Merge into feature-designs where they aid understanding
- Preserve diagram explanations and context
- Skip for deltas that don't have technical diagrams
- Do NOT create standalone diagram sections; diagrams should be embedded inline

**Handle code examples (if present in delta):**

For feature designs with code snippets:
- Validate and adjust per `code-examples.md` reference guide
- Ensure examples are minimal and generic (not codebase-specific)
- Extract API contracts and validation examples
- Merge into feature-designs only where genuinely helpful
- Skip if prose and diagrams are sufficient

**Create new feature docs if needed:**
- When delta creates an entirely new capability domain
- Follow nested structure: feature-specs/[domain]/README.md + sub-capability docs
- Mirror structure in feature-designs/
- Include UI Flow/Structure sections if delta has them

### 5. Analyze Decisions (Silent)

Analyze delta-design's "Key Decisions" section and implementation patterns for ADR/DES candidates.

**Extract decisions from delta-design:**
- Read each decision in the "Key Decisions" section
- Apply promotion criteria (see Decision Detection section)
- Flag decisions that warrant ADR or DES

**Detect implementation patterns:**
- Compare implementation code against delta-design
- Identify repeated code structures (same pattern 2+ times)
- Note cross-cutting patterns (logging, error handling, config)

**Check existing decisions:**
- Read ADR index (docs/architecture/README.md)
- Read DES index (docs/design/README.md)
- Check if any delta decisions should update existing ADR/DES
- Skip decisions already covered by existing ADR/DES

**Prepare candidates:**
- ADR candidates: Decisions that are hard-to-reverse and project-wide
- DES candidates: Repeatable patterns used 2+ times
- Updates: Existing ADR/DES that need modification based on this delta

### 6. Validate Decisions (Silent)

Dispatch the decision-reviewer agent to validate decision candidates:

```python
Task(
    subagent_type="katachi:decision-reviewer",
    prompt=f"""
Review these decision candidates from delta reconciliation.

## Delta Spec
{delta_spec}

## Delta Design (with Key Decisions)
{delta_design}

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

### 7. Validate Updates (Silent)

Dispatch reviewer agent to validate the proposed updates:

```python
Task(
    subagent_type="katachi:spec-reviewer",
    prompt=f"""
Review these feature documentation updates from delta reconciliation.

## Delta Spec
{delta_spec}

## Delta Design
{delta_design}

## Implementation Summary
{implementation_summary}

## Proposed Feature Spec Updates
{proposed_spec_updates}

## Proposed Feature Design Updates
{proposed_design_updates}

Verify that updates:
- Accurately reflect what was implemented
- Maintain consistency with existing documentation
- Follow documentation patterns
- Preserve coherent narrative
"""
)
```

Apply validation feedback to improve proposed updates.

### 8. Present Proposal for Review

Show complete update proposal to user:

```
"Reconciliation plan for DLT-XXX:

## Feature Specs to Update:
- [domain/capability.md]: [summary of changes]
- ...

## Feature Designs to Update:
- [domain/capability.md]: [summary of changes]
- ...

## New Feature Docs to Create:
- [domain/README.md]: [description]
- [domain/capability.md]: [description]
- ...

## Decision Candidates

### ADR Candidates
[For each candidate:]
- **[Decision Name]**
  - Summary: [What was decided]
  - Justification: [Why this warrants an ADR - hard to reverse / project-wide]
  - Proposed ID: ADR-NNN

  [Context, choice, alternatives, consequences from delta-design]

### DES Candidates
[For each candidate:]
- **[Pattern Name]**
  - Found in: [file paths where pattern appears]
  - Summary: [What pattern was used]
  - Justification: [Why this warrants a DES - repeated / cross-cutting]
  - Proposed ID: DES-NNN

  [Pattern description with do/don't examples from implementation]

### Updates to Existing Decisions
[For each update:]
- **[ADR/DES-NNN]: [Title]**
  - What changes: [description]
  - Why: [What this delta revealed]

[Show detailed diffs or full updated content for each file]

Which decision candidates should we create? Which updates should we apply?
What else needs adjustment in this reconciliation?"
```

Invite feedback and discuss any questions.

### 9. Iterate Based on Feedback

Apply user corrections or changes to proposed updates.
Re-present updated sections if significant changes.
Repeat until user approves the reconciliation.

### 10. Apply Updates

Once approved, update all affected documentation:

**Feature documentation:**
- Write/update feature-specs/ files
- Write/update feature-designs/ files
- Update README.md indexes

**Decision documents (if any approved):**

For each approved ADR candidate:
- Determine next ADR ID from docs/architecture/
- Create docs/architecture/ADR-NNN-title.md using ADR template
- Add entry to docs/architecture/README.md
- Update affected feature-designs to reference ADR-NNN

For each approved DES candidate:
- Determine next DES ID from docs/design/
- Create docs/design/DES-NNN-pattern.md using DES template
- Add entry to docs/design/README.md
- Update affected feature-designs to reference DES-NNN

For each approved update to existing decision:
- Update the ADR/DES document with the new information
- Do NOT reference the delta ID (deltas are working documents that will be deleted)

### 11. Mark Delta as Reconciled

Update delta status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS "✓ Reconciled"
```

Present summary:
```
"Reconciliation complete for DLT-XXX:

Updated feature specs:
- [list of files]

Updated feature designs:
- [list of files]

Created new feature docs:
- [list of files]

Created decision documents:
- [list of ADRs/DES created]

Updated decision documents:
- [list of ADRs/DES updated]

Feature documentation is now current with implementation."
```

## Decision Detection

### ADR Promotion Criteria

A decision warrants ADR when ALL of these apply:
1. **Hard to reverse**: Technology choices, architectural patterns, integration approaches
2. **Project-wide impact**: Affects multiple features, establishes precedent
3. **Not already documented**: No existing ADR covers it

### DES Promotion Criteria

A pattern warrants DES when ALL of these apply:
1. **Repeatable**: Used 2+ times or solves cross-cutting concern
2. **Prescriptive value**: Helps ensure consistency across codebase
3. **Not already documented**: No existing DES covers it

### Detection Signals

| Signal | Suggests |
|--------|----------|
| Decision mentions technology/framework/library | ADR |
| Decision has significant negative consequences | ADR |
| Same code structure appears 2+ times | DES |
| Decision solves logging, error handling, config | DES |

### Lightweight Principle

Not every decision needs promotion:
- If only relevant to this feature → keep in feature-design only
- If pattern used once → keep in delta-design only
- If easily reversible and local → no documentation needed
- When in doubt, ask the user

Reference `decision-types.md` for the full decision tree.

## Workflow

**This is a validate-first process:**
- Gather all delta context silently
- Read affected feature docs
- Draft complete updates
- Analyze decisions for promotion candidates
- Validate decisions with decision-reviewer agent
- Validate feature updates with spec-reviewer agent
- Present to user for approval (including decision candidates)
- Iterate based on feedback
- Apply all updates when approved (features + decisions)
- Mark delta as reconciled
