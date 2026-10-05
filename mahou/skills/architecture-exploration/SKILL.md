---
name: architecture-exploration
description: Draws a system's architecture on a canvas and explores ways to change it with the user. It lays the options out side by side, draws a part they share step by step, and redraws the whole chosen option after each decision the user makes, until one architecture remains. The user edits the same canvas. Use when the user wants to see which parts a system has and how they connect, or to compare options for changing them before a design is settled. For a settled design drawn as one page, use mahou:one-page-design.
argument-hint: <the system or the change to draw>
---

Load mahou:basics first, then mahou:canvas. Then read `.mahou/architecture-exploration.md` if present.

# Architecture exploration

The document goes in `canvas/` in the change's scratch folder and is named after the system or the change it draws. Every drawing of one exploration shares one document: the system as it stands in a square of its own, then the options and the drawings that follow them.

## Input

Draw only the parts and connections the conversation has established: what the scouts and researchers found, and the decisions the user has settled. When you reach a part whose place nobody has stated, ask the user where it goes.

## A drawing

Draw with the shapes, labels and layout mahou:canvas sets. On top of those:

- **Name each part with the name the code and the docs use**, followed by its runtime and its deployable, such as `API: <runtime>` or `<workflow name> (<deployable>/)`.
- **Draw one area per platform or deployable**, labelled with its name. Put each drawing in an `area` of its own, titled with the option it draws, such as `<letter>. <option>` or `Chosen: <option>`.
- **Add a note for each fact the diagram leaves out**, such as where deferred work runs or what an option gives up, with an arrow to the part it is about.
- **Start every shape id with the drawing's key**, `<key>-<part>`. To move, spread or copy a whole drawing, select its shapes by the prefix; tldraw keeps their arrows attached through the bindings.

## Exploring

When the user asks how the system could change, or wants options compared, follow `references/exploration.md`. A drawing of the system as it stands needs only the sections above.

## Export

Export through mahou:canvas. Save the SVG next to the document, under the same name.

## What this skill is not

It does not pick an option. The options and every change to them come from the user. It does not commit.
