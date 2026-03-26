---
name: mermaid-validation
description: Validate mermaid diagram syntax after writing mermaid code blocks. Use this skill whenever you generate, write, or edit mermaid diagrams in markdown files — including flowcharts, sequence diagrams, class diagrams, state diagrams, ER diagrams, gantt charts, pie charts, mindmaps, gitgraph, and any other mermaid diagram type. Even if the diagram looks correct, always validate — subtle syntax errors silently break rendering. Trigger on any task that produces or modifies mermaid code blocks.
---

# Mermaid Validation

Validate mermaid diagram syntax immediately after generating or modifying mermaid code blocks in markdown files, and auto-fix any issues found.

## Why This Matters

Mermaid diagrams have strict syntax rules that are easy to get subtly wrong — missing semicolons, incorrect arrow syntax, unquoted labels with special characters, mismatched brackets in subgraphs. Invalid diagrams silently fail to render, leaving the user with a broken code block they have to debug themselves. Validating every diagram before delivering it catches these issues early.

## Workflow

After writing or editing any mermaid code block in a markdown file:

1. **Extract** each mermaid block from the file (the content between ` ```mermaid ` and ` ``` ` fences, not the fences themselves)
2. **Validate** by piping the content through the validation script
3. If invalid: **fix** the errors based on the validator output, then re-validate
4. Repeat until all blocks pass

## Validation Script

The script uses [merval](https://github.com/aj-archipelago/merval), a lightweight mermaid parser (~552KB, ~32ms). It auto-installs on first run to `~/.cache/claude-plugins/merval/`.

### Usage

Pipe raw mermaid content (without the fences) to stdin:

```bash
echo 'flowchart TD
    A[Start] --> B[End]' | bash ${CLAUDE_PLUGIN_ROOT}/skills/mermaid-validation/scripts/validate-mermaid.sh
```

- **Exit code 0**: valid diagram
- **Exit code 1**: invalid diagram (errors in JSON output)

### Output

The script outputs JSON. The key fields to check are `isValid` and `errors`:

```json
{
  "isValid": false,
  "diagramType": "flowchart",
  "errors": [
    {
      "line": 2,
      "column": 5,
      "message": "Expected closing bracket ]",
      "code": "PARSE_ERROR"
    }
  ]
}
```

## Fixing Common Errors

When the validator reports errors, use the line/column info and message to fix the issue in the original mermaid block, then re-validate. Common pitfalls:

- **Unquoted labels with special characters**: Labels containing `(`, `)`, `[`, `]`, `{`, `}` need quoting — e.g., `A["Process (step 1)"]`
- **Invalid arrow syntax**: Arrows must match the diagram type (`-->` for flowcharts, `->>` for sequence diagrams)
- **Missing diagram type**: Every block must start with a type declaration (`flowchart TD`, `sequenceDiagram`, `classDiagram`, etc.)
- **Subgraph/end mismatch**: Every `subgraph` needs a corresponding `end`
- **Incorrect node reuse**: Once a node is defined with a shape, later references should use just the ID without redefining the shape
