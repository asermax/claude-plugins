# Casts and narrowing

verified: 2026-11-23

Answers what to write instead of an `as` cast, which narrowing to reach for first, and what a hand-written type guard must check.

## Knowledge

- `as` tells the compiler to stop checking, so a wrong cast fails at run time. A cast is allowed only on a value something has already validated.
- To check that a literal matches a type, use `satisfies`. It checks the value and keeps its literal types, where `as` widens them and checks nothing.
- Narrow with the strongest tool that works, in this order: a switch or `if` on the discriminant, the `in` operator, `typeof` or `instanceof`, a type guard, and only then a cast after validation.
- A type guard (`(value): value is X`) must check everything its return type claims. A guard that checks less hides the bug behind a name that says it is safe, which is worse than a visible cast. Name guards `isX` or `hasX`.
- A type guard narrows both ways: where it returns false, the compiler removes the guarded type. So a guard must return true for every value of that type. `(node): node is Call => node.type === "Call" && node.callee === name` returns false for calls with another callee, yet the false branch drops every `Call`; after `if (isCallTo(node, "a")) return …`, a second `isCallTo(node, "b")` narrows `node` to `never`, and reading its fields fails as an `error` type (oxlint's type-aware `no-unsafe-member-access`). Check the type once with the discriminant, then the extra condition without a guard.
- To remove a cast from existing code, find why the compiler cannot infer the type: a missing discriminant (make the type a union), a source type that is too wide (narrow it), an untyped boundary (parse it, see `boundaries`), or something the type system cannot express (brand it or use `satisfies`).

```ts
// Avoid: widens the literals and checks nothing.
const settings = { theme: "dark", columns: 3 } as Settings;

// Prefer: checked against Settings, and settings.theme stays "dark".
const settings = { theme: "dark", columns: 3 } satisfies Settings;

// Avoid: claims a full Resource after checking one field.
const isResource = (value: unknown): value is Resource =>
  typeof value === "object" && value != null && "id" in value;
```

## Sources

- pstack `typescript-best-practices` (github.com/cursor/plugins), 2026-11-08.
- A guard on an ESTree node in a custom lint rule, called twice in a row, and the type-aware lint errors it caused, 2026-11-23.
