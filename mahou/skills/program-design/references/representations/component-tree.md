# Component tree

The components the branch involves after the change, indented by who renders whom.

## What it covers

Which components the branch adds, changes or splits, and which component renders each one. Per component, what it renders, what state it owns and why it exists rather than staying inline.

It does not cover props, state values or files: those are the interfaces, the derivation ledger and the module list.

## What to check before proposing

- Read the components around the change: the parent that will render the new ones, its siblings, and the components the repository already has for the same job.
- Check the standards for when a component is split out and where its state lives, since those are what make a split arguable.

## Representation

A plain text tree in a fenced block, each line marked `new`, `touched` or nothing. Only what the branch touches: an unchanged component appears only as the parent line of one that changes. Library components, untouched siblings and the layout around the change stay out. A component rendered twice with different data gets one line per instance, with the distinguishing word after a separator.

```
ParentComponent                          touched
└── NewComponent                         new
    ├── NewChildComponent · variant a    new
    └── NewChildComponent · variant b    new
```

Under it, one short paragraph per marked component: what it renders, what state it owns, and why it exists rather than staying inline, in the terms of the standards that govern the repository.

## When it fits

A branch whose change is a composition: a component added, moved, split or given a child. It follows the screen layout and precedes the state and the interfaces, so the split settles before any prop is named. It does not fit a branch that only changes what an existing component computes; the derivation ledger carries that alone.
