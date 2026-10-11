# Package layout on the canvas

`program-design`'s package layout reference still says what the part covers, what to read before proposing it and when it fits. The record keeps the annotated file tree.

## Representation

One `mermaid` shape holding a flowchart of the packages. Each package is a node labelled with its folder, its package name and how it is built or run. The workspace is a document node joined to the packages it holds, and a target that a package deploys to is a store or a cloud. Label each edge between packages with the names one package imports from the other, and colour each package by the deployable it belongs to, with the palette in superpowers:mermaid.

Under the shape, one or two lines: the artifacts the change publishes or builds, and the dependencies it adds.
