# Callstack on the canvas

`program-design`'s callstack reference still says what the part covers, what to read before proposing it and when it fits. The record keeps the text tree.

## Representation

One `mermaid` shape per entry, holding a top-to-bottom flowchart from the request and its inputs to every response the entry can return. A check is a diamond, an action a rectangle coloured by the deployable that runs it, a refusal a red terminal with its status, and a success a green one. A failure that the entry handles without refusing the request is a dotted edge labelled with the error. Two entries that share their parts may share one shape.

Draw the flowchart as a diff, with the marks of `mermaid`'s diff reference: what exists today keeps its palette, a node or an edge the change adds gets the thick green outline, and an edge or a node the change removes stays in the diagram as a red dashed one. A path the change reroutes shows both its old edge, removed, and its new one, added.

Under the shape, the legend of those marks, then one or two lines stating the rule the flowchart implements.
