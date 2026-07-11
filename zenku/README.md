# zenku

Experiment-driven development. Ideas become **pre-registered experiments** that produce honest evidence; proven evidence flows into **durable engineering docs and code**. One spine, two halves, joined at `PRODUCT.md`.

zenku is the sibling of [katachi](../katachi). Where katachi bakes validation into its design phase through review loops, zenku's validation lives in the **experiments** — and its product-development docs are *fed from* those experiments rather than re-validated. Use zenku when the right design is genuinely unknown and has to be discovered, not just specified.

## Philosophy

- **Pre-register the judgment.** Write the single question, the falsifiable hypothesis, and how you'll judge the result *before* building. The verdict is rendered against that contract and the insight log — never against how it feels afterward.
- **One question per experiment.** If it needs an "and", split it.
- **Two-lens judging.** A *task* criterion (something concrete to do against a real work artifact) and an *insight* criterion (what understanding it produces) — because either lens alone has failure modes.
- **Spike discipline.** The experiment's code is a throwaway spike: minimal, real data, everything untested faked. Graduation to product is a *rewrite*, not a copy.
- **Negative results are first-class.** A documented dead end stops the team re-exploring it. Numbers are never reused; nothing is deleted.
- **Docs describe the present.** Durable docs are the source of truth for the current system — not a changelog.

## The two halves

### Experimentation

| Skill | What it does |
|-------|--------------|
| `zenku:capture` | Append an immature idea to `BACKLOG.md` — free, no interview |
| `zenku:experiment-start` | Promote an idea into a numbered pre-registered one-pager; scaffold a spike |
| `zenku:experiment-run` | Shape the minimal spike, build it against real data, assist + scribe the judging sessions |
| `zenku:experiment-conclude` | Force a verdict, append a `LEARNINGS.md` entry, promote proven pieces into a `PRODUCT.md` milestone |

### Product development (fed from the experiments)

| Skill | What it does |
|-------|--------------|
| `zenku:roadmap` | Break a `PRODUCT.md` milestone into features with ordering, a parallel set, and a dependency graph |
| `zenku:spec` | Durable feature spec, grounded in the source experiments |
| `zenku:design` | Durable feature design + inline ADR/DES (the spike is reference, not code to copy) |
| `zenku:implement` | Build against the design, then a code-review loop |
| `zenku:reconcile` | Fold what was built back into the durable docs; promote decisions |
| `zenku:patch` | Compressed single-session change (spec + design fused → implement → reconcile) grounded in a free-text description, a roadmap feature, or an experiment |

### Supporting

- `zenku:framework-core` *(internal)* — the shared principles, sandbox definition, artifact/doc map, and templates every skill loads first.
- `zenku:init` — scaffold the artifacts + docs tree and record project conventions.
- `zenku:commit` — analyze uncommitted changes and create grouped conventional commits.

## Project extension hooks

zenku's skills are generic. A project extends any skill with its own steps
**without forking it**: drop a `.zenku/<skill-name>.md` at the project root and
the skill folds those instructions into its flow (announcing that it did).
Extensions are additive — they add project-specific steps, never waive a
skill's core discipline. Typical uses: project-specific spike scaffolding in
`experiment-start`, syncing an outcome back to a source idea note in
`experiment-conclude`, project commit-grouping rules in `commit`. See the
project-extension-hooks section in `framework-core`.

## Artifact & doc map

```
BACKLOG.md                         ideas (Next up / Ideas / Later)
experiments/README.md              process note + one-pager template + index
experiments/NNN-slug/README.md     one-pager: question/hypothesis/judging, setup, insight log, verdict
LEARNINGS.md                       append-only, one entry per concluded experiment
PRODUCT.md                         milestones of promoted pieces ── the bridge ──▶
docs/planning/ROADMAP.md           per-milestone feature order + dependency graph
docs/feature-specs/<feature>.md    durable feature specs
docs/feature-designs/<feature>.md  durable feature designs
docs/architecture/ADR-NNN-*.md     one-time, hard-to-reverse decisions
docs/design/DES-NNN-*.md           repeatable cross-cutting patterns
```

## Getting started

1. `zenku:init` — scaffold the artifacts and record this project's conventions (purpose, spike location, build/test/lint commands) in its `CLAUDE.md`. There is no separate config file.
2. `zenku:capture` an idea → `zenku:experiment-start` → `zenku:experiment-run` → `zenku:experiment-conclude`.
3. When a `PRODUCT.md` milestone is worth building: `zenku:roadmap` → `zenku:spec` → `zenku:design` → `zenku:implement` → `zenku:reconcile`.

## Conventions

- Project-specific bits live in a `## zenku` section of the project's own `CLAUDE.md` — no config file.
- Experiment sandboxes are **stack-agnostic**, defined by properties (isolated, throwaway, minimal, real-data, easy to run/discard). A web/React example ships as one illustration, never the default.
- All skills and agents use the `zenku:` namespace.
