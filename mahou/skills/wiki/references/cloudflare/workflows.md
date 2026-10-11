# Cloudflare Workflows: spawn-and-resolve and its limits

verified: 2026-10-10

Answers how to run a long job on Cloudflare Workflows from another service in a spawn-and-resolve shape, what the hard limits are, which creation semantics are safe to retry, and how running instances behave across deploys. Distilled from a documentation survey and from spikes that ran Workflows on a Workers Paid account.

## Knowledge

- Instances get caller-chosen ids: `env.WORKFLOW.create({ id, params })`, ids up to 100 chars matching `^[a-zA-Z0-9_][a-zA-Z0-9-_]*$` (REST also reserves `cf_` + 64 hex). Mapping instances to your own identifiers is a documented use, and `params` is any JSON value.
- `create()` is not idempotent: it throws when the id exists within the retention window (3 days free, 30 paid, configurable per instance). `createBatch()` is idempotent and skips existing ids. Create-or-resume is two operations: create, catch the exists error, then `get(id)`; `get()` throws for an unknown id, so an id that does not resolve yet can mean queued-behind-something rather than absent. The duplicate-id error wording differs between local and deployed; only the substring `already_exists` is common to both.
- The finished `run()` return value is fetchable as the instance's `output` through `instance.status()` from a Worker route, or through the REST GET-instance endpoint. The status set is queued, running, paused, errored, terminated, complete, waiting, waitingForPause, unknown.
- `instance.status()` from the binding returns only `status`, `error` (`name`, `message`), `output` and `rollback`; it does not name the step that failed. The REST GET-instance endpoint lists every step with its name, success, output and attempts, each attempt with its error. `status()` does not tell a parked `waitForEvent` waiter from a running one: observed as `running` in most cases and `waiting` in some.
- Wall clock per instance is unlimited, and there is no instance-level deadline: create options are only `id`, `params` and `retention`, and the docs say an instance "can run forever". Bound a job's time with a timeout per step, or by calling `instance.terminate()` from outside (optionally `{ rollback: true }`). The binding constraint is CPU per step invocation: 10 ms on the free plan, 30 s default and configurable to 5 minutes via `limits.cpu_ms`. Waiting on network I/O does not burn CPU, so a job of many slow model calls fits; a single heavy parse must fit the CPU budget.
- Payloads: params, events and non-stream step results are each documented as capped at 1 MiB, and the docs say a step exceeding it fails. A spike returned a 2.6 MB JSON value from a step and it succeeded; the spike did not find the cause, so do not rely on either the cap or its absence. Since 2026-03-26 a JS step can return a `ReadableStream<Uint8Array>` (chunks under 16 MB), which the cap does not count. A step can also pass a `fetch` response body straight to `R2.put` and return only a small summary.
- Steps run once durably via `step.do`; the return value is persisted and replayed on resume instead of re-executing. A repeated step name replays the cached result, so a step inside a loop needs a counter in its name (`poll 7`). Branching is plain JS control flow inside `run()`.
- Retries: a step with no retry config is retried 5 times, starting at 10 s with exponential backoff, with a 10-minute timeout per attempt. The retry limit goes up to 10,000; the docs advise keeping a step timeout at 30 minutes or less and using `waitForEvent` for longer waits. `NonRetryableError` stops retrying. `step.sleep` waits up to 365 days; `step.waitForEvent` defaults to a 24 h timeout. The Workflow keeps an event sent before the waiter is listening.
- Recovery: `instance.restart({ from: { name: "<step>" } })` on an errored instance re-runs from that step and keeps earlier results. Rollback handlers on a step run on failure and on `terminate({ rollback: true })`; a plain `terminate()` runs no code in the instance.
- Deploys: a deploy fails every step executing at that moment (`WorkflowInternalError`) and runs the body again even if it had finished, so step bodies must be idempotent; the failed attempt counts against the step's retry limit. Workflows sometimes records the failure only when the step's timeout fires, and twice a `waitForEvent` across a deploy resolved exactly 5 minutes late. Sleeping instances wake on the new code and keep the results of steps already run; a step added before the sleep point runs on wake, and a renamed sleep step sleeps again. An instance created within seconds of a deploy can start on the old code.
- Cross-script binding: a Worker in another script binds the Workflow with `script_name`. That Worker deploys even when the target script does not exist, and wrangler gives no warning; its calls throw `workflow.not_found` until the target deploys, then work within about 3 s with no redeploy. Locally, see `local-dev`.
- Concurrency: instances with different ids run concurrently; sleeping or event-waiting instances do not count toward the running cap (50,000 paid, 100 free), so millions can wait at once. Creates are rate-limited per account (300/s paid).
- Conflicting limits exist across Cloudflare's own docs: the Agents SDK page says 10 MB state per workflow and 30 minutes per step; the Workflows reference says 100 MB to 1 GB per instance and unlimited step wall clock. The Workflows reference matches observed behavior reports; treat the Agents SDK table as stale.
- A Workflow class is written in TypeScript or JavaScript (GA since 2025-04-07) or Python (open beta since 2025-08-22, no later GA entry). Python has the same step API in decorator form (`@step.do`, `step.sleep`, `step.wait_for_event`). Rust cannot define one: workers-rs has no `WorkflowEntrypoint`. Whether stream returns and the CPU setting work from Python is undocumented.
- A step is ordinary Worker code, so it reaches code in other languages through what it can call: a service binding to another Worker, a Container through its Durable Object, or plain HTTP. Whether a `script_name` binding works across languages is undocumented.
- Steps per instance: 10,000 by default on Paid, configurable to 25,000 (1,024 on Free); `step.sleep` does not count as a step. A sleep-and-poll loop at 5 s used about 31 steps per 3 minutes of waiting. State per instance is up to 1 GB on Paid.
- Testing: see `vitest-plugin`.

## Sources

- Workers API (updated 2026-08-12): https://developers.cloudflare.com/workflows/build/workers-api/
- Limits (updated 2026-09-21): https://developers.cloudflare.com/workflows/reference/limits/
- Rules of Workflows: https://developers.cloudflare.com/workflows/build/rules-of-workflows/
- Trigger Workflows (updated 2026-07-13): https://developers.cloudflare.com/workflows/build/trigger-workflows/
- Sleeping and retrying (updated 2026-07-09): https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/
- Changelog: https://developers.cloudflare.com/workflows/reference/changelog/
- REST instances create/get: https://developers.cloudflare.com/api/resources/workflows/subresources/instances/
- Python Workflows: https://developers.cloudflare.com/workflows/python/
- workers-rs Workflows issue: https://github.com/cloudflare/workers-rs/issues/663
- Spikes on a Workers Paid account, 2026-10-04: a flattened item Workflow with sleep-and-poll, retries, a per-key lease and deploys mid-run; a Workflow bound across two scripts
