# typescript

- [`variants`](variants.md): modelling a value that takes one of several shapes as a discriminated union, and making every switch over it exhaustive
- [`branded-primitives`](branded-primitives.md): keeping two primitives that mean different things from being passed for each other, and where a brand may come from
- [`casts`](casts.md): what to write instead of `as`, from `satisfies` to the narrowing a check gives, what a type guard must check, why a guard that checks more than its type narrows the false branch wrongly, and how to remove casts around a library's type-level checks and invariant containers
- [`boundaries`](boundaries.md): where external data is parsed, which schema owns its type, how to annotate an Effect schema with a type that comes first, and why code inside the boundary does not check it again
- [`constructive-types`](constructive-types.md): writing a type whose illegal values cannot be built, and when a plain type is enough
- [`generic-schema-parameters`](generic-schema-parameters.md): passing a caller's schema into a factory's `Schema.Struct` without making the struct's type opaque, while handing back the caller's schema with its own members
