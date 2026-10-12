# Workers deploy: custom domains, secrets and CI tokens with wrangler

verified: 2026-10-12

Answers what needs care when you deploy a Worker with wrangler: attaching a custom domain, what a failed trigger update leaves behind, setting secrets, creating resources from a script, and the permissions a CI token needs. Distilled from a manual production deploy of two Workers, a D1 database and an R2 bucket with wrangler 4.135, and from the first CI deploy after it.

## Knowledge

- A custom domain (`routes: [{ "pattern": "<host>", "custom_domain": true }]`) does not attach to a hostname that already has DNS records. The deploy fails with `Hostname '<host>' already has externally managed DNS records (A, CNAME, etc). Delete them first or try a different hostname. [code: 100117]`. Delete the record and deploy again. From the deletion until the next deploy succeeds, the hostname has no DNS record.
- wrangler has no command for DNS records, and the OAuth token from `wrangler login` carries `zone (read)` only. Delete a record in the dashboard, or with an API token that has Zone DNS Edit.
- wrangler does not roll back a failed trigger update. It reports `Trigger configuration for "<worker>" was only partially updated` and the new version stays live. A config with `routes` and no `workers_dev` key turns workers.dev off on that deploy. If a deploy moves a Worker from workers.dev to a custom domain and the domain fails to attach, the Worker has no URL until a later deploy succeeds.
- Right after a deploy first enabled workers.dev for a Worker, a request to it answered 404. The same request answered normally a few seconds later.
- `wrangler secret bulk --name <worker>` reads a JSON object from stdin when no file is given, and sets every key in one new version. A script that builds the JSON from the file holding the values keeps them out of the terminal. `wrangler secret put <KEY> --name <worker>` also reads the value from stdin. Every secret change deploys a new version at once.
- Secrets survive `wrangler deploy`. A Worker redeployed under the same name keeps every secret it had, including those the new code does not read, until `wrangler secret delete`.
- `wrangler d1 create` and `wrangler r2 bucket create` work with the OAuth token. In a non-interactive shell they print the binding snippet and leave the config alone (`Using fallback value in non-interactive context: no`). `wrangler d1 migrations apply <db> --remote` in a non-interactive shell answers its own "continue?" prompt with yes.
- In CI, D1 calls failed with `The given account is not valid or is not authorized to access this service [code: 7403]` when the API token had no D1 permission. Once the token had Account D1 Edit and Zone Workers Routes Edit on the domain's zone, the migrations and both deploys passed, one of them attaching a custom domain.

## Sources

- Custom domains: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- Secrets: https://developers.cloudflare.com/workers/configuration/secrets/
- Production deploy, 2026-10-12: two Workers, D1 and R2 created and deployed by hand, a custom domain moved off an existing DNS record, then the first CI deploy
