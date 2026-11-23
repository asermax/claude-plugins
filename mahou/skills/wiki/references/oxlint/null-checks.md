# Null checks written `== null`

verified: 2026-11-23

Answers how to let `x == null` and `x != null` through oxlint while every other loose comparison stays an error, how to report the strict forms with an autofix, and how to apply one rule's fix across a repository without the other rules' fixes.

## Knowledge

- `eqeqeq` takes `["error", "always", { null: "ignore" }]` and `["error", "smart"]` in oxlint 1.92.0. Both accept `x == null` and reject `x == 1` and `x != undefined`, so the only accepted loose form is the comparison with the `null` literal. `smart` also accepts `typeof x == "string"` and comparisons of two literals; `always` with `null: "ignore"` does not.
- Ultracite's oxlint core config turns on `no-eq-null`, which reports `== null` itself. Turn it off next to the `eqeqeq` setting, or every `== null` fails the lint.
- No built-in oxlint rule, Ultracite rule or `@foldkit/oxlint-plugin` rule reports `x === undefined`, `x !== null` or `typeof x === "undefined"` in favour of `== null`, so a custom JS rule is needed. It visits `BinaryExpression` with operator `===` or `!==`, matches a `Literal` whose `raw` is `"null"` or an `Identifier` `undefined` that no scope declares, and matches `typeof` (a `UnaryExpression`) against the string `"undefined"`.
- For a strict comparison, `node.left` is never a `PrivateIdentifier` in the `@oxlint/plugins` types (only `#x in obj` has one), and a guard against it fails the type check with TS2367.
- Build the fix from the source text around the operator, not from `getText(node.left)`: the operand's range leaves out its parentheses, while the text from `node.range[0]` to the operator keeps them, so `(a?.b) !== undefined` becomes `(a?.b) != null`.
- Skip the fix for `typeof x === "undefined"` when `x` is an identifier no scope declares: `x == null` throws a `ReferenceError` where the `typeof` check returned `true`. Report it without a fix. Note too that `typeof x === "undefined"` is false for `null`, so the rewrite changes the result for a null value.
- To apply only the new rule's fix to a whole repository, run `oxlint -c <config> --fix <dirs>` with a separate config that loads just the plugin and enables just that rule, such as `{"plugins": [], "categories": {"correctness": "off"}, "jsPlugins": [{"name": "invariants", "specifier": "<absolute path>"}], "rules": {"invariants/<rule>": "error"}}`. The project config would also apply every other fixable rule.
- The rule's fix rewrites each comparison on its own, so `x === undefined || x === null` becomes `x == null || x == null`. Search the diff for repeated operands and merge them; `oxc/const-comparisons` reports the repeated form joined with `&&`, but read the `||` cases yourself. A plain line-based `rg` for `=== undefined` also misses a comparison that oxfmt split over two lines (`... !==\n undefined`); the lint run finds those.

## Sources

- oxlint 1.92.0, oxfmt 0.77.0 and ultracite 8.1.1 (`config/oxlint/core/index.mjs` sets `eqeqeq` and `no-eq-null` to `error`), adding `invariants/loose-null-checks` to saifu and running it over the repository, 2026-11-23.
