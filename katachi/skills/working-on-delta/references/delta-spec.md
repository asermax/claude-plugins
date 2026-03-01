# Delta Spec: [DLT-ID] - [Title]

<!-- This spec describes WHAT the delta does, not HOW it's implemented. -->
<!-- Choose the appropriate story format based on delta type -->

## Story

<!-- For Feature Deltas (user-facing changes): -->
As a [user type], I want to [action] so that [benefit].

<!-- For Technical Deltas (tests, refactoring, infrastructure): -->
<!-- As a [developer/system/codebase], I need [technical change] so that [quality benefit]. -->

## What It Does

[2-3 sentences describing the change]

## Requirements

<!--
Built collaboratively during the user interview. States WHAT is needed, not HOW.
Status values: Core goal | Must-have | Nice-to-have | Out
Up to 30 top-level requirements. Use sub-IDs (R3.1, R3.2) for grouping sub-requirements.
Requirements define the problem space; Acceptance Criteria below define how to verify each one.
-->

| ID | Requirement | Status |
|----|-------------|--------|
| R0 | [core problem statement] | Core goal |
| R1 | [requirement] | Must-have |
| R2 | [requirement] | Nice-to-have |

## Acceptance Criteria

<!-- Grouped by requirement area. Each R should map to one or more AC groups. -->
<!-- For Feature Deltas: Describe end-to-end user flows -->
<!-- For Technical Deltas: Describe measurable completion criteria -->

- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]
- [ ] [Error/Edge case]: Given [condition], then [behavior]

<!-- Technical Delta examples:
- [ ] Test coverage for [module] reaches [X]%
- [ ] All existing tests continue to pass after refactoring
- [ ] [Metric] improves by at least [X]%
-->

## User Flow

<!--
CONDITIONAL SECTION - Include ONLY if this delta involves user interaction flows.
DELETE this entire section for: technical deltas, bug fixes, API-only changes.

For complete breadboarding guide, see:
${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/breadboarding.md
-->

### Breadboard: [Flow Name]

```
  Place Name
  ----------
  - affordance 1
  - affordance 2
       |
       v
  Next Place
  ----------
```

### Flow Description

<!-- REQUIRED: The diagram alone is not enough - explain the flow in prose -->

**Entry point**: [How/when does the user enter this flow?]

**Happy path**: [Describe the main successful journey through the flow]

**Decision points**: [What choices does the user make? What determines branching?]

**Exit points**: [Where/how does this flow end?]

## Requires

Dependencies:
- [DLT-XXX] or "None"

---

## Detected Impacts

<!-- This section is populated automatically during spec phase -->

### Affected Features
- **[path/to/feature.md]** - [Modifies/Adds/Removes]: [description]

### Notes for Reconciliation
- [What needs to change in feature docs]
- [New docs that need to be created]
