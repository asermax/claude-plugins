# typescript

- [`variants`](variants.md): modelling a value that takes one of several shapes as a discriminated union, and making every switch over it exhaustive
- [`branded-primitives`](branded-primitives.md): keeping two primitives that mean different things from being passed for each other, and where a brand may come from
- [`casts`](casts.md): what to write instead of `as`, from `satisfies` to the narrowing a check gives, what a type guard must check, and why a guard that checks more than its type narrows the false branch wrongly
- [`boundaries`](boundaries.md): where external data is parsed, which schema owns its type, and why code inside the boundary does not check it again
- [`constructive-types`](constructive-types.md): writing a type whose illegal values cannot be built, and when a plain type is enough
