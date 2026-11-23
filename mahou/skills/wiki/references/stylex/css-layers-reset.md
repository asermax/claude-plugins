# A global reset against StyleX's CSS layers

verified: 2026-11-23

Answers why a StyleX 0.19 style such as `fontWeight` or `fontSize` on a `<button>` has no effect when the page also has a global element reset, and how to keep a page-wide reset without losing to it.

## Knowledge

- With `useCSSLayers` turned on in `@stylexjs/unplugin` (for example `useCSSLayers: { before: ["base"] }`), StyleX writes every rule inside `@layer` blocks. A rule outside any layer beats every layered rule, whatever its specificity, so an unlayered `button { font: inherit; }` in `index.html` wins over a StyleX class that sets `fontWeight` or `fontSize` on that button.
- The symptom is quiet: `getComputedStyle` on the button reports the inherited 16px and weight 400 while the StyleX class is on the element. Styles set on inner spans still apply, so only text directly inside the button looks wrong.
- Put the reset inside the layer the StyleX config names in `before` (`@layer base { button, input, select, textarea { font: inherit; } }`). That layer is ordered before StyleX's own layers, so StyleX rules win over it and elements without a StyleX style still get the reset.
- A value that differs between light and dark but is not a color, such as a background image used only in the light theme, cannot go through `light-dark()`, which takes colors only. When the build lowers `light-dark()` with Lightning CSS's `--lightningcss-light` / `--lightningcss-dark` variables, the same switch works for any value: `var(--lightningcss-light, url(...)) var(--lightningcss-dark, none)`, kept in a `stylex.defineVars` entry.

## Sources

- `@stylexjs/unplugin` 0.19.1 options (`useCSSLayers`), read 2026-11-23.
- A Foldkit app styled with StyleX, checked in Chromium 149 with agent-browser: before the change a button's computed font was 16px/400 with a StyleX class asking for 15px/650; after moving the reset into the `before` layer it was 15px/650, 2026-11-23.
- The same app's light-only paper texture through the Lightning CSS variables, checked in light and dark, 2026-11-23.
