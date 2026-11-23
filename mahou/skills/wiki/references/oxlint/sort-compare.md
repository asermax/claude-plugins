# Sorting in place of an order-free comparison

verified: 2026-11-23

What `typescript(require-array-sort-compare)` reports, and how to write an assertion that compares two lists without their order so the rule passes.

## Knowledge

- The rule reports `toSorted()` as well as `sort()` when the call has no compare function. It fired on an array whose elements were typed `unknown`, such as ids read from a command's untyped `args`.
- To compare a list without its order and still catch a missing or duplicated item, sort it with an explicit comparator and compare the result to a sorted literal: `expect(ids.toSorted((a, b) => String(a).localeCompare(String(b)))).toStrictEqual(["a", "b"])`. A `Set` comparison passes the rule but stops catching duplicates.

## Sources

- oxlint run on a vitest file, `releasedIds(result).toSorted()` on `unknown[]`: "Require 'compare' argument", 2026-11-23.
