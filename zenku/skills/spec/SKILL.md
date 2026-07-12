---
name: spec
description: |
  Write a feature specification grounded in the experiment evidence that justified the feature. Use when the user wants to "spec a feature", "write the spec for X", "let's spec this", or turn a roadmap feature into requirements. Produces docs/feature-specs/<feature>.md with every requirement traced back to the experiment that proves it.
---

# Feature Specification Workflow

Write the spec for a roadmap feature. The idea was already **validated in the experiments** — this skill does not re-derive or re-validate it. Instead it **grounds the spec in that evidence**: what proved out becomes must-have behavior, documented constraints become requirements, and open questions become explicit unknowns (or new backlog captures). Every requirement is traceably linked to the experiment that justifies it.

## Input

The feature to spec (a feature from `docs/planning/ROADMAP.md`). Identify it from `$ARGUMENTS` or the user's request.

## Context

**Load these skills and read these files before proceeding.**

### Skills
- `zenku:framework-core` — collaborative workflow principles + project conventions
- `zenku:capture` — for parking open questions that are out of scope for this feature

### Roadmap and product backlog
- `docs/planning/ROADMAP.md` — locate the feature; follow its link to the `PRODUCT.md` milestone piece
- `PRODUCT.md` — the promoted piece's distillation (what proved out, constraints) and its links to source experiments

### Experiment evidence (the ground truth for this spec)
- `experiments/NNN-slug/README.md` — the one-pager(s) the feature traces to: question, hypothesis, judging criteria, insight log, verdict
- `LEARNINGS.md` — the believed/observed/learned/scope/therefore entries for those experiments

### Existing spec (if present)
- `docs/feature-specs/<feature>.md` — current spec to update or create
- `docs/feature-specs/` — related feature specs, for consistency and dependency context

### Templates
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/feature-spec-template.md` — structure to follow
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/doc-index-templates.md` — the `feature-specs/README.md` index shape to keep current

## Pre-Check

- If the feature is not in `docs/planning/ROADMAP.md`, suggest running `zenku:roadmap` for its milestone first — a spec is written against a roadmapped feature.
- If the feature has no link back to a PRODUCT.md piece / experiment, stop and flag it: this track specs features that experiments proved out. An unproven feature belongs in an experiment first (or `zenku:capture`).

## Process

### 1. Check Existing State

If `docs/feature-specs/<feature>.md` exists:
- Read it. Check for drift against the roadmap entry and the PRODUCT.md piece.
- Summarize the user story, key requirements, and acceptance criteria.
- Ask what needs refinement, and enter iteration mode on that.

If no spec exists: proceed with initial creation. Mark the feature `⧗ Spec` in `docs/planning/ROADMAP.md`.

### 2. Follow the Evidence (Silent)

This is the heart of the skill. From the roadmap feature, follow the pointers to the PRODUCT.md piece, then to the **source experiment one-pagers** and their `LEARNINGS.md` entries. Read them fully. Extract, keeping the experiment id attached to each item:

- **What proved out** — the behaviors and properties the experiment established. These become **must-have behavior**.
- **Documented constraints** — the implementation-relevant constraints the sessions discovered (correctness requirements, things that "must" hold, noted-but-not-exercised limits). These become **requirements**.
- **Open questions / deferred items** — things the experiment explicitly left open, smoke-tested-only, or deferred. These become **explicit unknowns** in the spec, or — if out of scope for this feature — new `zenku:capture` entries.
- **Spike code location** — note it as reference material only; the spec describes behavior, not the spike's implementation.

Do **not** re-litigate the experiment's verdict. If something was concluded, treat it as settled evidence. Your job is to translate evidence into a spec, flag where evidence is thin, and surface genuine gaps — not to re-validate.

### 3. Interview: Refine Requirements (Collaborative)

Follow the one-question-at-a-time principle from `zenku:framework-core`.

Present your evidence-grounded understanding:
- The core user story (who/what/why) for this feature
- A proposed **Requirements table** where each row carries an **Evidence** cell citing the experiment(s) that justify it (e.g. `exp 004`, `exp 002: cursor-persistence constraint`), or `New` if it has no direct experiment backing
- The unknowns you extracted, and which ones you think are in-scope vs capture-worthy

