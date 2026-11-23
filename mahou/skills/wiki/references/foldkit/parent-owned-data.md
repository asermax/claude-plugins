# Data a parent owns, read by a child's update and view

verified: 2026-11-23

How a Foldkit (0.170.0) child Submodel reads data its parent owns, such as a query's result, without keeping a copy in its own Model, and how to test it.

## Knowledge

- Keep one owner. A child that stores its own copy of parent data (a tree, the settings) needs parent code that copies every new value down, and the copy can disagree with the owner. Pass the data instead: the view through `viewInputs` (`Submodel.defineView<Model, Message, Inputs>((model, inputs, h) => …)`), the update as a third parameter, `update(model, message, inputs)`.
- `Update.foldChild`'s `update` takes `(childModel, input)` only. Build the fold inside the parent's handler so its `update` closes over the parent Model, as the doc comment of `foldChild` shows ("`update` closes over per-dispatch context"): `(model, message) => Update.foldChild({ …, update: (child, childMessage) => Child.update(child, childMessage, inputsOf(model)) })(model, message)`. One function `inputsOf(parentModel)` builds the inputs for both the fold and `h.submodel`, so the update and the view read the same values.
- A child that reacts when the data arrives (starts a read, rebuilds a draft, leaves a route when the read fails) still needs a signal. Give it a message with no payload, such as `ChangedTree: {}`, and a capability that sends it, `changedTree = (model, inputs) => update(model, Message.ChangedTree(), inputs)`. The parent folds the capability with `Update.foldChild` after its query fold and passes `inputsOf(model)` as the fold's input. The handler reads the data from the inputs. With `foldkit/asyncData` inputs it tells success (`AsyncData.getData`, `isSuccess`) from a failed read with no data (`isFailure`); a failed refresh keeps the old data as `Stale`.
- Chain the parent's steps with `Update.combine(model, [stepA, stepB])` instead of concatenating `commands` by hand; each step runs on the Model the previous one returned. A data-last fold (`fold(input)`) is such a step.
- A child that must not rebuild on every signal (a form built once from the data) keeps a boolean for that, such as `isWaitingForTree`, where it used to test whether its copy was present. Tests assert what the flag produces (the draft still empty, the mode still loading, then the filled draft) rather than the flag itself, so renaming or replacing the flag does not fail them.
- Several folds of the same child that differ only in `update` (the child's message update, a route change, a data-changed capability) can share one descriptor: `const foldChildWith = <Input>(foldOutMessage, update: (child: ChildModel, input: Input) => ChildReturn) => Update.foldChild({ foldOutMessage, read, toParentMessage, update, write })`. `foldChild` is generic over the input, so the message fold is `foldChildWith(foldOutMessage, (child, message) => Child.update(child, message, inputsOf(model)))(model, message)` and the others pass `Child.changeRoute` or `Child.changedTree` directly. The read, the write and the message wrapper then live in one place.
- A fold returns `{ model }` unchanged when its `read` gives `None` (`runChildFold` in `foldkit/dist/update/update.js`), so a parent does not guard a fold with `Option.isSome(model.child) ? fold(model, input) : { model }`; call the fold.
- Tests: wrap the update with fixed inputs, `(model, message) => update(model, message, inputs)`, and pass the same inputs to `withViewInputs(view, inputs)()` in a scene. Define the wrapper as a top-level const: calling a generic wrapper inline as `story`'s first argument leaves the Model inferred as `unknown` in `model(...)` steps.
- When the data changes in the middle of a `story`, keep the inputs in a variable the wrapper reads and change it from a `model(() => { inputs = next })` step, then send the change message. Steps run in order, so the messages after that step see the new inputs. This is the order the app uses: the parent folds the data in, then signals the child.

## Sources

- `foldkit/dist/update/update.d.ts` (`foldChild`, `combine`, `ChildFold`) and `foldkit/dist/html/submodel.d.ts` (`defineView`, `viewInputs`), foldkit 0.170.0
- `foldkit/dist/test/story.d.ts` (`model` step), `foldkit/dist/asyncData/asyncData.d.ts` (`Stale`, `loadIfMissing`)
- `foldkit/dist/update/update.js` (`runChildFold`: `onNone: () => ({ model })`), foldkit 0.170.0
- A review of that change, which merged three Home fold descriptors and two Accounts ones into one generic descriptor each and dropped an `Option.isSome` guard around a child fold; 405 tests passed after it, 2026-11-23
- A web app that removed its screens' copies of the account tree and the settings: Home and its transaction sheet took them as inputs, and 405 story and scene tests passed after the change, 2026-11-23
