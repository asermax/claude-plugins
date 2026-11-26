# react

- [`component-modules`](component-modules.md): a component and the parts only it uses as a folder that exports the component alone, picked by a switch over a type
- [`render-functions`](render-functions.md): where conditional or per-item JSX lives: inline in the JSX, never in a render function defined in the component body, and when it becomes a child component
- [`compose-pieces`](compose-pieces.md): what to do when a second caller needs different behaviour from a component, provider or hook: single-job pieces each caller composes, never a mode prop
