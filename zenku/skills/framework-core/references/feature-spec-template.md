# Feature Spec — <feature name>

**Status**: <✗ draft | ✓ current>
**Roadmap**: [Milestone N / `<feature-slug>`](../planning/ROADMAP.md)
**Grounded in**: [experiment NNN](../../experiments/NNN-slug/README.md), `LEARNINGS.md` YYYY-MM-DD — NNN

A durable feature spec. It describes the **present intent** of the feature. It is *grounded in experiments* — what proved out becomes must-have behavior; the constraints the sessions discovered become requirements. It does not re-argue the idea; the experiments already validated it.

## User story

As a <user>, I want <capability>, so that <outcome>.

## Requirements

Prioritized problem-space summary. Each requirement links the evidence that justifies it. Status: `Core goal` / `Must-have` / `Nice-to-have` / `Out`.

| ID | Requirement | Status | Evidence |
|----|-------------|--------|----------|
| R1 | <what is needed> | Core goal | [exp NNN](../../experiments/NNN-slug/README.md) |
| R2 | <what is needed> | Must-have | `LEARNINGS.md` NNN |

Requirements state WHAT is needed. Acceptance criteria define HOW to verify each.

## Acceptance criteria

- **R1** — Given <context>, When <action>, Then <observable result>.
- **R2** — Given <context>, When <action>, Then <observable result>.

## Open questions / unknowns

Anything the experiments did not settle. Route each: an explicit unknown to resolve in `/design`, or a fresh `zenku:capture` for a follow-up experiment.

## Out of scope

What this feature deliberately does not do, and why.

## Dependencies

The roadmap features this one depends on — mirrors the `Depends on` column for this feature in `docs/planning/ROADMAP.md`; list them here as links.
