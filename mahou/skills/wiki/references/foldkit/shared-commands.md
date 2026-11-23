# One Command shared by a parent and its child Submodels

verified: 2026-11-23

How an app-level Foldkit (0.170) Command, such as one that changes the URL, can be returned from both the app's update and a child Submodel's update, and how to test what it does.

## Knowledge

- `defineMessageUnion` takes field records only, so two unions cannot list the same message schema. A Command declares one message in `messages`, built from one union, for example the app's `Message.CompletedChangeUrl`.
- Message and Command types are structural: `Command<T>` holds an `Effect<T>`. When the child's union declares a variant with the same tag and fields (`CompletedChangeUrl: {}`), the app-level Command fits the child's `Command<ChildMessage>` and the child can return it. The parent lifts it with the child's other Commands (`Update.foldChild`'s `toParentMessage`), and the completion comes back to the child wrapped in the parent's `Got…Message`, which the child handles in its `match`.
- In `story` and `scene` tests of the child, resolve the shared Command with the child's own constructor, `Command.resolve(ChangeUrl, ChildMessage.CompletedChangeUrl())`; a parent's story resolves it the same way and gets the lifted message.
- Prefer flags on one Command to near-duplicate Commands that differ in one step: `ChangeUrl({ shouldReplace, shouldScrollToTop, url })` picks `replaceUrl` or `pushUrl` and scrolls only when asked, and each caller passes the flags that keep its behaviour.
- After merging near-duplicate Commands into one with flags, a test that matched the old Command by name (`Command.expectHas(Definition)`, `Command.resolve(Definition, …)`, `commands.map((command) => command.name)`) now passes whichever flags and URL the caller sends: the name told push from replace before the merge and says nothing after it. Assert the arguments instead: `Command.expectHas(Definition({ shouldReplace, shouldScrollToTop, url }))` in a story, or `expect(result.commands?.map((command) => command.args)).toContainEqual({ … })` on a plain `update` result. A Command a parent lifted from a child's update keeps its `args`, so the same check works on the parent's result.
- To test the Command's effect, call the definition and `yield*` its `effect` inside `it.effect` from `@effect/vitest`. `pushUrl` and `replaceUrl` call `window.history.pushState`/`replaceState` and `window.dispatchEvent`; in a `node` test environment, `vi.stubGlobal("window", { dispatchEvent: vi.fn(), history: { pushState: vi.fn(), replaceState: vi.fn() }, scrollTo: vi.fn() })` lets the test assert which history call ran and whether it scrolled, without switching the file to `jsdom`. Undo it with `vi.unstubAllGlobals()` in `afterEach`.

## Sources

- `foldkit/dist/command/index.d.ts` (`Command`, `define`) and `foldkit/dist/schema/index.d.ts` (`defineMessageUnion`), foldkit 0.170.0
- `foldkit/dist/navigation/index.js`, `pushUrl` and `replaceUrl`
- A web app that merged three URL Commands into one shared by the app and its home screen, typechecked and tested, 2026-11-23
- A review of that merge: changing the sign-in URL to "/x" or the failed-read handler from replace to push left every name-matching story green; with the arguments asserted, 6 stories and 1 story failed, 2026-11-23
