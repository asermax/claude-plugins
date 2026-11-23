# drizzle

- [`column-renames`](column-renames.md): generating a migration that renames a column, keeping its data, when drizzle-kit has no terminal to ask whether a changed column is a rename
- [`row-schemas`](row-schemas.md): tying an Effect Schema row decoder to the table's columns with `Pick<$inferSelect, keyof Stored>`, and sharing that annotation between tables through one constrained alias
