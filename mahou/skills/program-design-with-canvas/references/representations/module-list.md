# Module list on the canvas

`program-design`'s module list reference still says what the part covers, what to read before proposing it and when it fits. The record keeps the file tree.

## Representation

One `file-tree` mock under the interfaces diagram, with the folders the change lands in as they look after the change, one tree per repository.

- **Colour each file that the change adds, changes or deletes**, using the interface cards' colours: `new` green, `touched` amber and dashed, `deleted` red and struck through.
- **Give every file its own line, and every folder its own line above the files in it.** Never put a folder path in front of a file name.
- **Leave the files and folders around them unmarked**, for context. Show only the name of a folder that the change does not enter.
- **Follow a file with its reason in grey** when the path alone does not explain the change.

## Example

```js
{ kind: 'file-tree', data: { lines: [
  ['', '<library>/src/', null, null],
  ['├── ', 'components/', null, null],
  ['│   ├── ', '<Resource>/', null, null],
  ['│   │   ├── ', '<ResourceTrigger>.tsx', 'new', null],
  ['│   │   └── ', 'index.ts', 'new', null],
  ['│   └── ', '<Existing>/', null, null],
  ['└── ', 'index.ts', 'touched', 'exports the trigger'],
] } }
```
