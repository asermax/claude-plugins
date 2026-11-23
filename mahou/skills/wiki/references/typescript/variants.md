# Variants as discriminated unions

verified: 2026-11-23

Answers how to type a value that takes one of several shapes, such as a request that is loading, loaded or failed, and how to make the code that branches on it fail to compile when a shape is added.

## Knowledge

- A value with several shapes is a union of object types sharing one literal field, the discriminant. Each shape carries only the fields it has.
- A boolean plus optional fields lets contradictory states exist, such as loading and holding an error at once. Two booleans that must change together are the same smell.
- A repository picks one discriminant name, `kind`, `type` or `status`, and every union in it uses that name.
- The set of discriminant values is a constant map with its type derived from it, never a TypeScript `enum`.
- Every `switch` over the discriminant ends in a `default` arm that assigns the value to a `never`-typed local, so adding a shape makes every unhandled switch a compile error.
- In an Effect codebase the discriminant is `_tag`, and each shape is built by a tagged constructor (`Schema.TaggedStruct`, `Data.taggedEnum`, or Foldkit's `defineTaggedUnion`, whose variants are callable as `Row.Transfer({ ... })`), not written as an object literal with `_tag`; anti-slop lint sets such as rat-stack's `no-manual-tagged-construction` refuse the literal. Branch with `Match.value(x).pipe(Match.tagsExhaustive({ ... }))` instead of a `switch`; it fails to compile when a tag is missing, as the `never` arm does. A `defineTaggedUnion` schema and its value type cannot share a name under `no-redeclare`, so the type takes a suffix (`typeof Row.Type` as `RowValue`).

```ts
// Avoid: contradictory states can be written.
type ResourceState = { isLoading: boolean; resource?: Resource; error?: string };

// Prefer: only the real states exist.
type ResourceState =
  | { kind: "loading" }
  | { kind: "ready"; resource: Resource }
  | { kind: "error"; error: string };

const describe = (state: ResourceState): string => {
  switch (state.kind) {
    case "loading":
      return "Loading";

    case "ready":
      return state.resource.name;

    case "error":
      return state.error;

    default: {
      const exhaustive: never = state;

      return exhaustive;
    }
  }
};
```

## Sources

- pstack `typescript-best-practices` and `principle-type-system-discipline` (github.com/cursor/plugins), 2026-11-08.
