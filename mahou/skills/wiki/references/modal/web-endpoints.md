# Calling a Modal function without the Python client

verified: 2026-10-10

Answers how code that cannot run Modal's Python client, such as a Worker or any non-Python service, starts a Modal function and collects its result. Distilled from Modal's documentation and from a spike that called a GPU function from a Cloudflare Workflow over web endpoints.

## Knowledge

- Modal's Python client talks gRPC, so it only runs where CPython and grpcio do. Modal has no public REST API to spawn a function and poll a call by id.
- The documented route is a web endpoint the app defines itself (`@modal.fastapi_endpoint`, `@modal.asgi_app` and similar). The job-queue pattern uses two endpoints: `POST /submit` calls `fn.spawn.aio(data)` and returns `{"call_id": call.object_id}`; `GET /result/{call_id}` calls `modal.FunctionCall.from_id(call_id).get.aio(timeout=0)` and answers 202 while the call runs and 404 on `OutputExpiredError`. Results expire after 7 days.
- Protection: Modal proxy auth (`requires_proxy_auth=True`, headers `Modal-Key` and `Modal-Secret`) rejects a request at Modal's edge, before any container starts. Proxy auth tokens can only be created in the Modal dashboard (Settings, Proxy Auth Tokens); no CLI or API creates them. A shared key the app checks itself also works, but the web container has to start before it can reject a request.
- The web endpoint's container cold-starts separately from the function it spawns, adding 4–6 s to the first submit or poll after idle.
- `spawn()` takes only the function's arguments: there is no idempotency key, no caller-chosen call id, and `FunctionCall` has no lookup by a caller key. The app has to deduplicate repeated submits itself.
- Modal stores a result as one blob, so an endpoint that returns only part of it still loads all of it. Whatever the function returns, such as base64-encoded audio, comes back in that JSON body; a function can instead upload its output to a URL the caller passes, such as a presigned PUT URL, and return only metadata.
- A function that fails deterministically makes `/result` answer 500 on every poll; a caller that treats every 500 as transient keeps retrying a call that will never succeed.

## Sources

- https://modal.com/docs/guide/webhooks
- https://modal.com/docs/guide/job-queue
- https://modal.com/docs/sdk/py/latest/Function
- https://modal.com/docs/sdk/py/latest/FunctionCall
- Spikes, 2026-10-04 and 2026-10-10: a Cloudflare Workflow submitting and polling a GPU function over both protection mechanisms; a Modal function uploading 12–110 MB files to a presigned PUT URL
