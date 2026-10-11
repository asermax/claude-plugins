---
name: mermaid
description: Loaded to choose, write, style and validate mermaid diagrams (flowcharts, sequence, state, ER and class diagrams). Carries a chart-selection table, one reference per chart type with a default shape and colour palette, the common syntax rules, a bundled validator and the rendering rules the validator cannot catch. Use whenever you generate, write or edit a mermaid code block, and validate every diagram before showing it, even one that looks correct.
---

# Mermaid Diagrams

Use a diagram to show something that prose would explain worse: a data model, a flow across services or APIs, a state lifecycle, an object structure. A diagram is worth drawing when the subject has many parts, branches, an order over time or a structure. Do not diagram something one sentence explains.

## How to use this skill

1. Pick the chart type from the chart-selection table below.
2. Open the matching `references/*.md` for that chart's syntax, a worked example and its styling guidance. Load only the references you need.
3. Write the diagram following the common syntax rules. In a flowchart or a state diagram, take each element's shape and colour from the palette in [references/flowchart.md](references/flowchart.md).
4. Validate it, then render it and look at the image (see Validation). Both steps are mandatory.
5. Place the diagram next to the prose it illustrates, not in a separate "diagrams" section.

## Chart selection

| You're documenting | Chart | Reference |
|---|---|---|
| A data model, a schema, database changes (entities, fields, relationships) | `erDiagram` | [references/er-diagram.md](references/er-diagram.md) |
| Branching logic, request routing, a flow across a repository's services | `flowchart` | [references/flowchart.md](references/flowchart.md) |
| Interaction over time across actors, services or APIs (who calls whom, in what order) | `sequenceDiagram` | [references/sequence-diagram.md](references/sequence-diagram.md) |
| The lifecycle or status transitions of an entity | `stateDiagram-v2` | [references/state-diagram.md](references/state-diagram.md) |
| Object and type structure and relationships (classes, DTO hierarchies, interfaces) | `classDiagram` | [references/class-diagram.md](references/class-diagram.md) |

When two charts fit, such as a flow that could be a `flowchart` or a `sequenceDiagram`, use `sequenceDiagram` when who acts and the order of messages matter, and `flowchart` when branches and decisions matter more than order.

## Common syntax


- **Start every diagram with a type declaration**: `flowchart TD`, `sequenceDiagram`, `stateDiagram-v2`, `erDiagram`, `classDiagram`. A block without one does not render.
- **Direction** (flowchart and state diagram): `TD` or `TB` runs top-down, `LR` left to right, `BT` bottom-up and `RL` right to left. Use `LR` for pipelines and flows, `TD` for trees and decisions.
- **Quote labels with special characters.** Quote any label that contains `()`, `[]`, `{}`, `:`, `,` or quotes: `A["Process (step 1)"]`. Unquoted special characters cause most parse failures.
- **Define a node once, then refer to it by id.** Give a node its shape and label on first use (`A[Start]`), then write only `A`.
- **Comments** start with `%%` on their own line.
- **Leave out decoration and any detail the reader does not need.**

## Validation (mandatory)

Mermaid's syntax is strict, and an invalid diagram renders as a broken code block with no warning. Validate every diagram before you show it. Write the diagram to a temp file and feed the file to the validator; do not pass a multi-line diagram as an inline shell string, because shell quoting breaks it and the validator reports errors that are not in the diagram.

