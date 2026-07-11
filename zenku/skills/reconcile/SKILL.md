---
name: reconcile
description: |
  Fold what was actually built back into the durable feature spec and design so they describe the present, and promote implementation-time decisions into ADRs/DES. Use when the user wants to "reconcile a feature", "update the docs to match what I built", or "sync docs after implementation". Surgical updates only — no rewriting for its own sake.
---

# Feature Reconciliation Workflow

Fold what was **actually built** back into the long-lived feature docs so they
describe the **present**, and promote any decisions made during implementation
into new/updated ADRs and DES. In this track the feature spec and design ARE
the durable docs — there is no ephemeral tier to discard. Reconciliation is a
**surgical update**: change only what the implementation changed.

**Project extensions:** if `.zenku/reconcile.md` exists, read it up front and
fold its steps in where it indicates. See the project-extension-hooks section
in `zenku:framework-core`.

## Input

The just-implemented feature. Identify it from `$ARGUMENTS` or the user's request.

## Context

**Load these skills and read these files before proceeding.**

### Skills
- `zenku:framework-core` — collaborative workflow principles + the document-the-present principle

### Durable docs (updated in place to describe the present)
- `docs/feature-specs/<feature>.md`
- `docs/feature-designs/<feature>.md`

### Decisions
- `docs/architecture/` — existing ADRs
- `docs/design/` — existing DES patterns

### Templates
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/ADR-template.md`
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/DES-template.md`

## Pre-Check

- If the feature is not marked `✓ Implemented` in `docs/planning/ROADMAP.md`, suggest running `zenku:implement <feature>` first — reconciliation follows a completed implementation.

## Process

### 1. Gather Context (Silent)

- Read the current `docs/feature-specs/<feature>.md` and `docs/feature-designs/<feature>.md`.
- Get the actual implementation: `git diff` / `git diff --staged`, or
  `git diff origin/main...HEAD` on a feature branch, plus recent commits.
- Note any updates the implementer already wrote back into the design (living
  doc) and any findings recorded in the scratchpad.

### 2. Compare Built vs Documented (Silent)

Identify where the implementation diverged from what the spec/design describe:
- Behavior that changed, was added, or was dropped versus the spec
- Approach, components, data flow, or decisions that differ from the design
- Constraints or findings the build discovered that the docs don't yet state

This diff is the *only* thing you touch. If a doc section still matches the
code, leave it exactly as is.

### 3. Draft Surgical Updates

For the feature spec and feature design, update **only** the sections the
implementation changed. Apply the surgical-change principle:
- For added behavior: insert new content without disturbing untouched sections
- For changed behavior: update the specific sub-section only; keep unchanged
  prose, voice, and structure intact
- For dropped behavior: remove it (don't annotate it as removed)
- Do NOT reword or "improve" sections that still describe the code correctly

**Document the present, not the past** (`zenku:framework-core`): the docs must
read as a description of the current system. No "previously / used to / no
longer / replaced by" phrasing. Frame decisions positively; record rejected
alternatives as "considered and not chosen", not as things removed. If the
spec's requirements/AC changed, keep each requirement's **Evidence link**
intact — a requirement that changed still traces to its experiment (or is newly
`New` if the build introduced it).

### 4. Promote Decisions (Collaborative)

Review decisions made *during implementation* (from the divergences, the
living-design updates, and repeated code structures) for promotion:
- **ADR** — a hard-to-reverse, project-wide choice made during the build that
  isn't already covered by an ADR
- **DES** — a repeatable pattern (2+ uses / cross-cutting) that emerged in the code

Also check whether the build **invalidated or extended an existing** ADR/DES —
if so, that document needs updating. Propose all candidates to the user before
creating anything (propose, don't decide). Keep it lightweight: local,
one-off, or easily-reversible decisions need no promotion.

### 5. External Validation (Silent)

Dispatch the reconciliation-reviewer:

```python
Task(
    subagent_type="zenku:reconciliation-reviewer",
    prompt=f"""
Review these reconciliation updates.

## Implementation (actual diff)
{code_diff}

## Current Feature Spec + Design (before updates)
{current_docs}

## Proposed Surgical Updates (spec + design)
{proposed_updates}

## Decision Candidates (new/updated ADR/DES)
{decision_candidates}

Verify:
- The updated docs describe the PRESENT built state accurately
- Changes are surgical — only what the implementation changed was touched
- No information was lost from sections that should have been preserved
- No backward-looking phrasing crept in; decisions framed positively
- Requirement Evidence links preserved
- ADR/DES classification is right (ADR = hard-to-reverse project-wide; DES = repeatable)
"""
)
```

### 6. Apply Feedback (Silent)

Apply ALL reconciliation-reviewer recommendations automatically. Use
AskUserQuestion only when a fix requires a genuine choice.

### 7. Present the Proposal

Show the update proposal to the user:
```
"Reconciliation plan for <feature>:

## Spec updates
- [section]: [what changed and why]

## Design updates
- [section]: [what changed and why]

## Decision candidates
- ADR-NNN <title> — [justification: hard-to-reverse, project-wide]
- DES-NNN <title> — [justification: repeatable / cross-cutting]
- Update to [existing ADR/DES]: [what the build revealed]

[Show the diffs / full updated sections]

Which decision candidates should we create? What else needs adjustment?"
```

Invite feedback and discuss.

### 8. Iterate, Then Apply

Apply the user's corrections. When approved:
- Write the surgical updates to `docs/feature-specs/<feature>.md` and `docs/feature-designs/<feature>.md`
- For each approved ADR: determine the next `NNN`, create `docs/architecture/ADR-NNN-<slug>.md` from the template, cite the experiment(s) where relevant, and reference it from the feature design
- For each approved DES: same, under `docs/design/DES-NNN-<slug>.md`
- For each approved update to an existing decision: update that document in place (describe the current decision; do not annotate the change)

Mark the feature `✓ Reconciled` in `docs/planning/ROADMAP.md`.

Present a summary:
```
"Reconciliation complete for <feature>.

Updated: docs/feature-specs/<feature>.md, docs/feature-designs/<feature>.md
Created: [ADRs/DES]
Updated decisions: [ADRs/DES]

Durable docs now describe the present built state."
```

## Workflow

- Diff **built vs documented**; that diff is the only thing you touch
- Update the feature spec + design **surgically** so they describe the present (no backward-looking prose)
- Promote implementation-time decisions to ADR/DES **with** the user; preserve requirement Evidence links
- Validate silently with `zenku:reconciliation-reviewer` (present state, surgical, no loss)
- Present, iterate, apply; mark the feature reconciled
