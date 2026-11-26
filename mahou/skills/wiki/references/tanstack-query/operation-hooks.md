# One hook per API operation, with the query options passed through

verified: 2026-11-26

Answers how screens reach an API through TanStack Query when several screens use the same operation: where the query key, the call and the invalidation live, and how a screen still tunes the query.

## Knowledge

- Write one hook per API operation, each in its own file, in the folder of the resource it touches: `useResources(filters)`, `useResource(id)`, `useCreateResource()`. Screens call these hooks and never call `useQuery` or `useMutation` directly.
- A query hook builds its key from a shared key factory and calls the typed API client. A mutation hook declares what it invalidates, or what it writes into the cache with `setQueryData`.
- Besides the operation's arguments, every hook takes an optional `options` with everything `useQuery` or `useMutation` accepts except `queryKey`, `queryFn` and `mutationFn`. Type `options` with the operation's result, its error union and, for a mutation, its input, such as `Omit<UseMutationOptions<Resource, ResourceError, CreateResourceInput>, 'mutationFn'>`.
- The hook writes its own settings first and spreads `options` on top, so a screen can set `enabled`, `select`, `refetchInterval` or callbacks. A screen's `onSuccess` runs after the hook's own invalidation, so it sees fresh data.
- The hook returns what `useQuery` or `useMutation` returns.
- Name the variable that holds a query hook's result after the data it reads, ending in `Query`, and the one that holds a mutation hook's result after its action, ending in `Mutation`: `const resourcesQuery = useResources(filters)`, `const createResourceMutation = useCreateResource()`. Every read then shows where the value comes from (`resourcesQuery.data`, `createResourceMutation.isPending`), and the name never clashes with the data itself.

```ts
export const useCreateResource = (options?: Omit<UseMutationOptions<Resource, ResourceError, CreateResourceInput>, 'mutationFn'>) => {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: (input) => runApi((client) => client.resources.create({ payload: input })),
    onSuccess: async (data, input, context) => {
      await queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
      await options?.onSuccess?.(data, input, context)
    },
  })
}
```

## Sources

- Program design session, 2026-10-18: the hooks of a TanStack Start web over an Effect HttpApi.
- A frontend data-fetching guide's rule on naming query and mutation results, 2026-11-20.
