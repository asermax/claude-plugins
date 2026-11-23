# Typing a row decoder against its table

verified: 2026-11-23

Answers how to tie an Effect Schema that decodes Drizzle rows into domain records to the table's columns, and how to share that annotation between tables.

## Knowledge

- Annotate the row decoder with the domain type it produces and the columns it reads: `const accountSchema: Schema.Codec<StoredAccount, Pick<typeof accounts.$inferSelect, keyof StoredAccount>> = Schema.Struct({ … })`. The struct then has to decode exactly the columns the domain type keeps, and a column whose type changes in the table, or a field the struct forgets, fails the typecheck instead of the decode at run time.
- To write the annotation once for several tables, a generic alias needs a constraint that tells the compiler the domain type's keys are columns, because `Pick<T, K>` requires `K extends keyof T`:

```ts
export type RowCodec<
  Stored,
  Table extends { $inferSelect: Record<keyof Stored, unknown> },
> = Schema.Codec<Stored, Pick<Table["$inferSelect"], keyof Stored>>;

const accountSchema: RowCodec<StoredAccount, typeof accounts> = Schema.Struct({ … });
```

- Decode columns whose values are a closed set with the same literal schema the domain exports next to its constant map (`Schema.Literals(Object.values(Kind))` defined once), not a copy built in the adapter.

## Sources

- Drizzle ORM 1.0.0-rc.5 `$inferSelect` and Effect 4.1.2 `Schema.Codec`; a review that moved five row decoders onto one alias and typechecked them, 2026-11-23.
