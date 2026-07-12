---
name: patch
description: |
  Apply a focused change through a compressed single-session workflow — research, plan (spec + design fused), implement, and reconcile in one pass with a single collaborative checkpoint and no intermediate files. Use when the user wants to "patch", "make a quick change", "make a focused change", "small fix", or handle a small piece of an experiment/feature without running the full roadmap → spec → design → implement → reconcile chain. Accepts a free-text change, a roadmap feature, or an experiment to ground the change in.
---

# Patch Workflow

Apply a focused change to the project through a **compressed single-session workflow**: research context → plan (spec + design fused into one document) → implement → reconcile, with a single collaborative checkpoint and no intermediate files. This is the compressed alternative to the full product chain (`roadmap → spec → design → implement → reconcile`) for changes small enough to plan, build, and reconcile in one pass.

It does not skip discipline — it collapses it. The spec and design are fused into one plan-mode document, validated silently before you ever see it; implementation and reconciliation still run their review loops. What you lose versus the full chain is the intermediate artifacts and the separate review rounds, not the rigor.

**Project extensions:** if `.zenku/patch.md` exists, read it up front and fold its steps in where it indicates (a project uses this for its own build/verify/graduation conventions). See the project-extension-hooks section in `zenku:framework-core`.

## Input

The change to make: `$ARGUMENTS` — a free-text change description, a roadmap feature, or an experiment reference (optional; prompt if not provided). All three converge on the same workflow; the input only determines where the evidence comes from.

## Context

**Load this skill and read these files before proceeding.**

### Skills
- `zenku:framework-core` — collaborative workflow principles + project conventions (build/test/lint commands, source layout, content principles)

### Project state (read during research, once grounding is resolved)
- `docs/planning/ROADMAP.md` — locate a feature target; follow its link to a `PRODUCT.md` piece
- `PRODUCT.md` — promoted pieces and their links to source experiments
- `experiments/NNN-slug/README.md` + `LEARNINGS.md` — evidence for an experiment-grounded patch
- `docs/feature-specs/<feature>.md` + `docs/feature-designs/<feature>.md` — the affected durable docs
- `docs/architecture/` (ADRs) + `docs/design/` (DES) — decisions the affected areas build on (read full docs)

### Templates
All under `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/` — used for the reconciliation output shapes:
- `feature-spec-template.md`, `feature-design-template.md`
- `ADR-template.md`, `DES-template.md`
- `doc-index-templates.md` — the folder index shapes to keep current on reconcile

## When to Use Patch vs the Full Chain

**Use `patch` when ALL apply:**
- The change is a focused modification to something that already exists, or an experiment-proven piece small enough for one session
- It affects at most 2–3 feature areas
- Requirements are expressible in 1–3 sentences
- No design unknowns that need a spike or external investigation
- It builds on existing ADR/DES patterns rather than establishing new ones

**Escalate when ANY apply:**
- It introduces a genuinely new, unvalidated user-facing capability → this belongs in the **experiment track first** (`/zenku:capture` → `/zenku:experiment-start`); in zenku, validation lives in experiments, not in a design gate
- Multiple valid approaches need investigating (a spike)
- It will likely establish new ADRs/DES patterns
- It spans many feature areas or introduces a new cross-cutting concern

In those cases, use the full chain (`/zenku:roadmap` → `/zenku:spec` → `/zenku:design` → `/zenku:implement` → `/zenku:reconcile`) or the experiment track.

## Pre-Check

- **Framework initialized?** If there is no `## zenku` section in the project's `CLAUDE.md` and no docs tree, offer to run `zenku:init` first (see the state detection in `zenku:framework-core`).
- If no `$ARGUMENTS`, ask the user to describe the change.
- Read the `## zenku` section of the project's `CLAUDE.md` for the build/test/lint commands and source layout. If they are not documented, ask once before running anything (as `zenku:implement` does).

### Resolve Grounding (one converging flow)

Determine where the patch's evidence comes from. All paths converge on the same Process below — grounding only changes what fills the Requirements table's `Evidence` column and whether a roadmap marker moves.

