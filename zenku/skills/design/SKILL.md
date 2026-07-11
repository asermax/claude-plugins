---
name: design
description: |
  Write the design for a feature from its spec and the experiment evidence, treating spike code as reference (graduation is a rewrite). Use when the user wants to "design a feature", "write the design for X", or "let's design this". Produces docs/feature-designs/<feature>.md and creates ADRs/DES inline when hard-to-reverse or repeatable decisions surface.
---

# Feature Design Workflow

Write the design for a feature that already has a spec. Ground it in the spec
and the **experiment evidence**, treating the experiment's **spike code as
reference material, not code to copy** — graduation into the product is a
rewrite. When the design surfaces a hard-to-reverse project-wide choice, create
an **ADR** inline; when it surfaces a repeatable cross-cutting pattern, create a
**DES** inline. Each cites the experiment(s) that justify it.

## Input

The feature to design (has a `docs/feature-specs/<feature>.md`). Identify it
from `$ARGUMENTS` or the user's request.

## Context

**Load these skills and read these files before proceeding.**

### Skills
- `zenku:framework-core` — collaborative workflow principles + project conventions

### Feature spec (what we design against)
- `docs/feature-specs/<feature>.md` — requirements, acceptance criteria, unknowns, evidence links

### Experiment evidence (still the ground truth)
- `PRODUCT.md` — the milestone piece and its links to source experiments
- `experiments/NNN-slug/README.md` + `LEARNINGS.md` — the evidence the spec traces to
- Spike code (at the location noted in the PRODUCT.md piece / the source one-pager) — **reference only**; read it to learn what worked and what the constraints really cost, never to copy

### Project decisions
- `docs/architecture/` — existing ADRs
- `docs/design/` — existing DES patterns

### Existing design + related designs (if present)
- `docs/feature-designs/<feature>.md` — current design to update or create
- `docs/feature-designs/` — related feature designs, for pattern reuse and consistency

