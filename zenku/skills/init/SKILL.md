---
name: init
description: |
  Set up the zenku framework in a project — scaffold the experimentation artifacts and docs tree, and record project conventions (purpose, spike location, build/test/lint commands) in the project's CLAUDE.md. Use when starting zenku in a repo for the first time, or when a skill reports the project is not initialized.
---

# Initialize zenku

Set up zenku in the current project. Load `zenku:framework-core` first for the collaborative principles and the artifact/doc map.

This is a collaborative setup — propose, confirm, then write. Never clobber an existing artifact; detect what is present and only fill gaps.

## 1. Detect state

Check for: `BACKLOG.md`, `experiments/`, `LEARNINGS.md`, `PRODUCT.md`, `docs/planning/ROADMAP.md`, and a `## zenku` section in `CLAUDE.md`. Also note whether the repo already has significant code (a brownfield project) — its purpose and stack can seed the conventions.

Report what already exists. If everything is present, there is nothing to do — say so and stop.

## 2. Interview for conventions

Ask, one question at a time (skip any the repo already answers, confirming your inference rather than asking cold):

- **Purpose** — what is this project for? (Experiments are judged partly on whether they serve it. It's fine to leave this blank for a pure exploration repo; skills will skip the purpose check.)
- **Spike location & run command** — where should experiment sandboxes live, and how is one launched? Offer the properties from `zenku:framework-core` (isolated, throwaway, minimal, real-data, easy to run/discard) and, if the stack fits, point at `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/sandbox-example-web.md` as one illustration. Do not impose a stack.
- **Build / test / lint commands** — detect from the lockfile/manifest and confirm; used by `experiment-start`, `implement`, and `reconcile`.
- **Docs layout** — defaults to the framework-core map; only record if this project deviates.

## 3. Write the `## zenku` section into CLAUDE.md

Append (or create `CLAUDE.md` with) a `## zenku` section capturing the answers:

```markdown
## zenku

- **Purpose**: <what this project is for, or omit>
- **Spike location**: <where experiment sandboxes live>
- **Run a spike**: <command / how to launch>
- **Build / test / lint**: <commands>
- **Docs layout**: <only if this project deviates from the framework-core map>
```

Every zenku skill reads this section. This is the only "config" — there is no separate config file.

If the project needs a skill to do something project-specific that a convention line can't capture — bespoke spike scaffolding, syncing an outcome to an external note, custom commit grouping — that goes in a `.zenku/<skill-name>.md` extension file (see the project-extension-hooks section in `zenku:framework-core`), not here. Don't create these during init; mention the mechanism and let them be added when a real need appears.

## 4. Scaffold artifacts (only what's missing)

- `BACKLOG.md` — with the section headers `## Next up`, `## Ideas`, `## Later / deferred` and a one-line note that capturing is free (`/capture`).
- `experiments/README.md` — the process note + the one-pager template (copy from `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/onepager-template.md`) + an empty index table (`| # | Experiment | Verdict |`).
- `LEARNINGS.md` — header + the entry shape (from `learnings-entry-template.md`), append-only note.
- `PRODUCT.md` — header + the milestone conventions (from `product-entry-template.md`, the prose through "Rules of the road" only — the trailing "## Milestone N" section is a worked example for `/experiment-conclude` to follow later, not something to pre-populate into a new project's file).
- `docs/` tree — create `docs/planning/`, `docs/feature-specs/`, `docs/feature-designs/`, `docs/architecture/`, `docs/design/`. These stay empty until the product half runs; a short `docs/README.md` explaining the layout is optional.

## 5. Explain what's next

Briefly restate the flow and hand off:

- Capture an idea with `zenku:capture`.
- Turn one into a pre-registered experiment with `zenku:experiment-start`, run it with `zenku:experiment-run`, close it with `zenku:experiment-conclude`.
- Once a `PRODUCT.md` milestone is worth building, start the product half with `zenku:roadmap`.