- **Experiment reference** (`$ARGUMENTS` names an experiment — "experiment 4", "exp 004", an `NNN-slug`, or an `experiments/` path) → **experiment-grounded**. Read that one-pager, its `LEARNINGS.md` entry, and the `PRODUCT.md` piece it feeds. Evidence for requirements traces to that experiment.
- **Roadmap feature** (`$ARGUMENTS` matches a feature slug in `ROADMAP.md`) → **feature-grounded**. Follow the feature to its existing spec and `PRODUCT.md` piece for evidence. This target drives the ROADMAP markers.
- **Free text** → scan `ROADMAP.md` and `PRODUCT.md` for a closely matching feature or promoted piece. If one matches, use `AskUserQuestion` to offer upgrading to a grounded patch (show the feature/piece name, its status, and its evidence); else proceed **ungrounded** — requirements will mostly be `New`.

### Patch Fitness Assessment

Judge whether the change fits the compressed workflow:

- **Genuinely new, unvalidated capability?** Steer to the experiment track: "This looks like a new capability rather than a focused change. In zenku, we validate that in an experiment before building it durably — I'd suggest `/zenku:capture` then `/zenku:experiment-start`. Want to do that, or continue as a patch anyway?"
- **Merely too big for one session** (many feature areas, needs a spike, likely new ADR/DES)? Recommend the full chain: "This is larger than a patch — I'd recommend `/zenku:roadmap` / `/zenku:spec` to track it properly. Continue as a patch anyway?"

Wait for the user's response. If they decline, stop. If they insist, continue.

Once resolved: if the patch is feature-grounded **and** the target is on `ROADMAP.md`, mark that feature `⧗` in `docs/planning/ROADMAP.md`.

## Scratchpad

Use `/tmp/zenku-patch-<id>-state.md` (id = the feature name, the experiment number, or an animal-adjective for parallel-safe runs). Track: grounding (experiment / feature / ungrounded), change description, affected features discovered, the plan, implementation progress and deviations, reconciliation decisions.

## Process

### 1. Research Context (Silent)

Build understanding before drafting anything:
- Read the affected `docs/feature-specs/` and `docs/feature-designs/` docs.
- Read the full ADR/DES documents the affected areas build on — follow their constraints.
- Read the grounding evidence: the experiment one-pager + `LEARNINGS.md` entry (+ `PRODUCT.md` piece), or the feature's existing spec + `PRODUCT.md` piece. Do **not** re-litigate a concluded experiment's verdict — treat it as settled evidence.
- Explore the source code in the affected areas to understand the current implementation.
- If the change touches any external library/framework, verify current APIs (use `superpowers:using-live-documentation` if available) — wrong API usage costs more to fix than a quick check.

### 2. Plan — Spec + Design Fused (Plan Mode)

Enter plan mode via `EnterPlanMode`. Draft **one document** that fuses the spec and the design (zenku has no separate plan tier). Honor the content principles from `zenku:framework-core`: present tense, self-sufficient prose, provenance confined to the `Grounded in` header and the `Evidence` column/lines.

```markdown
# Patch: <change description>

**Grounded in:** <experiment(s) / roadmap feature this traces to, or "ungrounded / ad-hoc">

## Change Summary
<1–3 sentences: what changes, why, who benefits>

## Requirements
| # | Requirement | Status | Evidence |
|---|-------------|--------|----------|
| R1 | ... | Core goal / Must-have / Nice-to-have | exp 004 / feature-spec / New |

## Acceptance Criteria
- AC1: Given <context> When <action> Then <result>

## Affected Features
- docs/feature-specs/<feature>.md — Adds / Modifies / Removes: <what>
- docs/feature-designs/<feature>.md — Adds / Modifies / Removes: <what>

## Design Approach
<How the change is implemented. Reference existing ADR/DES. Present tense. When it
involves library APIs, reflect the current documentation.>

### Key Decisions
- <choice> — <self-sufficient reason>. Evidence: <exp NNN / New>. Alternatives not
  chosen: <...>. Consequences: <...>.

## Implementation Steps
1. <file>: <change>

## Verification
- [ ] <how each AC is verified, including exercising the running system>

## Reconciliation Notes
- docs/feature-specs/<feature>.md: <what to update>
- docs/feature-designs/<feature>.md: <what to update>
- ADR/DES to create or update, if any
```

`New` (unbacked) requirements deserve extra scrutiny — a genuinely new behavior may belong in an experiment, not a patch. Exit plan mode via `ExitPlanMode`.

### 3. Validate the Plan (Silent)

