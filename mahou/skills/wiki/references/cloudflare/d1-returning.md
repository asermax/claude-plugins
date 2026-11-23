# Drizzle's `.returning()` on D1 through the Effect driver

verified: 2026-11-23

Whether an insert or update run through `drizzle-orm/effect-d1` (on `@effect/sql-d1`'s `D1Client`) can give back the written rows, so a store does not read a row back after writing it.

## Knowledge

- `db.insert(table).values(row).returning()` and `db.update(table).set(change).where(...).returning()` both work against D1 through `SQLiteD1Drizzle.makeWithDefaults`: the Effect succeeds with an array of the full written rows, typed as `table.$inferSelect[]`, with defaults filled in (an omitted `hidden` column came back `false`).
- An update whose `where` matches no row succeeds with `[]`, not a failure, so a store's `update` maps the first element to an `Option` and `create` turns `None` into a defect.
- Without `.returning()` the same statement yields D1's run result (`D1Result`), not rows. A helper whose parameter is `Effect<readonly Row[]>` (for example `writtenRow(decode)`, piped after the builder) makes a forgotten `.returning()` a type error.
- Statements deferred into a D1 batch (`client.batch` of compiled SQL, as a `Write` handle) run through `client.unsafe` and their results are dropped, so rows written in a batch still have to be read afterwards.

## Sources

- drizzle-orm 1.0.0-rc.5 `effect-d1` driver, effect 4.1.2, `@effect/sql-d1` 4.1.2.
- A throwaway test against the local D1 simulator of an Alchemy v2 beta.85 stage (insert, update, update of a missing id), run 2026-11-23.
