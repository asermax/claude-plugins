# Formatting money held as minor units

verified: 2026-11-22

Answers how to turn an amount stored as an integer of minor units (cents) plus a currency code into display text, which Intl options decide the output, and which libraries help.

## Knowledge

- Never divide minor units by `10 ** decimals` as a number. The quotient is a binary float, and past `Number.MAX_SAFE_INTEGER` the integer itself has already lost digits. Keep the amount as an integer, a bigint or a string until it is text.
- Build the exact decimal string from the integer, then hand the string to `Intl.NumberFormat.format`. Three ways to build it: slice the digits of `BigInt(amount).toString()` after padding to `decimals + 1` characters, Effect's `BigDecimal.make(BigInt(amount), decimals)`, or dinero.js `toDecimal`.
- `format` and `formatToParts` take a decimal string and format it exactly since ECMA-402 v3 (Chrome and Edge 106, Firefox 116, Safari 15.4). Earlier engines convert the string to a float first. `format(bigint)` is exact too but cannot shift the decimal point, so it suits whole units only.
- TypeScript's lib types accept `number | bigint` (newer libs add a numeric-string literal type). A plain `string` argument fails to compile even though it works at runtime. Declare an overload by merging into `Intl.NumberFormat` instead of casting through `unknown`.
- Take the decimals from the application's own currency table and pass them as both `minimumFractionDigits` and `maximumFractionDigits`. Intl's built-in per-currency digits come from the runtime's ICU data and can differ between engines and versions; an amount stored with the table's decimals then prints with another count.
- `currencyDisplay` changes how the currency is written: `"code"` gives `ARS 1.234,50` and `USD 1.234,50`, `"symbol"` gives `US$ 1.234,50` for USD in es-AR, and `"narrowSymbol"` gives `$ 1.234,50` for both ARS and USD. Use `"code"` when several currencies appear on one screen.
- Intl writes a non-breaking space (U+00A0) between the code or symbol and the number, and an ASCII hyphen-minus for negatives. To print a typographic minus (U+2212), call `formatToParts` and replace the part of type `minusSign`.
- The locale decides grouping. `es-AR` groups four-digit numbers (`1.234`); plain `es` does not (`1234`). Test the locale you ship.
- Compact notation (`notation: "compact"`) rounds to two significant digits by default (`1999999` becomes `2 M`). `roundingMode: "trunc"` keeps `1,9 M`. In es-AR the thousands suffix is inconsistent (`1,2 K` for 1234 but `21 k` for 21000), and there is no billions form (`12345678901` becomes `12 mil M`). `en-US` gives `12B`.
- Constructing an `Intl.NumberFormat` is slow compared to calling `format`. Cache instances in a module-level `Map` keyed by the options that vary (currency, decimals, notation).
- For a "no cents" form, cut the fraction from the digit string and format with zero fraction digits. Passing the full value with `maximumFractionDigits: 0` rounds instead of truncating.

```ts
const exactDecimal = (amount: bigint, decimals: number): string => {
  const digits = (amount < 0n ? -amount : amount).toString().padStart(decimals + 1, "0");
  const whole = digits.slice(0, digits.length - decimals);
  const sign = amount < 0n ? "-" : "";

  return decimals === 0 ? `${sign}${whole}` : `${sign}${whole}.${digits.slice(digits.length - decimals)}`;
};

const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  currencyDisplay: "code",
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals,
});

formatter.format(exactDecimal(123456n, 2));
```

## Libraries compared

- dinero.js 2.x: amounts are integers in minor units, with a bigint entry for amounts past the safe range (check the package docs for the import path of your version); `toDecimal` returns the exact decimal string and `toSnapshot` the parts.
- currency.js 2.0.4: no BigInt support, and `.value` is a float, so it reintroduces the error described above for large amounts. `.intValue` is the integer minor-unit count.
- big.js: arbitrary-precision decimal arithmetic whose `toFixed` returns exact strings; no currency or locale handling, so the result still goes through `Intl.NumberFormat`.

## Sources

- ECMA-402 `Intl.NumberFormat` v3 and MDN `Intl.NumberFormat` (developer.mozilla.org), 2026-11-22.
- Output of Node's `Intl.NumberFormat("es-AR", …)` run on 2026-11-22 for the grouping, `narrowSymbol`, compact and `roundingMode` examples.
- dinero.js, currency.js and big.js package documentation, as reported in a research pass on 2026-11-22.
