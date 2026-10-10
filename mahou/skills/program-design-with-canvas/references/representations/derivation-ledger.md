# State on the canvas

`program-design`'s derivation ledger reference still says what the part covers, what to read before proposing it and when it fits. The record keeps the text ledger.

## Representation

One `state-card` mock per component, in the same columns as the component tree, and one `hook-card` mock per hook or function the branch adds. Size each card to its content as `canvas` describes.

- **A line is `name := expression`**, with a comment under it when the expression does not say something the reader needs, and a tag on the right naming where the value comes from. The tags are `prop`, `context`, `query meta`, `cookie`, `local`, `form`, `server`, `browser` and `computed` on a component; a hook adds `arg` for its arguments and `env` for a build variable. Every line that derives from the lines above it is `computed`.
- **Lines go in the order they appear in the code:** props first, then context, query meta and cookies, then local and form state, then server queries and mutations, then browser reads, then computed values. A value comes before any line that uses it.
- **The last line says what the component renders or what the hook returns**, tagged `returns`, with no name and no `:=`. Write it as plain text in the same style as the other lines, never as code or JSX: "Nothing when `<value>` is missing. Otherwise a `<Button>` with `<props>`, calling `<value>` on click." Put the conditions of what renders in this line, never in a computed value that only feeds it.
- **A hook card** starts with what the hook does in one line, then its arguments, what it reads, what it computes and what it returns.

Join the cards with arrows. Label an arrow between two component cards with what crosses between them, such as a callback with its arguments or the props one card hands the other. Join each hook to every component or hook that calls it with a grey dashed arrow and no label, and place the hook card next to its caller's card.

Write each proposal and each point that the design leaves unsettled as a free-text note next to the card the note is about.

## Example

```js
{
  kind: 'state-card',
  data: {
    title: '<Trigger>', kind: 'button', repo: '<library>',
    lines: [
      ['<configurationId>', '"<configuration>"', 'prop', 'set by <Host>'],
      ['<buttonProps>', 'every other prop', 'prop', 'passed straight to Button'],
      ['<start>', 'use<Start>({ <configurationId> })', 'context', 'null without a provider'],
      ['returns', 'Nothing when <start> is missing. Otherwise a Button with <buttonProps>, calling <start> on click.', 'returns', null],
    ],
  },
}
```

```js
{
  kind: 'hook-card',
  data: {
    name: 'use<Start>', kind: 'hook', repo: '<library>',
    does: 'builds the callback a trigger calls to start',
    lines: [
      ['<configurationId>', 'argument', 'arg'],
      ['<provider>', 'use<Context>()', 'context'],
      ['returns', '<provider> == null ? null : a callback that starts with <configurationId>', 'returns'],
    ],
  },
}
```

Never leave a line's source empty, and never put `undefined` in `data`; write `null` for a missing comment.
