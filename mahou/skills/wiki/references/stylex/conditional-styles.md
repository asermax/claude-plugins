# Conditional styles

verified: 2026-11-22

Answers how to apply a modifier style only in one state, such as an "off" look for an unselected button, without repeating the base style in both branches of a ternary.

## Knowledge

- `stylex.props` and any helper that takes `StyleXStyles` accept an array whose entries can be `false`, `null` or `undefined`. At runtime `stylex.props` skips an entry that is `== null` or `=== false` while it flattens the array (StyleX 0.19.1, `lib/cjs/stylex.js`).
- Write the modifier as a conditional entry: `stylex.props([styles.chip, !isSelected && styles.chipOff])`. Avoid `isSelected ? styles.chip : [styles.chip, styles.chipOff]`, which names the base style twice and repeats the ternary for every element that changes with the same state.
- The types accept it: `!flag && styles.x` has type `false | <style>`, which `StyleXStyles` admits, so a strict typecheck passes with no cast.
- Later entries win over earlier ones for the same property, so put the modifier after the base.

## Sources

- `@stylexjs/stylex` 0.19.1, `lib/cjs/stylex.js`: the `possibleStyle == null || possibleStyle === false` skip in the props merge, read on 2026-11-22.
- Replacing two `cond ? base : [base, modifier]` class choices with conditional entries in a view, checked with a strict typecheck and the view's scene tests, 2026-11-22.
