# Building URLs from Foldkit routers

verified: 2026-11-23

How a Foldkit (0.170) router prints a URL, so an app builds every URL it navigates to from its routers instead of writing strings by hand.

## Knowledge

- A router built with `pipe(literal(...), Route.query(schema), Route.mapTo(Route.Variant))` is also a printer: calling it with the variant's fields, `homeRouter({ edit: Option.none(), new: Option.some("expense"), tx: Option.none() })`, returns the path and query, `"/?new=expense"`. A field that is `Option.none()` under `Schema.OptionFromOptional` is left out of the query, and a query that ends up empty prints no `?`.
- Give each URL the app sends a small builder next to the routers, such as `editTransactionPath(id)` or `signInPath()`, that fills the fields it does not use with `Option.none()`. Callers then pass a builder's result to the navigation command, and a unit test can compare each builder with the string the app used before.
- `Route.query` prints parameters in the order of the query struct's fields: it encodes the struct and walks the encoded record's entries. To keep an existing URL's parameter order, such as `?tx=…&edit=1`, declare the fields in that order.
- Under the `sort-keys` lint rule (Ultracite's oxlint core turns it on) that order is an error, reported at the struct's opening brace, not at the out-of-order key. A `// oxlint-disable-next-line sort-keys -- <reason>` directive therefore goes on the line before `Schema.Struct({`.
- Parsing does not depend on the order: the parser reads the query into a record before decoding it.

## Sources

- `foldkit/dist/route/parser.js` (foldkit 0.170.0), `query`'s `print` and the final `queryParams.toString()`
- A change that moved a web app's hand-built URLs onto its routers and kept `?tx=…&edit=1`, with the lint run that reported `sort-keys` at the struct's opening, 2026-11-23
