# Callstack

The path one request takes through the parts of a program: which part receives it, which parts it calls in turn, which condition decides between paths, and where a value the change touches enters, is read and lands.

## What it covers

The entry the request comes in through and what it is given. Each call from one part to the next, nested under its caller. The conditions that split the calls into paths, stated in words. On each path, the values the change adds, reads or passes on, and the call where each one is assembled. Other entries that reach the same parts, and what each passes.

It does not cover how a part reaches its result inside its own body, which is a derivation ledger or prose, nor the full shape of what crosses between parts, which is the interfaces.

## What to check before proposing

- Read the entry point and follow its calls down to the last one the change touches, in the code as it stands.
- Find every other caller of the parts the change touches, and what each one passes.
- Find where each value the change touches is assembled from several fields, and whether every path includes it.
- Check the standards for how the layers call each other, so the proposed path follows them.

## Representation

A plain text tree in a fenced block, from the entry down to the last call the branch touches. The root is the entry with what it is given on the next line. Each nested line is a part and the operation it performs, indented under its caller, with the values the change touches in parentheses. A condition that splits the calls is a line of its own, in words, with the paths under it. Where a call assembles a value, the line spells the fields inline, never through a constant.

The first column marks each line as a diff: `+` for a line the branch adds, `-` for a line it removes, a space for a line both versions have. A line the branch alters is two lines, the `-` one as it stands and the `+` one as it will be, one under the other, so the tree read without the `+` lines is the path today and without the `-` lines the path after the change. A right-hand annotation says what a line does with a value the change touches, such as reading the new field or leaving it out; a line that does nothing with one carries none. Each line naming a part that exists ends with its reference, as `basics` writes one; a part the branch creates has none, because it has no code yet. The tree is not drawn in mermaid, because the diff column and the annotations are half the content and mermaid has no form that can show them.

```
 <entry, with what it is given>                                          [[<path>#<entry>]]
-given {<field>, <field>}
+given {<field>, <field>, <new field>?}
 │
-└─ <part>.<operation>()                                                 [[<path>#<part>.<operation>]]
+└─ <part>.<operation>(<new field>)            ← reads the new field     [[<path>#<part>.<operation>]]
    ├─ <store>.<read>                                                    [[<path>#<store>.<read>]]
    │
    ├─ when <condition>
    │  └─ <part>.<other operation>                                       [[<path>#<part>.<other operation>]]
    │     └─ value = { a, b, c }               new field never included
    │     └─ <store>.<write>(value)                                      [[<path>#<store>.<write>]]
    │
    └─ otherwise
-      └─ value = { a, b }
+      └─ value = { a, b, new field }
+      └─ <part>.<new check>(value)
       └─ <store>.<write>(value)                                         [[<path>#<store>.<write>]]
```

The prose under the tree names the other entries that reach the same parts and what each passes, in words. Then it states the rule the tree implements, once, and what each path ends up carrying. It does not restate the tree.

## When it fits

When the decision is where a value enters, which path it takes and where it lands, inside one request that crosses layers. When several paths assemble the same thing and the change has to reach all of them. A change confined to one part with no callers to show needs no callstack; the prose carries it alone. A change to the order of steps or to what ends a run is a control flow.
