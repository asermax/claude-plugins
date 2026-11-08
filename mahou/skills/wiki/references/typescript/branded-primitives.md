# Branded primitives

verified: 2026-11-08

Answers how to stop two values that share a primitive type but mean different things, such as a resource id and an owner id, from being passed for each other, and where a branded value may come from.

## Knowledge

- Brand a primitive when two arguments or fields share its type but mean different things. Brand by need, not by reflex: a plain `number` stays plain while nothing else of type `number` can be passed in its place.
- The brand is an intersection with a readonly marker field: `string & { readonly __brand: "ResourceId" }`. A repository that already brands keeps its existing shape.
- A branded value comes only from a type guard that checks the claim (`input is ResourceId`) or a parse function built on it. Never from `as`.
- The parse runs once, where the value enters the system. Code that receives the branded type trusts it and does not check again.

```ts
type ResourceId = string & { readonly __brand: "ResourceId" };

const isResourceId = (input: string): input is ResourceId => UUID_PATTERN.test(input);

const parseResourceId = (input: string): ResourceId => {
  if (!isResourceId(input)) {
    throw new Error(`Invalid resource id: ${input}`);
  }

  return input;
};

const archiveResource = (resourceId: ResourceId): Promise<void> => { /* trusts the id */ };
```

## Sources

- pstack `typescript-best-practices` and `principle-type-system-discipline` (github.com/cursor/plugins), 2026-11-08.
