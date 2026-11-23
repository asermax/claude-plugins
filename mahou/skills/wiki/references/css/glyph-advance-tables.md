# Glyph advance tables

verified: 2026-11-23

Answers how to build and check a per-glyph width table that estimates in script how wide a string will draw, such as deciding which form of an amount fits a chip before layout.

## Knowledge

- Measure each advance in a browser with the real font file: put the glyph ten times in an inline-block span with `white-space: pre`, read `getBoundingClientRect().width`, divide by ten and by the font size to get em. Wait for `document.fonts.load('<weight> <size>px "<family>"')` first and check `document.fonts.check(...)`, or the fallback font gets measured. A page opened from `file://` in Chromium loads a `@font-face` whose `url()` is a sibling file.
- Advances in em do not depend on the size (Inter at 13px and 15px agree to 0.0001em), but they do depend on the weight and on `font-variant-numeric`. Measure with the weight and numeral setting of the element the table serves.
- `tabular-nums` changes more than the digits. In Inter Variable at weight 650 every digit and the minus sign advance 0.6466em, while comma, period and space all advance 0.2686em; with proportional numerals the comma and period are 0.3262em, the space 0.2442em and the "1" 0.4273em.
- Summing advances ignores kerning, so the sum runs slightly over the drawn width: within 0.35px at 15px for amounts such as `ARS 4.123.805,50`, and 0.8px when a minus sign precedes a capital (`−ARS 21.045.662,00`). The error makes a fit check conservative. A test can assert the sum stays within a pixel of the browser measurement.
- A table written by estimate can be off by several percent in either direction: Inter's capitals J, K, V, X and Y were 8 to 16 percent wider than estimated, and N and O were 4 to 5 percent narrower. A width that is too small lets a text overflow its box.

## Sources

- Measurements of Inter Variable (`@fontsource-variable/inter` 5.3.0, latin subset) in Chromium through agent-browser, weights 400 and 650, sizes 13px and 15px, with and without `tabular-nums`, 2026-11-23.
