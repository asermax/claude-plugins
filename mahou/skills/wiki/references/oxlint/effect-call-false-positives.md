# oxlint rules that misread Effect's data-first calls

verified: 2026-11-23

Answers why oxlint reports an array-method rule on a call that has no array method in it, when the code calls Effect's module functions such as `Option.filter` or `Array.reduce`, and what to write so the rule stays on.

## Knowledge

- `unicorn/no-array-method-this-argument` matches calls by method name and argument count, not by the receiver's type. `Option.filter(option, predicate)` has the shape of `array.filter(callback, thisArg)`, so the rule reports it as passing `thisArg` (seen with oxlint 1.92 under Ultracite). `Option.map(option, fn)` trips it the same way, also when `fn` is a function reference such as `Option.map(selected, labelOf)`.
- `unicorn/no-array-reduce` matches any call whose callee property is named `reduce`, so it also reports Effect's `Array.reduce` in the data-last form inside `pipe` (`pipe(items, Arr.reduce(seed, f))`), where neither the argument count nor the receiver looks like `Array#reduce`. Effect's data-last form does not help here. Write a `for` loop over the items, as the rule asks, or use a dedicated fold when one exists (`Number.sumAll`, `Array.max` with an `Order`).
- `eslint/array-callback-return` reports `Effect.map((value) => { expect(value).toEqual(...); })`, whose block body returns nothing, as an `Array.prototype.map` callback that does not return on all code paths. Write the step as a generator instead: `Effect.gen(function* expectsNothingBroken() { expect(yield* effect).toEqual(...); })`. Name the generator, since `eslint/func-names` reports an unnamed one.
- Do not disable the rule for the line. Write the value without the two-argument call: a ternary when the predicate does not read the value (`condition ? option : Option.none()`), or the data-last form inside `pipe` (`pipe(option, Option.filter(predicate))` or `option.pipe(Option.map(fn))`), whose call takes one argument.

## Sources

- A lint run with oxlint 1.92.0 under Ultracite 8.1.1 and Effect 4.1.2, 2026-11-23: a test helper `query.pipe(Effect.map((rows) => { expect(rows).toEqual(empty); }))` reported as `eslint(array-callback-return)`; the `Effect.gen` form with an unnamed `function*` then reported as `eslint(func-names)`, and passed once named.

- A lint run with oxlint 1.92.0 under Ultracite 8.1.1 and Effect 4.1.2, 2026-11-23: `pipe(more, Arr.reduce(Arr.of(seed), (totals, line) => ...))` reported as `unicorn(no-array-reduce)`; replaced with a `for` loop that reassigns a non-empty array.

- A lint run on a Foldkit and Effect 4.1.2 app, 2026-11-23: `Option.filter(model.tree, () => ...)` reported as `unicorn(no-array-method-this-argument)`; replaced with a ternary. `Option.map(inputs.selected, inputs.labelOfMissing)` reported the same way, replaced with `inputs.selected.pipe(Option.map(inputs.labelOfMissing))`, same day.
