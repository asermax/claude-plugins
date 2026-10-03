---
name: one-page-design
description: Draws a settled design as one page on a canvas, where screen mockups, storage and arrows show what the user sees, what gets stored on the way and how it is read back. The user edits the same canvas. Exports it as an SVG. Use when the user asks for a one-page design.
argument-hint: <the settled tree, or where to find it>
---

Load mahou:basics first, then mahou:canvas. Then read `.mahou/one-page-design.md` if present.

# One-page design

The document goes in `one-page/` in the change's scratch folder, as `one-page.tldr.json` when the change has one. When it has several, such as one per flow, each is named after what it shows, and they share the folder's mockups.

When drawing shows a gap in the tree, ask the user about it.

## Input

Read the settled tree, `design.md` in the change's scratch folder or the notes that record the design, and the prototypes under `prototypes/`. Draw only what the tree settled.

## Layout

- **Structure through size and position.** The main element of the change goes in the centre and is the largest; the steps around it are smaller. No single line of steps.
- **Relations through position.** What belongs to an element sits next to it. The data a screen keeps sits under that screen, not off to one side behind an arrow.
- **High level.** Leave out the internals the reader does not need, such as which internal service carries a call or the fields of a record. A store says what it keeps.
- **Show change.** Screens of different products look different. Show the state that leads to the main element, such as a screen with an error, and each interaction of the main element as its own small screen next to it.
- **Close-ups.** For a dense screen, draw small zooms of its parts, each tied back to its part with a dotted line. Show a behaviour as two zooms of the same part in two states, with an arrow between them.
- **Explainers.** A concept the screens only hint at, such as a buffer or a log, gets a large explainer, tied with a dotted line to where it appears.
- **Every arrow follows the legend.**

## Legend

A card in an empty part of the canvas, with a small example of each entry drawn with the same shapes the canvas uses. Include only the entries the canvas uses:

| Example | Meaning |
|---|---|
| `blue` arrow | the <primary actor> does something |
| `green` arrow | the <other actor> does something |
| `light-violet` arrow | a side effect: saved, uploaded, loaded |
| `orange` arrow | what happens when something fails |
| `black` arrow | a note about the part it points to |
| dotted line without an arrowhead | a close-up of the part it starts from |
| dotted `grey` arrow | a reference to something stored elsewhere |
| dotted box | parts that belong together |
| cylinder | where something is stored |
| blank screen | a screen the <actors> see |

Section titles take the colour of the actor they are about.

## Export

Export through `canvas`. The SVG sits next to the document, under the same name.

## What this skill is not

It does not commit.
