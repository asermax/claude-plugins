# Typing CSS custom properties in `style`

verified: 2026-11-27

Answers how to pass a CSS custom property, such as `--resource-color`, through a React `style` prop without casting the style object.

## Knowledge

- React's `CSSProperties` has no `--name` keys, so `style={{ "--resource-color": value }}` fails to type-check, and the usual workaround is `as CSSProperties` on every style object that sets one.
- Declare the keys once per app instead, by augmenting `CSSProperties` with a template-literal index signature. Every `style` object then type-checks without a cast, and every other key stays checked.
- The augmenting file needs a top-level import of `"react"` so it is a module: without one, `declare module "react"` replaces React's types instead of merging into them.
- The augmentation must extend the `CSSProperties` interface. A `Record` type cannot merge into an interface, so a lint rule that prefers `Record` to an index signature gets a disable comment with that reason here.

```ts
// src/types/cssProperties.ts
import "react";

declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}
```

```tsx
<div
  className={styles.swatch}
  style={{ "--resource-color": resourceColor }}
/>
```

## Sources

- A frontend styling standard that passes values known only at run time through CSS custom properties set in `style`, 2026-11-27.
