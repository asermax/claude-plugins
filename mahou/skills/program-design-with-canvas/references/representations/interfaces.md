# Interfaces on the canvas

`program-design`'s interfaces reference still says what the part covers, what to read before proposing it and when it fits. The record keeps the JSON Schemas.

## Representation

Two `mermaid` shapes. The first holds a class diagram of the shapes that cross between parts: one class per shape, its members with `?` on the optional ones, a stereotype for a union, and an edge for each shape that holds another. The second holds a flowchart of the calls between parts. Each part the branch adds or changes is a node, grouped by module and labelled with the operations it exposes. An edge runs from each caller to the part it calls, labelled with the call's direction or mode when it has one, such as `GET` or `PUT`.

Under the shapes, one or two lines on what the diagrams cannot show, such as the response an operation returns in a case that the record describes.
