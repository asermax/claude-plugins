# Flue on Cloudflare: agents as functions, dispatch from Workflows, and the DOM dependency

verified: 2026-09-13

Answers what Flue gives an agent step running inside a Cloudflare Worker, how a Workflow calls an agent and survives crashes, and which JavaScript libraries fail on the Workers runtime. Distilled while designing an extraction service whose agent loops run through Flue.

## Knowledge

- An agent is a plain function with the `'use agent'` directive; the function's return value is the system prompt. Hooks attach capabilities inside the body (`useModel`, `useTool`, `useSandbox`, `useSkill`, `useSubagent`, `usePersistentState`). The function name is the durable identity and becomes a generated Durable Object class (`Translator` becomes `FlueTranslatorAgent`); conversations persist by a caller-chosen id, so one conversation per key is one durable agent.
- Calling an agent from a Workflow step is documented as a first-class shape: a `dispatch` step checkpoints the `DispatchReceipt`, a separate `read` step awaits the settled reply, and both survive crashes because the receipt and reply each become durable step results. A receipt persisted across a crash is all a retry needs; `read()` re-attaches from any process.
- `dispatch` resolves at durable admission and does not wait for the model. `init(agent, { id })` plus `handle.dispatch()` and `handle.read(receipt)` awaits settlement and returns the reply. An unconditional re-send coalesces (both receipts read the same reply); a `uid: null` create-only send rejects the duplicate instead.
- Flue's durability defaults per agent are `maxAttempts: 10` and `timeoutMs: 1 h`, and deliveries to one conversation never run concurrently: inputs are processed in accepted order, so a busy conversation queues rather than races.
- The Workers runtime is not Node. Turndown fails with `document is not defined` on Workers without a DOM (open issue, no resolution recorded), and no first-party statement says cheerio runs there either; ecosystem evidence says the cheerio family works but uses a lot of CPU. A bundled DOM shim (linkedom, happy-dom) is the workaround, within the 3 MB free / 10 MB paid script budget. `nodejs_compat` is on by default from compatibility date 2026-08-04. Run a trial before relying on DOM-heavy libraries in Workers.

## Sources

- Flue workflows guide (updated 2026-07-21): https://flueframework.com/docs/guide/workflows/
- Flue agent API (updated 2026-07-23): https://flueframework.com/docs/reference/agent-api/
- Flue deploy guide, Cloudflare (updated 2026-07-21): https://flueframework.com/docs/ecosystem/deploy/cloudflare/
- Cloudflare announcement, Flue on the Agents SDK (2026-06-17): https://blog.cloudflare.com/agents-platform-flue-sdk/
- Turndown on Workers, open issue: https://github.com/mixmark-io/turndown/issues/469
- Cloudflare Node compatibility: https://developers.cloudflare.com/workers/runtime-apis/nodejs/
