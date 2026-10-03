# Derivation ledger

Every named value the branch involves, grouped under the part that owns it, in the order the values derive.

## What it covers

Where each value comes from, what it derives from, and which part owns it, across more than one owner. The rules a value goes through on its way, named by the function that applies them.

It does not cover the shape of the values, which is the interfaces, nor the order of a run's steps, which is a control flow.

## What to check before proposing

- Read where each value comes from today: the request, the store, the upstream service, the configuration, the props.
- Find the functions the repository already has for the rules the change needs, so a line reuses one rather than inventing it.
- Check the standards for where state lives on that layer, such as what a screen keeps locally and what it reads from the server.

## Representation

A flat list in a fenced block, one value per line, grouped under the component, service or module that owns it. The left of a line is the name, `:=` and the expression that produces it, written as a call or an access, never as code. The right of a line tags where the value comes from, in the vocabulary of the layer: on a screen, `server`, `form`, `local`, `prop`; in a service, `request`, `upstream`, `database`, `config`. Those are examples; a branch names provenance in whatever words its layer uses and keeps one word per kind of source. Leave the tag off a value that derives from the lines above it. Where the expression does not show something the reader needs, a rule applied twice or a unit conversion, a comment on the line says it.

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
