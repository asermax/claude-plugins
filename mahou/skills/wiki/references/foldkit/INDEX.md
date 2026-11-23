# foldkit

- [`typed-values`](typed-values.md): how Foldkit's RadioGroup and routes carry typed values, and how to keep a failed query-parameter decode from becoming a not-found route
- [`reading-the-clock`](reading-the-clock.md): reading the current time through a command at the moment a view that defaults to or is bounded by "now" opens, keeping one reading out at a time, and feeding readings in story tests
- [`scene-assertions`](scene-assertions.md): finding an aria-hidden SVG icon with `selector` by its path data, checking that an optional line is absent with `toHaveText`, checking an inline style and its absence with `toHaveStyle`, reaching the element that holds an icon, counting matches with `expectAll`, what `toHaveClass` matches, and checking that an element carries a shared StyleX style
- [`select-picker`](select-picker.md): building a select-like picker (a field plus a searchable list) on `Dialog` with the ARIA combobox pattern, opening it as a bottom sheet on the phone and a dropdown under the field on the desktop with CSS anchor positioning, and the Foldkit lint rules that shape a child view and its `Got*` wrapper
- [`scene-mounts`](scene-mounts.md): resolving and acknowledging the `AcquireResources` Mounts of a dialog opened inside another dialog in a scene test, and why a `Mount.expectEnded` step kept in a constant stops acknowledging after the first scene
