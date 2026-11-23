# Mounts in Foldkit scene tests

verified: 2026-11-23

Answers how a Foldkit (0.170) scene test resolves and acknowledges the Mounts of dialogs that open and close during the scene, and why a reused `Mount.expectEnded` step can stop acknowledging anything.

## Knowledge

- A scene tracks Mount slots by definition name and occurrence, the index among the rendered Mounts of that definition in render order. Every `Dialog` renders an `AcquireResources` Mount on its `<dialog>` while it is visible, so a dialog opened inside another dialog's content (a picker in a sheet) adds a second slot after `Command.resolve(Dialog.ShowDialog, Dialog.Message.SucceededShowDialog())`. Resolve it with another `Mount.resolve(Dialog.AcquireResources, Dialog.Message.SucceededAcquireResources())` before the next interaction, or the scene throws "I found unresolved Mounts when an interaction dispatched a new Message".
- A model given to the scene with two dialogs already open needs the resolve step twice.
- When the inner dialog closes, its slot ends and must be acknowledged with `Mount.expectEnded(Dialog.AcquireResources)`, or the scene fails at the end with "I found Mounts that ended without being acknowledged". The slot can end on the interaction that picks (click or Enter), before `Command.resolve(Dialog.CloseDialog, ...)`.
- Build the `Mount.expectEnded(...)` step inline in each scene. The step keeps its matchers in an array that `Array.fromIterable` returns as is, and it splices each matcher out of that array when it acknowledges a slot. A step stored in a module-level constant and shared by several tests acknowledges in the first scene that runs it and does nothing in later ones, without throwing, so those scenes fail at the end. `Command.resolve` and `Mount.resolve` steps stored in constants are not affected.

## Sources

- `node_modules/foldkit/dist/test/scene.js` (`slotKey`, `reconcileMountSlots`, `expectEndedMountsStep`) and `test/internal.js` (`assertAllUnmountsAcknowledged`), read 2026-11-23.
- Scene tests of a picker dialog inside a sheet dialog: a shared `expectEnded` constant passed the first test in the file and failed the later ones; the same tests passed alone and passed together once the step was built inline, run 2026-11-23.
