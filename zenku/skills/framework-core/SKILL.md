---
name: framework-core
description: |
  Load first when working with any zenku framework skill. Provides the collaborative workflow principles, the experiment-sandbox definition, the artifact/doc map, project-convention lookup, reviewer-dispatch table, and template pointers shared by every zenku command.
user-invocable: false
---

# Framework Core

The shared context every zenku skill loads first. zenku is an **experiment-driven development framework**: ideas become pre-registered experiments that produce evidence, and proven evidence flows into durable engineering docs and code.

## The two halves

zenku has one spine with two halves that meet at `PRODUCT.md`.

**Experimentation** — answer a single question honestly, judged against real work:

```
idea ──/capture──▶ BACKLOG.md
        │
        ├─/experiment-start──▶ experiments/NNN-slug/README.md   (pre-registered one-pager)
        ├─/experiment-run────▶ shape + build spike + run judging sessions
        └─/experiment-conclude▶ verdict → LEARNINGS.md, promote → PRODUCT.md milestone
```

**Product development** — turn a promoted milestone into durable docs and real code, *fed from the experiments that justified it*:

```
PRODUCT.md milestone
        ├─/roadmap────▶ docs/planning/ROADMAP.md      (feature ordering + parallel set + dependency graph)
        ├─/spec───────▶ docs/feature-specs/<feature>.md   (grounded in the source experiments)
        ├─/design─────▶ docs/feature-designs/<feature>.md + docs/architecture/ADR-*.md + docs/design/DES-*.md
        ├─/implement──▶ real code + code-review loop
        └─/reconcile──▶ fold what was built back into the durable docs
```

The critical distinction from katachi: **validation lives in the experiments, not in a design-review gate.** The product skills do not re-validate the idea — they ground themselves in the evidence the experiments already produced.

## Artifact & doc map (fixed conventions, no config file)

**Experimentation artifacts** (project root):
- `BACKLOG.md` — immature ideas. Sections: `Next up`, `Ideas`, `Later / deferred`.
- `experiments/README.md` — process note + the one-pager template + an index table of all experiments and their verdicts.
- `experiments/NNN-slug/README.md` — one one-pager per experiment: Question / Hypothesis / Judging (pre-registered), `## Setup`, `## Notes` (the live insight log), `## Verdict`. Numbers are monotonic and never reused; nothing here is ever deleted — a documented dead end is a deliverable.
- `LEARNINGS.md` — append-only, one entry per concluded experiment (Believed / Observed / Learned / Scope / Therefore).
- `PRODUCT.md` — the product backlog: proven pieces parked under **milestones**, each entry pointing back at its evidence. This is the bridge into the product half.

**Durable docs** (product half):
- `docs/planning/ROADMAP.md` — per-milestone feature ordering + dependency graph.
- `docs/feature-specs/<feature>.md` — long-lived feature specs.
- `docs/feature-designs/<feature>.md` — long-lived feature designs.
- `docs/architecture/ADR-NNN-*.md` — Architecture Decision Records (one-time, hard-to-reverse, project-wide choices).
- `docs/design/DES-NNN-*.md` — Design pattern docs (repeatable cross-cutting patterns, used 2+ times).

## The experiment sandbox

An experiment's code is a **spike**, not product. A good sandbox is defined by its *properties*, never by a stack:

- **Isolated** — lives apart from production code; nothing production imports it, and it imports production only as read-only reference.
- **Throwaway** — built to be discarded; graduation to real code is a *rewrite*, never a copy. Held to no production-quality bar except one: keep it modular enough that a later rewrite is cheap.
- **Minimal** — the cheapest thing that can answer the question. Everything the judging does not test is hardcoded, faked, or static.
- **Real data from day one** — snapshot the real work artifact the experiment is judged against into fixtures; never a toy input.
- **Easy to launch and to discard** — one obvious command to run it, no ceremony to tear it down.

**Where spikes live is project-specific.** Read the project's `## zenku` section in its `CLAUDE.md` for the spike location and how to run one. If it is not documented, ask once and record the answer (in the one-pager, and offer to note it in CLAUDE.md). Do **not** assume a language, framework, or directory. `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/sandbox-example-web.md` is one worked example (a web/React layout) — an illustration, never the default.

## Project conventions (read from CLAUDE.md)

zenku uses no config file. `zenku:init` writes a `## zenku` section into the project's `CLAUDE.md`; every skill reads it. It records:

- **Purpose** — what the project is for. Experiments are judged partly on whether they serve it. If absent, skip any "serves the purpose" check rather than inventing one.
- **Spike location & run command** — where experiment sandboxes live and how to launch them.
- **Build / test / lint commands** — used by `experiment-start` (verify a scaffold), `implement`, and `reconcile`. If absent, detect from the lockfile/manifest or ask once.
- **Docs layout** — defaults to the map above; a project may record deviations.

If the `## zenku` section is missing entirely, offer to run `zenku:init`.

