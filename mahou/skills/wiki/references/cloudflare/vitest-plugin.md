# Testing Workers and Workflows with the vitest plugin

verified: 2026-11-22

Answers how Cloudflare's vitest integration tests Workflows and outbound HTTP, what replaced its removed fetch mock, and which approach replays recorded HTTP. Distilled from the plugin's type declarations, changelog and examples, the docs, and a spike that ran every approach on plugin 1.1.13 and 1.3.6 under vitest 4.1.

## Knowledge

- `@cloudflare/vitest-plugin` is the renamed `@cloudflare/vitest-pool-workers` (renamed in 1.0.0; the old name stopped at 0.22.0). Tests run inside workerd with the project's wrangler bindings.
- Workflow introspection is documented and supported. `introspectWorkflowInstance(binding, id)` gives `waitForStepResult`, `waitForStatus`, the output and error, and `modify(fn)` with `disableSleeps`, `disableRetryDelays`, `mockStepResult`, `mockStepError`, `forceStepTimeout` and `mockEvent`. `introspectWorkflow(binding)` applies the same `modify` to every instance created afterwards, for ids the test does not control. Both support `await using`.
- `modify` works on whole steps. A mocked step never runs its callback, so the HTTP calls and the binding writes inside it never happen; steps that are not mocked run their real code, `fetch` included. `modify` needs a Workflow binding. A Workflow taken from `ctx.exports` raises an error that explains how to add the binding.
- Introspection gotchas: a falsy mocked result (`null`, `false`, `0`, `""`) is ignored and the real step body runs; `mockStepError` must come before `mockStepResult` on the same step; `getError()` drops a `NonRetryableError`'s message. Only introspection skips sleeps and retry delays; an undisabled 30 s sleep takes 30 s.
- `fetchMock` from `cloudflare:test` was removed in 0.13.0 and the `miniflare.fetchMock` option in 0.20.0. The changelog points to mocking `globalThis.fetch` or MSW ("recommended"), and the examples include an MSW fixture set up through `setupFiles`. The prose docs mention neither.
- MSW intercepts a `fetch` made inside a Workflow step, because the Workflow's `run()` executes in the test file's isolate. That is also why a global the test sets is visible to the Workflow. msw 2.15 works as is; msw 3's `msw/node` does not start in workerd (it cannot read `llhttp.wasm`) and works only through the experimental `defineNetwork` with the fetch interceptor.
- Miniflare's `outboundService`, set in the vitest config's miniflare options, replaces all of a Worker's outbound requests with one handler, which can read recorded responses from disk in Node. Nothing reaches the network unless the handler forwards it. Introspection, MSW without a catch-all, and a code seam all let unmatched requests reach the real network.
- Only HTTP interception (MSW or `outboundService`) runs the real step bodies, including the client's request building and response parsing and the step's binding writes, while replaying recorded responses.
- Replaying vcrpy (Python) cassettes needs translation: strip `content-encoding` and `content-length` from recorded responses (otherwise "Decompression failed"), rewrite URLs that changed (such as a provider now reached through a gateway), and compare bodies as JSON rather than bytes. Matching on URL alone serves the wrong recorded response when several share a URL.
- Code-level seams, such as a global symbol the code reads for a test double, are not a documented Workflow-testing method; they put the test hook in production code paths, and the double replaces the client code, so the client's serialization never runs.
- Outside the vitest plugin, Alchemy's local runtime (2.0.0-beta.85) has no hook to intercept a Worker's outbound `fetch`, so the interception options above do not exist there. Redirecting a fixed HTTPS URL to a local server through `/etc/hosts`, port 443 and a certificate trusted with `NODE_EXTRA_CA_CERTS` works, but writing `/etc/hosts` and binding 443 need root, so it fails for a normal user and in unprivileged CI. Reading the upstream URL from config, with the real URL as the default, lets a test point the Worker at a plain HTTP server on a random port (listen on port 0, read the assigned port). Start that server before the stage deploys and set the variable before the deploy. Read the config in the Worker's init and pass the value into the code that fetches: a `Config` read inside a layer built at request time did not see the variable, and the Worker called the real URL.

## Sources

- https://developers.cloudflare.com/workers/testing/vitest-integration/test-apis/
- https://developers.cloudflare.com/workflows/build/test-workflows/
- https://github.com/cloudflare/workers-sdk (vitest-plugin CHANGELOG, `fixtures/vitest-plugin-examples/request-mocking`, `fixtures/vitest-plugin-examples/workflows`)
- Alchemy test stage, 2026-11-22: a cron Worker fetching a fixed HTTPS rates URL, first intercepted through /etc/hosts and port 443 (EACCES as a normal user), then through a configurable URL and a local HTTP server.
- Spike, 2026-10-04: introspection, MSW, `outboundService` and a global seam raced on one Workflow, replaying recorded Firecrawl and Gemini responses
