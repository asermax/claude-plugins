# Browser validation

Drives a surface a person uses in a real browser. Assumes `validate` has settled how the surface's backend runs and which identity the run uses.

## Prerequisites

- **The surface is served**: a dev server or a built app, started the way the project's setup says. When the surface is not part of the backend's compose or task files, start it separately from its own repository and say so.
- **Its backend is up**, per the project's setup. When it is unclear which services back the surface, read the surface's repository for the base URLs it calls.
- **An authenticated session**, when the flow needs one, from the identity the user gave.

## Driving the browser

Before any browser action, load the `agent-browser` CLI's own skill content so its workflow, selector helpers and command catalog are in context:

```
agent-browser skills get core --full
```

Follow up with a specialized skill from its listing when one applies. From that point on, defer to the loaded content for every concrete action: navigation, selectors, cookie and storage injection, screenshots, eval-based assertions, cleanup. It is version-matched to the binary; this reference does not duplicate its syntax.

## Authenticating the session

Surfaces store their session differently: a cookie, a `localStorage` key, hydrated app state. Before driving:

- Read the surface's repository for how it reads the session, around its auth boundary.
- Inject the session in that shape with the mechanism the loaded `agent-browser` content documents.
- Set a cookie on the domain the surface's redirects land on. A cookie scoped to a host with a port is invisible to a request redirected to the bare host, and the surface then treats the session as anonymous.

A flow that needs no session skips this.

## Evidence

Every row leaves visual evidence in the report artifact `validate` requires. Prefer a recording of the whole row when the loaded `agent-browser` content exposes one; otherwise a screenshot at each meaningful moment, named after the row and the moment (`A1-01-before-submit.png`): the screen before the action, the action, the result, the state after. Under the visuals, the request the surface sent on the decisive action, from the network activity the tool exposes, and the stored state read back afterwards through the API. Both trimmed to what proves the row.

Confirm the final state through the accessibility tree or the DOM, not visual inspection alone.

## When the failure is behind the surface

When a backend the surface calls is the source of a failure, switch to `http.md` to observe the backend's behaviour in isolation, record it under the same row, and come back. The failure still goes to the user as a decision.
