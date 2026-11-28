# Type checking with the Effect-patched compiler

verified: 2026-11-28

Answers how to make every package of a pnpm workspace type-check with the Effect-patched TypeScript compiler (`@effect/tsgo`), so the Effect diagnostics a CI run reports also show up locally.

## Knowledge

- `effect-tsgo patch` (usually the root `prepare` script) replaces the native TypeScript-Go package the workspace installs. It patches only that package. A TypeScript 5 copy that another dependency pulls in as a peer stays unpatched, and its `tsc` reports none of the Effect diagnostics.
- A package's `node_modules/.bin/tsc` can point at such a peer copy and shadow the root's patched `tsc` for that package alone. A script that runs `tsc` in that package then uses the unpatched compiler and exits 0 on code that the Effect diagnostics reject, such as `Date.now()` inside Effect code (`globalDateInEffect`). Every other package and a fresh CI install report those diagnostics. Check each package by running `pnpm exec tsc --version` from its folder. The patched compiler prints `+effect-tsgo` after its version.
- A `node_modules/.bin/tsc` that points at the peer copy survives `pnpm install` and `pnpm install --force`, which report the workspace up to date. Deleting the package's `node_modules` and installing again removes it.
- `effect-tsgo tsc [args]` runs the patched compiler straight from `@effect/tsgo`, without going through `node_modules/.bin`. When you pass no version, it uses the installed TypeScript-Go version if `@effect/tsgo` supports that version, so it type-checks with the same compiler and downloads nothing. Writing every package's type-check script as `effect-tsgo tsc --noEmit` takes the shim out of the path. Keep the `prepare` patch, because editors run their own language server and never run the type-check script.
- A task runner that caches the type-check result by the package's own files (turbo's default inputs) keeps replaying a result the wrong compiler produced until one of those files changes. After fixing the compiler, run the type check once without the cache (`turbo run typecheck --force`).

## Sources

- A workspace on `@effect/tsgo` 0.67.5 and TypeScript 7.0.2 where one package resolved `tsc` to a TypeScript 5.9.3 peer copy: `tsc --noEmit` there exited 0 on four `Date.now()` calls inside `Effect.gen`, CI reported them as `TS377067`, and after deleting and reinstalling the package's `node_modules`, the same command reported all four, 2026-11-28.
- `effect-tsgo patch` reporting "typescript skipped because its hash matches the replacement" while the 5.9.3 copy stayed unpatched, and `pnpm install --frozen-lockfile --force` leaving the stale shim in place, 2026-11-28.
- `effect-tsgo --help` and `effect-tsgo tsc --version` (`7.0.2+effect-tsgo.0.67.5`), and `effect-tsgo tsc --noEmit` against `tsc --noEmit` on the same package: both exit 0, `effect-tsgo tsc` in 2.1 s and `tsc` in 1.9 s, 2026-11-28.
