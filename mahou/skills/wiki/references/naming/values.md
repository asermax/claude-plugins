# Naming values

verified: 2026-11-15

Answers how to name a variable or a derived value, in code and in a program design's derivation ledger, so the name states what the value holds.

## Knowledge

- A value is named for what it holds, not for its kind. A bare generic noun (`tree`, `lines`, `items`, `page`, `input`, `writes`, `rows`) names only the kind. Put the domain noun in front of it: `resourceTree`, `orderLines`, `orderInput`, `batchWrites`.
- A keyed collection is named after its key: `customersById`, `customersByName`. Two lookups of the same records by different keys then have different names.
- Values of the same kind that play different roles are named by their role: `existingItems` read from the store, `builtItems` made from the request, `newItems` still to write.
- A derived value is named for the result of the derivation, not for the step that produced it: `balanceDeltas`, `currencyBalances`, `nonZeroSums`, `writableCount`, rather than `deltas`, `sums`, `shown` or `upTo`.
- A value that holds a call's response is named after that call: `saveResponse`, `readSettingsResponse`, rather than `saved` or `result`.
- A name that already states what its value holds stays as it is: `userId`, `currencies`, `mainCurrency`.
- A name the library gives a value stays as the library gives it, as with booleans ([naming booleans](booleans.md)).

## Sources

- Program design session, 2026-11-15: a derivation ledger named its values `tree`, `existing`, `built`, `deltas`, `lines`, `payees`. The user asked to rename them for what each holds (`accountTree`, `existingPostings`, `currencyBalances`, `balanceDeltas`), and the renaming was then applied to every ledger of the design.
