# Package layout

How a program's code is distributed: what the repository holds, what ships, what a user installs and what runs it.

## What it covers

The packages and what each is for. Which of them are published and under what names. Whether anything is built before it ships and what that produces. What a user runs, and what runs it. Where tests and their fixtures live. The minimum runtime version and what forces it. What happens to a dependency the program must modify.

It does not cover the files inside a package, which is the module list, nor what any part does, which is the control flow and the interfaces.

## What to check before proposing

- Read the repository's workspace and manifest files, and how its existing packages are split, built and published.
- Find what depends on each package from outside it, since a package exists because something outside it depends on it separately.
- Check the standards for how packages are named, built and tested, and the wiki entries for the runtime and the package manager.

## Representation

A file tree in a fenced block, annotated, then a paragraph per package saying what it is for and what depends on it. The tree is not drawn in mermaid, because the annotations beside each entry are half the content.

```
<repository>/
├── <manifest>                   what the whole workspace runs
├── <workspace file>
└── packages/
    ├── <tool>/
    │   ├── <manifest>           what a user invokes
    │   ├── src/
    │   └── tests/
    └── <shared>/
        ├── <manifest>
        ├── src/                 what more than one package needs
        └── tests/
```

The prose does not restate the tree. It says why each package is separate, what it exposes to the others, and what the tree cannot show: what is published, what is built, what runs it, which runtime version it needs and why.

## When it fits

The first part of a package branch: a change that creates a package, splits one or changes how one is built or shipped. It comes before the control flow, because what a part may import depends on which package it lives in.
