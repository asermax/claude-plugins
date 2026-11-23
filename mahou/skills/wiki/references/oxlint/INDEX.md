# oxlint

- [`effect-call-false-positives`](effect-call-false-positives.md): oxlint rules written for array methods that fire on Effect's module functions, such as `Option.filter(option, predicate)` or `Arr.reduce` inside `pipe`, and what to write instead
- [`disable-directives`](disable-directives.md): why an `oxlint-disable-next-line` directive stops applying after a formatter splits the expression, and how to keep the reported node on the next line
- [`sort-compare`](sort-compare.md): what `require-array-sort-compare` reports, including `toSorted()`, and comparing two lists without their order in a test so the rule passes
