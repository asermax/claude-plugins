# Testing values read at module load

verified: 2026-11-22

Answers how to test a value a module reads once when it is imported, such as a locale taken from `navigator.languages` or a flag read from the environment, when a test setup file pins the input for the rest of the suite.

## Knowledge

- A test that only compares the value with what the setup file pinned passes when the module hard-codes that value, and every test that relies on the default inherits the same blind spot. The test has to change the input and see the value follow it.
- In vitest, change the input, call `vi.resetModules()`, then `await import(...)` the module again: the dynamic import evaluates a fresh copy that reads the new input. The static import at the top of the file keeps its first copy, so the other tests in the file are not affected. Restore the pinned input and call `vi.resetModules()` again before the test ends.
- A read-only browser property such as `navigator.languages` can be replaced with `Object.defineProperty(navigator, "languages", { configurable: true, value: [...] })`. It works on Node's `navigator` and on jsdom's, and `configurable: true` lets a later test define it again.
- Put an unsupported entry first in the list (for example `["zz", "en-US"]`) to also cover the filter that picks the first entry the runtime supports.
- Assert something the default changes downstream as well, such as text formatted without passing the value explicitly, so the test also catches a function that ignores the default.
- In a codebase whose lint rules forbid async test functions in favour of Effect, write the test with `it.effect` from `@effect/vitest` and wrap the dynamic import in `Effect.promise(() => import(...))` inside a named generator.

## Sources

- A review of a browser app's locale formatting tests with vitest 5.1 and @effect/vitest 4.1, 2026-11-22: the test that compared the locale with the pinned value passed with the locale hard-coded, and the re-import test failed on it.