1. **Write** the raw diagram body (the text between the ` ```mermaid ` fences, without the fences) to a temp file with the `Write` tool, such as `/tmp/diagram.mmd`.
2. **Run** the validator, which reads the diagram from stdin:
   ```bash
   bash ${CLAUDE_PLUGIN_ROOT}/skills/mermaid/scripts/validate-mermaid.sh < /tmp/diagram.mmd
   ```
3. **Read the result.** The script prints JSON; check `isValid` and `errors[]`:
   ```json
   {
     "isValid": false,
     "diagramType": "flowchart",
     "errors": [
       {
         "line": 2,
         "message": "Failed to parse flowchart: Parse error on line 2: ... Expecting 'SQE', ..."
       }
     ]
   }
   ```
   Exit codes: `0` valid, `1` invalid, `2` setup error.
4. If the diagram is invalid, **fix** it using the `line` and `message` of each error, then run the validator again until `isValid` is `true`.
5. **Render** the valid diagram and look at the image before you show the diagram. A diagram that parses can still draw wrong (see Rendering rules the validator cannot catch):
   ```bash
   npx -y -p @mermaid-js/mermaid-cli mmdc -i /tmp/diagram.mmd -o /tmp/diagram.png
   ```
   If mmdc reports that it cannot find `chrome-headless-shell`, install one and point mmdc at it:
   ```bash
   npx -y puppeteer browsers install chrome-headless-shell
   export PUPPETEER_EXECUTABLE_PATH=$(ls -d ~/.cache/puppeteer/chrome-headless-shell/*/chrome-headless-shell-linux64/chrome-headless-shell | tail -1)
   ```
   The installer fetches the newest version, and mmdc rejects any version other than its own unless `PUPPETEER_EXECUTABLE_PATH` points at a browser. Open `/tmp/diagram.png` with the `Read` tool. Check for clipped text, stray nodes or states, and a layout far wider or taller than the page.

The script parses with [mermaid-ast](https://github.com/neongreen/mermaid-ast), which runs the grammars vendored from mermaid itself, so a diagram it accepts is one mermaid parses. It covers 18 diagram types and installs itself on first run into `~/.cache/claude-plugins/mermaid-ast/`. The script accepts a leading frontmatter block and strips it before parsing. An error carries a `line` when the grammar reports one, and never a column.

### Validator limitations

- **ER diagrams**: the validator rejects a `%%` comment inside an `erDiagram`, although mermaid accepts it. Leave comments out of ER diagrams.

### Fixing common errors

- **Unquoted labels with special characters**: wrap them in quotes, `A["Total (USD)"]`, `B{"valid?"}`.
- **Wrong arrow for the diagram type**: `-->` in flowcharts, `->>`/`-->>` in sequence diagrams, `-->` in state and class diagrams. Mixing them fails.
- **Missing type declaration**: the first line that is not a comment must declare the diagram type.
- **`subgraph` or `state` block without its end**: every `subgraph` needs an `end`, and every composite `state X {` needs its `}`.
- **A node's shape declared twice**: declare the shape once; later references use the bare id.
- **Reserved word as a bare node id**: `end`, `class` and similar ids break parsing; rename the node or quote it.

## Rendering rules the validator cannot catch

The parser accepts these, and the renderer draws them wrong. Check for them in the rendered image after validation passes.

- **Long lines inside a container are cut.** A flowchart node, a subgraph title, a note in a sequence or state diagram, a class box, an entity box: the renderer clips any line in these that runs past about 24 characters. Break the text with `<br/>` at a word boundary before the 24th character, and again every 24 characters after that. Text outside a box is unaffected: edge labels, state transition labels and sequence messages wrap or extend on their own.
- **Curly braces and `<br/>` in sequence messages break some renderers.** A sequenceDiagram message carrying `{id}`-style braces or a `<br/>` tag parses, so the validator passes it, but some renderers (Obsidian's, observed) fail at the first such message and report the parse error on a later line. Keep sequence messages plain text, and put text that must be split into a note. `<br/>` inside flowchart node labels and sequence notes renders correctly, and so do commas, slashes and parentheses in messages.
- **A `;` inside state-diagram text ends the statement.** In a note or a transition label, the text after a `;` renders as stray states. Use a comma instead.
- **Markdown inside an `@{ shape, label }` label renders as plain text.** Leave markdown out of expanded-shape labels.
- **Mermaid ignores a subgraph's `direction` when edges cross its border.** Set the layout direction on the whole flowchart (`flowchart LR` or `flowchart TD`). When a flowchart grows too wide in one direction, redraw it in the other.
