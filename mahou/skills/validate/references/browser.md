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

## Viewports

Every row runs twice, once at a desktop size and once at a mobile size, set through the viewport or device emulation that the loaded `agent-browser` content documents. Take the two sizes from `.mahou/validate.md`. When it names none, ask for them with the other inputs `validate` asks for. A row passes only when it passes at both sizes, and the report gives its result and evidence per size.

## Authenticating the session

Surfaces store their session differently: a cookie, a `localStorage` key, hydrated app state. Before driving:

- Read the surface's repository for how it reads the session, around its auth boundary.
- Inject the session in that shape with the mechanism the loaded `agent-browser` content documents.
- Set a cookie on the domain the surface's redirects land on. A cookie scoped to a host with a port is invisible to a request redirected to the bare host, and the surface then treats the session as anonymous.

A flow that needs no session skips this.

## Evidence

Every row leaves visual evidence in the report artifact `validate` requires. At each size the row runs at, take a screenshot of the screen before the action, the action, the result and the state after. Name each one after the row, the size and the moment (`A1-desktop-01-before-submit.png`). Add a recording of the whole row when the loaded `agent-browser` content exposes one. The recording does not replace the screenshots, because the visual check reads them. Under the visuals, the request the surface sent on the decisive action, from the network activity the tool exposes, and the stored state read back afterwards through the API. Both trimmed to what proves the row.

Against a local setup, a state that lasts only as long as a request ends in milliseconds, such as a trigger that shows a loading state or a view that shows a sending message. Capture it with the network slowed down. After the page loads, connect to the page through the DevTools endpoint that `agent-browser get cdp-url` returns, and send `Network.enable` and `Network.emulateNetworkConditions` with a latency of a few seconds. The emulated latency delays the response to the page, not the request. The server stores the record as soon as the request leaves, and the page stays in the pending state until the delayed response arrives.

Confirm the final state through the accessibility tree or the DOM, and confirm how the screen looks through "Checking how the screen looks". A row passes only when both confirm it.

## Checking how the screen looks

At each size, check the screen against what was decided for it: the row's expected outcome, the design notes, the program design's screen layout, and the parts of a prototype that a decision adopted. A difference from a part of a prototype that no decision adopted is not a failure.

- Read every screenshot the row took. Look for an element on the wrong side of its anchor, misaligned, overlapping another, clipped by its container, running off the viewport, or missing.
- Measure every placement the decisions state, such as a tooltip below its trigger or a menu inside the viewport. Read the bounding boxes of the elements involved and the viewport's size through an eval, and record the numbers next to the screenshot. When the numbers and the screenshot disagree, go by the numbers.
- For each element the decisions say is visible, read the topmost element at its centre through an eval. Anything other than the element or one inside it means something covers it.

A screen that departs from what was decided fails the row. Handle the failure as "Fixing what fails" in `validate` says. A visual defect no decision covers is a bug outside the rows: report it with its screenshot and do not fix it.

## When the failure is behind the surface

When a backend the surface calls is the source of a failure, switch to `http.md` to observe the backend's behaviour in isolation, record it under the same row, and come back. The failure still goes to the user as a decision.
