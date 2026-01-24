# ASCII Breadboarding Guide

A technique from [Shape Up methodology](https://basecamp.com/shapeup/1.3-chapter-04) for documenting user interaction flows in specs.

## What is Breadboarding?

Breadboarding is a text-only notation for designing interaction flows at the right level of abstraction. It shows **what screens exist** and **how users navigate between them**, without getting into visual details.

The name comes from electrical engineering breadboards - prototypes that have all the components and wiring but no industrial design.

## When to Use Breadboarding

### Include Breadboards For:
- New screens or views
- New dialogs or modals
- Changes to navigation flows
- New user workflows
- Multi-step processes

### Skip Breadboards For:
- Technical deltas (tests, refactoring, infrastructure)
- Backend-only changes (APIs without UI)
- Bug fixes that don't change user flows
- Changes to existing flows where navigation is unchanged
- Simple CRUD with no workflow complexity

### Decision Tree

```
Is this a technical delta? → NO breadboarding
Does it involve new user workflows? → YES breadboarding
Does it only change existing behavior without new flows? → NO breadboarding
Does it add/change navigation between screens? → YES breadboarding
```

## Breadboarding Notation

Three elements only:

| Element | Representation | Purpose |
|---------|----------------|---------|
| **Places** | Underlined text | Screens, dialogs, menus - things users can navigate to |
| **Affordances** | Listed below places | Buttons, fields, links - things users can interact with |
| **Connections** | Arrows and lines | Navigation between places |

### Notation Characters

```
Place underlining:  ----------
Vertical flow:      |
Branching:          +
Arrow down:         v
Arrow right:        →
Arrow left:         ←
Arrow up:           ↑
```

## Basic Example

```
      Login
      -----
      - email field
      - password field
      - [Login] button
           |
           v
      Dashboard
      ---------
```

## Branching Example

```
      Login
      -----
      - email field
      - password
      - [Login] button
      - forgot password link
           |
     +-----+-----+
     |           |
     v           v
 Dashboard   Reset Password
 ---------   --------------
 - (app)     - email field
             - [Send] button
                   |
                   v
            Check Email
            -----------
            - instructions
            - [Back to Login]
```

## Guidelines

### 1. Focus on Flow, Not Layout

Breadboards show WHAT screens exist and HOW users move between them, not WHERE elements are positioned on screen.

**Good**: Shows navigation and decisions
**Bad**: Trying to show visual layout with ASCII boxes

### 2. Show Only Delta-Relevant Paths

Don't recreate the entire application navigation. Show only the flow being added or modified by this delta.

**Good**: New checkout flow from cart to confirmation
**Bad**: Every possible path through the entire app

### 3. Include Decision Points

Where does the user choose? Branch the diagram at decision points using `+` and `|`.

```
      Form
      ----
      - fields
      - [Submit]
           |
     +-----+-----+
     |           |
     v           v
  Success     Error
  -------     -----
```

### 4. Name Places Clearly

Use descriptive names that match your acceptance criteria. Users should recognize these screen names.

**Good**: "Checkout", "Order Confirmation", "Payment Details"
**Bad**: "Screen1", "Modal", "Page"

### 5. List Key Affordances Only

Don't exhaustively list every element. Show only affordances relevant to the flow.

**Good**:
```
  Login
  -----
  - email
  - password
  - [Login]
```

**Bad**:
```
  Login
  -----
  - header logo
  - navigation menu
  - email field
  - email label
  - password field
  - password label
  - show password checkbox
  - remember me checkbox
  - login button
  - forgot password link
  - sign up link
  - footer links
  - copyright text
```

### 6. Use Consistent Notation for Affordances

- Fields: "email field", "password", "search box"
- Buttons: "[Submit]", "[Cancel]", "[Save]" (use brackets)
- Links: "forgot password link", "terms link"
- Other: "(description)" for non-interactive context

### 7. Show the Complete Journey

Each breadboard should show a complete user journey from entry to exit. Don't show partial flows.

## Flow Description (Required)

The diagram alone is not enough. Always include a prose description with:

### Entry Point
How/when does the user enter this flow?

**Example**: "User clicks 'Checkout' button from shopping cart"

### Happy Path
Describe the main successful journey through the flow.

**Example**: "User enters payment details, reviews order, confirms purchase, sees confirmation with order number"

### Decision Points
What choices does the user make? What determines branching?

**Example**: "If payment fails, user sees error and can retry or change payment method. If validation fails, user sees inline errors and can correct fields."

### Exit Points
Where/how does this flow end?

**Example**: "Flow ends at Order Confirmation screen or when user clicks 'Continue Shopping'"

## Mapping to Acceptance Criteria

Each path through the breadboard should correspond to acceptance criteria.

| Flow Path | Acceptance Criterion |
|-----------|---------------------|
| Login → Dashboard | Given valid credentials, when user clicks Login, then user sees Dashboard |
| Login → Reset Password → Check Email | Given user clicks "forgot password", when they enter email, then they see confirmation |
| Login → Error (from failed login) | Given invalid credentials, when user clicks Login, then user sees error message |

## Examples by Type

### Simple Linear Flow

```
      Start
      -----
      - [Begin]
           |
           v
      Step 1
      ------
      - fields
      - [Next]
           |
           v
      Step 2
      ------
      - fields
      - [Submit]
           |
           v
      Complete
      --------
```

### Modal/Dialog Flow

```
      Main Page
      ---------
      - content
      - [Open Settings]
           |
           v
      Settings Dialog
      ---------------
      - options
      - [Save]
      - [Cancel]
           |
     +-----+-----+
     |           |
     v           v
  Main Page   Main Page
  ---------   ---------
  (saved)     (no change)
```

### Multi-Path Flow

```
         Upload
         ------
         - [Choose File]
         - [Upload]
              |
      +-------+-------+
      |               |
      v               v
  Processing      Invalid File
  ----------      ------------
  - progress      - error message
      |           - [Try Again]
      v                |
   Success             |
   -------             |
   - [Done] -----------+
                       |
                       v
                   Upload
                   ------
```

## Common Mistakes

### ❌ Too Much Detail
```
╔══════════════════════╗
║ Login Screen         ║
║ ┌──────────────────┐ ║
║ │ Email: [_______] │ ║
║ └──────────────────┘ ║
╚══════════════════════╝
```
This is a wireframe, not a breadboard.

### ❌ Missing Connections
```
  Login
  -----
  - email
  - [Login]

  Dashboard
  ---------
```
How does user get from Login to Dashboard?

### ❌ Unclear Place Names
```
  Screen1
  -------
  - thing
  - [button]
```
What screen? What thing? What button?

### ✅ Good Breadboard
```
      Login
      -----
      - email field
      - password field
      - [Login] button
           |
           v
      Dashboard
      ---------
      - user's tasks
      - recent activity
```

## Integration with Wireframes

- **Breadboards** (in specs) show the flow between places
- **Wireframes** (in designs) show the layout within a place
- Place names should be consistent between both
- Each place in a breadboard may have a corresponding wireframe in the design
