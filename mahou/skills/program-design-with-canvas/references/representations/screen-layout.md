# Screen layout on the canvas

`program-design`'s screen layout reference still says what the part covers, what to read before proposing it and when it fits. The record keeps the text sketch.

## Representation

One `screen-wireframe` mock per view, left to right in the order the user reaches them, each with a caption above it naming the view. Arrows join consecutive views, labelled with the action that moves from one to the next, such as a click or a send.

- **Pick the layout by where the change sits.** `page` for a change in the page itself, `panel` for a change inside a side panel next to the page, `dialog` for a dialog over the dimmed page.
- **Regions that stay as they are** go in `regions`, one bracketed line each, such as `course page` or `side nav`.
- **What the branch adds or alters** goes in `rows`. Each box holds only the word that names what it holds: `title`, `introduction`, `option`, `send`. Write an icon as what it is, such as `check-mark icon`, never as the symbol.
- **Mark each button with `button`**, and the main action with `primary`. The mock draws buttons with a solid border and every other box dashed. A row with `group` draws a dashed outline around its boxes, for a list of options or another set rendered by one component.
- **Name the component that renders each row** in the row's `note`, as `<Component> · <repo>`. The mock draws the note outside the screen, next to the row.

Size each mock at 800 by 420 and the area around the views to fit them.

Under the views, write as free text what the sketches cannot place: where else the same element appears, when a button is disabled, what happens on leaving the page.

## Example

```js
{
  kind: 'screen-wireframe',
  data: {
    layout: 'dialog',
    regions: ['<page>, dimmed'],
    rows: [
      { boxes: [{ label: 'title', grow: true }, { label: '×', button: true }], note: '<Form> · <repo>' },
      { group: true, boxes: [{ label: '◯ option' }, { label: '◯ option' }], note: '<Options> · <repo>' },
      { boxes: [{ label: 'description', grow: true, height: 46 }], note: '<Textarea> · <library>' },
      { align: 'end', boxes: [{ label: 'cancel', button: true, width: 90 }, { label: 'send', button: true, primary: true, width: 90 }] },
    ],
  },
}
```
