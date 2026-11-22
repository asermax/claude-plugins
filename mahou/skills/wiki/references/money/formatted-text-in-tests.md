# Formatted text in tests

verified: 2026-11-22

Answers how to write test expectations for text produced by `Intl.NumberFormat` so they match the real output and do not break on invisible characters.

## Knowledge

- Intl output contains characters that look like ASCII: a non-breaking space (U+00A0) after the currency code or symbol and before a compact suffix, and a hyphen-minus for negatives. An expectation typed with a normal space fails with two identical-looking strings.
- Write the non-breaking space as an escape in the expectation (`"ARS\u00A01.234,56"`), or as a named constant (`const gap = "\u00A0"`) interpolated into template literals. Do not paste the literal character: editors and formatters show it as a space and may normalize it.
- Linters that enforce unicorn's `escape-case` and `no-hex-escape` accept only the uppercase unicode form `\u00A0`, not `\xa0`.
- Copy the expected text from the real output of the runtime the tests run on, not from what the locale should print. Compact forms surprise most: `12345678901` in es-AR prints `12 mil M`.
- A test that proves screen behaviour (the chip shows the short form when the full text does not fit) asserts the real text. One formatter test file covers each form once (negative, zero, four-digit grouping, a value past `Number.MAX_SAFE_INTEGER`); screen tests do not re-test the formatter.
- Test runners that match accessible names or visible text compare strings exactly, so the non-breaking space also matters for text queries.
- Node's ICU data and a browser's can differ for compact forms and less common locales. Assert compact text against one runtime only.

## Sources

- Failures and fixes from updating the Story and Scene tests of a money formatter, 2026-11-22.
- Node `Intl.NumberFormat` output checked on 2026-11-22.
