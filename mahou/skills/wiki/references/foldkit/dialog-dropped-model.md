# Releasing a Dialog whose model is dropped with its view

verified: 2026-11-23

Why a `@foldkit/ui` `Dialog` stops answering Escape after its parent drops the model while it is open (for example a sheet held in an `Option` that becomes `None` on close), and how to release what it holds.

## Knowledge

- `Dom.showDialog` (run by the `ShowDialog` command and by the `AcquireResources` Mount) calls `element.show()`, not `showModal()`. Escape is not the native dialog's: a `keydown` listener on `document` dispatches a `CustomEvent('cancel')` on the topmost dialog of Foldkit's own stack, and the view maps it to `RequestedClose`. The listener, the stack entry, the focus trap, the return focus, the background isolation and one scroll lock are stored per dialog id in a module-level map.
- `showDialog` returns early, without calling `show()` or adding a listener, when that map already holds an entry for the id.
- The entry is removed by `closeDialog` (the `CloseDialog` command, issued by `RequestedClose`), by `releaseDialogResources` (the `ReleaseDialogResources` command, issued when the view's `OnUnmount` sends `Unmounted` to an open model), or by the `AcquireResources` Mount's finalizer, but only when that Mount was the one that acquired. When `ShowDialog` acquires first, the Mount gets `false` and releases nothing on unmount.
- A parent that drops the Dialog model in the same update that closes the view (`sheet: Option.none()`) sends no `RequestedClose`, and the `Unmounted` message reaches a parent that no longer holds the child, so it is ignored. The entry leaks. The next dialog with the same id is never shown: it gets no listener, and Escape dispatches `cancel` on the detached element of the earlier opening, so nothing happens. The click handlers on the backdrop and the close button still work, because they are view event handlers. The leak also keeps one scroll lock and the stale stack entry.
- Fix: whenever an open Dialog model leaves the model, issue `Dialog.ReleaseDialogResources({ id })` (Foldkit's documented cleanup for "the element is removed without a close Message"). One way that covers every path (close, save, browser Back, a route change, a lost session, nested pickers and confirm dialogs) is to wrap the root update: list every Dialog model on the screen before and after each message, and release each id that was open before and is absent after. Map the command's result through a `Got*Message` wrapper, because `foldkit(wrap-child-output-in-got-message)` rejects a plain `Completed*` mapper.
- A Dialog model the parent keeps (closed through `Dialog.close`) never leaks: `CloseDialog` releases the entry even when the element is already gone, because it falls back to `releaseDialogResources`.
- The node scene and story runners do not run `Dom`, so a test cannot reproduce the dead Escape. A test can only check that the command is issued. A browser check that patches `HTMLDialogElement.prototype.show` and `close` and `EventTarget.prototype.dispatchEvent` for `cancel` events shows the leak: the second opening logs no `show`, and Escape logs `cancel` on a target whose `isConnected` is false.

## Sources

- `foldkit/dist/dom/dom.js`, `showDialog`, `closeDialog`, `releaseDialogHygieneById` (foldkit 0.170.0)
- `@foldkit/ui/dist/dialog/index.js`, `AcquireResources`, `Unmounted`, `ReleaseDialogResources` (@foldkit/ui 0.170.0)
- saifu commit 404417b, `apps/web/src/client/release-dropped-dialogs.ts`, and the browser reproduction behind it, 2026-11-23
