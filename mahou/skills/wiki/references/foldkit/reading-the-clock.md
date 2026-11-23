# Reading the clock in a Foldkit app

verified: 2026-11-23

Answers where a Foldkit (0.170.0) app reads the current time, so that a value built from "now" is never older than the moment the user asks for it, and how to test it in a story.

## Knowledge

- `update` stays pure: the time enters through a command whose effect reads it (`Clock.currentTimeMillis` with Effect) and answers with a message carrying the reading, for example `{ now, timeZone }`. Keep one command and one message for every reading; the handler stores the reading and acts on it.
- A reading taken once in `init` goes stale in a tab left open for hours. Anything that defaults to "now" or bounds an input by "now" (a form's default time, a date field's `max`) gets its own reading when it opens: run the read command at that moment and build the value in the handler of the answer, from the reading the message carries, not from a time stored earlier in the model.
- Open the dependent view when the reading answers, not before. The clock command finishes in the same tick, so nothing visible waits, and the view never shows a stale default that would need replacing later (replacing it means telling a default the user has not touched from a value they typed).
- The parent decides when a child view opens in a function that runs after every message that can complete its inputs (route, data, settings). That function would run the read command again on each of those messages while the answer is out, so keep a boolean in the model that is true while a reading is out, set when the command is sent and cleared when any reading answers. Let any reading that answers open the pending view, including the one from `init`, since it is just as fresh.
- The same answer can refresh the parent's own "now" (labels such as "today"). Do not let it move what the user navigated to, such as the month on screen; only fill it when it is still empty.
- An edit view opened on a stored instant shows the stored time and takes only the zone and the bound from the fresh reading.

## Testing

- In `foldkit/story`, `given(init().model)` takes only the model: the commands `init` returned are not pending. Feed the start reading as `message(CompletedRead(...))`; `Command.resolve(Read, ...)` on it fails with "no matching pending Command".
- To prove the second reading is used, give the start reading at one minute, open the view, assert it is still closed and `Command.expectHas(Read())`, then `Command.resolve(Read, CompletedRead(later))` and assert the default and the bound are the later minute.
- Put the later reading in a different month and day from the start reading. When both fall in the same month, an assertion that the month on screen stayed put passes even when every reading moves it.
- Every existing story that opens the view now needs a `Command.resolve(Read, ...)` between the message that opens it and the view's own commands (a dialog's show command, for example), and helpers that call `update` directly need a second `update` with the reading.

## Sources

- Fixing a transaction form that opened at the time read when the app started, in a Foldkit 0.170 app with Effect 4.1.2, 2026-11-23.
