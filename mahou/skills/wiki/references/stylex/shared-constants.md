# Shared constants

verified: 2026-11-22

Answers how to keep a length that both a StyleX style and plain TypeScript code need, such as a grid's minimum column width that script uses to predict the layout, in one place so the two cannot drift apart.

## Knowledge

- Put the values in `stylex.defineConsts({...})` in a `*.stylex.ts` file, as a named `export const`. The compiler rejects a `defineConsts` call that is not a named export.
- The compiler replaces the call with a plain object of the raw values (StyleX 0.19.1, `styleXDefineConsts` copies each value into the emitted object). Numbers stay numbers, so ordinary TypeScript can import the export and compute with it at runtime. Checked with the StyleX plugin applied to both the Vite build and the Vitest run.
- Store numbers and add the unit where a style uses one, with a template literal inside `stylex.create`: ``gap: `${grid.columnGap}px` `` or ``gridTemplateColumns: `repeat(auto-fill, minmax(${grid.minWidth}px, 1fr))` ``. The compiler evaluates the template statically and emits the same CSS as the literal string (`minmax(160px, 1fr)`, `padding: 8px 12px`).
- Make the `.stylex.ts` file the one that holds the values, and import it from the script side.
- The same export shares a value between styles in different `.stylex.ts` files, such as a floating button's height and the bottom padding another screen reserves for it: another file's `stylex.create` reads `consts.height` and the build emits the literal value (`padding-bottom: 96px`), not a variable.
- Use `defineConsts`, not `defineVars`, for these values: `defineVars` exports CSS custom property references (`var(--x)`), which script cannot compute with.
- See css/grid-auto-fill-columns for the arithmetic that usually needs the shared values.

## Sources

- `@stylexjs/babel-plugin` 0.19.1, `lib/index.js`: `styleXDefineConsts` and the `defineConsts` visitor (export and static-value checks), read on 2026-11-22.
- A screen's bottom padding read from a `defineConsts` export in another `.stylex.ts` file, checked in the `vite build` CSS, 2026-11-22.
- Moving a chip grid's minimum width, gap, gutter and padding into `defineConsts` shared by the styles and a column-count function, checked with `vite build` output and the unit tests, 2026-11-22.
