# PRODUCT.md conventions

Where promoted experiments wait to become product. When `/experiment-conclude` renders a **promote** verdict, the proven piece is parked here — pointing at its evidence — instead of being built on the spot. Building is a separate, later activity (the product half: `roadmap → spec → design → implement → reconcile`), which reads these entries and their linked experiments.

Entries accumulate under **milestones**. A milestone is a coherent package worth building as one unit; keep adding proven pieces until it is, then start the product half. Which milestone an entry joins is decided with the user at experiment closure.

Rules of the road:
- Only concluded experiments land here; the entry links the one-pager, which owns the full evidence. Don't restate the insight log — point at it.
- Each entry carries the *implementation-relevant* distillation: what proved out, the constraints the sessions discovered, and where the spike code lives (reference material — building from here is a rewrite).
- Milestones are numbered and named for the package they add up to. Nothing here is scheduled; order within a milestone is not priority (the roadmap decides order).

## Milestone N — <name>

*<one-line description of the coherent package this milestone adds up to>*

- **<proven piece>** — proved in [experiment NNN](experiments/NNN-slug/README.md) (YYYY-MM-DD). What proved out: <distillation>. Implementation-relevant constraints from the sessions: <constraints the later spec must honor>. Spike code: `<spike location>` — reference material, implementation is a rewrite.
