# Types whose illegal values cannot be built

verified: 2026-11-08

Answers how to type a value with an invariant, such as a list that is never empty or a range that never runs backwards, and when the plain type is enough.

## Knowledge

- Build the type from parts that are all legal, rather than taking a loose type and checking it at run time in every caller: `[T, ...T[]]` for a non-empty list, `[T, T][]` for an even count, a start plus a duration for a range that cannot be negative.
- Keep the plain type while every operation on it is total. `T[]` stays `T[]` for a sum, where an empty list is a valid input.
- Strengthen the type where the loose one forces a lie at a use site. The signs are a non-null `!`, a cast such as `list[0] as T`, and a "should never happen" throw. Returning `T | undefined` is the other honest signature.
- Where a plain value arrives, narrow it once with a guard, and the fact travels in the type from there.

```ts
type NonEmpty<T> = [T, ...T[]];

const isNonEmpty = <T>(list: T[]): list is NonEmpty<T> => list.length > 0;

// Avoid: partiality hidden from the compiler.
const latestResource = (resources: Resource[]): Resource => resources.at(0)!;

// Prefer: an empty input cannot be passed.
const latestResource = (resources: NonEmpty<Resource>): Resource => resources[0];

// Avoid: the invariant lives in a comment.
type Window = { start: Date; end: Date }; // start <= end

// Prefer: a negative window cannot be written.
type Window = { start: Date; durationMs: number };
```

## Sources

- pstack `typescript-best-practices` (github.com/cursor/plugins), 2026-11-08.
