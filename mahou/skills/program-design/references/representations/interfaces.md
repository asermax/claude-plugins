# Interfaces

What crosses between the parts the branch adds or changes: component props, function inputs and outputs, request and response bodies, event payloads. Each one is written as a JSON Schema, so the shape is stated without the language's own syntax.

## What it covers

Per part, what it receives and what it hands back, the type of each member, which members are required, and what each one answers. For a declaration that already exists, only the members it gains, changes or loses.

It does not cover how a part computes its output, which is a derivation ledger or prose, nor stored fields, which are the class diagram, nor the file a declaration lives in, which is the module list.

## What to check before proposing

- Read the declarations the branch touches as they stand, and the ones the repository already has for similar parts, so a new one follows them.
- Read the callers of a part whose interface changes, since each one has to keep working or change with it.
- Check the standards for naming, typing and validation at the boundary, such as what a payload rejects.

## Representation

One JSON Schema per part, in a fenced `json` block. The `title` names the part and the operation; the `description` says what the part answers. A function or an endpoint is an object with an `input` and an `output` property. Props, payloads and events are the object itself. Each member carries a `description` saying what it answers, and `required` lists what the caller must pass. An enumeration is an `enum`; a shape used in more than one place is a `$defs` entry referenced with `$ref`. An existing declaration carries a `$comment` saying it exists, and lists only the members the branch adds, changes or removes, each with a `$comment` saying which.

```json
{
  "title": "<Part>.<operation>",
  "description": "What the operation answers.",
  "type": "object",
  "properties": {
    "input": {
      "type": "object",
      "properties": {
        "<id>": { "type": "string", "description": "The record the operation reads." },
        "<new field>": { "type": "integer", "minimum": 0, "description": "What the new value answers." }
      },
      "required": ["<id>"]
    },
    "output": { "$ref": "#/$defs/<Result>" }
  },
  "$defs": {
    "<Result>": {
      "type": "object",
      "properties": {
        "state": { "enum": ["match", "mismatch"], "description": "Whether the two sides agree." },
        "rows": { "type": "array", "items": { "$ref": "#/$defs/<Row>" } }
      },
      "required": ["state", "rows"]
    },
    "<Row>": {
      "type": "object",
      "properties": {
        "label": { "type": "string" },
        "difference": { "type": "number", "description": "Planned minus actual." }
      },
      "required": ["label", "difference"]
    }
  }
}
```

An existing payload gaining a member:

```json
{
  "title": "<Payload>",
  "$comment": "exists",
  "type": "object",
  "properties": {
    "<new field>": { "type": ["string", "null"], "$comment": "added", "description": "What the new value answers. Absent keeps the current value; null clears it." }
  }
}
```

The prose under the schemas says what the schemas cannot: which callers change with a part, and what the boundary does with an absent member, a present value and an explicit null when that differs between paths.

## When it fits

Under every branch that adds or changes what crosses between parts. It renders together with the module list, since a declaration and its file settle together.
