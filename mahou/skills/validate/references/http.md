# HTTP validation

Drives an API with `curl`, through the path real callers take. Assumes `validate` has settled how the system runs and which identity the run uses.

## Prerequisites

- **The service is up**, with its dependencies, per the project's setup.
- **Auth**, when the service needs it: the credential the user gave, in the header the service expects. Do not guess the header; read the endpoint's auth dependency in the code when the project's setup does not say. Re-issue the credential when `401` appears mid-run and it worked before.

## Traffic path

Through the gateway or proxy when the project has one, never a service's direct host. The public route may differ from the internal path; a `404` on a route that exists usually means the wrong one was hit.

## Smoke check

When the service exposes a health endpoint, hit it first. A red health check means the time goes into bringing the service up cleanly, not into more calls.

## Building the call

- The method the endpoint expects.
- The public URL for the endpoint.
- The auth header when needed.
- `Content-Type: application/json` and a JSON body when posting or patching, inline or `--data @body.json`.
- Capture status and body: `-w '%{http_code}\n' -o response.json -s`, then inspect with `jq`.
- Chain calls by pulling ids out of responses with `jq -r` when a row sequences them (create, fetch, update).

## Evidence

Every call that proves a row goes in the report artifact `validate` requires, as a five-part block: the state read before the call, the endpoint and method, the payload sent, the response status and body, and the state read after the call. Read the before and after states through the API when an endpoint exposes them, and through the database only when none does. Trim every block to the fields the row is about.

## Common pitfalls

- `401` unexpectedly: the credential expired or was regenerated.
- `404` on a route that exists: the direct path was hit instead of the public one.
- `415` or `422` on a POST: missing `Content-Type` or a malformed body.
- Passes over HTTP but breaks in the browser: the gap is usually in the gateway or the surface's auth boundary. Re-run through the public path.

## When the service misbehaves

A `5xx`, a hang, or an error the body does not explain is recorded as the row's evidence and goes to the user as a decision. This reference covers validation, not debugging.
