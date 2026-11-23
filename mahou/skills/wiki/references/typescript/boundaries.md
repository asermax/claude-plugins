# Parsing at boundaries

verified: 2026-11-23

Answers where external data gets validated, where its TypeScript type comes from, and whether code inside the system checks it again.

## Knowledge

- External data is `unknown`, never `any`, until it is parsed: request and response bodies, `JSON.parse`, messages between processes or windows, file contents, environment variables, CLI arguments, database rows.
- Each boundary has one parse function that turns the input into a named domain type. `Record<string, unknown>` and its spellings stop at that parse.
- Inside the boundary, code trusts the type. Checking an already-parsed value again deep in a call chain is noise and a reviewer flags it.
- One schema owns each shape. When the repository has a runtime schema library, the type is inferred from the schema (`z.infer<typeof ResourceSchema>` or the library's equivalent) instead of a hand-written interface plus a hand-written guard that can drift from it. No new schema library is added for one guard.
- When the type comes first, annotate the schema with it (`const resourceSchema: z.ZodType<Resource> = …`) so the compiler rejects a schema that proves less than the type.
- In Effect 4, the annotation is `Schema.Codec<Type, Encoded>`. Both parameters are covariant, so a schema that decodes to a narrower type passes and one that decodes to a wider type (a `NullOr` where the type has none) fails. For a database row, give the encoded side as `Pick<typeof table.$inferSelect, keyof Type>`: the compiler then also checks that every field the schema reads is a column of a compatible type. A generic helper that takes `Schema.Codec<A, unknown>` and is called with an explicit type argument (`codec<Cursor>(Schema.Struct({ … }))`) checks the same way without naming the encoded side.
- An Effect `Schema.Struct` encode keeps only its declared fields, so a codec typed for a small shape (a paging cursor) can encode a whole record that has it, with no hand-written picking.
- When a generated file already owns a shape (an OpenAPI, GraphQL or protobuf client, a database schema), derive from its types with `Pick`, `Omit`, `Parameters`, `ReturnType`, `Awaited` or `typeof` before declaring a new interface.

```ts
const ResourceSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["draft", "published"]),
});

type Resource = z.infer<typeof ResourceSchema>;

const parseResource = (input: unknown): Resource => ResourceSchema.parse(input);

// Derived from the generated client, not redeclared.
type ResourceSummary = Pick<GeneratedResource, "id" | "status">;
```

## Sources

- pstack `typescript-best-practices`, `principle-type-system-discipline` and `principle-boundary-discipline` (github.com/cursor/plugins), 2026-11-08.
- Effect 4.1.2 `Schema.Codec` (covariant `out T, out E`) annotating saifu's D1 row decoders and paging cursor codecs, and a probe that widened one field to `NullOr` and failed to compile on both sides, 2026-11-23.
