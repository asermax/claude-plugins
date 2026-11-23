# Branching on a Foldkit union

verified: 2026-11-23

Which form branches on a value of a Foldkit union (`defineTaggedUnion`, `defineRouteUnion`, `defineMessageUnion`): the union's own `match` or `matchOrElse`, its `guards`, or Effect `Match`. Also how far a lint rule without type information can enforce the choice. The general case, discriminated unions and exhaustive switches, is in [`typescript/variants`](../typescript/variants.md).

## Knowledge

- Foldkit 0.170's doc comments set the forms. For `defineTaggedUnion`: "`match` for exhaustive handling", "`matchOrElse` for selected variants with a fallback for the rest", "`guards` and `isAnyOf` for variant checks". For `defineRouteUnion`: "Use `match` to handle every Route, `matchOrElse` to handle selected Routes with a fallback, `guards` or `isAnyOf` to check selected tags". For `defineMessageUnion`: "Message unions intentionally expose only constructors and exhaustive `match`. Use Effect `Match` when only some tags need handling or several tags share one handler."
- Which form to write:

  | What the code does | Tagged or route union | Message union |
  | --- | --- | --- |
  | One handler per variant, every variant | `X.match(value, { A, B })` | `X.match(value, { A, B })` |
  | Some variants, a fallback for the rest | `X.matchOrElse(value, { A }, fallback)` | Effect `Match.tag("A", …)` then `Match.orElse` |
  | Several tags share one handler | Effect `Match.tag("A", "B", …)` | Effect `Match.tag("A", "B", …)` |
  | Check one or a few tags | `X.guards.A(value)`, `X.isAnyOf` | Effect `Match` or `Predicate.isTagged` |

- `X.match` takes the cases as an object keyed by tag and fails to compile when a tag is missing or unknown, as `Match.tagsExhaustive` does. It also has a curried form, `X.match({ ... })` returning a function of the value, and an output type argument, `X.match<Output>(value, cases)`, for when the handlers' results must widen to one declared type. `matchOrElse` passes the fallback only the variants the cases leave out.
- Unions that a library defines with these factories follow the same rules. The message union of a `@foldkit/ui` component such as `Dialog.Message` exposes only `match`, so code that handles one of its tags and forwards the rest keeps Effect `Match.tag` plus `Match.orElse`.
- A plain TypeScript union of `_tag` objects has no `match` of its own, for example one that is generic over the parent's message type and so cannot be a Schema. Effect `Match.tagsExhaustive` stays right for it.
- A lint rule without type information cannot tell which union a matched value belongs to. The rule can compare tag sets instead. It collects the tags of `Match.tagsExhaustive({ ... })`, or of a chain of single-tag `Match.tag` and `Match.tags` steps closed by `Match.exhaustive`, and flags them when they equal exactly the tags of a Foldkit union declared in the same file or in a module the file imports. To find those unions, the rule reads each relatively imported module and takes the top-level keys of the object passed to `define*Union`. Without the import condition the rule raises false positives: a plain TS union and an unrelated Foldkit union in the same project can share a tag set (two tags such as an asking and a refusal state). The rule's message points at the union's own `match`.
- Such a rule misses partial matches that should be `matchOrElse`, unions declared in a module the file reaches only through another module, unions from packages, and unions whose keys are spread or computed. A multi-tag `Match.tag` step is skipped on purpose, since a shared handler is the case Foldkit keeps Effect `Match` for.
- Test the rule with `RuleTester` from `oxlint/plugins-dev` under vitest. Set `RuleTester.describe` and `RuleTester.it` to functions that call vitest's `describe` and `it` and return nothing; assigning vitest's functions directly fails a strict-void-return lint. Because the rule reads imported modules from disk, write them to a folder from `mkdtempSync` and give the test case a `filename` in that folder.

## Sources

- Foldkit 0.170.0 `foldkit/dist/schema/index.d.ts` and `index.js`, doc comments on `defineTaggedUnion`, `defineRouteUnion` and `defineMessageUnion`, read 2026-11-23.
- oxlint 1.92.0 `oxlint/dist/plugins-dev.d.ts` (`RuleTester`), read 2026-11-23.
- A refactor of a Foldkit app's Effect `Match` calls to the unions' own `match`, and a custom oxlint rule written for it, 2026-11-23.
