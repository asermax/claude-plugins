# State on the canvas

`program-design`'s derivation ledger reference still says what the part covers, what to read before proposing it and when it fits. The record keeps the text ledger.

## Representation

One `state-card` mock per component, in the same columns as the component tree, and one `hook-card` mock per hook or function the branch adds. Size each card to its content as `canvas` describes.

- **A line is `name := expression`**, with a comment under it when the reader needs something the expression leaves out, and a tag on the right from `program-design`'s derivation ledger. Draw each tag in the colour of its kind, and give tags of a similar kind similar colours:

  | Kind | Tags and colours |
  |---|---|
  | What the part receives, greens | `prop` `#0ca678`, `arg` `#20c997`, `request` `#2b8a3e` |
  | Configuration, olives | `query meta` `#5c940d`, `env` `#74b816`, `config` `#66a80f` |
  | Shared state from above | `context` `#7048e8`, `cookie` `#c2255c` |
  | Read from outside, blues and orange | `server` `#1c7ed6`, `upstream` `#1971c2`, `database` `#364fc7`, `browser` `#e8590c` |
  | Held by the part, greys and amber | `local` `#495057`, `constant` `#5c677d`, `form` `#f08c00` |
  | Functions, teals | `function` `#0b7285`, `method` `#1098ad`, `effect` `#15aabf` |
  | Derived | `computed` `#868e96` |
  | Last line | `returns` `#212529` |

  When a branch adds a tag to the ledger, give the tag a colour from its kind's family that differs from the other colours in that family.
- **Lines go in the order they appear in the code:** props first, then context, query meta and cookies, then local and form state, then server queries and mutations, then browser reads, then computed values. A value comes before any line that uses it.
- **Only add variables when necessary.** If a value is used once, inline it where it is used, in the `returns` line or in an argument. Hooks and functions build the return value directly on the `return`, never step by step or through separate variables. Components do the same in the JSX: a value the JSX can use directly goes there instead of in a separate variable, such as a field destructured from a query's data.
- **The last line says what the component renders or what the hook returns**, tagged `returns`, with no name and no `:=`, in the same style as the other lines. For a component, write it as a tree of the elements the component renders, never as code, JSX or prose: one element per line, `├─` and `└─` before its children, and `←` before the props the element passes, each as a name or as `<prop> ← <where its value comes from>`. A condition goes on its own line under the element it shows or hides. Put the conditions of what renders in this line, never in a computed value that only feeds it.
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
      ['returns', 'nothing while <start> is missing; otherwise\nButton ← ...<buttonProps>, onClick: <start>', 'returns', null],
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
