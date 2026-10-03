# Module list

The files the branch creates, changes or deletes.

## What it covers

Every file the branch adds, changes or deletes, and why a file sits where it does when the path alone does not say it. A file the branch looks like it should touch and does not, so the user can check that claim.

It does not cover what is inside a file, which the interfaces and the other parts state, nor the order the files are written in, which belongs to the implementation.

## What to check before proposing

- Read the directories the change lands in, and where the repository already puts files of the same kind.
- Check the standards for module layout: when a set of files becomes a folder with an index, which domain folder a helper belongs to.

## Representation

Paths in a fenced block, grouped by directory, each marked `new`, `touched` or `deleted`, with the reason on the same line when the path alone does not say it.

```
<feature>/components/NewComponent/
├── NewComponent.<ext>                   new
├── NewChildComponent.<ext>              new
└── index.<ext>                          new, exports the component only
<feature>/components/ParentComponent.<ext>           touched
<shared>/<domain>/sharedRule.<ext>       new
<manifest>                               touched   new dependency
```

The same form on a service:

```
<app>/schemas/thing.<ext>                touched   new field on two schemas
<app>/endpoints/thing.<ext>              touched   one more filter on the list endpoint
<app>/services/thing.<ext>               touched   new branch in the resolver
<app>/repositories/thing.<ext>           unchanged, the filter already flows through
<tests>/endpoints/thing_list.<ext>       touched
```

Under the list, the placement decisions and only those: why a set of files became a folder with an index instead of siblings, why a helper sits in one domain folder rather than another. Each one cites the standard it follows when a standard covers it.

Every path traces to something a part above names, and everything a part names has a path here. That check is what says the branch is complete.

## When it fits

Under every branch that adds, changes or deletes files. It renders together with the interfaces.
