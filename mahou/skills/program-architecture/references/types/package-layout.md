# Package layout

A branch about how a program's code is distributed: what the repository holds, what ships, what a user installs and what runs it. It is the first branch of a program architecture, because what a part may import depends on which package it lives in.

## What it covers

The packages and what each is for. Which of them are published and under what names. Whether anything is built before it ships and what that produces. What a user runs, and what runs it. Where tests and their fixtures live. The minimum runtime version and what forces it. What happens to a dependency the program must modify. What happens to scratch folders once the program no longer needs them.

It does not cover the modules inside a package, which the code itself decides, nor what any part does, which is a contract or a control flow branch.

## What it needs to question

- How many packages, and what belongs in each. A package exists because something outside it depends on it separately.
- Which packages are published, under which names, and whether a folder's name is the name published to the registry.
- Whether there is a build step. What it produces, what it costs to keep, and what a consumer gets without one.
- What a user invokes, and what executes it. When the answer is a compiled form, what that form takes away: a plug-in loaded at run time, a dependency resolved from disk, a patch applied by a package manager.
- Where tests sit relative to the code they test.
- The minimum runtime version, and which decision above forces it.
- A dependency that must be changed to work: whether it is patched, forked into a package or replaced, and whether that fix reaches an installed copy.

## Representation

A file tree in a fenced block, annotated, then a paragraph per package saying what it is for and what depends on it. A file tree is the one shape this type does not draw in mermaid. The annotations beside each entry are half the content, and mermaid has no form that can show them.

```
<repository>/
├── package.json                 what the whole workspace runs
├── <workspace file>
└── packages/
    ├── <tool>/
    │   ├── package.json         what a user invokes
    │   ├── src/
    │   └── tests/
    └── <shared>/
        ├── package.json
        ├── src/                 what more than one package needs
        └── tests/
```

The prose does not restate the tree. It says why each package is separate, what it exposes to the others, and which decisions above the tree cannot show: what is published, what is built, what runs it.
