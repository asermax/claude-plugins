# Screen layout

A low-resolution sketch of the screen the branch changes, with each element drawn as a box in the position it occupies.

## What it covers

Where what the branch adds or alters sits on the screen, and which component renders each piece. The rest of the screen appears only as much as it takes to place the change.

It does not cover who owns what, which is the component tree, nor where the values come from, which is the derivation ledger.

## What to check before proposing

- Read the screen as it renders today, and the components that render the region the change lands in.
- When the screen has a prototype, take the parts, the states and the copy from it.
- Check the standards for layout and component conventions, so the proposed placement follows them.

## Representation

Boxes in a fenced block, with nothing inside a box but the word that names what it holds: a title, a label, a value, a bar. No copy, no data, no styling. The sketch draws what the branch adds or alters, each box with an arrow on the right naming the component that renders it. Everything else is one bracketed line per region.

```
┌────────────────────────────────────────────────────────┐
│   [ existing region, one line per region ]             │
│                         ⋮                              │
│   ┌─────────────────────────────────────────────────┐  │ ← NewComponent
│   │  title                                          │  │
│   │  description                                    │  │
│   │                                                 │  │
│   │  ▓▓▓▓│▓▓▓│▓▓│                                   │  │ ← NewChildComponent
│   │  label  label  label                            │  │
│   └─────────────────────────────────────────────────┘  │
│   [ existing actions ]                                 │
└────────────────────────────────────────────────────────┘
```

When the element has several states, sketch the one that carries the change and say in a line how the others differ. The prose under it covers what the sketch cannot place, such as anything whose position depends on the data. When the rendering itself is undecided, the branch goes through the `prototype` skill, and the sketch records what the prototype settled.

## When it fits

A branch that adds or moves something a user sees. It opens a screen branch, before the component tree, because a correction here costs one redrawn sketch. It does not fit a branch with no screen.
