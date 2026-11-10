# UI

A branch about something the user sees on a screen: where it sits, what information it shows, which states it has, how each value is encoded and what appears when there is nothing to show. A rule that derives the data the element shows is not part of this branch; it is a rules branch, and the UI branch refers to it.

## What it covers

The element's place relative to what already exists on the screen, the information it shows and which of it comes from which data, every state it can be in and what each state shows, the encoding of each value (color, size, position, text), the empty case, and the interactions the element offers and what each one does.

It does not cover how the data reaches the screen, that is a data flow. It does not cover components, props or styling code, that is program design.

## What it needs to question

- Which information is shown, and which of the available data is deliberately left out.
- Where the element sits relative to the existing screen, and what it displaces or joins.
- Which states exist. One per distinct thing the user can see. Examples: loading, with a skeleton or a placeholder while the data arrives; empty; error, such as a failed request; disabled; success. Ask which of these states the element can reach in its context, and whether it can reach any state the list does not name.
- How each value is encoded, and what the encoding follows: a fixed scale, a rule, a comparison against something else on screen.
- What each interaction does, and whether the element has any. A static element is a valid answer.
- What the user sees when the data is absent or the rule that derives it returns nothing.

## The visual direction

Before the first prototype, check whether the product's visual direction (palette, icons, logo, fonts, and the other decisions that hold across screens) is already settled. Look in the project's design system note, where the charter puts it, and in the exploration's decision log. When it is settled, the prototypes use it. When it is missing or partial, settle the missing pieces in this branch first, through mahou:prototype's visual-direction variant. Each pick is a leaf of the branch. When the branch is recorded, write the picks to the design system note.

## Representation

A prototype, built and iterated through mahou:prototype's screen-element variant, whose states are the branch's states and whose interactions are the branch's interactions. Load that skill when the branch opens; it carries how the file is built and iterated.

When a prototype already exists from the exploration, it is the starting point and not the representation. Before the branch renders, ask `prototype` to reconcile the file against the settled leaves, so every leaf that departs from the picture is applied and named.

In the note, the prototype is kept as an HTML file the note links to, placed where the project's charter puts attachments, and its path in the change's scratch folder is referenced nowhere. Prose under it walks the states in the order the user meets them and states what the prototype does not show: what each encoding follows, why the empty case reads the way it does, and which rules branch produces the data. The prose does not describe the prototype's controls or the file.
