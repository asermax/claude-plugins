# oxlint

- [`effect-call-false-positives`](effect-call-false-positives.md): oxlint rules written for array methods that fire on Effect's module functions, such as `Option.filter(option, predicate)` or `Arr.reduce` inside `pipe`, and what to write instead
- [`disable-directives`](disable-directives.md): why an `oxlint-disable-next-line` directive stops applying after a formatter splits the expression, and how to keep the reported node on the next line
- [`sort-compare`](sort-compare.md): what `require-array-sort-compare` reports, including `toSorted()`, and comparing two lists without their order in a test so the rule passes
- [`js-plugin-shared-helpers`](js-plugin-shared-helpers.md): moving the helpers several custom JS plugins copy into shared modules, merging copies that drifted apart, proving the move changed no report with a stress config in a worktree, and typing visitors and rule tests against `@oxlint/plugins`
