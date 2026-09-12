# Shipping a Node CLI

verified: 2026-09-12

How a TypeScript CLI reaches a user's machine: as source, as a bundle, or as a compiled binary, and what each form costs a program that loads code at run time.

## Knowledge

- Node runs TypeScript directly, stripping types, stable since Node 24.12. A package can therefore publish its source with a `bin` pointing at a `.ts` file, with no build step and no second copy of every module. The cost is a minimum Node version, which `engines` states. Only erasable syntax works: no enums, no namespaces, no parameter properties.
- A compiled binary embeds the runtime and drops `node_modules`. Any import a plug-in makes of the tool's own package then fails to resolve, and the loader has to hand the modules over itself. pi does this with jiti's `virtualModules` map, statically importing every package an extension may use so the bundler includes them. That cost applies to every compiled form, not just one.
- `bun build --compile` leaves a dynamic import with a non-literal specifier unbundled and loads it from disk at run time. Bun also transpiles TypeScript on import, so an external TypeScript plug-in works with no extra tooling. Binaries run 57 to 91 MB. Bun keeps its own lockfile and ignores `pnpm-lock.yaml`. Compiling cannot target Node, since `--target=node` produces a bundle to a folder, not an executable.
- Node marks its own single executable applications as active development. In ESM mode the embedded script can dynamically import built-in modules only, and loading from disk throws; the workaround is a CommonJS main with a `createRequire` built from a different path.
- `deno compile` can only import files known at compile time, or embedded with `--include`, so arbitrary plug-in paths do not work.
- Bundling to one ESM file: esbuild 0.28 and rolldown 1.2 both take TypeScript in and emit a single Node ESM file. tsdown 0.23 wraps rolldown, detects a shebang and sets `bin`; tsup's last release was November 2025 and its own successor documentation points at tsdown. rollup needs a plugin for TypeScript and another for the shebang.
- A CommonJS-shaped dependency inside an ESM bundle needs a banner: `import { createRequire } from 'node:module'; const require = createRequire(import.meta.url)`. esbuild leaves a non-analyzable dynamic import in place rather than failing, and injects a shim that throws at run time when `require` is otherwise absent.
- jiti bundles its own Babel and ships no runtime dependencies of its own, so bundling it inlines several megabytes that only run on a transform cache miss. pi keeps it external and rewrites its import into a lazy `createRequire('jiti')`.
- `tsgo` type-checks and emits one file per source file. It does not bundle; a bundling step is separate.

## Sources

- https://nodejs.org/api/typescript.html
- https://bun.com/docs/bundler/executables
- https://nodejs.org/api/single-executable-applications.html
- https://docs.deno.com/runtime/reference/cli/compile/
- https://tsdown.dev/guide/migrate-from-tsup
- https://github.com/unjs/jiti/blob/main/AGENTS.md
- https://raw.githubusercontent.com/badlogic/pi-mono/main/scripts/build-coding-agent-bundle.mjs
