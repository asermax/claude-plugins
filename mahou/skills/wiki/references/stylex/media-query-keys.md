# Media query keys

verified: 2026-11-23

Answers why a StyleX 0.19 style fails to compile with "Invalid pseudo or at-rule" when its media query key is a constant imported from another file.

## Knowledge

- A conditional value such as `height: { default: "auto", [mobile]: "50vh" }` compiles when `mobile` is a plain `const mobile = "@media (max-width: 739px)"` declared in the same file.
- The same key imported from another module as a plain exported string fails in `validateConditionalStyles` with "Invalid pseudo or at-rule": the compiler evaluates `stylex.create` statically and does not follow a plain constant across files.
- Declare the media query in each `.stylex.ts` file that uses it. StyleX's documentation offers `stylex.defineConsts` for media queries shared across files; that route was not tried here.

## Sources

- `@stylexjs/babel-plugin` 0.19.1 error trace (`validateConditionalStyles` → `validateNamespace` → `styleXCreateSet`) from a Vitest run with `@stylexjs/unplugin`, 2026-11-23; the same style compiled once the constant was declared in its own file.
