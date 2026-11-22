# D1: the text of constraint failures and how it reaches Effect's SqlError

verified: 2026-11-22

Answers what message D1 gives when a statement breaks a UNIQUE index, a CHECK constraint or a trigger's `RAISE(ABORT, ...)`, where that message sits once `@effect/sql-d1` wraps it, and how to read the three kinds apart. The local forms were observed in tests against Alchemy's local D1 gateway; the production form is from Cloudflare's documented `D1_ERROR:` prefix and was not run.

## Knowledge

- Local D1 (Alchemy's local gateway over workerd) gives SQLite's message followed by the result code and the extended code:
  - UNIQUE: `UNIQUE constraint failed: members.team_id, members.email: SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_UNIQUE)`. SQLite names the table and columns, never the index name.
  - CHECK: `CHECK constraint failed: stock_not_negative: SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_CHECK)`. A named constraint (`CONSTRAINT "stock_not_negative" CHECK(...)`, drizzle's `check("name", ...)`) gives its name.
  - `RAISE(ABORT, 'text')` in a trigger: `text: SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_TRIGGER)`. The message is the raised text alone, with no "constraint failed" prefix.
- On a deployed Worker the binding's error message starts with `D1_ERROR: ` and ends with `: SQLITE_CONSTRAINT`, without the extended code (not verified here). A parser that accepts an optional `D1_ERROR: ` prefix and an optional ` (extended: ...)` suffix reads both.
- To tell a raised abort from SQLite's own failures, take the text before `: SQLITE_CONSTRAINT`. It is UNIQUE or CHECK when it starts with `UNIQUE constraint failed: ` or `CHECK constraint failed: `; NOT NULL, FOREIGN KEY and PRIMARY KEY failures start with their own `... constraint failed`. Anything else with the `SQLITE_CONSTRAINT` code, and an extended code of `SQLITE_CONSTRAINT_TRIGGER` or none, is a raised abort. Require the code suffix for the abort case, or any error text would read as one.
- `@effect/sql-d1` (4.1.x) wraps a failing `batch` or statement as `SqlError { reason: UnknownError { message: "Failed to execute batch", cause } }`. Both `message` fields are generic; D1's text is only in `reason.cause.message`, an error tagged `LocalD1QueryError` locally. `SqlError.cause` points at the reason, and the reason's `cause` is a non-enumerable `Error` cause, so `Object.keys` does not list it; walk the chain with `"cause" in value` (`Predicate.hasProperty`) and read each `message`.
- A UNIQUE index on a column declared `COLLATE NOCASE` uses that collation, so names differing only in case collide and give the same UNIQUE message.
- D1 has no interactive transactions, so a condition the batch must check as it writes needs a constraint that fails: a trigger with `RAISE(ABORT, 'prefix:' || NEW.id)` carries a value back in the message, and a CHECK on a guard table carries only the constraint's name.

## Sources

- https://developers.cloudflare.com/d1/observability/debug-d1/
- https://www.sqlite.org/lang_createtrigger.html#raise
- https://www.sqlite.org/rescode.html#constraint
