# Parsing typed amounts in the user's locale

verified: 2026-11-22

Answers how to read an amount the user typed in their own locale's separators (`1.234,56` or `1,234.56`) into integer minor units, without floats and without a hand-written table of separators per locale.

## Knowledge

- Derive the separators from Intl instead of a table: format a sample such as `"1234567.5"` with `formatToParts` and read the parts of type `group` and `decimal`. The lengths of the `integer` parts give the group sizes: the last one is the primary size (3) and the one before it the secondary size, which is 2 in en-IN (`12,34,567.5`) and 3 elsewhere.
- Build the parser's pattern from those parts and escape them: a group can be `.`, `,`, an apostrophe (de-CH), a no-break space (U+00A0) or a narrow no-break space (U+202F, fr-FR). A user cannot type the last two on most keyboards, so when the group is whitespace accept a plain space too.
- Some locales print non-Latin digits (ar-EG prints `١٬٢٣٤٫٥`). Give the edit-text formatter and the sample formatter `numberingSystem: "latn"` so the text in the field and the pattern both use `0`–`9`; the display formatters can keep the locale's digits.
- Require full groups (`\d{1,S}(?:G\d{S})*G\d{P}`) or no groups at all (`\d+`). Strict groups are what make ambiguous text deterministic: `1,234` is one thousand two hundred thirty-four in en-US and `1` plus a three-digit fraction in es-AR, which a two-decimal currency then refuses; `12,34` and the other locale's full form (`1.234,56` in en-US) match nothing and are refused.
- Turn the match into minor units by string work: drop every non-digit from the whole part, pad the fraction to the currency's decimals, refuse a longer fraction, then check `Number.isSafeInteger` and `> 0` (or keep a `BigInt`). Never `parseFloat` the normalized text.
- Prove it with a property test that formats the edit text and parses it back in several locales (es-AR, en-US, en-IN, fr-FR, de-CH, ar-EG): any separator, group size or digit mismatch shows up as a failed round trip.
- Read the locale in one module and give the formatters and the parser an optional locale argument defaulting to it. Tests then pass a locale explicitly for each locale they cover, and a test setup file pins `navigator.languages` (`Object.defineProperty(navigator, "languages", { configurable: true, value: ["es-AR"] })`, which works in both Node's and jsdom's `navigator`) for tests that render screens, so their text does not depend on the machine.

## Sources

- Node 24 `Intl.NumberFormat(…).formatToParts` output for es-AR, en-US, en-IN, fr-FR, de-CH, es-ES and ar-EG, checked on 2026-11-22.
- A round-trip property test over those locales in a browser app's amount parser, 2026-11-22.
