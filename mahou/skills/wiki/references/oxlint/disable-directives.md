# Keeping a disable directive on the reported line

verified: 2026-11-23

Answers why an `oxlint-disable-next-line` directive stops suppressing a report after the file is formatted, and how to lay out the code so it keeps working.

## Knowledge

- `// oxlint-disable-next-line <rule> -- reason` suppresses only the reports whose location starts on the line right after the comment. The report sits on the flagged node (a `typeof` check, say), not on the statement that holds it.
- A formatter such as oxfmt reflows a long condition over several lines. When the flagged node lands on the second or third line of the reflowed expression, the directive no longer covers it and oxlint reports the rule again (seen with oxlint 1.92.0 and oxfmt 0.77.0, `return a && b && typeof x === "string" ? … : null` split into one operand per line).
- Keep the flagged node on the line after the directive: move the other conditions into an early return above the directive, so the guarded expression is short enough to stay on one line.

```ts
// Avoid: after formatting, the typeof operand sits two lines below the directive.
// oxlint-disable-next-line some/rule -- reason
return isTagCall(step) &&
  step.arguments.length === 2 &&
  typeof tag.value === "string"
  ? [tag.value]
  : null;

// Prefer: the other checks return early; the flagged check stays on the next line.
if (!isTagCall(step) || step.arguments.length !== 2) {
  return null;
}

// oxlint-disable-next-line some/rule -- reason
return tag?.type === "Literal" && typeof tag.value === "string"
  ? [tag.value]
  : null;
```

## Sources

- oxlint 1.92.0 and oxfmt 0.77.0, running the linter after the formatter on a custom lint plugin, 2026-11-23.