## Collaborative workflow principles

Every zenku skill is a collaboration. The user is the architect; you propose and implement.

1. **One question at a time.** Never batch questions; wait for the answer before proceeding.
2. **Propose, don't decide.** Offer options with trade-offs; never add or change scope without agreement.
3. **Use AskUserQuestion for 2–4 structured choices.** Clear header (≤12 chars), full question, a description per option. Plain text for open-ended or yes/no.
4. **Detect gaps proactively.** Surface unstated assumptions and edge cases; challenge vague answers; ask "what's missing?" and "what could go wrong?" — but never fill a gap yourself.
5. **Use a scratchpad.** Track state in `/tmp/zenku-<skill>-<id>-state.md` (id = the experiment number, the feature name, or an animal-adjective for parallel-safe runs). Keep it after completion for audit.
6. **Bridge the context gap.** You hold the full picture across many files; the user does not. When asking or explaining, include diagrams (ASCII, sequence, data-flow), name the specific files/components, and show concrete examples.
7. **Research when uncertain.** When the user signals "not sure" or a technical choice is in play, research (dispatch `zenku:experiment-researcher` for landscape surveys, or a general-purpose agent) before presenting options.
8. **Document the present, not the past.** All durable docs describe the *current* system — what it does and what it deliberately does not do. Never phrase anything as what the system *used to* do. Record rejected alternatives as "considered and not chosen (because …)", not as history. The only sanctioned place for history is an ADR's `Status: Superseded by ADR-XXX` line.

## Document-creation workflow

Specs, designs, decisions, and one-pagers all follow the same loop:

(Roadmaps are the exception: `/roadmap` validates structurally — dependency cycle-check + mermaid validation + user confirmation — rather than via a reviewer agent.)

1. **Research (silent, thorough)** — read the source evidence (for the product half: the source experiments, `LEARNINGS.md`, prior ADRs/DES; for a one-pager: the backlog idea and any prior related experiments). Build understanding before asking anything.
2. **Draft (with decision points)** — write the complete document from the template. Base every choice on the research. Where a genuine choice exists (multiple valid approaches, real trade-offs), use AskUserQuestion.
3. **Validate (silent)** — dispatch the matching reviewer agent (table below). Feed it only the artifact, its templates/evidence, and the user's stated constraints — not your reasoning history.
4. **Apply feedback (silent)** — apply all mechanical fixes automatically; use AskUserQuestion only when a fix requires a genuine choice.
5. **Present** — show the validated document, summarize the fixes applied, flag anything unresolved, invite feedback.
6. **Iterate** — apply corrections; re-validate if the change is significant.
7. **Finalize** — write to its canonical location; update any index/status.

Validate *before* presenting; auto-apply fixes; reserve AskUserQuestion for real decisions.

## Reviewer-dispatch table

| Artifact | Reviewer | Dispatch |
|----------|----------|----------|
| Experiment one-pager | `zenku:onepager-reviewer` | `Task(subagent_type="zenku:onepager-reviewer")` |
| Experiment build shape | `zenku:shape-reviewer` | `Task(subagent_type="zenku:shape-reviewer")` |
| Experiment verdict / learnings | `zenku:conclusion-reviewer` | `Task(subagent_type="zenku:conclusion-reviewer")` |
| Feature spec | `zenku:spec-reviewer` | `Task(subagent_type="zenku:spec-reviewer")` |
| Feature design (incl. ADR/DES) | `zenku:design-reviewer` | `Task(subagent_type="zenku:design-reviewer")` |
| Implemented code | `zenku:code-reviewer` | `Task(subagent_type="zenku:code-reviewer")` |
| Reconciled durable docs | `zenku:reconciliation-reviewer` | `Task(subagent_type="zenku:reconciliation-reviewer")` |
| Knowledge-gap research | `zenku:experiment-researcher` | `Task(subagent_type="zenku:experiment-researcher")` |

## Templates

All under `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/`:

- `onepager-template.md` — experiment one-pager
- `learnings-entry-template.md` — a `LEARNINGS.md` entry
- `product-entry-template.md` — a `PRODUCT.md` milestone entry
- `roadmap-template.md` — a `ROADMAP.md` milestone section
- `feature-spec-template.md` — a durable feature spec
- `feature-design-template.md` — a durable feature design
- `ADR-template.md` — Architecture Decision Record
- `DES-template.md` — Design pattern doc
- `sandbox-example-web.md` — one worked sandbox example (illustration, not default)

## State detection

Before executing a skill, detect project state:

- **Not initialized** (no `BACKLOG.md` / `experiments/` and no `## zenku` in CLAUDE.md) → offer `zenku:init`.
- **Experiments only** (experimentation artifacts exist, no `docs/planning/ROADMAP.md`) → the experimentation half is live; the product half starts once a milestone in `PRODUCT.md` is worth building.
- **Full** (both halves present) → proceed normally.