Validate the fused plan through zenku's two doc reviewers, sequentially. Both are autonomous — the user only sees the final validated plan.

**Step 1 — Spec validation.** Dispatch `zenku:spec-reviewer` on the spec sections (Grounded in, Change Summary, Requirements with Evidence, Acceptance Criteria, Affected Features):

```python
Task(
    subagent_type="zenku:spec-reviewer",
    prompt=f"""
Review this compressed patch specification for completeness, testability, and
experiment-grounding.

## Grounded In
{grounded_in}

## Change Summary
{change_summary}

## Requirements (with Evidence column)
{requirements}

## Acceptance Criteria
{acceptance_criteria}

## Affected Features
{affected_features}

## Source Experiment Evidence (if grounded)
{experiment_evidence}

Note: this is a compressed patch spec, not a full feature spec — review at the level
appropriate for a focused change. Every requirement should trace to evidence or be
marked New; nothing should contradict a concluded experiment. Do NOT re-validate the
idea's merit — that was settled in the experiments.
"""
)
```

Apply all fixes to the plan. Note any scope/requirement adjustments for the next step.

**Step 2 — Design validation.** Dispatch `zenku:design-reviewer` on the design sections (Design Approach, Key Decisions), passing the validated spec sections + the ADR/DES indexes:

```python
Task(
    subagent_type="zenku:design-reviewer",
    prompt=f"""
Review this compressed patch design for coherence and experiment-grounding, and
sanity-check any inline ADR/DES classification.

## Validated Spec Sections
{validated_spec_sections}

## Design Approach
{design_approach}

## Key Decisions
{key_decisions}

## ADR Index
{adr_index}

## DES Index
{des_index}

Note: this is a compressed patch design, not a full feature design — review at the
level appropriate for a focused change. Watch for spike-copy risk and correct ADR
(one-time, hard-to-reverse) vs DES (repeatable pattern) classification. Do NOT
re-validate the idea's merit.
"""
)
```

Apply fixes. If design review surfaces spec-level issues, cascade back to Step 1 and re-validate the spec.

### 4. User Checkpoint

Present the fully validated plan. This is the single collaborative checkpoint — it replaces the separate spec/design review rounds of the full chain.
- Show the complete plan, with the Requirements table and its Evidence column.
- Highlight assumptions, any `New` (unbacked) requirements, and adjustments made during validation.
- Ask: "Does this plan look right? What needs adjustment?"
- Iterate until approved.

### 5. Implement

Build the change following the approved plan and `zenku:implement` discipline:
- Follow the referenced ADRs/DES. Add a code comment referencing a decision only where the choice would otherwise be unclear (`// See ADR-003: …`). Code and comments **never cite the experiment or the spike** — explain the *why* on its own terms (content-is-self-sufficient principle).
- No test-mode branches or environment checks in production code.
- The plan is ephemeral (no persisted design doc), so record any divergence from it in the scratchpad — that is what reconciliation folds in later.
- Run the project's tests, linter, and type checker (the documented commands); new or changed behavior gets new or updated automated test coverage.

### 6. Verify + Code-Review Loop

- Walk each acceptance criterion and confirm the code satisfies it. **Exercise the running system** — drive the real runtime path (curl / CLI / UI as fits the project) against local/dev only; never production, never destructive commands. If the change has no runtime surface (pure refactor/library), say so and rely on the automated coverage.
- Then loop `zenku:code-reviewer` until it returns `PASS`:

```python
Task(
    subagent_type="zenku:code-reviewer",
    prompt=f"""
Review this implementation against its patch spec, design, and referenced decisions.

## Grounded In (experiment refs for the spike-rewrite check)
{grounded_in}

## Patch Spec (acceptance criteria)
{spec_sections}

## Patch Design (approach + key decisions)
{design_sections}

## Referenced ADR/DES (full documents)
{adr_des_content}

## Implemented Code
{code_diff}
"""
)
```

Pass the **Grounded-in experiment refs explicitly** so the reviewer's spike-rewrite check works without a persisted design doc. If the assessment is `NEEDS_WORK`, fix ALL findings automatically (AskUserQuestion only for a genuine choice), re-run tests/lint/types, fix anything the fixes broke, and re-dispatch. On `PASS`, exit the loop, present the implementation (what was built, AC mapping, deviations, findings for reconciliation), and iterate on feedback.

