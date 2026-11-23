# Sharing helpers between oxlint JS plugins

verified: 2026-11-23

How to move syntax-tree and scope helpers that several custom oxlint JS plugins copy into shared modules, how to merge copies that drifted apart, how to prove the move changed no report, and how the shared helpers type against `@oxlint/plugins`.

## Knowledge

- A JS plugin named in the config's `jsPlugins` (by a relative `specifier`) is loaded as a TypeScript module, and it can import other `.ts` modules by relative path, such as `./plugin-shared/expressions.ts`. Split the shared modules by kind: file paths (repository root, workspace-relative path, test-file check), expressions (unwrapping parentheses, `as`, `!`, `satisfies` and optional chains, static property and key names, string values), imports (the import identity of an expression, import specifier names) and scope (the variable a name resolves to, whether it is declared locally or never reassigned, whether it names a global object).
- Add the shared folder to the tsconfig that typechecks the plugins; a pattern such as `scripts/*.ts` does not include subfolders.
- When two copies of a helper differ, read every caller before choosing. Merge a difference that only adds correct detection (one copy also unwraps `ChainExpression`, or also reads a non-computed string-literal key `{ "require": x }`) into the superset. Turn a difference the callers depend on into a parameter instead: two import resolvers that each follow a different set of re-exported namespaces (`Effect` in one plugin, `HttpApi`, `Rpc` and the like in the other) become one resolver that takes that set.
- Unify the "no value" sentinel (`null` or `undefined`) of merged helpers, then fix every caller's comparison: `name !== undefined` against a helper that now returns `null` silently becomes always true.
- A repository that lints clean gives an empty report before and after, which proves nothing. Also run a stress config: every custom rule turned on for every file, no per-file overrides, and the core categories off, with `--format=unix` so each report is one line. Diff the before and after outputs of both the real config and the stress config, and run the plugins' own rule tests.
- `oxlint -c stress.config.ts` takes the stress config as a TypeScript module with `defineConfig`, like the main `oxlint.config.ts`. The order of the lines in a `--format=unix` report changes between runs, because JS plugins lint files in parallel, so sort both reports before diffing them; an unsorted diff shows the same lines removed and added.
- Two shared helpers that resolve each other, such as a require-function check that follows a `createRequire` import and an import resolver that follows `require(...)` calls, trip `eslint/no-use-before-define` whichever is declared first. Keep both as top-level exports and put one disable directive, with its reason, on the forward call; nesting a private copy of one inside the other is how the plugins came to hold two copies.
- Run both lint passes in a detached worktree of the same commit (`git worktree add --detach`, install the dependencies there), copying only your changed files in for the second pass. In a checkout other people are editing, their half-finished files change the report between the two runs.
- `@oxlint/plugins`' `ESTree` namespace exports no `Literal` type; use `Extract<ESTree.Node, { type: "Literal" }>`. A `Property` visitor receives a union that includes destructuring and assignment-target properties, whose `value` is not an `Expression`; visit `ObjectExpression` and iterate its `properties` to get object-literal properties only.
- A rule that decides by the file's place in the repository reads `context.filename`. In `RuleTester` cases, set `filename` to an absolute path under the repository root; the file need not exist unless the rule reads it.
- A rule-test case whose code holds `${...}` in a plain string trips `no-template-curly-in-string`. Write the case as a template literal with the inner backticks and `${` escaped.
- `RuleTester.describe` and `RuleTester.it` can be set to `describe` and `it` from `@effect/vitest`. The Effect language service then reports `it` as an unstable API in the plugin typecheck unless the tsconfig's `allowedUnstableApis` lists `"@effect/vitest"`.

## Sources

- A review of that refactor, 2026-11-23: a third plugin's private require resolver merged into the shared import module, with the stress report identical once sorted and different line order between two runs of the same code.

- oxlint 1.92.0 with `@oxlint/plugins` 1.92.0, `oxlint/plugins-dev` `RuleTester`, effect-tsrs 0.2.3 and `@effect/vitest` 4.1.2: a refactor that moved the copied helpers of two custom plugins into shared modules and added a plugin of ten rules on them, with before and after reports of the real and the stress config identical, 2026-11-23.
