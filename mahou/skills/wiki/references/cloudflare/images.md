# Processing images on Cloudflare: the Images binding and WebAssembly in a Worker

verified: 2026-10-10

Answers how a Worker or Workflow step converts and re-encodes images (SVG to raster, WebP output), what each route handles, and what it costs. Distilled from a spike that raced the Images binding against WebAssembly libraries on real article images, and from the Images pricing docs.

## Knowledge

- The Images binding (`env.IMAGES.input(stream).transform(...).output(...)`) rejects every SVG (`9412: not an image`). It handled rasters up to 36 MP at about 58 ms CPU, outside the Worker's memory. Its WebP output was 3–9% larger than libwebp's, so content hashes differ between the two routes.
- Pricing: Cloudflare bills calls to the binding as unique transformations and counts each source image and parameter set once per calendar month. The Images Free plan includes 5,000 a month; beyond that, new transformations fail with `9422` and nothing is charged. The Paid plan includes 5,000 and charges $0.50 per 1,000 more. The docs do not say whether Workers Paid alone lifts the 5,000. `.info()` calls are not billed.
- Locally, `wrangler dev` runs a reduced version of the binding that supports only width, height, rotate and format; `wrangler dev --remote` runs the real one.
- WebAssembly in the Worker: `@resvg/resvg-wasm` rasterizes SVG and `@jsquash/webp` (libwebp) encodes WebP, in a deployed Worker and in a Workflow step, at 25–530 ms CPU per image warm plus about 250 ms on an isolate's first run. The bundle is 3.9 MiB, 1.5 MiB gzipped. Raster output matched Pillow's byte for byte.
- Decoding a raster above about 10 MP exceeds the 128 MB isolate (`exceededMemory`, error 1102) and ends the invocation; the code cannot catch it. The boundary is not deterministic, and 12 MP and above always failed. The only guard is to read the dimensions from the header before decoding.
- resvg has no system fonts in a Worker: without a bundled font, all SVG text disappears silently. One bundled font (about 400 KB) replaces every font the SVG names.
- `performance.now()` does not advance during synchronous compute, so a step cannot measure its own CPU; read CPU from `wrangler tail`.
- Browsers render SVG natively, so an SVG kept as SVG needs no rasterizer for display; see `r2` for serving it safely.

## Sources

- Images pricing: https://developers.cloudflare.com/images/pricing/
- Images binding: https://developers.cloudflare.com/images/transform-images/bindings/
- Spike, 2026-10-04: 14 real article images (SVGs, large PNGs, JPEG, animated GIF) through both routes in a deployed Worker and a Workflow step
