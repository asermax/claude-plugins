# Contract

A branch about what a component agrees with the rest of the system: what it is given, what it exposes for others to call or register, and what it hands on. Any process has a contract; the branch splits into the parts the component has, and a component with no interface or no output lacks that part.

## What it covers

Inputs: each value the component is given, where it comes from, whether it is required, what its default is, and how several sources of the same value combine. Interface: each member others call or register through, what question it answers and who asks it. Outputs: the value the component hands on, its parts, what each carries, which are optional and what absent means, and who validates it.

It does not cover how the component derives its output from its inputs; that is a rules branch. A value moving through several components is a data flow. It does not cover storage: a value that is persisted is a data model. Type names, function signatures and file formats are program design, except where a format is itself the decision, such as the file a configuration is read from.

## What it needs to question

Inputs:

- Which inputs exist, and which are required. What a missing required input does to the run.
- Where each comes from: an argument, a file, the environment, another component. When several sources can provide the same value, which wins, and whether a list-valued input merges or replaces.
- What the default is when a value is optional and absent.

Interface:

- Which members exist and who calls each.
- What each member answers, and what the caller must declare to use it.
- Whether the interface is closed or pluggable, and what a plug-in must provide to be accepted.

Outputs:

- The parts of the value and what each carries.
- Which parts are optional and what an absent part means, as opposed to an empty one.
- Whether the value is passed as produced or transformed on the way. Whether it has to cross a boundary, such as a process, a file, or a network, which constrains its shape.
- Who validates it, the producer or the consumer, and what an invalid value does.

## Representation

One form per part, each followed by its prose.

Inputs: a table, one row per input, with what it is, where it comes from and whether it is required. When sources combine, a top-to-bottom flowchart of the precedence follows the table.

| Input | What it is | Where it comes from | Required |
|---|---|---|---|
| Document | The file the run reads | Positional argument | Yes |
| Plug-ins | Sources to load | A list in the settings file; a repeatable flag adds entries | Yes |
| Writers | Output writers to run, by name | A list in the settings file; a repeatable flag adds entries | No, one default runs when the list is empty |

```mermaid
flowchart TD
    A[A settings value] --> B{"Given as a flag?"}
    B -->|"Yes, single value"| F((Flag value))
    B -->|"Yes, repeatable list"| M["The file list plus every flag occurrence"]
    M --> R((Merged list))
    B -->|No| C{"Present in the settings file?"}
    C -->|Yes| W((File value))
    C -->|No| D{"Has a default?"}
    D -->|Yes| K((Default))
    D -->|No| E(("Missing, the run fails"))
```

Interface and outputs: one flowchart per member, captioned `<member> · <when it is called>`. The caller and the component sit at the two ends. The call is a solid arrow from the caller, through a braces box holding what the call sends, to the component. The return is a dashed arrow labelled `returns` from the component, through a braces box holding what comes back, to the caller. A member that returns nothing has no return arrow. Each braces box lists its interface's name, then one line per field with its type, then in parentheses what the values mean. A value nested in another gets its own braces box, joined to its parent by a plain line. Style each flowchart with superpowers:mermaid's palette.

```mermaid
flowchart LR
  caller@{ shape: rect, label: "Caller" } -->|"create"| inp@{ shape: braces, label: "CreateParams
  resourceId: string
  (the row the caller just wrote)" }
  inp --> comp@{ shape: subproc, label: "Component" }
  comp -.-> out@{ shape: braces, label: "Instance
  id: string
  (stored on the row)" }
  out -.->|"returns"| caller
  classDef worker fill:#dbeafe,stroke:#2563eb,color:#1f2937
  classDef flow fill:#dcfce7,stroke:#16a34a,color:#1f2937
  classDef payload stroke:#d97706
  class caller worker
  class comp flow
  class inp,out payload
```

The prose for each member states what the diagram cannot: when the member is called, what an absent field means, who validates the value and what an invalid one does to the caller.
