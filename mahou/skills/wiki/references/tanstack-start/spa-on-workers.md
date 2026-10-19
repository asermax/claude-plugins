# TanStack Start in SPA mode on Cloudflare Workers

verified: 2026-10-19

Answers why a TanStack Start app built in SPA mode returns 500 on Cloudflare Workers at `/` and on every route, and which option fixes it.

## Knowledge

- `tanstackStart({ spa: { enabled: true } })` prerenders the app shell to `/_shell.html` (`spa.prerender.outputPath` defaults to `"/_shell"`). The build writes no `index.html`.
- On Workers with static assets, a request whose path matches no asset goes to the app's Worker. With no `index.html`, that includes `/`, so the server entry renders the routes on the server. Code that reads browser globals, such as `globalThis.location.origin` for an API client's base URL, throws on the server. The Worker then returns TanStack Start's error page with status 500.
- Set `spa: { enabled: true, prerender: { outputPath: "/index" } }` so the shell lands at `dist/client/index.html`. With `notFoundHandling: "single-page-application"` on the assets, the assets serve `/`. They also serve the shell to every navigation request (`Sec-Fetch-Mode: navigate`) to a path with no asset, so the request never reaches the Worker.
- A request to an unknown path that is not a navigation, such as `curl` without browser headers, still reaches the Worker. Check a deploy with the browser's headers, or in a browser.
- The dev server serves the shell either way, so the bug shows only in a deploy.

## Sources

- `@tanstack/start-plugin-core` 1.171.54, `dist/esm/schema.js` (`spaSchema`, `outputPath: opts.outputPath ?? "/_shell"`).
- A TanStack Start 1.169 SPA deployed with Alchemy 2 (`Cloudflare.Website.Vite`, `notFoundHandling: "single-page-application"`), 2026-10-19: 500 before the fix, 200 after it.
