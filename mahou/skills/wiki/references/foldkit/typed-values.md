# Typed values in Foldkit radio groups and routes

verified: 2026-11-22

Where Foldkit (0.170) takes a value type, and what a route does with a query parameter that fails to decode.

## Knowledge

- `RadioGroup.create<Value extends string = string>()` types both sides of the bundle it returns. `view` receives `option.value: Value`, and `update` returns an `OutMessage<Value>` whose `Selected` carries `value: Value`. An update module that calls `RadioGroup.create<Union>()` therefore reads the picked value as `Union` with no re-check. The model (`RadioGroup.Model`) and the message (`RadioGroup.Message`) are not generic, so the type lives only on the created bundle: create it with the same type argument in the view module and in the update module, or the update side sees `string`.
- `Route.query(schema)` takes any `Schema.Codec<A, I>` for the query record. A parameter that fails to decode makes the whole route fail to parse, and `parseUrlWithFallback` then returns the fallback (not found). To route a malformed value to a screen that reports it, make the parameter's schema total: decode the raw string into a union of the domain type and a tagged "invalid" struct that keeps the raw text, and encode the struct back to the raw text so the URL prints unchanged.
- A route union (`defineRouteUnion`) uses `Schema.OptionFromNullOr` for each field, while a router's `Route.query` struct uses `Schema.OptionFromOptional`. Both can wrap the same inner schemas, so declare each field's inner schema once and wrap it per use.
- In Effect 4, `Schema.String.pipe(Schema.decodeTo(Target, { decode: SchemaGetter.transform(f), encode: SchemaGetter.transform(g) }))` builds that kind of total decoder. `f` returns the target's Encoded form and `g` receives it.

## Sources

- node_modules/@foldkit/ui/dist/radioGroup/index.d.ts
- node_modules/foldkit/dist/route/parser.d.ts
