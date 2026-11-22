# Asserting icons and missing lines in Foldkit scene tests

verified: 2026-11-22

How Foldkit (0.170) scene tests can find a decorative SVG icon and check that an optional line is not rendered.

## Knowledge

- An icon drawn as an `aria-hidden` SVG has no role or name, so `role` and `text` cannot find it. `selector(css)` accepts `[attr="value"]` whose value may contain spaces, so ``selector(`path[d="${icons[name]}"]`)`` finds the icon by its path data when the test imports the same icon map the view reads. The test then checks which icon is drawn without a `data-*` attribute added only for the test.
- `selector` supports only tag names, `#id`, `.class`, `[attr]`, `[attr="value"]`, `[attr^="prefix"]`, `:not(...)` and descendant combinators; any other syntax throws.
- `textContent` (used by `toHaveText`, by a `RegExp` passed to `text`, and by the full-text branch of a string passed to `text`) joins every descendant text node with no separator. `expect(role("button", { name: /^Title/u })).toHaveText("TitleAmountAccount")` therefore fails when an optional line between them renders, which makes it a check that the line is absent.
- `toHaveStyle(name, value?)` reads the element's inline style (`h.Style`), not its classes, so it checks a value the view sets from data, such as a per-item color. Pass the CSS name in kebab case (`"background-color"`). `expect(...).not.toHaveStyle("background-color")` checks that the view left the inline value out, for example on an unselected item that must show its class colors: an inline value would override any class, so the view drops it (`h.Style(isOn ? { backgroundColor: color } : {})`) and the test checks for its absence.
- `selector` matches attributes and props only. `h.Style` puts the inline style in the vnode's style data, not in an attribute, so `[style]` never matches and no selector can find an element by its color. To reach the element that holds a known child, such as the colored circle around an icon, filter a multi-match locator by that child and take the innermost match: `last(filter(all.selector("span"), { has: iconLocator }))`. Matches come in depth-first document order, so an outer span that also contains the icon comes before the circle and `last` picks the circle. `foldkit/scene` exports the multi-match factories only through the `all` object (`all.selector`, `all.role`), not as `allSelector`.
- `expect(locator)` has no `toHaveCount`; calling it fails at run time with "toHaveCount is not a function". A count goes through `expectAll` with a multi-match locator: `expectAll(all.role("button", { name: "+ Item" })).toHaveCount(1)` checks that exactly one such button renders.
- `toHaveClass(name)` checks one class token: `h.Class` splits its string on whitespace into a class map and the matcher looks up `name` as one key. A StyleX style compiles to several atomic classes, so `toHaveClass` with a whole StyleX class string never passes; compare the `class` attribute instead.
- To check that an element uses a style shared from a common module (a create button reusing the shared pill style), compare its whole `class` attribute with the class the shared style produces: `expect(role("button", { name: "+ Item" })).toHaveAttr("class", stylex.props(sharedStyles.pill).className)`. This needs the test runner to run the StyleX transform (a StyleX plugin in the vitest config), so the class names in the test match the ones the view renders; it fails when the view renders its own style instead, and its message lists both class strings.
- A string passed to `text` matches an element whose full text equals it or one of whose direct text nodes equals it. An element holding a text node and a child element (an amount with a caption span under it) is still found by the text node alone.

## Sources

- node_modules/foldkit/dist/test/query.d.ts (`selector`, `text`)
- node_modules/foldkit/dist/test/query.js (`textContent`, `matchesText`, `hasDirectTextNodeMatch`)
- node_modules/foldkit/dist/test/matchers.js (`toHaveText`, `toHaveStyle`, `toHaveClass`)
- node_modules/foldkit/dist/html/index.js (`classObjectFor`, foldkit 0.170.0)
- node_modules/foldkit/dist/test/scene.d.ts (`expect`, `expectAll`, `all`)
- node_modules/foldkit/dist/test/query.js (`lookupAttribute`, `findAllImpl`, `filter`)
- A scene test asserting the background color of the circle around a row's category icon, checked to fail when the circle's color is replaced, run 2026-11-22.
- A scene test asserting a button renders once and carries a shared StyleX style, checked to fail against a button with a local style, run 2026-11-22.
- A scene test asserting a selected item's inline background color and its absence on an unselected item, run 2026-11-22.
