# A caller's schema inside a generic Schema.Struct

verified: 2026-11-23

How a factory that builds an Effect Schema struct from a schema its caller passes in (a kit made per screen, given that screen's mode union) keeps the struct's `Type` concrete and still hands the caller's schema back with its own members. Covers effect 4.1.

## Knowledge

- A parameter typed as a bare generic schema, `<ModeSchema extends Schema.Top>(mode: ModeSchema)`, put into `Schema.Struct({ mode })` makes the struct's `Type` opaque inside the factory: `modifyFields` and field access on the model fail with "not assignable to StrictKeys<View<…>>" or "Property does not exist".
- A parameter typed `Schema.Codec<Mode, ModeI>` keeps the struct's `Type` concrete (`mode: Mode`), but the factory can then only return the schema as a `Codec`, which drops the members the caller's value has, such as a Foldkit tagged union's `guards` and `match`.
- Take both with an intersection: `<A, I, Mode, ModeI, ModeSchema>(draft: Schema.Codec<A, I>, SheetMode: ModeSchema & Schema.Codec<Mode, ModeI>)`. TypeScript infers `ModeSchema` as the caller's whole type and `Mode`, `ModeI` from the `Codec` member. Inside, assign the parameter to a `Schema.Codec<Mode, ModeI>` const (an upcast, no cast) and put that const in the struct; return the parameter itself (`Mode: SheetMode`) so callers keep `Kit.Mode.guards.Editing(...)`.

## Sources

- effect 4.1.2 `Schema.Struct`, `Schema.Codec`; typecheck runs with `effect-tsrs` on TypeScript 7.0.2
- A web app's edit sheet kit made generic over each screen's mode union (one with an id, one with a parent id and name), 2026-11-23
