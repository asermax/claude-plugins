# Invariants

A closing branch about the rules that must hold on every path through the system, whatever order its operations run in: a total that always equals the records it sums, a record that is never written twice, a value that never crosses a limit. The other branches each settle their own part; this one gathers the rules from all of them and checks that each rule holds.

## When it opens

After every other branch of the root settles, and only when one of these holds:

- The design writes the same stored value from more than one path, such as a total updated by creating, editing and deleting records and by a bulk load.
- Something can run at the same time against shared data, such as two sessions or devices of one user, a background job next to a user's request, or a step retried after it already wrote.
- The user asks whether the system can reach an invalid state.

When none holds, the root has no invariants branch.

## What it covers

Every rule the design already settled that must hold on every path, gathered from the earlier branches, and any rule the user adds here. For each rule, what in the design keeps it and which operation could break it if that safeguard were missing. The operations that change the stored data, as the earlier branches define them.

It does not cover how one value is derived or one decision is made; that is a rules branch. It does not cover the states one thing passes through; that is a lifecycle.

## What it needs to question

- Which rules hold on every path. State the ones earlier branches settled as ✓ leaves, and ask whether any other must hold.
- For a rule the user adds here, its edges: what happens when a change would break it (refused, corrected, allowed and flagged), when it is checked (at the moment of the change, or over the whole history the change touches), and how bulk or background writes are checked against it.
- What each answer changes in the earlier branches. Carry it there in the same round, as mahou:design-tree says.

Then propose a spike with mahou:spike's model-check strategy over every operation, with each rule as an invariant. Run it once the user agrees. For each broken rule, ask a question in this branch, with the spike's shortest path to it as the concrete case, and the branch settles when those questions close.

## Representation

A table, one row per rule:

| Rule | Enforced by | Broken by, if unchecked |
|---|---|---|
| <the rule, one sentence> | <the decision or mechanism that keeps it, with the branch or leaf> | <the operation or interleaving that would break it without that safeguard> |

Under the table, write prose that names the rules this branch added and gives the model check's result: which rules held, within which bounds, and where its findings and model are stored.

At recording, each rule becomes one line in the project's invariants note, in the section for its kind, with a link to the note that explains the rule; the table and the model check's result go to that explaining note.
