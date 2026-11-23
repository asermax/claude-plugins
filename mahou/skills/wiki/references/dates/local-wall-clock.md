# Local wall-clock times

verified: 2026-11-23

Answers how to turn a date and time the user typed in their own zone into a UTC instant and back, and how to show an instant as local date and time text, with Effect's DateTime and Intl.

## Knowledge

- A `<input type="datetime-local">` holds wall-clock text such as `2026-11-22T21:03`, with no zone. It means a time in the viewer's zone, not UTC.
- Effect 4's `DateTime.makeUnsafe(text)` reads a string with no zone as UTC: it appends `Z` before parsing. `DateTime.toDateUtc(DateTime.makeUnsafe("2026-11-22T21:03"))` is 21:03Z, three hours early for a viewer at UTC−3.
- To read the text as wall-clock time in a zone, use `DateTime.makeZoned(text, { timeZone, adjustForTimeZone: true })` and then `DateTime.toDateUtc(zoned)`. `adjustForTimeZone: true` takes the parsed parts as the zone's local time; without it, the parts are taken as UTC and only the zone label changes. `makeZoned` returns an Option, None for an empty or invalid text or an unknown zone, so an empty field needs no separate check.
- The reverse, an instant to wall-clock text for the field, is `DateTime.makeZoned(instant, { timeZone })` and `DateTime.toParts(zoned)`, padded into `YYYY-MM-DDTHH:mm`. Keep one function for it and use it both for the default "now" of a new form and for the stored instant of an edit.
- Round trip trap: filling an edit form with `instant.toISOString().slice(0, 16)` and saving with the UTC reading above looks consistent, because the same wrong instant comes back unchanged. Test the conversion with a zone offset from UTC: a typed local time must produce the instant of that zone, and an edit opened on a stored instant must show its local time and save it back unchanged.
- The field's `max` attribute compares wall-clock texts. Set it to the current minute in the same zone as the field's value, never to a UTC text.
- A "now" read once when the app starts goes stale in a tab left open. A client check that refuses times after that stored now refuses valid past times later in the day. Leave the future-date refusal to the server, which compares instants with its own clock, or read the clock again before checking.
- `DateTime.toDate(zoned)` returns a Date whose UTC fields are the zone's wall-clock fields. Formatting it with a module-level `Intl.DateTimeFormat` set to `timeZone: "UTC"` through `DateTime.formatIntl` prints the local time without building a formatter per zone or per call. An `Intl.DateTimeFormat` built with `timeZone` set to the viewer's zone formats the instant directly; the shift is only worth it when the formatter has to be shared at module level.
- The locale decides the order and punctuation of the parts: with `{ weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }`, en-US prints `Sun, Nov 8, 2026, 18:40`, en-GB `Sun, 8 Nov 2026, 18:40` and en-IE `Sun 8 Nov 2026, 18:40` (Node 24's ICU). A locale picked for its order also brings its words: en-GB and en-IE abbreviate September as `Sept` while every other month gets three letters, so an en-IE formatter chosen for `Sun 8 Nov 2026, 18:40` prints `Tue 8 Sept 2026, 09:05`. When a design fixes the exact text, take the parts from one en-US `formatToParts` call (three-letter months, and a two-digit hour with `hour: "2-digit"` and `hourCycle: "h23"`) and join them in the design's order, then pin a September date in a test.

## Sources

- Fixing a transaction form that saved local times as UTC and an edit form that hid it, 2026-11-23.
- en-IE, en-GB and en-US `formatToParts` output for September checked on Node 24 (ICU 78), 2026-11-23.
- Effect 4.1.2 `internal/dateTime.ts` (`makeUnsafe`, `hasZone`, `makeZonedUnsafe`, `toDate`, `formatIntl`) read on 2026-11-23; Node 24 `Intl.DateTimeFormat` output checked on 2026-11-23.
