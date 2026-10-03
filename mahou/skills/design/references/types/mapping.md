# Mapping

A branch about how the constructs of one source map to what a value carries: which source construct becomes which part of the value, in what form, and what is left out. The rules read as a table from source to result. When the value also needs its own keys and types, those are a schema.

## What it covers

Every construct of the source the definition names, the part of the value each one becomes, and the form it takes there. The constructs that produce nothing, and the ones whose treatment is deferred. Where one construct nested inside another changes what the outer one becomes.

It does not cover the code that performs the conversion, that is program design. It does not cover the keys and types of the value, that is a schema.

## What it needs to question

- The constructs the source carries and which of them the definition names. A construct the definition does not name is a hypothetical.
- For each construct, the part of the value it becomes and its exact form there.
- Constructs nested inside others, and whether the nesting changes the outer result.
- The constructs left out on purpose, and the ones kept in whatever form the converter produces.
- Variants of one construct that look alike but come out differently.

## Representation

A table, one row per construct: the source, what it becomes in the value, and its form. A worked example follows the table: one input that exercises the rules that interact, and the value it produces. The prose under them says what the table cannot: why a construct produces nothing, how a nested case resolves, and what the example shows that a single row does not.

| Source | Becomes | Form |
|---|---|---|
| <construct> | <part of the value> | <form> |
| <construct nested in another> | <part of the value> | <form> |
| <construct left out> | nothing | none |

```text
input    <a short source fragment that combines the rules>

result   <part 1>   <form>
         <part 2>   <form>
```
