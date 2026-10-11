# Describing an SVG with Gemini

verified: 2026-10-10

Answers how to get a description of an SVG from the Gemini API when the SVG is not rasterized first, and what each way of sending it costs. Distilled from a spike that sent 8 real article SVGs (badges, a logo, formulas, a diagram, a chart) through `generateContent` with `gemini-3.5-flash-lite`, one call per cell.

## Knowledge

- The documented image types are PNG, JPEG, WebP, HEIC and HEIF; SVG is not listed.
- Inline data with mime type `image/svg+xml` is accepted (200) although undocumented. It described 6 of 8 SVGs correctly but described both formulas as an all-black image, and a chart as drawn on a dark grid, with no error. The likely cause is that the model renders transparent backgrounds as black; the spike did not test this.
- The markup as an inline part with mime type `text/plain`, or pasted into the prompt, gives a usable description of every SVG tested; the two routes differ by under 5 tokens. The model reads text the markup carries, such as a formula's LaTeX in `<title>`, so it named an equation that the raster route read out symbol by symbol. A prompt that says "image" still works.
- Cost: a 768 px raster costs about 1.3k prompt tokens whatever the SVG's size. Markup grows with size: 0.8k tokens for a 1.3 KB badge, 11.8k for a 23 KB diagram, 27.8k for a 63 KB chart.
- Whether `image/svg+xml` acceptance holds on other models and over time is unknown.

## Sources

- Image understanding: https://ai.google.dev/gemini-api/docs/image-understanding
- File input methods: https://ai.google.dev/gemini-api/docs/file-input-methods
- Spike, 2026-10-10: 33 calls comparing a raster, `text/plain` markup, markup in the prompt and inline `image/svg+xml`
