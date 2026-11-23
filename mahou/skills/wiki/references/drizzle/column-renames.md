# Renaming columns with drizzle-kit generate

verified: 2026-11-23

Answers how to generate a migration that renames a column, keeping its data, when drizzle-kit runs without a terminal to answer its prompts.

## Knowledge

- When a schema column changes its SQL name, `drizzle-kit generate` cannot tell a rename from a drop plus a create. In a terminal it asks; without one (stdin closed, run by an agent or CI) it writes no migration, exits with code 2 and prints `missing_hints` with one entry per unresolved column.
- Pass the decisions with `--hints '<json-array>'`, one object per column: `{ "type": "rename", "kind": "column", "from": ["public", "<table>", "<old_name>"], "to": ["public", "<table>", "<new_name>"] }`. A `{ "type": "create", "kind": "column", "entity": [...] }` entry chooses a new column instead. The first element is `"public"` even for SQLite, as the `missing_hints` output prints it.
- With rename hints, the SQLite migration is `ALTER TABLE \`<table>\` RENAME COLUMN \`<old>\` TO \`<new>\`;`, which keeps the rows' values, and the new `snapshot.json` records the renamed column. Add `--name <slug>` to name the migration folder.

## Sources

- drizzle-kit 1.0.0-rc.5 `generate`, sqlite dialect: the run without hints printed `missing_hints: 3 unresolved decisions` and exited 2; the run with three rename hints wrote three `RENAME COLUMN` statements, 2026-11-23.
