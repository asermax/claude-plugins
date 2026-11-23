# Testing the request a Foldkit Command sends to an HTTP API

verified: 2026-11-23

How a test checks what a Foldkit (0.170) Command that calls an Effect `HttpApiClient` sends, such as the query parameters it computes from its arguments, without a server.

## Knowledge

- `story` and `scene` tests resolve a Command by its arguments and never run its effect, so a value the Command computes inside `execute` (a UTC range from a month and a time zone, a query built from an `Option` cursor) is only tested by running the effect.
- Call the definition and run its `effect` inside `it.effect` from `@effect/vitest`, providing the client layer, and replace the network with `Effect.provideService(FetchHttpClient.Fetch, fakeFetch)`. `FetchHttpClient.Fetch` is a `Context.Reference` read when the request runs, so providing it on the effect reaches a layer that already provided `FetchHttpClient.layer`.
- The fake receives `string | URL | Request`; take the URL with `new URL(input instanceof Request ? input.url : input)` (`String(input)` fails oxlint's `no-base-to-string`) and answer with `Promise.resolve(Response.json(body))`. Read the query from `url.searchParams`; an array field arrives as repeated keys, read with `getAll`.
- An app client made with `HttpApiClient.make(api)` and no `baseUrl` builds relative URLs that work in the browser and fail in Node before `fetch` is called. The Command then returns its failure message and the fake records nothing. Build the test's layer with `HttpApiClient.make(api, { baseUrl: "http://localhost" })` and `Layer.provide(FetchHttpClient.layer)`.
- The client encodes the request with the endpoint's input schema, checks included, before calling `fetch`. An argument that fails a check, such as a placeholder cursor `"c0"` for a field whose filter requires a token that decodes, makes the Command return its failure message and the fake records no request. Build such values with the same encoder the server uses (for a cursor, the package's `encode…Cursor` over a real position), and keep placeholders only for response fields whose schema is a plain `Schema.String`.
- When a Command turns an `Option` argument into an optional query key, or a response sentinel into an `Option`, run it once with `None` and once with `Some`. A test of only the `None` side still passes when the `Some` side is dropped.
- Assert concrete values (`"2026-03-01T03:00:00.000Z"` for March 2026 in Buenos Aires) rather than recomputing them with the helper the Command calls, so a wrong argument to that helper fails the test.
- `Command.resolve(Definition(args), …)` matches arguments that hold `Option` values and non-empty arrays structurally, so stories keep working when a Command's arguments become `Schema.Option` or `Schema.NonEmptyArray` fields.

```ts
const localApi = Layer.effect(
  Api,
  HttpApiClient.make(api, { baseUrl: "http://localhost" })
).pipe(Layer.provide(FetchHttpClient.layer));

const fetch = (input: string | URL | Request) => {
  sent.push(new URL(input instanceof Request ? input.url : input));

  return Promise.resolve(Response.json({ nextCursor: "", transactions: [] }));
};

ReadMonth({ ...args }).effect.pipe(
  Effect.provide(localApi),
  Effect.provideService(FetchHttpClient.Fetch, fetch)
);
```

## Sources

- `effect/dist/http/FetchHttpClient.d.ts` (`Fetch` reference), effect 4.1.2
- A web app's `ReadMonth` test sending `Option.some("c0")` as a cursor: the contract's cursor filter rejected it, the effect returned the failure message and `fetch` received nothing; with a token from the core cursor encoder the query carried it, 2026-11-23
- A web app's `ReadMonth` test: with the app's `Api.layer` the effect returned `FailedReadMonth` and `fetch` was never called; with a `baseUrl` the query carried the expected range, 2026-11-23
