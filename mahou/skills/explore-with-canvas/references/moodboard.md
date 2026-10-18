# Moodboard

Look and feel covers palette, type, shape language, and tone. The answer is a moodboard on this canvas, not prose, and the picks the user settles are decisions like any other.

## Layout

The canvas has two areas, side by side:

- **User's references**: images the user brings. The user pastes or drags the images in their own tab; the agent never places images there.
- **Agent's references**: images a researcher collected, laid out as a grid of thumbnails (below).

## Collecting the batch

One researcher per source family, split by what the subject needs. Each downloads into `canvas/ref-images/` beside the document, with a manifest per batch holding one line per image: what to look at in it, and the source URL.

## Ingesting images

tldraw color props take theme tokens, not hex values, and image assets are the only way to show a picture. Fetch each file through the Vite server (`/@fs<absolute path>`), downscale to at most 480px on the long side, and store the data URL as an asset with `fileSize` in its props. Import in batches, and after each batch refresh the tab and count the assets before the next.

## Mockups for palettes, type pairings, and page fragments

Write a mockup per need into `mockups/` beside the document; the mockup's kind is its file name, and the file hot-reloads into every open tab. Genericized examples ship in `mockups/` beside this reference: copy the ones you need and adapt them.

- `palette.tsx`: swatches with real hex values.
- `font-pair.tsx`: a type pairing in the real faces; loads both families from Google Fonts inside the page, so the sample is the type itself, not a picture of it.
- `style-tile.tsx`: a page fragment in the chosen palette, light and dark; reproduces the shape language of a reference the user brought as a parameterized tile, so one correction changes every variant.

## Clustering the direction

When the user has marked what they like, move the winners into a **chosen direction** area: the images they picked, the palette and type pairing that won, and a card naming each settled pick. Settled picks go to the decision log like any other decision.
