# Testing messages that arrive while a command is in flight

verified: 2026-11-23

How to test what a Foldkit app's update does when several messages arrive while a command such as a read is still out, for example to count how many times a read is sent.

## Knowledge

- `story` from `foldkit/story` throws "I found unresolved Commands when you sent a new Message" when a `message(...)` step runs while earlier commands are pending. A story cannot hold a read in flight while other messages arrive.
- To test that case, call `update` in a `for` loop over the messages, collect every `result.commands` into one array, and assert on it, such as `commands.filter((command) => command.name === OpenResource.name)` having length 1. Command instances carry their definition's `name`.
- Where the lint config forbids `Array#reduce` (unicorn `no-array-reduce`), write the loop as a `for...of`.
- A custom story step `(simulation) => simulation` can read `simulation.commands` to assert on the pending commands of a single step.

## Sources

- `foldkit/dist/test/story.d.ts` (foldkit 0.170.0)
