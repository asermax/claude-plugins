---
name: shape-with-canvas
description: Runs the shape skill on a canvas instead of in the chat. The canvas is the shape tree, one section per branch with its leaves and its prose; questions, findings and readings are written on it, and the user answers with sticky notes. Use when the user wants to settle the open decisions of a problem and solution definition on a canvas.
argument-hint: <the problem and the decisions settled so far>
---

Load mahou:shape first, then mahou:canvas. Then read `.mahou/shape-with-canvas.md` if present.

# Shape with canvas

`shape` and the skills it loads keep their procedure, question rules and tree rules, the Out of scope branch included.

The document is `canvas/shape.tldr.json` in the change's scratch folder. `shape.md` in the same folder keeps the tree and each branch's prose, updated whenever the canvas changes; the canvas draws from it.

## The canvas is the tree

The root goes at the top of the canvas as a title, `Problem: <one line>`. Each top-level branch is an `area` labelled `<n> <title> · <status>`, and Out of scope is always the last one.

- **Left side: the branch's leaves**, in monospace text, with the same marks as `design-tree`. The sub-branches follow as a tree under them, `├─ <n.m> <title>  <status>` with their leaves indented, and a blank line above each sub-branch.
- **Right side: the prose**, at the branch level. The branch's own prose comes first, the statement of what is settled under it. Then each sub-branch that has prose gets a heading, `<n.m> <title> · <status>`, with its prose under it. A sub-branch without prose gets no heading.
- **Prose is plain paragraphs, all of them the same width**, 1160 units.
- **Shape draws no representations.** A diagram goes on the canvas only inside a question, and is deleted with the question's card.
- When a branch's sub-branches make it much taller than the others, lay its sub-branch sections side by side under its leaves.

Lay the branches out in tree order, read down each column and then across. Use three columns, split where the tallest column stays as short as possible, and make each branch as wide as its column.

The opening tree goes on the canvas as the branch areas, each one pending, with the ✓ leaves the user brought under their areas and no prose yet. When a branch opens, its statement of what is settled goes on the canvas as its prose. When a branch settles, ask the user to approve it there.

A dropped branch or leaf folds into Out of scope as `shape` says: delete the branch's area or the leaf, and add the ✓ leaf to Out of scope.

## Questions

Questions go in the open branch, at the top of its right side, above its prose.

- **A question is a violet card**: a rectangle with violet border and fill, titled `❓ Q<n> · <title>`, then the body, which gives the situation and ends with the question. Add a diagram, drawn with tldraw shapes, when the question is about the order things happen in, who sees what, or which part of the definition a situation touches.
- **Follow-ups stay inside the base question's card**, one at a time, until the question branch closes. The card holds, top to bottom: the base question and its diagram, a summary box, one Claude note, and the current follow-up as a violet card of its own.
- **The summary box**, a solid grey rectangle labelled `Summary · Q<n> so far`, holds what the question branch has settled and the findings that bear on it. Rewrite it each round; never add a line per answer.
- **When the question branch closes**, delete the card, update the branch's leaves on the left, and update its prose.
- **Keep two questions open for the user to answer.** A question waiting on a lookup does not count toward the two, so there are three while one waits. Open the next question from the branch's open leaves as soon as one closes.

## Messages from Claude

Everything you would say in the chat goes on the canvas: how you read an answer, lookup results, status, and requests to approve a branch. Write it as a Claude note: a grey dashed rectangle labelled `Claude`, in the branch or the question it is about. Keep one Claude note per place and replace its text each round. When a branch is done, delete its note.

## Ending

When every branch is settled, put a Claude note under the root title stating that the tree is complete, and stop. Ask nothing, as `design-tree`'s Ending says.
