# Screen layout on the canvas

`program-design`'s screen layout reference still says what the part covers, what to read before proposing it and when it fits. The record keeps the text sketch.

## Representation

One mock per state of the prototype, copied from the prototype as the iteration left it, as `canvas` describes for mockups. Give each mock a caption above it naming the state. Lay the mocks out in rows inside the column, so the part stays as wide as the column.

Under the mocks, write which component renders each region of the screen, and what the mocks cannot place: where else the same element appears, when a button is disabled, what happens on leaving the page.

## Example

```js
{ kind: '<screen>-final', data: { state: '<state>' } }
```
