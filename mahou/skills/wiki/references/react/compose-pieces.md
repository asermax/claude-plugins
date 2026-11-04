# Compose pieces instead of branching on the caller

verified: 2026-11-04

Answers what to do when a second caller needs a component, a provider or a hook to behave differently from how the first caller uses it.

## Knowledge

- Do not change the component, provider or hook to branch on which caller it serves, whether through a mode prop, a flag, or an optional argument that only one caller passes.
- Split what it does into pieces that each do one job, such as a hook per side effect, a mutation hook per request and the view as its own component. Export them, and let each caller compose the pieces it needs.
- The first caller uses the same pieces, so no caller duplicates code, and no piece checks which caller is calling it.

```tsx
// Avoid: one dialog that branches on the caller.
// "update" skips the upload and sends a PATCH, "create" uploads and sends a POST.
<ResourceDialog resource={resource} mode={resourceId == null ? "create" : "update"} />

// Prefer: pieces each caller composes.
const upload = useResourceUpload(); // { start, wait }
const createResourceMutation = useCreateResource({ waitForUpload: upload.wait });
const updateResourceMutation = useUpdateResource();

// The first caller uploads, then creates.
<ResourceForm
  sendStatus={createResourceMutation.status}
  onSend={(values) => createResourceMutation.mutate(values)}
/>

// The second caller updates what it already created, with no upload.
<ResourceForm
  sendStatus={updateResourceMutation.status}
  onSend={(values) => updateResourceMutation.mutate({ resourceId, ...values })}
/>
```

## Sources

- A frontend components guide's rule on composing pieces, 2026-11-02.
