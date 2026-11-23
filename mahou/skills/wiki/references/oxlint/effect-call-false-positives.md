# oxlint rules that misread Effect's data-first calls

verified: 2026-11-23

Answers why oxlint reports an array-method rule on a call that has no array in it, when the code uses Effect's module functions in their data-first form, and what to write so the rule stays on.

## Knowledge

- `unicorn/no-array-method-this-argument` matches calls by method name and argument count, not by the receiver's type. `Option.filter(option, predicate)` has the shape of `array.filter(callback, thisArg)`, so the rule reports it as passing `thisArg` (seen with oxlint 1.92 under Ultracite).
- Do not disable the rule for the line. Write the value without the two-argument call: a ternary when the predicate does not read the value (`condition ? option : Option.none()`), or the data-last form inside `pipe` (`pipe(option, Option.filter(predicate))`), whose `filter` call takes one argument.

## Sources

- A lint run on a Foldkit and Effect 4.1.2 app, 2026-11-23: `Option.filter(model.tree, () => ...)` reported as `unicorn(no-array-method-this-argument)`; replaced with a ternary.
