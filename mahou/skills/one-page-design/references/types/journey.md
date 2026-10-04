# Journey

A page that shows what happens, step by step: what the user sees, what gets stored on the way, and how it is read back.

## Centre

The centre is the main step of the flow, such as the screen where the user acts. It is the largest shape on the page. The steps before and after it sit around it, smaller. Do not lay the steps out in a single line. Uses `central-image` and `storyboard`.

## Layout

- **Data under the screen that keeps it.** The data a screen keeps sits under that screen, not off to one side behind an arrow.
- **Show change.** Draw the screens of different products so they look different. Show the state that leads to the main step, such as a screen with an error, and each interaction of the main step as its own small screen next to it. Uses `small-multiples`.
- **Close-ups.** For a dense screen, draw small zooms of its parts, each tied back to its part with a dotted line. Show a behaviour as two zooms of the same part in two states, with an arrow between them. Uses `small-multiples`.
- **Explainers.** A concept the screens only hint at, such as a buffer or a log, gets a large explainer, tied with a dotted line to where it appears. Uses `concrete-under-abstract`.
- **Storage.** Draw each store as a cylinder labelled with what the store keeps.

## Leave out

Internals the reader does not need, such as which API carries a call or the fields of a record.