### Templates
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/feature-design-template.md`
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/ADR-template.md`
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/DES-template.md`

## Pre-Check

- If `docs/feature-specs/<feature>.md` does not exist, suggest running `zenku:spec <feature>` first — design is written against a spec.

## Process

### 1. Check Existing State

If `docs/feature-designs/<feature>.md` exists:
- Read it. Check for drift against the spec. Summarize the approach and key decisions.
- Ask what needs refinement, and enter iteration mode on that.

If no design exists: proceed with initial creation. Mark the feature `⧗ Design` in `docs/planning/ROADMAP.md`.

### 2. Research (Silent)

- Read the spec fully — requirements, AC, unknowns, evidence links.
- Read the source experiment one-pagers and **study the spike code as
  reference**: what mechanism actually worked, what the documented constraints
  cost in practice, what the spike deliberately faked or left in-memory. The
  spike tells you what to build; it is not what you ship.
- Read relevant existing ADRs and DES; note patterns you can reuse.
- For any library/framework/API the design will lean on, look up **current**
  documentation (use `superpowers:using-live-documentation` if available) —
  training data ages; do not design against a remembered API.
- Resolve as many of the spec's **unknowns** as you can from the spike and
  research. Unknowns you cannot resolve carry into the design as stated risks.

Build understanding without asking upfront questions.

### 3. Interview: Design Decisions (Collaborative)

Follow the one-question-at-a-time principle from `zenku:framework-core`.

Present your design thinking grounded in the evidence:
- The approach you're leaning toward and why (tie it to what the spike proved)
- Where the spike's shape should carry over vs where the rewrite should diverge
- Architectural choices with genuine alternatives
- Any spec unknown you couldn't resolve and how you propose to handle it

Use AskUserQuestion for structured choices (2-4 options with trade-offs).
Ask about architectural direction, technology selection, and integration with
existing patterns — not about the feature's merit (that was settled in the
experiments).

### 4. Draft the Design

Following the template, draft `docs/feature-designs/<feature>.md`:
- **Problem context** — what this feature must do, constraints (many carried
  from the experiment), interactions with other features
- **Design overview** — the approach and its main components
- **Modeling** — entities, relationships, state transitions
- **Data flow** — inputs → processing → outputs; error flows
- **Key mechanisms** — flag unresolved unknowns with ⚠️ in the mechanisms
  table; resolve before implementation
- **Key decisions** — for each: the choice, the reason it is the right one
  (self-sufficient prose — the actual argument, not "because experiment NNN"),
  an **Evidence** line pointing to the experiment/doc that backs it,
  alternatives considered and not chosen (with reasons), and consequences
- **System behavior** — scenarios and edge cases, covering the spec's AC

Write in the present tense — describe the system as it will be, framing
alternatives as "considered and not chosen", never as things "removed" (see
the document-the-present principle in `zenku:framework-core`). Keep the design
prose self-sufficient: constraints, mechanisms, and rationale are explained on
their own terms; experiment references stay in the `Grounded in` field and each
decision's `Evidence` line, never in the explanatory prose (see the
content-is-self-sufficient principle in `zenku:framework-core`).

### 5. Surface ADRs and DES (Collaborative, Inline)

As the design takes shape, watch for decisions that outgrow the feature doc.
Propose them to the user before creating anything (propose, don't decide):

- **ADR** — a choice that is **hard to reverse AND project-wide** (a
  technology, an architectural pattern, an integration approach that sets
  precedent). Create `docs/architecture/ADR-NNN-<slug>.md` from the template,
  **citing the experiment(s)** that justify it, and reference it from the design.
- **DES** — a **repeatable cross-cutting pattern used 2+ times** (or that
  should be consistent across the codebase). Create `docs/design/DES-NNN-<slug>.md`
  from the template, cite the experiment(s), and reference it from the design.

Determine the next `NNN` by scanning the respective directory. Keep it
lightweight: a decision relevant only to this feature stays in the feature
design; a pattern used once stays inline. When unsure, ask the user.

### 6. External Validation (Silent)

Dispatch the design-reviewer:

```python
Task(
    subagent_type="zenku:design-reviewer",
    prompt=f"""
Review this feature design for quality AND experiment-grounding.

## Feature Spec
{spec_content}

## Source Experiment Evidence (one-pagers + LEARNINGS; spike is reference only)
{experiment_evidence}

## Completed Design
{design_content}

## ADRs/DES created or referenced inline
{adr_des_content}

## Existing ADR/DES Indexes
{adr_des_indexes}

Also sanity-check the inline ADR/DES classification:
- ADR = one-time hard-to-reverse project-wide choice
- DES = repeatable pattern (2+ uses / cross-cutting)
Flag any misclassification, any decision that should have been promoted but
wasn't, and any ADR/DES that doesn't cite its justifying experiment.
"""
)
```

### 7. Apply Feedback (Silent)

Apply ALL design-reviewer recommendations automatically. Use AskUserQuestion
only when a fix requires a genuine choice. Track changes for the next step.

### 8. Present the Validated Design

Show the complete design plus any ADR/DES created. Highlight the key decisions
(and their evidence), and what the reviewer changed.

Invite feedback: "What needs adjustment in this design?"

### 9. Iterate, Then Finalize

Apply the user's changes; re-run validation (steps 6-7) if significant. When
approved, write `docs/feature-designs/<feature>.md` (set the doc's Status
field to ✓ current), finalize any ADR/DES, and mark the feature `✓ Design` in
`docs/planning/ROADMAP.md`.

Present a summary:
```
"Design complete for <feature>.

Key decisions: [list]
ADRs created: [list, if any]
DES created: [list, if any]

Next: /zenku:implement <feature>"
```

## Workflow

- Ground the design in the spec + experiment evidence; read the **spike as reference**, build a rewrite
- Look up current docs for any library the design leans on
- Draft the design **with** the user; surface ADRs (hard-to-reverse, project-wide) and DES (repeatable) inline, each citing its experiment
- Validate silently with `zenku:design-reviewer` (quality + grounding + ADR/DES classification)
- Present, iterate, finalize to `docs/feature-designs/<feature>.md`
