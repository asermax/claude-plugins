# Render functions outside the JSX

verified: 2026-11-26

Answers where a piece of JSX that a component renders conditionally or per item may live: inside the JSX, in a function in the component body, or in a child component.

## Knowledge

- A render function written inline inside the JSX is fine: a `.map` callback, or a render prop such as `renderItem={(item) => <Row item={item} />}`.
- Do not define a render function as a variable or a nested function in the component body and call it from the JSX, such as a `renderHeader()` that holds a conditional render. Keep the conditional in the JSX, and when its branches grow, extract a child component. A child component can be tested on its own and takes part in React's reconciliation and memoization.
- Logic used once may still go into a helper in the component when writing it inline would make the JSX harder to read, as long as the helper computes a value and does not return JSX.

```tsx
// Avoid: render function defined in the component body and called from the JSX.
export const ResourcePanel = ({ resource }: Props) => {
  const renderHeader = () => (
    <header>
      <h2>{resource.name}</h2>
    </header>
  );

  return <section>{renderHeader()}</section>;
};

// Prefer: a child component.
const ResourcePanelHeader = ({ resource }: Props) => (
  <header>
    <h2>{resource.name}</h2>
  </header>
);

export const ResourcePanel = ({ resource }: Props) => (
  <section>
    <ResourcePanelHeader resource={resource} />
  </section>
);

// Fine: render function written inline in the JSX.
export const ResourceList = ({ resources }: ListProps) => (
  <ul>
    {resources.map((resource) => (
      <li key={resource.id}>{resource.name}</li>
    ))}
  </ul>
);
```

## Sources

- A frontend components guide's rule on render functions, 2026-11-14.
