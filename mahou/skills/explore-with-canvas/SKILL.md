---
name: explore-with-canvas
description: Runs the explore skill on a canvas instead of in the chat. The user asks with sticky notes, the skill lays out the answers freely on the canvas with their facts and diagrams, and a decision log grows in one place. Use when the user wants to build their understanding of a problem on a canvas.
argument-hint: <context and the problem in plain words>
---

Load mahou:explore first, then mahou:canvas. Then read `.mahou/explore-with-canvas.md` if present.

# Explore with canvas

`explore` keeps its opening, how each question is answered and its decision rules.

The document is `canvas/explore.tldr.json` in the change's scratch folder.

## The canvas

- **The opening** goes in an `area` labelled `Problem`: what the sources ask for, what the user decided that departs from them, and where they contradict each other or the user's direction.
- **The decision log** is an `area` labelled `Decisions`, next to the problem. Add each decision the user settles as one line, in the order settled, and never move or rebuild the log, so the user can always go back to it.
- **Lay the answers out freely on the canvas.** Draw related topics close together, and join them with an arrow when the relation needs saying. Give the answer first, then the facts that support it, then the decisions it raises. Write each decision as a violet card titled `❓ <title>`. Keep verified facts apart from what a source asserts.
- **Draw diagrams with tldraw shapes**, which are easier to change when a later answer changes the diagram.
- **A prototype, an architecture drawing or a spike result** goes next to the answer it is part of. Draw screens as mockups copied from the prototype, and architecture drawings with `architecture-exploration`'s rules on this same canvas.

## Messages from Claude

Everything you would say in the chat goes on the canvas, as a Claude note: a grey dashed rectangle labelled `Claude`, next to the answer or shape the note refers to. Replace the note's text when the message changes instead of adding another note.
