# Callstack

A branch about the path one request takes through the parts of a program: which part receives it, which parts it calls in turn, which condition decides between paths, and where a value the change touches enters, is read and lands. It follows the branch that names the parts. The control flow says in what order the steps happen and what ends the run; the callstack says which part calls which, and what each call carries.

## What it covers

The entry the request comes in through and what it is given. Each call from one part to the next, nested under its caller. The conditions that split the calls into paths, stated in words. On each path, the values the change adds, reads or passes on, and the call where each one is assembled. Other entries that reach the same parts, and what each passes.

It does not cover how a part reaches its result inside its own body, which is a rules branch, nor the full shape of what crosses between parts, which is a contract. Parameter lists beyond the values the change touches, and function bodies, are left to the code.

## What it needs to question

- Where the request enters and what it carries on arrival.
- Which part handles it first and which parts it calls, in nesting order.
- The conditions that pick one path over another, and whether each path needs the change.
- For each value the change touches: where it enters, which calls pass it on, where it is read, and where it lands.
- Where a call assembles a value from several fields, which fields it includes, and whether the new value is among them on every path.
- Other entries that reach the same parts, and whether the change reaches them as well.

## Representation

A plain text tree in a fenced block, from the entry down to the last call the branch touches. The root is the entry with what it is given on the next line. Each nested line is a part and the operation it performs, indented under its caller, with the values the change touches in parentheses. A condition that splits the calls is a line of its own, in words, with the paths under it. Where a call assembles a value, the line spells the fields inline. A right-hand annotation on each line says what the branch does to it: a value added, a value read, or unchanged. The tree is not drawn in mermaid, because the annotations are half the content and mermaid has no form that can show them.

```
<entry, with what it is given>
given {<field>, <field>, <new field>?}                          ← new field added
│
└─ <part>.<operation>(<new field>)                              ← reads the new field
   ├─ <store>.<read>                                            unchanged
   │
   ├─ <condition that selects the first path>
   │  └─ <part>.<other operation>                               unchanged
   │     └─ value = { a, b, c }                                 new field never included
   │     └─ <store>.<write>(value)                              unchanged
   │
   └─ otherwise
      └─ value = { a, b, new field }
      └─ <store>.<write>(value)                                 unchanged
```

The prose under the tree names the other entries that reach the same parts and what each passes, in words. Then it states the rule the tree implements, once, and what each path ends up carrying. It does not restate the tree.

Use it when the decision is where a value enters, which path it takes and where it lands, or when several paths assemble the same thing and the change has to reach all of them. A change confined to one part with no callers to show needs no callstack; the prose carries it alone.
