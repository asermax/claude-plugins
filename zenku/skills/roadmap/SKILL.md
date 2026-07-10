---
name: roadmap
description: |
  Break a PRODUCT.md milestone into an ordered, dependency-aware feature list and record it in docs/planning/ROADMAP.md. Use when the user wants to "plan a milestone", "build the roadmap", "break this milestone into features", or "figure out what to build first". This is the entry point that feeds zenku:spec and zenku:design.
---

# Roadmap Workflow

Turn a milestone from `PRODUCT.md` into a buildable roadmap: an ordered feature
list, the set that can go in parallel, and a cycle-checked dependency graph.
The features you name here are the units the rest of the track operates on —
each becomes a `zenku:spec`, then a `zenku:design`, then an implementation.

## Input

The milestone to plan (from `PRODUCT.md`). Identify it from `$ARGUMENTS` or the
user's request; if ambiguous, list the milestones in `PRODUCT.md` and ask which.

## Context

**Load these skills and read these files before proceeding.**

### Skills
- `zenku:framework-core` — collaborative workflow principles + project conventions (doc locations, PRODUCT.md location)

### Product backlog
- `PRODUCT.md` — promoted experiments parked under milestones; the milestone entry points at each promoted piece's source experiment(s)

### Existing roadmap (if present)
- `docs/planning/ROADMAP.md` — current roadmap to extend or update

### Template
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/roadmap-template.md` — section structure to follow

## Pre-Check

- If `PRODUCT.md` has no milestones yet, there is nothing to plan — say so and stop.
- If the target milestone has a section in `docs/planning/ROADMAP.md` already, this is an update, not a fresh plan (see step 1).

## Process

### 1. Check Existing State

If the milestone already has a section in `docs/planning/ROADMAP.md`:
- Read it. Check for drift: did `PRODUCT.md` gain or change promoted pieces since it was written?
- Summarize the current feature list, ordering, and dependency graph to the user.
- Ask what needs revisiting (a new feature, a changed dependency, a re-order), and update only that.

If no section exists: proceed with a fresh plan.

### 2. Read the Milestone (Silent)

Read the milestone entry in `PRODUCT.md`. For each promoted piece, note its
title, what proved out, its documented constraints, and the experiment(s) it
links to (`experiments/NNN-slug/README.md`). Build a complete picture of the
package this milestone adds up to — do not read the experiment one-pagers in
full here (that is `zenku:spec`'s job); you only need enough to carve features.

### 3. Interview: Carve the Milestone into Features (Collaborative)

Follow the one-question-at-a-time principle from `zenku:framework-core`.

Present your reading of the milestone, then propose an initial feature
breakdown for the user to refine. A **feature** is a buildable slice with a
stable slug (used for `docs/feature-specs/<feature>.md` and
`docs/feature-designs/<feature>.md`). A promoted piece may become one feature,
split into several, or fold together with another — this is the decision to
make with the user.

Use AskUserQuestion for structured choices (2-4 options: how to split a piece,
whether two pieces are one feature, granularity). Ask about:
- **Feature boundaries** — where one feature ends and the next begins
- **Ordering** — what must be built first (foundations, shared mechanisms)
- **Naming** — confirm each feature's slug

Each feature must map back to the PRODUCT.md milestone entry (and thereby its
source experiments) — record that link. Do not invent features with no basis
in a promoted piece; if the user wants one, that is a gap to `zenku:capture` or
a new experiment, not a roadmap entry.

### 4. Establish Dependencies and Ordering (Collaborative)

For each feature, determine its `Depends on:` list (other features in this or
an earlier milestone that must exist first). Propose dependencies from what you
read, then confirm with the user.

Derive from the dependency graph:
- **Build order** — a topological ordering; foundations first
- **Parallelizable set** — features with no interdependency that can be worked at once

**Cycle check (required):** verify the `Depends on:` edges form a DAG. If you
find a cycle, surface it to the user and resolve it (drop or redirect an edge)
before writing anything.

### 5. Draft the Roadmap Section

Following the template, draft (or update) the milestone's section in
`docs/planning/ROADMAP.md`:
- A short milestone summary (what package it adds up to), linking to the `PRODUCT.md` milestone
- An **ordered feature list**: each row carries the feature name/slug, its `Depends on:` list, features it is **Parallel-safe with**, a link back to the PRODUCT.md piece + source experiment(s), and a **Status** marker
- The **parallelizable set** called out explicitly
- The **dependency graph** rendered as a mermaid diagram (`graph TD`), one node per feature, edges from dependency to dependent

Status markers (the lifecycle the rest of the track advances):
`✗ Defined` → `✓ Spec` → `✓ Design` → `✓ Implemented` → `✓ Reconciled`
(use `⧗` for a phase in progress). New features start `✗ Defined`.

### 6. Validate the Mermaid Diagram

If the `superpowers:mermaid-validation` skill is available, use it to validate
the dependency-graph code block. If it is not available, skip validation
gracefully (do not block on it) — just double-check the syntax by eye.

### 7. Present for Review

Show the drafted section to the user: the ordered feature list, the
parallelizable set, and the rendered dependency graph. Highlight the build
order and any feature whose dependencies you inferred rather than confirmed.

Invite feedback: "Does this ordering and dependency graph match how you'd
build the milestone?"

### 8. Iterate, Then Finalize

Apply the user's corrections (re-run the cycle check and mermaid validation if
edges changed). When approved, write the section to `docs/planning/ROADMAP.md`.

Present a summary:
```
"Roadmap ready for <milestone>.

Build order: <feature-1> → <feature-2> → ...
Parallelizable: {<feature-a>, <feature-b>}

Next: /zenku:spec <first-feature>"
```

## Workflow

- Read the milestone silently; carve it into features **with** the user
- Establish ordering + parallelizable set + a cycle-checked dependency graph
- Every feature traces back to a PRODUCT.md piece and its source experiments
- Write/update the per-milestone section in `docs/planning/ROADMAP.md`, mermaid graph validated when the skill is available
- Present, iterate, finalize — this feeds `zenku:spec` and `zenku:design`
