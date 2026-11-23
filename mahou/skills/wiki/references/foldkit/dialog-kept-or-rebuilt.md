# Telling a kept Dialog from a rebuilt one in a test

verified: 2026-11-23

What a test can observe when a parent rebuilds a child model that holds a `@foldkit/ui` `Dialog`, for example re-running the child's init once late data arrives and carrying the open dialog over with `{ ...rebuilt, dialog: held.dialog }`.

## Knowledge

- `Dialog.open(model)` runs `update(model, RequestedOpen)`. For a dialog that is not animated it only sets `isOpen: true` and returns a `ShowDialog` command; the animation stays `Idle`.
- `SucceededShowDialog` returns the model unchanged while the dialog is open (or leaving). It only acts when the dialog closed before the show finished, by issuing `CloseDialog`.
- So while a non-animated dialog is open and idle, a freshly opened dialog and the held one are structurally equal. `toStrictEqual` cannot tell a kept dialog from a rebuilt one, and an `isOpen` check tells nothing either. Removing the line that carries the dialog over passes such a test.
- The difference shows only when the held dialog is in a state a fresh open does not produce: closing (`isOpen: false`, `LeaveStart`, `LeaveAnimating`) or mid-animation on an animated dialog. A test that must catch a dropped carry-over drives the held dialog into one of those states before the rebuild. When no reachable flow gets there (for example the parent unmounts the child as soon as the dialog closes), the carry-over has no observable effect, and an assertion on reference identity (`toBe(heldDialog)`) ties the test to the implementation instead of a behaviour.

## Sources

- `@foldkit/ui/dist/dialog/index.js`, `RequestedOpen` and `SucceededShowDialog` handlers (@foldkit/ui 0.170.0)
- A test review of a sheet that opens before its data and is rebuilt when the data lands, run 2026-11-23
