---
name: one-page-design
description: Draws a settled design as one page on a canvas, as a journey (what the user sees step by step, what gets stored on the way and how it is read back) or as an anatomy (what one thing is made of and where each of its parts comes from). The user edits the same canvas. Exports it as an SVG. Use when the user asks for a one-page design.
argument-hint: <the settled tree, or where to find it>
---

Load mahou:basics first, then mahou:canvas. Then read `.mahou/one-page-design.md` if present.

# One-page design

The document goes in `one-page/` in the change's scratch folder, as `one-page.tldr.json` when the change has one. When the change has several documents, such as one per type, name each document after what it shows. The documents share the folder's mockups.

When drawing shows a gap in the tree, ask the user about it.

## Input

Read the settled tree, `design.md` in the change's scratch folder or the notes that record the design, and the prototypes under `prototypes/`. Draw only what the tree settled.

## Types

The types are starting points, not limits. Each gives a centre, a layout and the main patterns it uses. A page can borrow from another type or go beyond the types.

Read the type from the context first: what the user described and what the material is best shown as. When more than one type fits or none clearly does, explain to the user how the page would look under each type and ask. Then read the type's reference.

| The page shows | Reference |
|---|---|
| What happens, step by step: what the user sees, what gets stored on the way and how it is read back | `references/types/journey.md` |
| What one thing is made of and where each of its parts comes from | `references/types/anatomy.md` |

## Layout

Apply these to any page as guidance, not as rules. A page departs from one only when the user or the page's content calls for it.

- **One centre.** One element goes in the centre and is the largest, and every other part of the page attaches to it. The type says which element.
- **Related elements sit together.** Place them near each other, so the reader makes the connection from their position as well as from the arrows between them.
- **Supporting views are small and show only what changes.** A close-up or a variant is much smaller than the centre and shows only the part that differs, not the whole screen around it.
- **Draw only what answers the page's question.** Leave out the internals and the states the reader does not need to answer that question. Each type lists what its pages leave out.
- **Every arrow follows the legend.**

## Patterns

A page is not limited to the patterns its type names. When a part of the page needs a pattern its type does not name, offer the user the patterns that fit.

| Pattern | Use when | Reference |
|---|---|---|
| Central image | One picture of the whole, with notes around it | `references/patterns/central-image.md` |
| Concrete under abstract | Tying a model or explanation to the real state it describes | `references/patterns/concrete-under-abstract.md` |
| Cutaway | The anatomy of a mechanism, assembled part by part | `references/patterns/cutaway.md` |
| Small multiples | Comparing states or variants of one thing | `references/patterns/small-multiples.md` |
| Storyboard | A sequence of moments | `references/patterns/storyboard.md` |
| Trajectory | A behaviour over time, shown all at once | `references/patterns/trajectory.md` |
| Tape | Ordered events, offsets, windows, replay | `references/patterns/tape.md` |
| Travelling objects | What a process moves, and where it is at each moment | `references/patterns/travelling-objects.md` |
| Bookend contrast | Trade-offs, the two extremes of a range | `references/patterns/bookend-contrast.md` |
| Relationship matrix | Combinations, which item affects which | `references/patterns/relationship-matrix.md` |
| Containers and flows | Quantities, where they accumulate and drain, feedback loops | `references/patterns/containers-and-flows.md` |
| Repeated units | Magnitudes and scale comparisons | `references/patterns/repeated-units.md` |
| Layered stack | Levels of abstraction and how they depend on each other | `references/patterns/layered-stack.md` |
| Layering and separation | A dense drawing that has to stay readable | `references/patterns/layering-and-separation.md` |
| Micro and macro | Many items where both the overall pattern and each item matter | `references/patterns/micro-macro.md` |
| Sparkline | A trend next to a number or a label | `references/patterns/sparkline.md` |
| Parameter heatmap | How a system behaves across its configurations | `references/patterns/parameter-heatmap.md` |
| Reactive document | A causal system the reader should explore by changing it | `references/patterns/reactive-document.md` |
| Comic panel | One mechanism per panel, small drawings mixed with text | `references/patterns/comic-panel.md` |
| Dependency map | Which concepts depend on which | `references/patterns/dependency-map.md` |
| Question-typed form | Choosing a form from the question the drawing answers | `references/patterns/question-typed-form.md` |

## Legend

A card in an empty part of the canvas, with a small example of each entry drawn with the same shapes the canvas uses. Include only the entries the canvas uses:

| Example | Meaning |
|---|---|
| `blue` arrow | the <primary actor> does something |
| `green` arrow | the <other actor> does something |
| `light-violet` arrow | a side effect: saved, uploaded, loaded |
| `orange` arrow | what happens when something fails |
| `black` arrow | a note about the part it points to |
| `black` arrow between two diagrams | a concept that is part of the one it points to |
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