### 7. Reconcile

Fold what was actually built into the durable docs, following `zenku:reconcile`:
- **Diff built-vs-documented.** Compare the implementation against the plan's Affected Features + Reconciliation Notes and the current durable docs. That diff is the only thing you touch.
- **Apply surgical, present-tense updates** to the affected `docs/feature-specs/` and `docs/feature-designs/`. Preserve requirement `Evidence` links; no backward-looking prose ("used to / previously"); no rewording for its own sake; do fix genuinely outdated information. If an affected feature has no doc yet, note it — a brand-new feature belongs in the full chain, not invented here.
- **Promote decisions collaboratively.** Extract implementation-time decisions from Design Approach + Key Decisions. ADR = hard-to-reverse **and** project-wide → `docs/architecture/ADR-NNN-<slug>.md`; DES = repeatable cross-cutting pattern used 2+ times → `docs/design/DES-NNN-<slug>.md`. Determine the next `NNN` by scanning the directory; cite the justifying experiment(s). Propose before creating.
- **Keep the folder indexes current** (create any from `doc-index-templates.md` if absent): add a row to `docs/architecture/README.md` / `docs/design/README.md` for each new ADR/DES (update the row for any existing decision the patch changed); update the affected `docs/feature-specs/README.md` / `docs/feature-designs/README.md` row only if the patch changed its one-liner or status. Zero index changes is a valid outcome for a purely internal change.
- **Validate once** with `zenku:reconciliation-reviewer`:

```python
Task(
    subagent_type="zenku:reconciliation-reviewer",
    prompt=f"""
Review these reconciliation updates.

## What Was Built
{implementation_summary}

## Proposed Feature-Spec Updates
{proposed_spec_updates}

## Proposed Feature-Design Updates
{proposed_design_updates}

## ADR/DES Candidates
{decision_candidates}

## Current Durable Docs (the pre-update state)
{current_docs}

Verify: the docs now describe the PRESENT built state; changes are surgical (only
what changed was touched); nothing was lost (Evidence links preserved); decision
promotion is correctly classified.
"""
)
```

- Present the reconciliation proposal (spec/design updates, ADR/DES candidates with proposed IDs, updates to existing decisions, with diffs); iterate; apply on approval. **Zero updates is a valid outcome** for a purely internal change (refactor/bugfix) — state it explicitly rather than inventing changes.

### 8. Finalize

- If the target was on `ROADMAP.md`, mark it `✓ Reconciled` in `docs/planning/ROADMAP.md`. (Off-roadmap patches move no marker.)
- Present a summary:

```
"Patch complete: <change>

Grounded in: <experiment / feature / ungrounded>
Files modified: <list>
Feature docs updated: <list>
Decision documents created/updated: <list, if any>
Roadmap: <feature — ✓ Reconciled, if roadmapped>"
```

- Commit is the user's call — do not auto-commit.

## Edge Cases

- **Change balloons mid-implementation** (new unknowns, more files, design decisions needed): pause and present the situation — offer to continue as a patch, escalate to the full chain, or (if it's really a new capability) route to an experiment.
- **No feature documentation exists yet:** reconciliation has nothing to update. Note it, and suggest the full chain for genuinely new features rather than inventing docs here.
- **Reconciliation produces zero updates:** valid for a purely internal change. State: "This change doesn't affect any documented feature behavior — no reconciliation updates needed."
- **Free-text patch matches a roadmap feature/experiment:** offer to upgrade to a grounded patch (handled in Pre-Check → Resolve Grounding).

## Workflow

**A compressed, validate-first process:**
- Research context, resolve grounding (experiment / feature / free-text), assess fitness
- Plan mode: draft one document fusing spec + design (no intermediate files)
- Validate silently: `zenku:spec-reviewer` → `zenku:design-reviewer`, cascading back on issues
- Present the validated plan — the single collaborative checkpoint
- Implement against the plan
- Verify the acceptance criteria (tests, lint, types, exercise the running system), then loop `zenku:code-reviewer` → fix all → re-dispatch until PASS
- Reconcile surgically into the durable docs, validate with `zenku:reconciliation-reviewer`, present, apply
- Finalize: mark the roadmap feature `✓ Reconciled` if roadmapped; summarize; leave the commit to the user
