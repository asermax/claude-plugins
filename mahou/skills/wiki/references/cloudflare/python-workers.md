# Python Workers: packages, limits and status

verified: 2026-10-04

Answers whether a Python web app, such as a FastAPI service, can run as a Cloudflare Python Worker, which packages it can use, and the limits that bind it. Distilled from documentation and the Pyodide package list while weighing a move of a Python API onto Cloudflare; nothing was run.

## Knowledge

- FastAPI runs through a built-in ASGI connector (`workers.asgi`). ASGI and WSGI support landed 2026-09-02, and Python 3.14 on Pyodide 314.x is the default for compatibility dates from 2026-09-08. Whether an older compatibility date still pins an older Python is undocumented.
- Cloudflare's own pages disagree on the status. A GA announcement is dated 2026-09-21, while a docs page still says beta behind the `python_workers` flag, with `pywrangler` for setup and deploys.
- Packages are pure-Python wheels, PyEmscripten wheels and what Pyodide bundles. Pyodide 314.0.7 ships Pillow, httpx, SQLAlchemy, pydantic, aiohttp, asyncpg and cffi. It does not ship cairosvg (which needs native libcairo), grpcio, boto3, botocore, greenlet, markdown-it-py or google-genai; a pure wheel may still install, but nothing confirms it.
- Nothing built on gRPC runs, so a Python client that talks gRPC, such as Modal's, cannot run there. Pyodide routes HTTP clients through JS `fetch`.
- Limits are the Workers ones: 128 MB memory per isolate including WASM, a 64 MiB uncompressed bundle (changed 2026-09-04), CPU 30 s by default and up to 5 min on Paid, `waitUntil` up to 30 s after the response, 15 min of wall time for queue consumers and cron triggers.
- Cold start uses a memory snapshot taken at deploy; one third-party measurement put it near 1 s.
- Bindings to D1, R2, KV, Durable Objects, Queues, Workflows, Workers AI and service bindings are available from Python. Async SQLAlchemy through a D1 driver is not (see `d1`).

## Sources

- https://developers.cloudflare.com/workers/languages/python/
- https://developers.cloudflare.com/workers/languages/python/packages/fastapi/
- https://developers.cloudflare.com/workers/platform/limits/
- https://pyodide.org/en/stable/usage/packages-in-pyodide.html
- https://blog.cloudflare.com/python-workers-ga
