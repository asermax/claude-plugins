# Naming booleans

verified: 2026-11-18

Answers how to name a variable, prop or state that holds a boolean.

## Knowledge

- A boolean starts with a prefix that makes the name read as a yes or no question about the thing it describes: `is`, `has`, `should`, `can`, `support` or `supports`, `show` or `hide`, `enable` or `disable`, `apply`, `open` or `close`, `expand` or `collapse`, `expanded` or `collapsed`. Examples are `isEditing`, `hasAccess`, `shouldRetry`, `canSubmit`, `showFooter` and `expanded`.
- The rule applies to local state as well as props: `const [isEditing, setIsEditing] = useState(false)`.
- A name a library already gives a boolean stays as the library gives it, such as `isPending` and `isError` on a TanStack Query result, or `disabled` and `checked` on a DOM attribute.
- A name that crosses a boundary the codebase does not own keeps the other side's name: an API response or body field (`requires_csat`), a library prop (`interactable`), an environment variable (`PERMISSIONS_ENABLED`), a URL search-param key (`panelOpen`).

## Sources

- Program design session, 2026-11-01: a form's local state named after the flag it held, renamed to `isEditing`.
