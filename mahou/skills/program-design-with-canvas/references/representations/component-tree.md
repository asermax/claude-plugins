# Component tree on the canvas

`program-design`'s component tree reference still says what the part covers, what to read before proposing it and when it fits. The record keeps the text tree.

## Representation

One `component-cards` mock. Each component is a card inside the card of the component that renders it. Each tree root starts a column, and roots that belong together, such as the components that host the same element, share one.

- **Colour each card by the component's kind:** `host` for a component of the host app that only renders the new ones, `provider` for one that holds state and renders nothing of its own, `scope` for one that adds values for everything inside it, `dialog`, `view` for one of the views a parent switches between, `part` for a piece of a view, and `button`.
- **Tag each card with its repository and with whether the change adds the component or touches it.** A new card has a solid border, a touched card a dashed one.
- **A card with `row`** lays its children side by side, for views that replace each other.
- **The legend under the cards** lists every colour.

Explain each card with a free-text note beside the diagram, with an arrow pointing at the card's title. In the note, write what the component renders, what state it owns and why it exists rather than staying inline. A component rendered in more than one place gets its notes on one instance, and the other instance gets one note saying it has the same cards. Point each arrow at a spot inside the mock as `canvas` describes, finding the card by its `data-card` attribute, which holds the card's name. Lay the notes out as `canvas` describes for notes around a diagram.

## Example

```js
{
  kind: 'component-cards',
  data: {
    columns: [
      [{ name: '<Providers>', kind: 'host', repo: '<app>', change: 'touched', children: [
        { name: '<Provider>', kind: 'provider', repo: '<library>', change: 'new', children: [
          { name: '<Dialog>', kind: 'dialog', repo: '<library>', change: 'new', row: true, children: [
            { name: '<Form>', kind: 'view', repo: '<library>', change: 'new' },
            { name: '<Done>', kind: 'view', repo: '<library>', change: 'new' },
          ] },
        ] },
      ] }],
      [{ name: '<Host>', kind: 'host', repo: '<app>', change: 'touched', children: [
        { name: '<Trigger>', kind: 'button', repo: '<library>', change: 'new' },
      ] }],
    ],
  },
}
```
