# Sandbox example — a web/React project

This is **one worked example** of an experiment sandbox convention, not the zenku default. zenku prescribes sandbox *properties* (isolated, throwaway, minimal, real-data, easy to run/discard), never a stack. A project records its own convention in the `## zenku` section of its `CLAUDE.md`. This example shows what that looks like for a Vite + React + TypeScript app (the layout the framework was first extracted from).

## Layout

- `src/experiments/<NNN-slug>/` — throwaway experiment code, one route each. Not held to production quality.
- `src/experiments/registry.ts` — registers each experiment as a lazily-imported route so the app shell can list and open it.
- `src/app/` — a shell: a router plus a gallery listing registered experiments.
- Production library code lives elsewhere (e.g. `src/lib/`), imports nothing from `src/experiments/`, and is populated later by the product half — never directly by an experiment.

## Running a spike

```sh
pnpm dev     # experiments gallery at localhost:5173
pnpm lint    # verify the scaffold
pnpm build   # verify the scaffold compiles
```

## What the `## zenku` section in CLAUDE.md would say

```markdown
## zenku

- **Purpose**: <what this project is for>
- **Spike location**: `src/experiments/<NNN-slug>/`, registered in `src/experiments/registry.ts`
- **Run a spike**: `pnpm dev`, open the experiment from the gallery
- **Build / test / lint**: `pnpm build` / `pnpm test` / `pnpm lint`
```

Other stacks look completely different — a `spikes/` directory of scripts, a scratch notebook, a throwaway CLI. The properties are what matter, not this shape.
