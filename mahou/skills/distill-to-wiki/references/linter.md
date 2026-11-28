# Rules and their linter

A rule about how code is written can live in two places that must agree: the entry or rule that states it, and the linter of the project the session works in. Decide for each item whether a check fits it, using the sections below. When one fits, the item carries the linter change, and a change to one side carries the change to the other in the same item.

## Where the project's linter lives

Read the repository: its lint, format and compiler configs, a folder of custom rules or a local plugin, the rule tests beside them, and the scripts that run them. The linter change goes there, whether the item lands in the global wiki or in the project. A global entry's rule still lands in this project's linter only; another project picks it up when its own session runs.

When the project has no linter, or no place for custom rules where the check needs one, ask the user whether to add one, and which tool and where. Add it only once the user agrees.

## The entry and the rule

- The entry or rule states the standard on its own, without naming the lint rule that checks it. The rule's message points back at the entry, by its path and heading, so a reader who hits the report finds the reason.
- Renaming, moving or removing a heading breaks every message that cites it. Search the linter for the old heading before changing it.
- An entry that applies only to part of the project (one app, one package, one kind of service) says so, and the rule turns on only for that part.

## What the linter can check

Pick the kind of check from what the rule is about. The tools column names examples, not a list to choose from.

| The rule is about | What a check looks at | Tools |
|---|---|---|
| Import boundaries | which module may import which: a folder imported only through its index, a package only through its entry point, one layer never importing another | the linter's restricted-imports rule, an import-contract tool, a custom rule |
| Library and API usage | a library or API banned in favour of another, or a call that must have a given shape | the linter's banned-API config, rules of a plugin for that library, a custom rule |
| Type system usage | something the types can enforce: a required prop or argument, an exhaustive switch, an assertion only on validated data | the compiler, the type-aware rules of the linter |
| Code shape | a pattern inside one function, component or class: what a handler does, where a value comes from, how a comment is written | a custom rule over the syntax tree, ast-grep |
| File and folder layout | where a file lives and how it is named | a custom rule that reads the file name |
| Project-wide structure | something only visible across files, such as a dependency's minimum version | an architecture test |
| Exceptions | the form of a disable comment: the rule, the entry it departs from and the reason | the linter's directive-description rule, a custom rule |

Prefer the earliest check that works: the types first, then a rule the linter or one of its plugins already ships, then a custom rule.

## When a check does not fit

Say so in the item, with the reason, instead of adding a rule:

- The entry describes a default, not a prohibition.
- The code already fails to build, run or type-check without the rule.
- Another rule or the compiler already reports it.
- The types can enforce it instead, such as a required prop rather than a rule that checks the prop is passed.
- The rule would only work with a hand-kept list of names that drifts from the code.

## What stays in sync

- Every rule message ends with its citation, naming the entry and a heading that exists.
- The rule's tests, with cases that pass and cases that fail, written the way the project's other rule tests are.
- The linter's own documentation of its rules, when the project keeps one.
- Disable comments that name a removed or changed rule.

## Before presenting the item

Run a blast radius on the change. Run the new or changed rule over the project, or search for the pattern when the rule is not written yet. Put in the item:

- how many places it reports, per repository or package, with two or three examples;
- the disable comments it adds, removes or leaves unused;
- any rule, entry or config that conflicts with the change, such as a rule whose fix another rule then reports, or an entry's example that does what the new rule forbids.

Present what the blast radius found, and let the user decide whether the rule goes in. The item does not fix the places the rule reports.
