# Design red flags

verified: 2026-11-08

Answers which shapes in a proposed part or a diff make the code harder to change, how to tell one is present, and what to name as the correction. The next person to change the code is often an agent that sees only the files it opened, so it cannot follow a rule that lives in a file it never read.

## Knowledge

| Red flag | Test | Correction to name |
|---|---|---|
| Shallow module | A caller has to call two or more of the module's members, in order, to finish one operation, or an option exposes an internal stage. | One member that does the operation, with the stages behind it. |
| Information leakage | The same representation, policy or wire detail appears in two modules, so changing it means editing both; a public export includes a transport, storage or framework type. | One module that owns the detail and parses into domain types for the rest. |
| Temporal decomposition | Modules are named after steps (load, validate, transform, save) and two of them repeat the same rules about one record. | One module per body of knowledge, holding the steps that protect the same rules. |
| Pass-through layer | A function or layer forwards the same arguments to one other function with the same shape and adds no policy, adaptation or abstraction of its own. | Call the inner function directly, or move the responsibility to the layer that can finish the operation. |
| One-caller wrapper | A function, hook, component or adapter has one caller and no second implementation planned. | Inline it at its caller. |
| Split ownership | Two parts write the same state, or each keeps its own copy of it. | One owner that writes it; the other parts read it or ask the owner. |
| Two ways to do one task | A way to do something the repository already does another way is added, and both stay. | One way, with the callers of the other moved in the same change. |
| Importable internals | A file another module should not use is reachable by import from outside the module. | The module's entry point as the only import path, with the internals out of reach. |
| Hand-synced list | Adding one item means editing two or more lists, such as a union, a map and a switch over the same keys. | One list, with the others derived from it, or a check that fails the build when they disagree. |
| Growing branch | One more branch is added to an if/else or switch chain that already decides on the same value, or a second boolean must stay consistent with a first. | A discriminated union, a state machine or a lookup table, named with its members. |
| Re-validation inside the system | A function that a boundary (a request handler, a config parser, a form schema) already feeds parsed, typed data checks that data again. | Validation at the boundary only, with the inner function trusting its types. |

A red flag is a finding only when the correction is something the code's structure decides: its layout, its interfaces, how it splits into functions and modules. When the shape follows from behaviour the user settled, leave it.

## Sources

- pstack `architect` skill, `references/design-red-flags.md`, and the `principle-model-the-domain`, `principle-minimize-reader-load` and `principle-boundary-discipline` skills (github.com/cursor/plugins, `pstack/skills/`), read 2026-11-08.
