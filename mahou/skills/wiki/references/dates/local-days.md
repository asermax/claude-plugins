# Local days

verified: 2026-11-22

Answers how to group timestamps by the day the viewer sees on their calendar, and how to write that day's title, without shifting rows across midnight.

## Knowledge

- `date.toISOString().slice(0, 10)` gives the UTC day. For a viewer at UTC−3, an instant at 22:30 local time falls under the next day. Group by the day in the viewer's time zone instead.
- With Effect's DateTime, the viewer's day of an instant is `DateTime.makeZoned(instant, { timeZone })` followed by `DateTime.formatIsoDate(zoned)`, which writes the date in the zone the value carries. `makeZoned` returns an Option; it is None for an unknown zone name.
- Read the time zone from the browser (`Intl.DateTimeFormat().resolvedOptions().timeZone`) once, keep it in state beside the clock, and pass it to the grouping. If the list can render before the zone is read, render no rows rather than falling back to UTC.
- Rows already sorted by time group into adjacent runs, so a map from day key to rows keeps the order of the days and of the rows in each.
- To title a day already keyed as `YYYY-MM-DD`, read the key as UTC midnight (`DateTime.makeUnsafe(day)`) and format it with the UTC functions (`DateTime.formatUtc`, `DateTime.getPartUtc`). The key is a calendar date with no zone, so formatting it in UTC cannot move it. Formatting that UTC midnight in a zone west of UTC prints the previous day.
- The locale fixes the order of the parts `Intl.DateTimeFormat` prints, whatever order the options are written in: en-US with `{ weekday: "long", day: "numeric" }` prints `16 Monday`. For a fixed text such as `Monday 16`, format the weekday alone and join it with the day number.
- Test the grouping with a zone that has an offset from UTC and instants on both sides of local midnight; a test in UTC passes with the UTC-day bug.

## Sources

- Fixing a list that grouped transactions by UTC day, 2026-11-22.
- Node `Intl.DateTimeFormat` output and Effect 4 `DateTime` source checked on 2026-11-22.
