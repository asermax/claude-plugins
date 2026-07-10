# Feature Design — <feature name>

**Status**: <✗ draft | ✓ current>
**Spec**: [feature-specs/<feature>.md](../feature-specs/<feature>.md)
**Grounded in**: [experiment NNN](../../experiments/NNN-slug/README.md) (the spike is reference material — this design is the rewrite)
**Decisions**: [ADR-NNN](../architecture/ADR-NNN-*.md), [DES-NNN](../design/DES-NNN-*.md)

A durable feature design. It describes how the feature is built **in the present**. The experiment's spike code is *reference material, not code to copy* — graduation is a rewrite. Where a hard-to-reverse project-wide choice arises, spin out an **ADR**; where a repeatable cross-cutting pattern arises (used 2+ times), spin out a **DES**.

## Problem context

What this feature must do, its constraints (many carried from the experiment), and its interactions with other features.

## Design overview

The approach and its main components. Include a diagram (component/data-flow/sequence) — bridge the context gap.

## Modeling & data flow

The key entities, relationships, and state transitions, and how data moves through them: inputs → processing → outputs; error flows.

## Key mechanisms

| Part | Mechanism | Serves |
|------|-----------|--------|
| <part> | <concrete mechanism> | R1 |

Flag unknowns with ⚠️ and describe them below the table; resolve before implementation.

## Key decisions

### <Decision title>

- **Choice**: <what was chosen>
- **Evidence**: <experiment NNN | New>
- **Alternatives considered and not chosen**: <alternative> — not chosen because <reason>
- **Consequences**: <trade-offs, follow-on effects>

## Decisions surfaced

- **ADR candidate**: <hard-to-reverse choice> → `docs/architecture/ADR-NNN-*.md`
- **DES candidate**: <repeatable pattern> → `docs/design/DES-NNN-*.md`

## System behavior

Scenarios and edge cases, covering the spec's acceptance criteria.
