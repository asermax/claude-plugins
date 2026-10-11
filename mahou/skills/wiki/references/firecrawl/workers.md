# Calling Firecrawl from a Cloudflare Worker

verified: 2026-10-10

Answers whether Firecrawl's JavaScript SDK runs in a Worker, what a plain request needs, and how to read the credits a scrape consumed. Distilled from a spike that scraped a real article from a deployed Worker, recorded Firecrawl responses, and Firecrawl's docs.

## Knowledge

- `@mendable/firecrawl-js` 4.42.4 fails in workerd before sending: `Unsupported cache mode: default`, because axios's fetch adapter builds a `Request` with `cache: 'default'`, which workerd rejects.
- Plain `fetch` to `POST https://api.firecrawl.dev/v2/scrape` with a bearer key works (3.8 s, 1 credit for one article).
- The Python SDK sends fields of its own that a bare request would not (`onlyMainContent`, `maxAge`, `origin` and others); a client that has to behave like the SDK, or match responses recorded through it, sends them explicitly.
- The raw response carries `creditsUsed`, which the docs do not list; Python SDK code reads it as `metadata.credits_used`.
- Billing per the docs: 1 credit per page; the `rawHtml` and `markdown` formats carry no surcharge; `proxy` accepts `basic`, `enhanced` and `auto` (the default), and neither `enhanced` nor an `auto` escalation is charged extra.
- `rawHtml` for one long article was 630 KB, which matters where a step result or payload has a size cap.

## Sources

- Scrape endpoint: https://docs.firecrawl.dev/api-reference/endpoint/scrape
- Billing: https://docs.firecrawl.dev/billing
- Spike, 2026-10-04: a real article scraped from a deployed Worker with the SDK and with plain `fetch`
