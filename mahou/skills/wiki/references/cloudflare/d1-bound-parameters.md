# D1: the 100 bound values per statement limit

verified: 2026-11-22

Answers which D1 statements grow with their input, how to keep a list of ids from growing one, and how to split multi-row inserts into statements under the limit with drizzle. Taken from a change that moved bulk writes onto a `db.batch` of generated statements and ran against D1 in tests.

## Knowledge

- D1 refuses a statement with more than 100 bound values and returns a generic error that names neither the table nor the count.
- A multi-row `INSERT` binds one value per column per row, so it hits the limit at `floor(100 / columns)` rows. Defaults that the query builder binds and values in an `ON CONFLICT DO UPDATE` clause count too.
- An id list in a `WHERE` clause does not need to grow. Bind the whole list as one JSON value and read it with `json_each`: `column in (select value from json_each(?))` binds one value for any list length.
- To split inserts automatically, keep the table, the rows and the conflict clause as data instead of a built statement. At batch time:
  1. Build the insert for 1 row and for 2 rows and read `toSQL().params.length` of each.
  2. Values per row = count(2) − count(1). Fixed values = count(1) − values per row, which includes defaults and conflict-clause values.
  3. Rows per statement = `floor((100 − fixed) / perRow)`. When it is below 1, fail with a message naming the table and the count.
  4. Build one insert per slice of rows, applying the same conflict clause to each.
- Send every chunk, together with the batch's other statements, in one `db.batch` (D1 `batch()`). A D1 batch is one transaction, so the chunks land or fail together.
- Add a guard that runs on every planned statement before the batch is sent and fails when `params.length` is over 100, with a message naming the table (or the first words of the SQL) and the count. A new query that exceeds the limit then fails with a clear message instead of D1's generic error.

```ts
const maxBoundValues = 100;

export const insertMany = <Table extends SQLiteTable>(
  table: Table,
  rows: InsertRows<Table>,
  onConflict: (insert: InsertOf<Table>) => Statement = (insert) => insert
) => ({
  table: getTableName(table),
  size: rows.length,
  build: (db: Db, from: number, to: number) =>
    onConflict(db.insert(table).values(rows.slice(from, to))),
});

const rowsPerStatement = (table: string, size: number, count: (rows: number) => number) => {
  if (size < 2) return Math.max(size, 1);

  const one = count(1);
  const perRow = count(2) - one;

  if (perRow <= 0) return size;

  const rows = Math.floor((maxBoundValues - (one - perRow)) / perRow);

  if (rows < 1) {
    throw new Error(`one row of ${table} binds ${one} values, over D1's limit of ${maxBoundValues}`);
  }

  return rows;
};

const guard = ({ label, params }: { label: string; params: readonly unknown[] }) => {
  if (params.length > maxBoundValues) {
    throw new Error(`${label} binds ${params.length} values, over D1's limit of ${maxBoundValues}`);
  }
};
```

## Caveats

- The per-row estimate assumes every row binds the same columns. Rows that omit different optional columns bind different counts; the guard catches the statements this makes too large.
- A lint rule that requires multi-row inserts to go through the helper and flags `.values(<array>)` cannot tell an array from a single row in every case. The runtime guard is what makes the code safe; the rule only points people to the helper.
- Splitting multiplies statements, and D1 allows 1,000 queries per Worker invocation, so a large enough input still fails on the statement count.

## Sources

- https://developers.cloudflare.com/d1/platform/limits/
- https://developers.cloudflare.com/d1/worker-api/d1-database/#batch