Use AskUserQuestion for structured choices (2-4 options). Because validation already happened, focus questions on **build-scope decisions**, not idea merit:
- Priority negotiation (`Core goal` / `Must-have` / `Nice-to-have` / `Out`)
- Which documented constraints are in-scope for this feature vs a later one
- How to handle each open question: spec it as a known unknown, or capture it
- Scope boundaries against neighbouring roadmap features

`New` (unbacked) requirements deserve extra scrutiny — ask the user to confirm they belong here rather than in a fresh experiment.

### 4. Draft the Spec

Following the template, draft `docs/feature-specs/<feature>.md`:
- **User story** — who, what, why; specific and concrete
- **Requirements table** — finalized from the interview. Each requirement has a status (`Core goal` / `Must-have` / `Nice-to-have` / `Out`) **and an Evidence cell linking it to the experiment that justifies it**. R1 is the core goal.
- **Acceptance criteria** — Given/When/Then, grouped by requirement area; each requirement maps to one or more AC groups
- **Unknowns** — open questions carried from the experiments (with the experiment id), plus anything the interview surfaced; captured items link to their `BACKLOG.md` entry
- **Out of scope** — what this feature deliberately does not do, and why
- **Dependencies** — the roadmap features this one depends on

Keep provenance in the **Grounded in** field and the **Evidence** column only. The user story, requirement text, and acceptance criteria read as self-sufficient statements of what and why — never "because experiment NNN…" (see the content-is-self-sufficient principle in `zenku:framework-core`). A requirement says *what is needed*; its `Evidence` cell says *how we know*.

### 5. Traceability Check (Internal, not saved)

Verify before validating:
- Every requirement either traces to an experiment (Evidence cell) or is explicitly marked `New` — no silent unbacked requirements
- No requirement **contradicts** a concluded experiment's findings
- Every requirement maps to at least one AC group; every AC group traces to a requirement

Surface any gap to the user before proceeding.

### 6. External Validation (Silent)

Dispatch the spec-reviewer:

```python
Task(
    subagent_type="zenku:spec-reviewer",
    prompt=f"""
Review this feature specification for completeness AND experiment-grounding.

## Roadmap Feature Entry
{roadmap_entry}

## PRODUCT.md Milestone Piece (with experiment links)
{product_piece}

## Source Experiment Evidence (one-pagers + LEARNINGS entries)
{experiment_evidence}

## Completed Spec (Requirements table with Evidence cells, Acceptance criteria, Unknowns)
{spec_content}
"""
)
```

### 7. Apply Feedback (Silent)

Apply ALL spec-reviewer recommendations automatically: fill traceability gaps, add missing edge cases, clarify criteria, correct any requirement that drifted from the evidence. Use AskUserQuestion only when a fix requires a genuine choice (multiple valid ways, conflict with an earlier decision). Track changes for the next step.

### 8. Present the Validated Spec

Show the complete spec. Highlight:
- The Requirements table with its Evidence column (call out any `New` rows)
- The Unknowns section
- What the reviewer changed

Invite feedback: "What needs adjustment in this spec?"

### 9. Iterate, Then Finalize

Apply the user's changes; re-run validation (steps 6-7) if significant. When approved, set the doc's Status field to ✓ current, write `docs/feature-specs/<feature>.md`, and mark the feature `✓ Spec` in `docs/planning/ROADMAP.md`.

Then update the **feature-specs index** `docs/feature-specs/README.md` (create it from `doc-index-templates.md` if absent): add this feature's row — link, a one-line capability description, its status, and its milestone — or update the existing row if the spec already had one. Keep the index consistent with the folder.

Present a summary:
```
"Spec complete for <feature>.

[Requirements table]

Unknowns carried forward: [list]
Captured to backlog: [list, if any]

Next: /zenku:design <feature>"
```

## Workflow

- Follow the roadmap feature back to its **source experiments** and read the evidence
- Translate proved-out behavior → must-haves, constraints → requirements, open questions → unknowns/captures
- Build the Requirements table **with** the user, each requirement carrying an Evidence link; do NOT re-validate the idea
- Draft spec, run the traceability check, validate silently with `zenku:spec-reviewer`
- Present, iterate, finalize to `docs/feature-specs/<feature>.md`
