# Breadboard

A breadboard draws the settled tree as the places a person moves through, the pieces each place has, and the actions that take the person from one place to another. Each leaf settles one piece without saying how it connects to the others, so a missing connection or piece found on the breadboard becomes a leaf in the tree before the session ends.

## Before drawing

Copy this skill's `mockups/place.tsx` into the canvas folder's `mockups/`, unless it is already there. Its props are its `data`: a `title`, a `subtitle` or `null`, and `items`, each `{ kind, label, id }`, where `kind` is `button`, `field`, `text`, `list`, `toggle`, `tabs` or `gap`.

## What to draw

Draw the whole flow at once, below the tree on the same document, under the title "Breadboard, from the tree above".

- **Draw one `area` per part of the flow** and label it `<n> <part>`. Lay the areas out in columns: every area in a column has the column's width, and no area spans two columns.
- **Draw one `place` mock per place.** The title is the place's name, and the items are only the pieces a person uses there: buttons, fields, lists, toggles, tabs, short texts. Draw no layout, no colors or fonts, and no real content; grey bars stand for content.
- **Draw one card per state** when a state changes which pieces the place has, joined by arrows labelled with the action or event that switches from one state to the other. A variation that only adds a line or switches a value stays on the same card as an item.
- **Draw an arrow per connection** from the place to where it leads, labelled with the action that moves the person there. Write an action that leaves the person on the same place in a grey note beside that place.
- **Draw a diamond per decision the system makes** and label it as a question, with each outgoing arrow labelled with its answer. Draw an outside service as a cloud.
- **Draw a red card per gap** with the text `? <the missing connection or piece, and the leaf it touches>`, beside the place it is about.

Update the "Breadboard" section in `shape.md` each time the canvas changes: one subsection per area, each place with its pieces, the connections, the decisions and the gaps still open.

## Working the gaps

The user corrects the breadboard and answers the gaps. Apply each answer to the card, and to the tree when the answer changes a settled leaf, adds a piece or connection, or puts something out of scope: rewrite the leaf it changes, add a leaf marked `(breadboard)`, or add one to Out of scope. Delete a gap's red card once its answer is in the tree.

When the user needs context before answering a gap, write the question on a violet question card under the gap's place, numbered after the session's last question.

When no red card is left, ask the user to approve the breadboard.
