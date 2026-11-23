# Static font weight matching

verified: 2026-11-23

Answers why text at the same `font-size` and `font-weight` looks bolder and wider in one page than in another, when one page embeds static font faces and the other a variable font, and how to make the second match the first.

## Knowledge

- With static faces (one `@font-face` per weight), a `font-weight` that has no face of its own is drawn with another face. For a requested weight above 500, the browser takes the closest heavier face first, then the closest lighter one; for one below 400, lighter first; between 400 and 500, the faces up to 500 first, then lighter, then heavier.
- So a page that embeds only 400, 500, 600 and 700 draws `font-weight: 650` with the 700 face. A page using the variable version of the same family draws 650 as 650, which reads as slightly smaller and lighter even though the CSS is identical.
- To match a static-face design from a variable-font app, write the weight the design actually draws (700 here), not the weight its CSS declares. Check it in the browser: set the element's weight to the declared and the snapped value and compare `getBoundingClientRect().width`; with static faces both give the same width.
- `font-variant-numeric: tabular-nums` set on an ancestor in the design widens digits too; compare the computed `font-variant-numeric` of both elements when a title with numbers differs in width.

## Sources

- CSS Fonts Module Level 4, §5.2 "Matching font styles", the font-weight step, read on 2026-11-23.
- Measuring a month title ("November 2026", Inter 16px, weight 650) in a prototype embedding static Inter 400–700 and an app using Inter Variable: 126.97px against 125.78px, equal at weight 700 with tabular numerals, 2026-11-23.
