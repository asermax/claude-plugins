# Calling a Modal function without the Python client

verified: 2026-10-04

Answers how code that cannot run Modal's Python client, such as a Worker or any non-Python service, starts a Modal function and collects its result. Distilled from Modal's documentation; nothing was run.

## Knowledge

- Modal's Python client talks gRPC, so it only runs where CPython and grpcio do. Modal has no public REST API to spawn a function and poll a call by id.
- The documented route is a web endpoint the app defines itself (`@modal.fastapi_endpoint`, `@modal.asgi_app` and similar), protected with proxy auth tokens sent as key and secret headers.
- The job-queue pattern uses two endpoints: `POST /submit` calls `fn.spawn.aio(data)` and returns `{"call_id": call.object_id}`; `GET /result/{call_id}` calls `modal.FunctionCall.from_id(call_id).get.aio(timeout=0)` and answers 202 while the call runs and 404 on `OutputExpiredError`. Results expire after 7 days.
- The caller then needs only plain HTTP. Whatever the function returns, such as base64-encoded audio, comes back in that JSON body.

## Sources

- https://modal.com/docs/guide/webhooks
- https://modal.com/docs/guide/job-queue
