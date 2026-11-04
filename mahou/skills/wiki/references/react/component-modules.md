# Component modules

verified: 2026-11-02

Answers how to split a React component into parts that only it uses, and how the rest of the code reaches it.

## Knowledge

- A component whose parts nobody else uses becomes a module: a folder named after the component, with an `index.ts` that exports only that component, and one file per part beside it. For example, `PollResults/` holds `index.ts`, `PollResults.tsx` and one results component per poll type.
- Code outside the folder imports from its `index.ts` only, never a part's file. The parts stay exported from their own files, because the main component imports them.
- A component that renders one of several shapes by a type picks the part with a `switch` over the type, one `case` per value and a `default` that returns the narrowed value with `satisfies never` (`poll satisfies never` after `switch (poll.type)`), so a new type value fails the type check instead of falling into another case's render. Each part takes only the props its shape uses.
- A lint rule can enforce the entry: for every relative import, find the innermost folder that holds an `index.ts`, contains the imported file and does not contain the importer, and reject the import unless it names that `index.ts`.

## Sources

- kurasu, `apps/web/src/features/polls/PollResults/` and the `kurasu-boundaries/module-entry` lint rule, 2026-11-02.
