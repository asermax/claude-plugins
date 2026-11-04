---
name: program-design-with-canvas
description: Runs the program-design skill on a canvas. Each part of a branch (screen layout, component tree, state) is drawn on the canvas for the user to correct, while the record file keeps the text representation. Use when the user wants to work a program design on a canvas.
argument-hint: <the scope or change to program-design>
---

Load mahou:program-design first, then mahou:canvas. Then read `.mahou/program-design-with-canvas.md` if present.

# Program design with canvas

`program-design` and the skills it loads keep their opening, tree, branch order, parts, standards, record and ending.

When the user asks for a fast track, or fast track is already on in the session, load mahou:fast-track after mahou:canvas and before starting, unless it is already in context. It changes some of this skill's engagement rules.

The document is `canvas/<name>.tldr.json` in the change's scratch folder, named after what the program design covers, such as `settings-screen.tldr.json`. The record stays `program-design/<root>.md`. Each time a part settles on the canvas, write it into the record in the text representation from `program-design`'s references.

## The canvas

- **The tree goes at the top**, in monospace text, with `design-tree`'s marks. Update it whenever you propose a part or the user settles one.
- **Each part gets its own `area`**, labelled `<root> · <branch> · <n> <part> · <status>`, with the status `proposed` or `settled`. A new part goes under the previous part of its branch. A settled part stays on the canvas.
- **Give each branch its own column.** Start a new branch to the right of the previous one. Put the new branch's first part at the same height as the first part of the root's first branch.
- **Draw each part as its reference under `references/representations/` describes.** Work out a part with no canvas reference with the user before drawing it.
- **Draw the contents of a file, such as a route file or a config, as a `code-snippet` mock** in its `code` view, with highlighting rules for the file's language. Never draw a file's contents as a monospace text card.
- **Draw the code the user asks for as `code-snippet` mocks** inside an `area` in the column of the branch it details, under the branch's parts, labelled as a sketch that does not enter the record. Draw a change as a diff in the `unified` view, one snippet per file, with a note beside each changed line on the behaviour the line adds or changes.
- **An arrow runs from the part that acts to the part it acts on**, labelled with the action and what it carries: `renders · <props>` from a component to what it renders, `calls · <arguments>` from a caller to the hook or function it calls, `reads context · <values>` from a component to the provider whose context it reads. The canvas references name only the labels each one uses.

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

## Marking the change

On every part, mark what the change adds, alters and removes, and what exists today and takes part in the change, with the same marks in every representation.

- **A card carries a badge in its top right corner** for the change to the whole component, hook or function: `+ NEW` in green when the change adds it, `~ CHANGED` in amber when it exists today and the change alters it, and `= UNCHANGED` in grey when it exists today, stays as it is and takes part in the change. The border repeats the mark: solid and thicker for new, dashed for changed, dotted grey for unchanged. The card's colour names the kind of component or hook.
- **A line, an interface member or a file carries a mark in its left margin**: `+` added, `~` changed, `−` removed, and no mark when it exists today and stays. On state, hook and interface cards the line's name and expression take the mark's colour: green for added, amber for changed, red and struck through for removed. A line carries no background colour.
- **Draw what takes part in the change even when the change leaves it as it is**, such as the host that renders a new component or the component that calls a changed hook, marked `= UNCHANGED`, with the lines that connect it to the change.
- **Draw a part that another branch defines as a reference** in the branch that uses it: the same kind of card, with its name and kind, the line `definition in <branch>.<part>` and no lines inside, joined only to the cards of this branch. Never draw an arrow to a card in another column. In the module list, the file of that part carries the mark it has in the branch that defines the part, followed by `shared, defined in <branch>.<part>`.
- **Every part ends with the same legend**, a `change-legend` mock that draws the three badges with their borders and the three line marks. The component tree draws the badges inside its own legend row instead.

## Questions

A question goes inside the part it is about, on the right side of the part's area, next to the items it discusses. The part's Agent note goes under the questions.

- **A question is a violet card**: a rectangle with violet border and fill, titled `❓ Q<n> · <title>`, then the body, which gives the situation and ends with the question. Add a diagram, drawn with tldraw shapes, when the question is about where something runs, in what order or across which boundary.
- **Follow-ups stay inside the base question's card**, one at a time, until the question closes. The card holds, top to bottom: the base question and its diagram, a summary box, one Agent note, and the current follow-up as a violet card of its own.
- **The summary box**, a solid grey rectangle labelled `Summary · Q<n> so far`, holds what the question has settled and the findings that bear on it. Rewrite it each round; never add a line per answer.
- **When the question closes**, delete the card, redraw the part with what it settled, and update the record.

## Messages from the agent

Everything you would say in the chat goes on the canvas: how you read an answer, research results, status, and requests to approve a part. Write it as an Agent note: a grey dashed rectangle labelled `Agent`, in the part or the question it is about. Keep one Agent note per place and replace its text each round. When a part settles, delete its note.

## Mockups

The canvas references use the mockups in this skill's `mockups/` folder: `component-cards`, `state-card`, `hook-card`, `interface-card`, `file-tree` and `change-legend`. Before drawing a part, copy the mockups it uses into the canvas folder's `mockups/`, unless they are already there. Each file's props are its `data`.
