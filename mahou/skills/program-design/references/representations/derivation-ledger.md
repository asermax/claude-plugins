# Derivation ledger

Every named value the branch involves, grouped under the part that owns it, in the order the values derive.

## What it covers

Where each value comes from, what it derives from, and which part owns it, across more than one owner. The rules a value goes through on its way, named by the function that applies them.

It does not cover the shape of the values, which is the interfaces, nor the order of a run's steps, which is a control flow.

## What to check before proposing

- Read where each value comes from today: the request, the store, the upstream service, the configuration, the props.
- Find the functions the repository already has for the rules the change needs, so a line reuses one rather than inventing it.
- Check the standards for where state lives on that layer, such as what a screen keeps locally and what it reads from the server.
- Read what the wiki and the project's rules say about extracting variables and logic. By default the ledger names no value used once only to feed a condition and no helper used in one place.

## Representation

A flat list in a fenced block, one value per line, grouped under the component, service or module that owns it. The left of a line is the name, `:=` and the expression that produces it, written as a call or an access, never as code. When the reader needs something the expression leaves out, such as a rule applied twice or a unit conversion, write it in a comment on the line.

Put one of these tags on the right of each line:

| Kind of line | Tags |
|---|---|
| What the part receives | `prop`, `arg` for a hook's or a function's argument, `request` for a service's request |
| Configuration | `query meta`, `env` for a build variable, `config` for a service's settings |
| Shared state from above | `context`, `cookie` |
| A value read from outside the part | `server`, `browser`, `upstream`, `database` |
| A value the part holds | `local` for state the part owns or an instance's mutable value, `form`, `constant` for a module constant |
| A function rather than a value | `function` for a helper defined inside the part, `method` for a function of a class or of an object the part returns, `effect` for a `useEffect` |
| A value derived from the lines above | `computed` |
| The last line | `returns` |

Name an `effect` line after the hook and its dependencies, such as `useEffect, [<dependency>]`, never by when the effect runs. When no tag fits a line, name a new one for its kind of source, use one tag per kind, and define the new tag the first time it appears in the ledger.

A component's group ends with a `returns` line that says what the component renders, as a tree: one element per line, `├─` and `└─` before its children, and `←` before the props the element passes, each as a name or as `<prop> ← <where its value comes from>`. A condition goes on its own line under the element it shows or hides. Never write it as code, JSX or prose.

```
ParentComponent                                                        touched
  remoteValue      := useRemoteThing(id)                                server
  localSelection   := Map<key, patch>                                   local
  displayedThing   := select(remoteValue, localSelection)               the two merged

ChildComponent                                                         new
  thing            := displayedThing                                    prop
  reference        := useReference(id)                                  server
  index            := reference by id -> key
  leftGrouped      := sharedRule(thing.plan, reference)
  rightGrouped     := sharedRule(sum(thing.items, by index[itemKey]), reference)
                                                  # same rule, once per side
  state            := any difference != 0 ? mismatch : match
  returns            <Panel> ← state
                     ├─ <LeftSide> ← leftGrouped
                     └─ <RightSide> ← rightGrouped
                          shown while rightGrouped is not empty
```

The same form on a service, with that layer's tags:

```
<Service>.<operation>(payload)                                         touched
  payload          := request body                                      request
  record           := <store>.get(payload.id)                           database
  quota            := <client>.fetch(record.owner_id)                   upstream
  limit            := settings.<LIMIT>                                  config
  allowance        := quota.total - record.used
  decision         := allowance >= payload.amount
```

A line uses only names defined above it, so a value can be followed from its source to the output by reading down. The same function name on two lines with different arguments is one rule applied twice. Draw the flow as a graph only when the user asks for one.

The prose under it answers what the lines cannot: which key a grouping uses, how two sides are matched, what a value present on only one side counts as. Each answer is a contract of a function the ledger calls, and it settles with the interfaces.

## When it fits

A branch whose difficulty is where values come from and how they derive, across more than one owner. It does not fit a single computation inside one function, which its interface states in one line.
