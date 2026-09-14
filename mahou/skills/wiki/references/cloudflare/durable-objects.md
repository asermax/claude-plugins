# Durable Objects as a per-key serialization gate

verified: 2026-09-13

Answers whether a Durable Object can serialize work per key, such as one job per domain at a time, and which of its APIs make it a lock and a queue. Distilled while designing a per-domain gate in front of Workflow creation.

## Knowledge

- A Durable Object instance is single-threaded: each object handles its events one at a time in one location, so the addressing alone gives per-key serialization. Key an instance per gate (`idFromName(key)`) and concurrent callers line up without any lock code.
- `blockConcurrencyWhile` holds other events on the object until its callback finishes, covering the check-and-create window where a gate reads its own stored state and decides.
- Storage on the object is transactional key-value (SQLite-backed classes since the `new_sqlite_classes` migration), so a busy flag plus a FIFO queue of waiting job ids is a correct gate: enqueue when busy, and when the running job reports completion, pop the queue and create the next.
- Workflows can be created from inside a Durable Object; the docs list it as a trigger location alongside Worker routes, queue consumers and scheduled handlers. A gate that is the only creator of its key's instances also settles handle semantics: an instance id that does not resolve yet is itself the queued state.
- Flue agents on Cloudflare are Durable Objects themselves (one class per `'use agent'` function, SQLite-backed required), and deliveries to one conversation never run concurrently, so a domain-keyed agent conversation is already a lock before any gate of your own.

## Sources

- In-memory state: https://developers.cloudflare.com/durable-objects/reference/in-memory-state/
- State API, `blockConcurrencyWhile`: https://developers.cloudflare.com/durable-objects/api/state/
- Trigger Workflows, creation locations (updated 2026-07-13): https://developers.cloudflare.com/workflows/build/trigger-workflows/
- Cloudflare blog, Durable Objects single-threading: https://blog.cloudflare.com/durable-objects-easy-fast-correct-choose-three/
- Flue deploy guide and Schedules (updated 2026-07-21): https://flueframework.com/docs/ecosystem/deploy/cloudflare/ , https://flueframework.com/docs/guide/schedules/
