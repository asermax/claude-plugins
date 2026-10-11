# Callstack on the canvas

`program-design`'s callstack reference still says what the part covers, what to read before proposing it and when it fits. The record keeps the text tree.

## Representation

One `mermaid` shape per entry, holding a top-to-bottom flowchart from the request and its inputs to every response the entry can return. A check is a diamond, an action a rectangle coloured by the deployable that runs it, a refusal a red terminal with its status, and a success a green one. A failure that the entry handles without refusing the request is a dotted edge labelled with the error. Two entries that share their parts may share one shape.

Under the shape, one or two lines stating the rule the flowchart implements.
