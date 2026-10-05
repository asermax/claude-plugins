# The cf CLI against wrangler

verified: 2026-10-04

Answers what Cloudflare's new `cf` CLI is, how it relates to wrangler, and whether it covers D1 migrations, deploys and CI yet. Distilled from the package, its README, the announcement and the help output; the subcommands' flags were not readable.

## Knowledge

- `cf` (npm `cf`, binaries `cf` and `cloudflare`) is in open beta since 2026-09-28; another Cloudflare post calls it a technical preview. Releases ship almost daily.
- Cloudflare presents it as wrangler's eventual replacement: when the beta ends, wrangler gets a final major release pointing to `cf`, then 18 months of maintenance. `cf migrate` converts a wrangler project, and configuration moves to a typed `cloudflare.config.ts`.
- `cf d1 migrations` and `cf d1 time-travel` exist, but their file format and flags were not documented. `cf deploy` covers Workers and Containers rollouts.
- It builds with Vite by default and hands builds to wrangler for projects that need it, Python Workers among them; it documents no Python flow of its own.
- Locally it runs against Miniflare with D1, R2 and KV state. In CI it reads `CLOUDFLARE_API_TOKEN`; there is no official GitHub Action yet.
- wrangler stays GA. Its D1 migrations are hand-written `.sql` files tracked in `d1_migrations`, Python Workers deploy through `pywrangler`, and CI uses `cloudflare/wrangler-action` v4.

## Sources

- https://github.com/cloudflare/cf
- https://blog.cloudflare.com/cloudflare-cf-cli-launch/
- https://developers.cloudflare.com/d1/reference/migrations/
- https://developers.cloudflare.com/workers/wrangler/commands/d1/
