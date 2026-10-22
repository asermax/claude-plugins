---
name: design-with-canvas
description: Runs the design skill on a canvas instead of in the chat. The canvas is the design tree, one section per branch with its leaves, its representation and its prose; questions, findings and readings are written on it, and the user answers with sticky notes. The recording at the end stays in the chat. Use when the user wants to design a system on a canvas.
argument-hint: <the settled shape tree, or where to find it>
---

Load mahou:design first, then mahou:canvas. Then read `.mahou/design-with-canvas.md` if present.

# Design with canvas

`design` and the skills it loads keep their procedure, branch types, question rules and tree rules.

The document is `canvas/design.tldr.json` in the change's scratch folder. `design.md` in the same folder keeps the tree, each branch's prose and its mermaid diagrams, updated whenever the canvas changes; the canvas draws from it.

## The canvas is the tree

Each top-level branch is an `area` labelled `<n> <title> · <status>`.

- **Left side: the branch's leaves**, in monospace text, with the same marks as `design-tree`. The sub-branches follow as a tree under them, `├─ <n.m> <title>  <status>` with their leaves indented, and a blank line above each sub-branch.
- **Right side: the write-up**, at the branch level. The branch's own representation and prose come first. Then each sub-branch that has a representation or prose gets a heading, `<n.m> <title> · <status>`, with its diagrams and its prose under it. A sub-branch with neither gets no heading.
- **Use `design`'s types for the representations.** While a branch is open, draw its diagrams with tldraw shapes, which are easier to change as answers come in. Once the branch settles, replace each diagram with a `mermaid` shape that holds the source the final document uses. Size the shape to the diagram's own proportions, at one canvas unit per diagram unit. When the shape is wider than the branch's right side, widen every area in that column until the shape fits, so the column keeps one width. Draw a screen as a mockup copied from its prototype.
- **Prose is plain paragraphs, all of them the same width**, 1160 units, under the representation they describe.
- When a branch's sub-branches make it much taller than the others, lay its sub-branch sections side by side under its leaves.
- **A folded branch keeps its area**, labelled `<n> <title> · merged into <m>`, holding only the leaf that says where its content went.

For a branch whose type has a canvas reference under `references/types/`, read both the type in `design` and the canvas reference: draw the canvas as the canvas reference describes, and write `design.md` and the final documentation in the type's own form. A type with no canvas reference is drawn in its own form. Each canvas reference has the same file name as the type it adapts.

| The branch is about | `design` type | Canvas reference |
|---|---|---|
| What a component agrees with the rest of the system | `contract.md` | `references/types/contract.md` |
| How a value moves between components | `data-flow.md` | `references/types/data-flow.md` |

Lay the branches out in tree order, read down each column and then across.

The opening tree goes on the canvas as the branch areas, each one pending, with no leaves yet. Above the areas, a Claude note says in one line per branch what that branch settles. A branch's opening statement goes on the canvas as its leaves and its prose. The exploration, the shape tree or earlier branches may already show how part of the branch looks. When they do, and a diagram would make that part easier to follow, draw it with tldraw shapes above the prose, in the diagram form of the branch's type, and mark on it the parts that are still undecided, so the unknowns are obvious. When they do not, the opening has leaves and prose only. When a branch settles, draw its representation and prose in its section and ask the user to approve it there.

## Questions

Questions go in the open branch, on its right side, under its write-up. The branch's Claude note goes under the questions.

- **A question is a violet card**: a rectangle with violet border and fill, titled `❓ Q<n> · <title>`, then the body, which gives the situation and ends with the question.
- **Add a diagram, a table or a mockup to the card when text is not enough.** The canvas offers tldraw shapes for a diagram drawn by hand, a monospace text for a table, a mockup, and a `mermaid` shape. For example: a diagram of a library's format or of how its parts call each other, next to what the tree settled about it; a table in the summary box when findings compare options, one column per option and one row per point that matters for the decision; a small timeline with real values when the question is about order.
- **Follow-ups stay inside the base question's card**, one at a time, until the question branch closes. The card holds, top to bottom: the base question and its diagram, a summary box, one Claude note, and the current follow-up as a violet card of its own.
- **The summary box**, a solid grey rectangle labelled `Summary · Q<n> so far`, holds what the question branch has settled and the findings that bear on it. Rewrite it each round; never add a line per answer.
- **When the question branch closes**, delete the card, update the branch's leaves on the left, and update its write-up.
- **Keep two questions open for the user to answer.** A question waiting on a spike, a prototype or a lookup does not count toward the two, so there are three while one waits. Open the next question from the frontier as soon as one closes.
- **A merged question is one card.** Retitle the lower-numbered card, fold the other card's summary into its summary box, and delete the other card.

## Messages from Claude

Everything you would say in the chat goes on the canvas: how you read an answer, research and spike results, status, and requests to approve a branch. Write it as a Claude note: a grey dashed rectangle labelled `Claude`, in the branch or the question it is about. Keep one Claude note per place and replace its text each round. When a branch is done, delete its note.

## Recording

When the tree is complete, stop the canvas and continue with `design`'s Recording section in the chat.
