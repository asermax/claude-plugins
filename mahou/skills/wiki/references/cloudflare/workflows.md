# Cloudflare Workflows: spawn-and-resolve and its limits

verified: 2026-09-13

Answers how to run a long job on Cloudflare Workflows from another service in a spawn-and-resolve shape, what the hard limits are, and which creation semantics are safe to retry. Distilled from a survey run while designing an extraction service against Cloudflare Workflows.

## Knowledge

- Instances get caller-chosen ids: `env.WORKFLOW.create({ id, params })`, ids up to 100 chars matching `^[a-zA-Z0-9_][a-zA-Z0-9-_]*$` (REST also reserves `cf_` + 64 hex). Mapping instances to your own identifiers is a documented use, and `params` is any JSON value.
- `create()` is not idempotent: it throws when the id exists within the retention window (3 days free, 30 paid, configurable per instance). `createBatch()` is idempotent and skips existing ids. Create-or-resume is two operations: create, catch the exists error, then `get(id)`; `get()` throws for an unknown id, so an id that does not resolve yet can mean queued-behind-something rather than absent.
- The finished `run()` return value is fetchable as the instance's `output` through `instance.status()` from a Worker route, or through the REST GET-instance endpoint, which also returns a per-step array with attempts and timings. The status set is queued, running, paused, errored, terminated, complete, waiting, waitingForPause, unknown.
- Wall clock per instance is unlimited. The binding constraint is CPU per step invocation: 10 ms on the free plan, 30 s default and configurable to 5 minutes via `limits.cpu_ms`. Waiting on network I/O does not burn CPU, so a job of many slow model calls fits; a single heavy parse must fit the CPU budget.
- Payloads: params, events and non-stream step results are each capped at 1 MiB. Larger artifacts go to external storage (R2) with a reference passed instead. Whether `run()`'s final output shares the 1 MiB cap is undocumented.
- Steps run once durably via `step.do`; the return value is persisted and replayed on resume instead of re-executing. Branching is plain JS control flow inside `run()`. Steps support per-step retries (limit up to 10,000, fixed or backoff delay) and a per-attempt timeout; `NonRetryableError` stops retrying; `step.sleep` waits up to 365 days; `step.waitForEvent` waits from 1 second to 365 days.
- Concurrency: instances with different ids run concurrently; sleeping or event-waiting instances do not count toward the running cap (50,000 paid, 100 free), so millions can wait at once. Creates are rate-limited per account (300/s paid).
- Conflicting limits exist across Cloudflare's own docs: the Agents SDK page says 10 MB state per workflow and 30 minutes per step; the Workflows reference says 100 MB to 1 GB per instance and unlimited step wall clock. The Workflows reference matches observed behavior reports; treat the Agents SDK table as stale.

## Sources

- Workers API (updated 2026-08-12): https://developers.cloudflare.com/workflows/build/workers-api/
- Limits (updated 2026-06-15): https://developers.cloudflare.com/workflows/reference/limits/
- Trigger Workflows (updated 2026-07-13): https://developers.cloudflare.com/workflows/build/trigger-workflows/
- Sleeping and retrying (updated 2026-07-09): https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/
- REST instances create/get: https://developers.cloudflare.com/api/resources/workflows/subresources/instances/
