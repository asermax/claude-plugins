# Handing a fact from a parent update to a child

verified: 2026-11-23

How a parent update (an app shell, a screen) tells a child Submodel about something the parent learned, such as a read the parent owns that failed, without breaking Foldkit's lint rules.

## Knowledge

- `foldkit/no-child-message-construction-in-root` (`@foldkit/oxlint-plugin`) flags `Child.Message.X(...)` built in a parent's update, such as `foldChild(...)(model, HomeMessage.FailedTree())`. Its message: expose a child update capability that applies the fact and call it with `Update.foldChild`, `Update.foldChildAt` or `Update.foldChildStep`.
- The capability is a function exported by the child, `(childModel, input) => Return`, that builds its own Message and calls its own `update`. Give it the parent's raw value as `input`, for example a `Result.Result<Data, string>`: `receiveTree = (model, result) => update(model, Result.isSuccess(result) ? Message.ReceivedTree({ tree: result.success }) : Message.FailedTree())`. One capability then carries both the success and the failure, and the parent passes `Result.succeed(data)` where it only holds data.
- The parent wires it with `Update.foldChild({ foldOutMessage, read, toParentMessage, update: Child.receiveTree, write })` and calls the fold with `(parentModel, result)`.
- Declare the capability after the child's `update` const, next to the other capabilities, so it does not call `update` before its declaration.

## Sources

- `@foldkit/oxlint-plugin` rule `no-child-message-construction-in-root`, its report text from a `pnpm check` run, 2026-11-23
- `foldkit/dist/update/update.d.ts` (foldkit 0.170.0), `foldChild` and `Fold`
