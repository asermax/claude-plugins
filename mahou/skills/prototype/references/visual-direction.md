# Visual direction

Show and settle the final options here. Explore the wider set of references on a moodboard (mahou:explore-with-canvas, `references/moodboard.md`), and use the candidates it produces as the options.

## One page per piece

Each piece gets its own file in `prototypes/`, named after it, such as `palettes.html`, `icon-libraries.html` or `logo.html`. When the user wants to see two pieces together, put them on one page, for example the fonts on the logo's page next to the wordmark. Options are labelled by letter, and one line under each says what it trades and where it comes from. Write the line to describe the trade and the source, without recommending an option.

Every option is shown on the same sample of the product, drawn with the same example data, so the user compares the option and not the content:

- **Palettes**: the same small product screen drawn in each palette, light and dark when the palette has both, with its swatches under it and the hex values in its line. Mark each value taken from a token site or estimated from screenshots as estimated. Name the source of every other value.
- **Icon libraries**: the same set of the product's concepts, each drawn from every library at the size the product shows it, one row per library and one column per concept. Take the SVGs from each library's published data rather than a live API, so the page stays self-contained, and write "none" in the cell when a library has no icon for a concept. Each row names the library, its license and its icon count. Add a toggle for a dark background.
- **Logo**: each option as an app icon at its large and its small size, next to the wordmark, on the product's light and dark backgrounds. Check that the icon is still recognizable at the small size, and say in the option's line when a detail is lost there.
- **Fonts**: each option shows the wordmark next to the logo and a small product sample with amounts or other figures, light and dark. Embed each font in the file, only the subsets and weights used, and give its license. Measure whether its digits are tabular and say so in its line when they are not.

## Rounds

The first round offers the options. Stop after opening the file and wait. The user picks, picks with corrections, or rejects every option and says what they want instead; each answer is a decision that goes back to the loading skill to record.

Every following round applies the corrections as given. When the user picks one option, the others leave the page and the next round shows variants of the picked one that differ only in what the correction touched. When the user rejects every option, the next round offers new options built from what they said. When the user attaches a reference image, read it, copy it to `prototypes/refs/`, describe what it shows in the message, and draw the next options after it, leaving out what the user said to ignore.

## Applying the picks

Once a piece is settled, replace its placeholder in each screen prototype in `prototypes/` with the settled palette, icons, logo or fonts. Then reconcile those prototypes so every screen uses the settled direction.
