# stylex

- [`shared-constants`](shared-constants.md): defining a length once with `stylex.defineConsts` so plain TypeScript that computes layout and the styles of several files read the same number, and why a style reading it from another file gets a different class name
- [`conditional-styles`](conditional-styles.md): applying a modifier style in one state with a falsy array entry instead of a ternary that repeats the base style
- [`media-query-keys`](media-query-keys.md): why a media query key imported from another file fails with "Invalid pseudo or at-rule" and where to declare it instead
