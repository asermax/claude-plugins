# Standards

The conventions that govern the implementation of one root, and what each one governs in it.

## What it covers

Every source of conventions the root's settled branches touch: the wiki entries for the technologies involved, the project's `CLAUDE.md`, `.mahou/basics.md` and any rule file the repository keeps. Each source is listed with the piece of the change it constrains. A source the change does not touch is not listed.

## What to check before proposing

- Derive the list from the branches settled under the root.
- Read each source named before writing its line.

## Representation

One line per source, named by its path or wiki entry, followed by what it governs in this root, stated in terms of the root's settled branches: the declaration, the refactor, the emission, the gate. A reader can go from a source to the piece of the change it constrains and back.

```
- wiki `<topic>/<entry>`: the payload validation at the endpoint
- `CLAUDE.md`, "Testing": where the new tests live and how they are named
- `.mahou/basics.md`: the error format the new endpoint returns
```

## When it fits

Once per root, always, after every other branch. A root closes only when this list exists.
