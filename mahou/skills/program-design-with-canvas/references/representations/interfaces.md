# Interfaces on the canvas

`program-design`'s interfaces reference still says what the part covers, what to read before proposing it and when it fits. The record keeps the JSON Schemas.

## Representation

One diagram of `interface-card` mocks joined by arrows.

- **Give each repository its own column inside an `area`.** Label the area with the repository, and add the package name when the repository holds several packages. Inside a repository, put each kind of part in its own column, side by side and with no header: components first, then hooks and functions. Align a card with the card that renders or calls it when the column leaves room.
- **Draw each part as an `interface-card`, including the existing components that render or call a part the change adds or alters.** Its `kind` sets the shape: a `component` has square corners, a `hook` is a pill, a `function` has a double border, an `endpoint` is a hexagon and a `type` has rounded corners. Its `change` sets the colour and the badge: `new` is green, `touched` amber and dashed, `unchanged` grey and dotted, `pending` blue and dotted for an endpoint another root settles, and `shared` violet for a type. Each member takes a third element, `added`, `changed`, `removed` or `null`, for its margin mark.
- **Give every function and every type its own card.** Never put two functions or two types on one card, even when they pair up, such as the reader and the writer of one format, or two documents of the same kind. A part another branch defines gets its own card too.
- **Draw an arrow for every call and every type.** Run one arrow from each caller to each function it calls, and one from each function to each type it uses or returns. When a caller or a callee is defined in another branch, draw it in this part as a reference card, so the arrow has both of its ends here.
- **List the part's inputs on the card, one member per line, and its return value under the rule.** Write "no arguments" on a part with no inputs, and "props unchanged" on a host component whose props do not change. Leave the path off the card, because the file tree holds the paths.
- **Put each type under the part that uses it first**, in the same column, joined to that part by a violet dotted arrow labelled `uses`, `returns` or `sends`. When several cards share the types, such as the views of one dialog, put the types under the last of those cards.
- **Label each arrow with the props, arguments or request it carries**: `renders · <props>`, `calls · <arguments>`, `GET`, `POST`, or the callback a hook hands back. Run an arrow between two columns from the facing edge of one card to the facing edge of the other. Run an arrow between two adjacent cards of one column straight from the bottom edge of the upper card to the top edge of the lower one. Curve an arrow that skips a card in its column around the side of the column. Use the left side for the first column and the right side for every other column, so the arrow never crosses a card or the content beside the column. Keep every arrow and label clear of the cards.
- **The legend under the diagram** lists every shape and colour.

## Example

```js
{ kind: 'interface-card', data: { name: '<ResourceTrigger>', kind: 'component', change: 'new', repo: '<library>', inputs: [['<resourceName>', 'string'], ['<entityId>?', 'string'], ['...buttonProps', 'ButtonProps']] } }
{ kind: 'interface-card', data: { name: '<useResourceAction>', kind: 'hook', change: 'new', repo: '<library>', inputs: [['<resourceName>', 'string']], output: '(() => void) | null' } }
{ kind: 'interface-card', data: { name: 'GET /api/<resource>/{name}/', kind: 'endpoint', change: 'pending', repo: '<consumer-api>', inputs: [['name', 'string, in the path']], output: '<Resource>' } }
{ kind: 'interface-card', data: { name: '<Resource>', kind: 'type', change: 'shared', repo: '<library>', inputs: [['name', 'string'], ['labels', '{ [locale]: string }']] } }
```
