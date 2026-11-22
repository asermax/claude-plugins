# Grid auto-fill columns

verified: 2026-11-22

Answers how many columns `grid-template-columns: repeat(auto-fill, minmax(MIN, 1fr))` produces for a given container width, and how wide each cell is, when code must pick a text form (full, shortened, abbreviated) before the browser lays the grid out.

## Knowledge

- The spec repeats the track the largest number of times that does not overflow the container's content box, sizing each track at its minimum (MIN) and counting the gaps between tracks. With content width W and column gap G that is `columns = max(1, floor((W + G) / (MIN + G)))`. The `+ G` accounts for n tracks having only n − 1 gaps.
- At least one track is always made, so a container narrower than MIN still gets one column, and that column overflows.
- After the count is fixed, the `1fr` maximum shares the leftover space, so each cell is `(W − (columns − 1) × G) / columns` wide. Subtract the item's horizontal padding and border for the width its text gets.
- W is the content box: subtract the container's horizontal padding from its outer width. When the width comes from the window, apply any `max-width` of the enclosing column first: `W = min(windowWidth, maxWidth) − leftPadding − rightPadding`.
- The formula holds for `auto-fill` whatever the item count, because auto-fill keeps empty tracks. `auto-fit` collapses empty tracks and stretches the items into them, so with fewer items than columns each item is wider than the formula gives.
- Grid items stretch to fill their cell by default (`justify-items: stretch`), so flex-era settings such as `flex-shrink: 0` on the items are not needed when switching a scrolling flex row to such a grid.
- Test the count at the breakpoints, where W + G is an exact multiple of MIN + G: one pixel below adds no column, the exact width adds one.

## Sources

- CSS Grid Layout Module Level 1, §7.2.3.2 "Repeat-to-fill: auto-fill and auto-fit repetitions", read on 2026-11-22.
- Replacing a horizontally scrolling chip row with an auto-fill grid and sizing each chip's text from the window width, 2026-11-22.
