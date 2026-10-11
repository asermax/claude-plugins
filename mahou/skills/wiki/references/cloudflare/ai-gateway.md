# AI Gateway: calling a provider through it from a Worker

verified: 2026-10-10

Answers what changes when a Worker calls a model provider through Cloudflare AI Gateway instead of directly: authentication, caching, what the caller learns about cost, and what can be managed from the CLI. Distilled from a spike that called Gemini through a gateway from a deployed Worker, and from the AI Gateway docs.

## Knowledge

- A provider is reached at `https://gateway.ai.cloudflare.com/v1/<account>/<gateway>/<provider>/...` (for Gemini, the `google-ai-studio` provider, then the provider's own path such as `v1/models/<model>:generateContent`). The provider's SDK works with its base URL pointed there, and so does plain `fetch`; both sent byte-identical bodies, and the gateway did not change the body.
- A gateway with authentication on requires a `cf-aig-authorization` header on every request.
- With response caching on, an identical request returns the stored response without calling the provider (0.1 s against 1.6–2.7 s for a miss). The `cf-aig-cache-status` response header says `HIT` or `MISS`.
- The docs describe no cost or token figures returned to the caller, in headers or body. Cost is an estimate the gateway computes from token data for its own observability. `cf-aig-custom-cost` is a request header that overrides the price used; it returns nothing.
- wrangler has no gateway command, and the OAuth token wrangler uses cannot create gateways (`10000 Authentication error`); create gateways in the dashboard or with an API token that has AI Gateway Edit.
- The gateway logs every request sent through it.

## Sources

- Caching: https://developers.cloudflare.com/ai-gateway/configuration/caching/
- Costs: https://developers.cloudflare.com/ai-gateway/observability/costs/
- Google AI Studio provider: https://developers.cloudflare.com/ai-gateway/usage/providers/google-ai-studio/
- Spike, 2026-10-04: Gemini image description from a deployed Worker through a gateway, with the SDK and with plain `fetch`
