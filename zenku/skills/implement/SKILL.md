---
name: implement
description: |
  Build a feature against its design, verify the spec's acceptance criteria, then run a code-review loop until it passes. Use when the user wants to "implement a feature", "build X", "code up this feature", or graduate a design into the production codebase. The spike is reference; this is the real rewrite.
---

# Feature Implementation Workflow

Build a designed feature into the production codebase, verify it against the
spec, and drive a code-review loop until it passes. The experiment's spike is
**reference material** — this is the real rewrite against the design, not a
copy of the spike.

## Input

The feature to implement (has a `docs/feature-designs/<feature>.md`). Identify
it from `$ARGUMENTS` or the user's request.

## Context

**Load these skills and read these files before proceeding.**

### Skills
- `zenku:framework-core` — collaborative workflow principles + project conventions (build/test/lint commands, source layout)

### Feature documents
- `docs/feature-specs/<feature>.md` — what to build; the acceptance criteria to verify against
- `docs/feature-designs/<feature>.md` — how/why; the approach to follow

### Project decisions
- `docs/architecture/` — ADRs the design references (read the full documents)
- `docs/design/` — DES patterns the design references (read the full documents)

### Reference material
- Spike code (path in the design / PRODUCT.md piece) — reference only; do not copy

## Pre-Check

- If `docs/feature-specs/<feature>.md` or `docs/feature-designs/<feature>.md` is missing, suggest running `zenku:spec` / `zenku:design` first — implementation follows a design.
- Read the **zenku conventions section of the project's CLAUDE.md** for the documented build/test/lint commands and source layout. If they are not documented, ask the user before running anything.

Mark the feature `⧗ Implemented` in `docs/planning/ROADMAP.md`.

## Process

### 1. Gather Context (Silent)

- Read the spec (acceptance criteria are the target) and the design (the approach).
- Read the full ADR/DES documents the design references — follow their constraints.
- Study the spike code as **reference**: it shows a working shape and what the
  documented constraints cost. Reproduce the *behavior* against the design;
  write production-quality code, not a port of the spike.
- For any library/framework the build uses, verify current APIs (use
  `superpowers:using-live-documentation` if available) rather than relying on
  training data.

### 2. Implement Against the Design

Build the feature following the design. Work in coherent, verifiable steps; if
the design names components, build them in dependency order.

- Follow the referenced ADRs/DES. Add a code comment referencing a decision
  only where the choice would otherwise be unclear (`// See ADR-003: …`).
- **Living design:** if you must diverge from the design for a valid reason,
  update `docs/feature-designs/<feature>.md` to match reality *as you go*, then
  continue. Write important implementation findings (API behavior, a constraint
  the spike hid) back into the design too — this is what `zenku:reconcile` folds
  in later.
- No test-mode branches or environment checks in production code.

Track progress in a scratchpad (`/tmp/zenku-implement-<feature>-state.md`): current
step, deviations from design, findings, issues.

### 3. Verify Acceptance Criteria

When the build is complete:
- Run the project's tests, linter, and type checker (the documented commands).
  Fix what they surface.
- New or changed behavior must get new or updated automated test coverage —
  running the existing suite is not enough.
- Walk each acceptance criterion in the spec and confirm the code satisfies it.
  Note any criterion you cannot satisfy and why — that is review input, not
  something to hide.

### 4. Code-Review Loop

Repeat until the code-reviewer returns `PASS`:

**4a. Dispatch the code-reviewer:**

```python
Task(
    subagent_type="zenku:code-reviewer",
    prompt=f"""
Review this implementation against its spec, design, and decisions.

## Feature Spec (acceptance criteria)
{spec_content}

## Feature Design (approach)
{design_content}

## Referenced ADR/DES (full documents)
{adr_des_content}

## Implemented Code
{code_diff_or_files}
"""
)
```

Gather the code as a diff (`git diff` / `git diff --staged`, or
`git diff origin/main...HEAD` on a feature branch).

**4b. Fix all issues:** if the assessment is `NEEDS_WORK`, address ALL findings
automatically — missing acceptance-criteria coverage, design misalignment,
pattern violations, quality issues, unintended effects/regressions. Use
AskUserQuestion only when a fix requires a genuine choice (e.g. multiple valid
resolutions, or a conflict with an earlier decision).

**4c. Verify fixes:** re-run tests, lint, and type checking; fix anything the
fixes broke.

**4d. Re-dispatch:** loop back to 4a with the updated code until `PASS`.

### 5. Present Findings to User

Once the reviewer returns `PASS`:
- Summarize what was built and how it maps to the acceptance criteria
- List the issues found and fixed during the loop
- Note any deviation from the design (and that you updated the design doc to match)
- Note findings written back to the design for reconciliation

Invite feedback: "What needs adjustment in this implementation?"

### 6. Iterate, Then Finalize

Apply the user's changes; re-run the review loop if changes are significant.
When approved, mark the feature `✓ Implemented` in `docs/planning/ROADMAP.md`.

Present a summary:
```
"Implementation complete for <feature>.

Files changed:
- [file]: [what changed]

Acceptance criteria: [n/n satisfied]
Review iterations: [count]
Design updates made during build: [list, if any]

Next: /zenku:reconcile <feature>"
```

Offer to commit as an optional pre-reconcile checkpoint — reconcile is still
pending and should run before this lands for good.

## Workflow

- Read spec + design + referenced ADR/DES; study the spike as **reference only**
- Build against the design into the production codebase; keep the design doc living as you diverge
- Verify the spec's acceptance criteria (tests, lint, types, plus manual walk)
- Loop `zenku:code-reviewer` → fix all → verify → re-dispatch until PASS
- Present, iterate, finalize; hand off to `zenku:reconcile`
