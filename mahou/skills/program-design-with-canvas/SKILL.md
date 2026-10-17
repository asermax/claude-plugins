---
name: program-design-with-canvas
description: Runs the program-design skill on a canvas. Each part of a branch (screen layout, component tree, state) is drawn on the canvas for the user to correct, while the record file keeps the text representation. Use when the user wants to work a program design on a canvas.
argument-hint: <the scope or change to program-design>
---

Load mahou:program-design first, then mahou:canvas. Then read `.mahou/program-design-with-canvas.md` if present.

# Program design with canvas

`program-design` and the skills it loads keep their opening, tree, branch order, parts, standards, record and ending.

The document is `canvas/<name>.tldr.json` in the change's scratch folder, named after what the program design covers, such as `settings-screen.tldr.json`. The record stays `program-design/<root>.md`. Each time a part settles on the canvas, write it into the record in the text representation from `program-design`'s references.

## The canvas

- **The tree goes at the top**, in monospace text, with `design-tree`'s marks. Update it whenever you propose a part or the user settles one.
- **Each part gets its own `area`**, labelled `<root> · <branch> · <n> <part> · <status>`, with the status `proposed` or `settled`. A new part goes under the previous part of its branch. A settled part stays on the canvas.
- **Give each branch its own column.** Start a new branch to the right of the previous one. Put the new branch's first part at the same height as the first part of the root's first branch.
- **Draw each part as its reference under `references/representations/` describes.** Work out a part with no canvas reference with the user before drawing it.

Each canvas reference describes how to draw one of `program-design`'s representations, and has the same file name as that representation's reference under `program-design/references/representations/`:

| The part | `program-design` reference | Canvas reference |
|---|---|---|
| Screen layout | `screen-layout.md` | `references/representations/screen-layout.md` |
| Component tree | `component-tree.md` | `references/representations/component-tree.md` |
| State, as a derivation ledger | `derivation-ledger.md` | `references/representations/derivation-ledger.md` |
| Package layout | `package-layout.md` | `references/representations/package-layout.md` |
| Interfaces | `interfaces.md` | `references/representations/interfaces.md` |
| Callstack | `callstack.md` | `references/representations/callstack.md` |
| Module list | `module-list.md` | `references/representations/module-list.md` |
| Standards | `standards.md` | `references/representations/standards.md` |

## Questions

A question goes inside the part it is about, on the right side of the part's area, next to the items it discusses. The part's Claude note goes under the questions.

- **A question is a violet card**: a rectangle with violet border and fill, titled `❓ Q<n> · <title>`, then the body, which gives the situation and ends with the question. Add a diagram, drawn with tldraw shapes, when the question is about where something runs, in what order or across which boundary.
- **Follow-ups stay inside the base question's card**, one at a time, until the question closes. The card holds, top to bottom: the base question and its diagram, a summary box, one Claude note, and the current follow-up as a violet card of its own.
- **The summary box**, a solid grey rectangle labelled `Summary · Q<n> so far`, holds what the question has settled and the findings that bear on it. Rewrite it each round; never add a line per answer.
- **When the question closes**, delete the card, redraw the part with what it settled, and update the record.

## Messages from Claude

Everything you would say in the chat goes on the canvas: how you read an answer, research results, status, and requests to approve a part. Write it as a Claude note: a grey dashed rectangle labelled `Claude`, in the part or the question it is about. Keep one Claude note per place and replace its text each round. When a part settles, delete its note.

## Mockups

The canvas references use the mockups in this skill's `mockups/` folder: `screen-wireframe`, `component-cards`, `state-card`, `hook-card`, `interface-card` and `file-tree`. Before drawing a part, copy the mockups it uses into the canvas folder's `mockups/`, unless they are already there. Each file's props are its `data`.
