---
name: test-design-with-canvas
description: Runs the test-design skill on a canvas instead of in the chat. The candidate roots are drawn on a map of the system for the user to pick, and each branch is drawn as a classification tree with its combination matrix under it; the user corrects with sticky notes or by voice. Use when the user wants to design the test cases and manual validations of a settled change on a canvas.
argument-hint: <the settled design to prove>
---

Load mahou:test-design first, then mahou:canvas. Then read `.mahou/test-design-with-canvas.md` if present.

# Test design with canvas

`test-design` and the skills it loads keep their procedure: roots, branches, classifications, partitions, matrices, facts, dropped rows, recording and ending.

When the user asks for a fast track, or fast track is already on in the session, load mahou:fast-track after mahou:canvas and before starting, unless it is already in context. It changes some of this skill's engagement rules.

The document is `canvas/test-design.tldr.json` in the change's scratch folder. The record stays `test-design/<repo>.md`; write a tree's change into it whenever the canvas changes, and draw the canvas from it.

## Roots on a map of the system

The candidate roots go on the canvas as a map of the system, under a title naming the change and the order the trees are worked in.

- **Each tree is an `area`**, labelled with its letter, its repository or deployable, and what it is to the rest of the system, such as `B <service>/: what a client calls`. Lay the areas out in the order work flows through them, whoever starts it on the left; put the tree that every other one imports along the bottom.
- **Each candidate root is a blue card** inside its tree's area. Its first line is an empty checkbox, `☐`, for the user to tick, then the root's id and its entry point; its second line is `e.g. <scenario>`, one or two scenarios through that entry point, an error case among them.
- **A candidate that is not a root is a grey dashed card** with the reason, such as a piece that runs only inside another entry point, or a migration, checked by one manual row.
- **Arrows join the cards that hand work to each other**, each labelled with the action one card asks of the other, such as `create` or `start`.

Tell the user to tick or cross out cards with sticky notes or by voice.

## Each branch is a classification tree

Each branch is an `area` labelled `<id> <root> · <status>`, inside its tree's area. Branches stack down their tree's area, and the trees sit side by side.

Draw every branch of a tree at once, each one whole: its root, classifications, partitions and matrix, labelled `proposed`. This replaces `test-design`'s one level and one branch at a time. A branch, and everything on it, stays `proposed` until the user approves it. Open the next tree once the user has approved every branch of the one before.

Draw each branch with `canvas`'s `classificationTree`, which lays out the root, the classifications, the partitions and the matrix. Keep each branch's spec as data in a script in the canvas folder. When a branch changes, such as a row turned manual or a partition added, call the helper again with the same name.

- **The root is a blue box** at the top, with the entry point and what it is given.
- **Each classification is a violet box** under the root, joined to it by a line with no arrowheads.
- **Each partition is a green box** under its classification, joined the same way, with a short label.
- **The matrix goes under the tree.** A header line reads `row · what the test does` on the left and `expected · kind · setup` on the right, both in grey. Each row is one line: its id and summary on the left, a filled dot under the centre of each partition it picks, and its expected outcome, kind and setup on the right. Dotted grey lines run between the rows and down each partition's column.
- **A row run by hand is orange**, its text and its dots, whether it is `test + manual` or `manual`. Its expected outcome adds what the check observes by hand.
- **Dropped rows get a grey line under the matrix**, `Dropped: <reason>`.
- **A branch with one row** draws its root and that row, with no classifications.

## Questions

A question goes inside the branch it is about, beside the classification, partition or row it discusses. A question about a root goes beside its card on the map. The branch's Agent note goes under the questions.

- **A question is a card with a violet border and no fill**, titled `❓ Q<n> · <title>`, then the body, which gives the situation and ends with the question. The card has no fill so it differs from the filled violet classification boxes.
- **Follow-ups stay inside the base question's card**, one at a time, until the question closes. The card holds, top to bottom: the base question, a summary box, one Agent note, and the current follow-up as a card of its own.
- **The summary box**, a solid grey rectangle labelled `Summary · Q<n> so far`, holds what the question has settled. Rewrite it each round; never add a line per answer.
- **When the question closes**, delete the card, redraw the branch with what it settled, and update the record.

## Messages from the agent

Everything you would say in the chat goes on the canvas, as an Agent note: a grey dashed rectangle labelled `Agent`, in the branch, tree or question it is about. One note at the top of the canvas says how to read the drawing and lists the implementation tasks the trees surfaced. Keep one Agent note per place and replace its text each round.
