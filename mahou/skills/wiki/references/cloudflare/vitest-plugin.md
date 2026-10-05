# Testing Workers and Workflows with the vitest plugin

verified: 2026-10-04

Answers how Cloudflare's vitest integration tests Workflows and outbound HTTP, and what replaced its removed fetch mock. Distilled from the plugin's type declarations, changelog and examples, and the docs; nothing was run.

## Knowledge

- `@cloudflare/vitest-plugin` is the renamed `@cloudflare/vitest-pool-workers` (renamed in 1.0.0; the old name stopped at 0.22.0). Tests run inside workerd with the project's wrangler bindings.
- Workflow introspection is documented and supported. `introspectWorkflowInstance(binding, id)` gives `waitForStepResult`, `waitForStatus`, the output and error, and `modify(fn)` with `disableSleeps`, `mockStepResult`, `mockStepError`, `forceStepTimeout` and `mockEvent`. `introspectWorkflow(binding)` applies the same `modify` to every instance created afterwards, for ids the test does not control. Both support `await using`.
- `modify` works on whole steps. A mocked step never runs its callback, so the HTTP calls inside it never happen; steps that are not mocked run their real code, `fetch` included. `modify` needs a Workflow binding. A Workflow taken from `ctx.exports` raises an error that explains how to add the binding.
- `fetchMock` from `cloudflare:test` was removed in 0.13.0 and the `miniflare.fetchMock` option in 0.20.0. The changelog points to mocking `globalThis.fetch` or MSW ("recommended"), and the examples include an MSW fixture set up through `setupFiles`. The prose docs mention neither.
- Miniflare's `outboundService` replaces a Worker's whole outbound traffic with a handler; whether the plugin accepts it as an option is unstated.
- Whether MSW or a patched `globalThis.fetch` catches a `fetch` made inside a Workflow step is undocumented. The Workflow engine runs in a Durable Object, and the examples only cover requests made from the Worker itself.
- Code-level seams, such as a global symbol the code reads for a test double, are not a documented Workflow-testing method; they put the test hook in production code paths.

## Sources

- https://developers.cloudflare.com/workers/testing/vitest-integration/test-apis/
- https://developers.cloudflare.com/workflows/build/test-workflows/
- https://github.com/cloudflare/workers-sdk (vitest-plugin CHANGELOG, `fixtures/vitest-plugin-examples/request-mocking`, `fixtures/vitest-plugin-examples/workflows`)
