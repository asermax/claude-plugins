---
name: prioritize
description: |
  Order the experiment BACKLOG.md so the most impactful experiments run first. Use when the user wants to "prioritize the backlog", "order the experiments", "figure out which experiment to run first", "triage the backlog", or asks "what should I try next". Reorders ideas across the backlog's sections; it does not define or run experiments.
---

# prioritize

Load `zenku:framework-core` first — it holds the collaborative workflow principles and the project's conventions (where the artifacts live, the stated purpose). Load `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/prioritization-rubric.md` for the scoring vocabulary (Stakes / Uncertainty / Cost / Unlock, the `(S×U)/C` sort, the S≈0 filter) — do not restate it here.

**Project extensions:** if `.zenku/prioritize.md` exists, read it now and fold its steps into the flow where it indicates. See the project-extension-hooks section in `zenku:framework-core`.

Order a backlog of **experiments** — bets that reduce uncertainty — so the most impactful ones run first. The spirit of this skill: **you bring the analysis and ask a handful of targeted questions; the user adjudicates a table.** Never march the user through the backlog one idea at a time, and never assume they hold the whole backlog and its dependencies in their head. This skill only *orders* ideas — it never judges whether an experiment is well-formed or worth doing (that is `/experiment-start` and `/experiment-conclude`'s job).

## Context

**Load these skills and read these files before proceeding.**

### Skills
- `zenku:framework-core` — collaborative principles + project conventions (purpose, artifact locations)

### The backlog and its context
- `BACKLOG.md` — the ideas to order (sections `## Next up`, `## Ideas`, `## Later / deferred`)
- `LEARNINGS.md` — what has already been answered or contradicted (drives Uncertainty)
- `experiments/README.md` — the experiment index (what is in flight / concluded)
- `PRODUCT.md`, `docs/planning/ROADMAP.md` (if present) — decisions the ideas might gate (drives Stakes)
- `CLAUDE.md` — the `## zenku` section: the project purpose (the impact anchor) and conventions

### Rubric
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/prioritization-rubric.md`

## Pre-Check

- If there is no `BACKLOG.md`, there is nothing to order — offer `zenku:init` and stop.
- If the backlog has zero or one idea, say so and stop — ordering needs at least two.

## Process

### 1. Load State (silent)

Read the backlog and its context. From `LEARNINGS.md` note which questions are already settled; from `PRODUCT.md`/`ROADMAP.md` note which decisions are pending (these are what an experiment can gate); from the `## zenku` section of `CLAUDE.md` note the project purpose. If no purpose is stated, skip the purpose-alignment lens rather than inventing one.

### 2. Analyze and Draft the Whole Ranking (silent)

This is your work product, done **before** bothering the user. From the backlog text alone, draft — for *every* idea at once:

- a first-pass **Stakes / Uncertainty / Cost** (1–3 each) and the **Unlock** flag, per the rubric;
- a **suspected dependency graph** — which ideas presuppose another's outcome;
- the resulting tiered order from `(S×U)/C`, ranked only within dependency tiers;
- the **S≈0 filter**: set aside ideas whose answer would change no decision.

Explicitly mark the cells you are **unsure** about — ambiguous stakes, ideas that might already be answered, and *suspected-but-unconfirmed* dependencies. These are what you'll ask about; everything you're confident in, you won't.

Keep the scores and reasoning in a scratchpad at `/tmp/zenku-prioritize-<id>-state.md` (`id` = an animal-adjective for parallel-safe runs). Scores never go into `BACKLOG.md`.

### 3. Ask Only the Targeted Questions the Draft Couldn't Resolve

A small, focused set — one question at a time, AskUserQuestion where the answer is enumerable. Each question targets a specific unknown from step 2: a suspected dependency, whether a question is already settled, or a genuine close call on stakes/urgency.

**Every question restates the full substance of the idea(s) it's about — the idea's actual question and its why — not just its bold title.** The user may not remember a backlog entry from its name alone. For example, instead of *"Does X need Y first?"* ask:

> Idea **X** ("can we score a diff incrementally to cut judge latency?") looks like it assumes we already have the streaming judge from **Y** ("does an incremental judge beat batch on latency?"). Does X actually need Y's result first, or are they independent?

Resolve ambiguity, confirm suspected dependencies, and settle close calls. Do **not** quiz the user on ideas you already scored confidently. For any idea that failed the S≈0 filter, tell the user it reads as a framing problem (its answer changes no decision yet) and suggest sharpening it via `/experiment-start` or parking it — don't force it into the ranking.

### 4. Validate (silent), before showing the user

Fold the answers back into the draft, then dispatch the reviewer:

```python
Task(
    subagent_type="zenku:priority-reviewer",
    prompt="""
Audit this proposed experiment ordering for coherence.

## Proposed order (with scores)
{the tiered table: idea, S, U, C, Unlock, tier}

## Dependency chains
{confirmed dependencies}

## Project purpose (if any)
{purpose}
"""
)
```

Auto-apply the reviewer's mechanical fixes to the draft (a clear inversion, an obvious bottleneck). Hold anything that needs a real choice for the user in the next step. The user only ever sees a reviewer-checked table.

### 5. Present the Results Table; Let the User Adjust

Show one table, ideas as rows, ordered by `(S×U)/C` into top/mid/low tiers with dependency chains honored:

| # | Idea | Gates (S) | How settled (U) | Spike cost (C) | Unlocks | Depends on |
|---|------|-----------|-----------------|----------------|---------|------------|
| 1 | **Streaming judge** — does an incremental judge beat batch on latency? | High | High | S | 2 ideas | — |
| 2 | **Diff scoring** — can we score a diff incrementally? | Med | High | M | — | Streaming judge |

Refer to ideas by their **bold title**, never a bare position. Briefly say why the top items are on top. Invite the user to override any cell, any rank, or any dependency directly — the table is the adjustment surface.

**If the user changes anything, re-dispatch `zenku:priority-reviewer` on the edited table and re-present if the re-check flags anything material.** Repeat until the user is happy with a clean table. Keep the reasoning in the conversation and the scratchpad — never in `BACKLOG.md`.

### 6. Apply — Ordering Only

Reorder `BACKLOG.md` to match the approved table. **Move entries; do not add scores, tiers, or rationale lines.**

First ensure all three sections exist — an older or hand-edited `BACKLOG.md` may be missing one; create any absent `## Next up` / `## Ideas` / `## Later / deferred` header before moving entries into it.

- **Top tier → `## Next up`**, in priority order (top = run first). Keep the existing bullet style — the *order* of the bullets carries the priority; do not convert to a numbered list.
- **Mid tier → `## Ideas`.**
- **Low tier / deferred → `## Later / deferred`**, carrying a short parking reason where the user gave one.

Preserve each entry's existing `**bold title** — question + why` text and its bullet marker verbatim; only its section and order change.

### 7. Summary

Present the new order and what moved:

```
"Backlog reordered.

Next up (run first): <idea-1> → <idea-2> → ...
Moved down: <idea> → Later (reason)

Next: /experiment-start <top idea>"
```

Note that re-running `/prioritize` after `/experiment-conclude` is normal and cheap — an answered question sinks automatically as its Uncertainty drops to Low.

## Workflow

- Draft the full ranking + suspected dependencies **yourself**, before asking anything
- Ask only the targeted questions the draft couldn't resolve — each carrying the idea's full substance
- Validate with `zenku:priority-reviewer` *before* presenting; re-validate after the user edits
- Apply as a **reorder only** — no scores or rationale written to `BACKLOG.md`
- This orders experiments; it never defines or judges them
