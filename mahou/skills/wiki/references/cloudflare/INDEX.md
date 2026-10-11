# Cloudflare

- [`ai-gateway`](ai-gateway.md): calling a provider through a gateway: authentication, the cache header, no cost returned, no CLI
- [`cf-cli`](cf-cli.md): the beta `cf` CLI against wrangler for D1 migrations, deploys and CI
- [`containers`](containers.md): running an existing image behind a Durable Object, reaching bindings, sizes, sleep and cost
- [`d1`](d1.md): SQLite on Cloudflare, its limits, wrangler migrations, and why SQLAlchemy and Alembic do not drive it
- [`durable-objects`](durable-objects.md): serializing work per key with a gate object
- [`flue`](flue.md): agents as functions, dispatch from Workflows, the Vite-only build, and the DOM dependency on Workers
- [`images`](images.md): the Images binding against WebAssembly in a Worker: SVG, the 10 MP memory ceiling, fonts and pricing
- [`local-dev`](local-dev.md): running Workers that bind each other locally, shared state, local R2 over S3 and tunnels to it
- [`python-workers`](python-workers.md): running a Python web app as a Worker, the Pyodide package gaps and the limits
- [`r2`](r2.md): S3 access, presigned URLs in a browser, serving SVG safely, and pricing
- [`vitest-plugin`](vitest-plugin.md): testing Workflows with introspection and step mocks, and outbound HTTP after `fetchMock`
- [`workflows`](workflows.md): running a long job in a spawn-and-resolve shape, its limits, retries, behaviour across deploys, and the languages that can write one
