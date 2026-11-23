# Styling disabled Foldkit buttons, switches and positioned toasts

verified: 2026-11-23

Why CSS `:disabled` rules and `paddingBottom` classes do not affect `@foldkit/ui` `Button`, `Switch` and `Toast` elements, and what to style instead.

## Knowledge

- `@foldkit/ui`'s `Button.view` and `Switch.view` render `aria-disabled="true"` and `data-disabled=""` when `isDisabled` is true, and omit the native HTML `disabled` attribute so the element stays focusable. A CSS rule written with `:disabled` alone never matches a disabled Foldkit button or switch.
- Match both native and ARIA-disabled controls by adding `:is([aria-disabled=true])` alongside `:disabled` in shared StyleX rules (for example, `opacity: { ":disabled": 0.45, ":is([aria-disabled=true])": 0.45, default: 1 }` and the matching `cursor`).
- `@foldkit/ui`'s `Toast.view` writes an inline `style` attribute on the toast stack container with `position: fixed`, `bottom: 0` (for bottom positions) and `padding: 16px`. Inline `padding` overrides any `paddingBottom` class passed through `containerClassName`.
- Shift a bottom-positioned toast stack above a floating bottom control with `marginBottom` instead (for example, `marginBottom: calc(<clearance> - 16px)` to account for the inline 16px padding). On a `position: fixed; bottom: 0` container with `top: auto`, `margin-bottom` lifts the container cleanly without fighting inline styles.

## Sources

- `@foldkit/ui/dist/button/index.js` (`view`), `@foldkit/ui/dist/switch/index.js` (`view`), `@foldkit/ui/dist/toast/index.js` (`positionToContainerStyle`, `view`) (@foldkit/ui 0.170.0)
- saifu disabled-button and toast-clearance fixes verified in Chrome at 390×844 and 1440×900, 2026-11-23
