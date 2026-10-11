# Running Workers locally together

verified: 2026-10-10

Answers how to run two Workers that bind each other locally, how they share D1, R2 and Durable Object state, what breaks when one is down or reloads, and how a service on the internet reaches local R2. Distilled from spikes on wrangler 4.149.0 and `@cloudflare/vite-plugin` 1.63.1; nothing here is from documentation unless marked.

## Knowledge

- Two Workers, one binding the other's Workflow with `script_name`, resolve the binding locally in three launch modes:
  - one process with both configs: `wrangler dev -c a/wrangler.jsonc -c b/wrangler.jsonc` (one exposed port);
  - two `wrangler dev` processes, started in either order, which find each other through the dev registry;
  - one Worker under `vite dev` with the Cloudflare plugin and the other under `wrangler dev`.
- D1, R2 and Durable Object state are shared only when every process uses the same state folder: `--persist-to <dir>` for wrangler, `persistState: { path }` in the Vite plugin. Otherwise each config directory gets its own `.wrangler/state` and the other Worker sees empty tables (`no such table`). Migrations apply locally with `wrangler d1 migrations apply <db> --local --persist-to <dir>`; `database_id` can be a placeholder.
- With multiple configs, `--env-file` reaches only the first Worker.
- Edits reload in about 5 s under `wrangler dev`, keeping Durable Object state. A Workflow instance in flight during a reload or restart never resumes: it stays `running`.
- Creating a Workflow instance while the Worker that defines it is not running locally returns an id without error. The instance then either never starts or ends `errored` with `Worker "<name>" not found`, and it stays that way after the Worker comes up; instances created afterwards work. Deployed, the same call throws `workflow.not_found`.
- Local R2 over the S3 API (experimental, undocumented): `local_dev.experimental_s3_credentials` (`accessKeyId`, `secretAccessKey`) on an `r2_buckets` entry serves the local bucket at `/cdn-cgi/local/r2/s3/<bucket-id>` on the dev server, checking SigV4 signatures in headers and in presigned query strings. Added in workers-sdk PR #14280, merged 2026-07-27. A process with the same state folder and no credentials reads the objects through its binding.
- `wrangler dev` refuses `/cdn-cgi/*` requests whose Host it does not recognise (`403 Invalid Host header`) and checks signatures against its own `localhost:<port>` unless started with `--local-upstream <public-host>`. The Vite plugin's dev server accepted a tunnel's Host as is.
- Cloudflare quick tunnels (`cloudflared tunnel --url http://localhost:<port>`, no account) answer every `/cdn-cgi/*` path on `*.trycloudflare.com` with Cloudflare's own 404, so the request never reaches the dev server and no cloudflared flag helps. A local proxy that maps another path (such as `/s3/<bucket>/<key>`) to `/cdn-cgi/local/r2/s3/...` with `Host: localhost:<port>` works under both dev servers: presign for the localhost URL, then hand out the URL with the tunnel's origin and path. A 110 MB upload from the internet went through at 5 s. A quick tunnel gets a new random hostname on every start; a fixed one needs a named tunnel, a Cloudflare login and a DNS record. Documented quick-tunnel limits: 200 in-flight requests, no SSE, no uptime guarantee.
- A Worker route that accepts the upload and writes it through the R2 binding needs no rewrite, since its path is outside `/cdn-cgi`.

## Sources

- workers-sdk PR #14280 and `packages/wrangler/CHANGELOG.md`: https://github.com/cloudflare/workers-sdk/pull/14280
- Quick tunnels (documentation): https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/
- Spikes, 2026-10-04 and 2026-10-10: two Workers bound across scripts in three launch modes; a Modal function uploading into local R2 through ngrok and Cloudflare quick tunnels
