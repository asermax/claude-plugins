# How test runners talk to reporters

verified: 2026-09-12

How a test runner hands results to a pluggable reporter, what it calls and when, and who computes the exit code. Applies to any tool that runs many checks and lets someone else format the output.

## Knowledge

- mocha's `Runner` is an EventEmitter and a reporter subscribes in its constructor. vitest and jest call optional methods on a reporter object. node:test exposes an object-mode stream a reporter transform consumes. In all three the run is the only emitter, and the test unit is a stateful object carried in the payload that never emits itself.
- vitest 4 calls `onInit`, `onTestRunStart`, `onTestModuleQueued`, `onTestModuleCollected`, `onTestModuleStart`, `onTestCaseReady`, `onTestCaseResult`, `onTestModuleEnd`, `onTestRunEnd(testModules, unhandledErrors, reason)`. The end carries no counts. The reporter derives them from the modules the run handed it.
- jest 30 calls `onRunStart`, `onTestFileStart`, `onTestCaseStart`, `onTestCaseResult`, `onTestFileResult`, `onRunComplete(contexts, aggregatedResult)`. The end carries an aggregate with the counts and a `success` flag, and the command reads that flag.
- mocha 12 emits `start`, `suite`, `test`, `pass`/`fail`/`pending`, `test end`, `suite end`, `end`. The end carries nothing; reporters count for themselves. Only one reporter runs per run.
- node:test ends its stream with `test:summary`, the final cumulative summary. Several reporters can run, each a transform composed onto the stream.
- Every runner except mocha and node:test keeps an infrastructure failure apart from a failing assertion: vitest exposes collection errors on the module and unhandled errors at the end, jest sets `testExecError` on the file result and counts it separately. pytest separates them into distinct hooks for a test report, a collection report and an internal error.
- The runner computes the exit code from its own count or its own aggregate, never by subscribing as a reporter does.
- Finding no test is a failure by default in vitest, jest and mocha, each with a flag that turns it into a pass: `passWithNoTests`, `--fail-zero`.

## Sources

- https://github.com/vitest-dev/vitest/blob/v4.1.11/packages/vitest/src/node/types/reporter.ts
- https://github.com/jestjs/jest/blob/v30.5.1/packages/jest-reporters/src/types.ts
- https://github.com/mochajs/mocha/blob/v12.0.1/lib/runner.js
- https://github.com/nodejs/node/blob/main/doc/api/test.md
- https://github.com/pytest-dev/pytest/blob/main/src/_pytest/hookspec.py
