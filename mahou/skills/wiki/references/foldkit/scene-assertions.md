# Asserting icons and missing lines in Foldkit scene tests

verified: 2026-11-22

How Foldkit (0.170) scene tests can find a decorative SVG icon and check that an optional line is not rendered.

## Knowledge

- An icon drawn as an `aria-hidden` SVG has no role or name, so `role` and `text` cannot find it. `selector(css)` accepts `[attr="value"]` whose value may contain spaces, so ``selector(`path[d="${icons[name]}"]`)`` finds the icon by its path data when the test imports the same icon map the view reads. The test then checks which icon is drawn without a `data-*` attribute added only for the test.
- `selector` supports only tag names, `#id`, `.class`, `[attr]`, `[attr="value"]`, `[attr^="prefix"]`, `:not(...)` and descendant combinators; any other syntax throws.
- `textContent` (used by `toHaveText`, by a `RegExp` passed to `text`, and by the full-text branch of a string passed to `text`) joins every descendant text node with no separator. `expect(role("button", { name: /^Title/u })).toHaveText("TitleAmountAccount")` therefore fails when an optional line between them renders, which makes it a check that the line is absent.
- `toHaveStyle(name, value?)` reads the element's inline style (`h.Style`), not its classes, so it checks a value the view sets from data, such as a per-item color. Pass the CSS name in kebab case (`"background-color"`). `expect(...).not.toHaveStyle("background-color")` checks that the view left the inline value out, for example on an unselected item that must show its class colors: an inline value would override any class, so the view drops it (`h.Style(isOn ? { backgroundColor: color } : {})`) and the test checks for its absence.
- A string passed to `text` matches an element whose full text equals it or one of whose direct text nodes equals it. An element holding a text node and a child element (an amount with a caption span under it) is still found by the text node alone.

## Sources

- node_modules/foldkit/dist/test/query.d.ts (`selector`, `text`)
- node_modules/foldkit/dist/test/query.js (`textContent`, `matchesText`, `hasDirectTextNodeMatch`)
- node_modules/foldkit/dist/test/matchers.js (`toHaveText`, `toHaveStyle`)
- A scene test asserting a selected item's inline background color and its absence on an unselected item, run 2026-11-22.
