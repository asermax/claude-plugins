# Technical ASCII Diagrams Guide

A guide for documenting software architecture and design using ASCII diagrams in feature designs, delta designs, and decision documents.

## What are Technical Diagrams?

Technical diagrams are ASCII-based visual representations of software concepts like state machines, process flows, component interactions, and data models. They show **structure and relationships** at a conceptual level, not implementation details.

Purpose: Clarify complex concepts that are hard to express in prose alone. Good diagrams complement writing—they should not replace clear explanations.

## When to Use Technical Diagrams

### Include Diagrams For:
- Entity relationships and data models
- State machines and lifecycle transitions
- Multi-step processes with decision points
- Component interactions and integration flows
- Complex data flow through the system

### Skip Diagrams For:
- Simple linear processes (prose is clearer)
- Concepts already clear from prose description
- Implementation details better shown in code
- When the diagram would be more complex than helpful

### Decision Tree

```
Is the concept hard to express in prose? → Consider a diagram
Does it have states/transitions? → State diagram
Does it have decision points/branches? → Flow diagram
Does it show component interactions? → Sequence diagram
Does it show entity relationships? → ERD diagram
Could prose be just as clear? → Skip the diagram
```

## General Principles

- **Complement prose**: Always include text explanation alongside diagrams
- **Keep minimal**: Show only what aids understanding; omit obvious details
- **Embed inline**: Place diagrams within relevant document sections, not as standalone sections
- **Label clearly**: Use descriptive names, avoid abbreviations without explanation
- **Conditional use**: Delete diagram sections that don't apply to your feature

---

## State Diagrams

### When to Use
- Entities with lifecycle stages (e.g., Order: pending → shipped → delivered)
- State machines with transitions
- Status tracking systems
- Workflow states

### Notation

```
States:      [State Name]
Transitions: --[event/action]-->
```

### Basic Example

```
[Pending] --[approve]--> [Active] --[expire]--> [Expired]
    |                       |
    +-[reject]---> [Rejected]
```

### With Description Template

```
[State A] --[event1]--> [State B] --[event2]--> [State C]
    |
    +-[event3]---> [State D]
```

**States**:
- State A: [What this state represents]
- State B: [What this state represents]
- State C: [Final/terminal state]
- State D: [Alternative outcome]

**Transitions**:
- event1: [What triggers this transition]
- event2: [What triggers this transition]
- event3: [When alternative path is taken]

### Do's and Don'ts

**Do**:
```
[Draft] --[publish]--> [Published] --[archive]--> [Archived]
```
Clear, simple state names and transition labels

**Don't**:
```
[S1: d] --[p/v/s]--> [S2: pub/act] --[a]--> [S3: arc/del]
```
Cryptic abbreviations make diagrams harder to understand than prose

---

## Flow Diagrams

### When to Use
- Multi-step processes with decision points
- Algorithm logic with branches
- Conditional workflows
- Decision trees

### Notation

```
Steps:       [Step Name]
Decisions:   <Question?>
Arrows:      -->  (or →)
```

### Basic Example

```
[Start] --> [Validate Input] --> <Valid?> --Yes--> [Process] --> [End]
                                    |
                                    No
                                    ↓
                              [Show Error] --> [End]
```

### Complex Process Example

```
[User Request] --> <Authenticated?> --No--> [Login Flow] --+
                         |                                  |
                         Yes                                |
                         ↓                                  |
                  <Has Permission?> <-----------------------+
                         |
                         +--No--> [403 Error]
                         |
                         Yes
                         ↓
                  [Fetch Data] --> <Cache Hit?> --Yes--> [Return Cached]
                         |              |
                         |              No
                         |              ↓
                         +--------> [Query DB] --> [Update Cache] --> [Return Data]
```

**Process Description**:
- Entry: [When this flow starts]
- Decision points: [Key conditions that branch the flow]
- Exit: [How flow completes]

### Do's and Don'ts

**Do**:
```
[Request] --> <Valid?> --Yes--> [Process]
                  |
                  No
                  ↓
            [Reject]
```
Clear question in diamonds/brackets, obvious flow direction

**Don't**:
```
req→chk→ok?→yes→proc
       ↓no
      rej
```
Too terse; direction unclear; hard to scan

---

## Sequence Diagrams

### When to Use
- Component interactions and message passing
- API request/response flows
- Asynchronous operations
- Integration between systems
- Multi-layer communication

### Notation

```
Participants:  Listed as column headers
Messages:      Participant1 --[message]--> Participant2
Time:          Flows downward
Returns:       <--[response]--
```

### Basic Example

```
Client          Server          Database
  |                |                |
  |--[request]---->|                |
  |                |--[query]------>|
  |                |<--[result]-----|
  |<--[response]---|                |
  |                |                |
```

### With Async Operations

```
Frontend        Backend         Queue           Worker
   |                |              |               |
   |--[submit]----->|              |               |
   |<--[202 Accepted]              |               |
   |                |--[enqueue]-->|               |
   |                |<--[ack]------|               |
   |                |              |--[job]------->|
   |                |              |               |--[process]
   |                |              |<--[complete]--|
   |                |<--[notify]---|               |
   |<--[webhook]----|              |               |
```

**Participants**: [Explain role of each participant]

**Flow**:
1. [Describe the interaction sequence]
2. [Highlight key async patterns or timing]
3. [Note error handling if relevant]

### Do's and Don'ts

**Do**:
```
Client      API         DB
  |          |          |
  |--GET---->|          |
  |          |--query-->|
  |<--200----|          |
```
Vertical alignment, clear message labels, left-to-right flow

**Don't**:
```
C->A->D
D->A
A->C
```
Impossible to understand sequence; no visual structure

---

## Entity-Relationship Diagrams (ERD)

### When to Use
- Data model design
- Entity relationships and cardinality
- Database schema documentation
- Domain modeling

### Notation

```
Entities:       Entity
Relationships:  1---* (one-to-many)
                1---1 (one-to-one)
                *---* (many-to-many)
Hierarchy:      Parent
                ├─ Child1
                └─ Child2
```

### Basic Example

```
User 1---* Session
  |
  1
  |
  *
Order 1---* OrderItem *---1 Product
```

### With Hierarchy

```
Organization
├─ Department 1---* Employee
└─ Project
       |
       1
       |
       *
     Task 1---1 Employee (assignee)
```

**Entities**: [Explain each entity and its purpose]

**Relationships**:
- User-Session: One user can have many sessions
- Order-OrderItem: An order contains multiple items
- [Explain key relationships and cardinality]

### Nested Structure Example

```
Project
├─ has many Issues
│  ├─ has many Comments
│  └─ belongs to User (creator)
├─ has many Milestones
└─ belongs to Organization
```

### Do's and Don'ts

**Do**:
```
Author 1---* Book *---* Category
   |
   1
   |
   1
Profile
```
Clear cardinality notation, obvious relationships

**Don't**:
```
A─B
B─C
A─D
C─D
```
Unclear relationships; no cardinality; ambiguous direction

---

## Combining Diagram Types

Sometimes multiple diagram types work together:

### Example: Order Fulfillment

**State Diagram**:
```
[New] --[pay]--> [Paid] --[ship]--> [Shipped] --[deliver]--> [Delivered]
  |                |
  +-[cancel]------>|
                   +-[cancel]--> [Refunded]
```

**Data Model**:
```
Order 1---* OrderItem *---1 Product
  |
  1
  |
  *
ShipmentTracking
```

**Sequence** (payment flow):
```
Customer    Checkout    Payment    Warehouse
   |            |          |          |
   |--[pay]---->|          |          |
   |            |--[charge]>|         |
   |            |<--[ok]--- |         |
   |            |--[fulfill]--------->|
   |<--[confirm]|          |          |
```

Each diagram shows a different aspect of the same feature.

---

## Best Practices

### Keep Diagrams Minimal
- Show only what aids understanding
- Omit obvious implementation details
- Focus on concepts, not code structure

### Always Add Text Explanations
```markdown
## Data Flow

[Diagram showing flow]

**Description**: [Prose explanation of what the diagram shows and why it matters]
```

### Use Consistent Notation
- Stick to the patterns in this guide
- Don't invent new notation without explanation
- Match the style of existing diagrams in the project

### Embed Diagrams Inline
Don't create a standalone "Diagrams" section. Instead:

```markdown
## Modeling

The system models orders with a clear lifecycle:

[State diagram here]

Orders transition from New to Paid when payment succeeds...
```

### Update Diagrams During Reconciliation
- When reconciling deltas, validate diagrams against implementation
- Remove stale diagrams that no longer reflect reality
- Adjust diagrams to match actual system behavior

### Generic vs Specific
- Use generic examples in DES patterns (pattern essence, not specific code)
- Use specific examples in feature designs (actual domain entities)

---

## Quick Reference

| Need to Show | Use | Example |
|--------------|-----|---------|
| Lifecycle stages | State diagram | `[Draft] --[publish]--> [Published]` |
| Decision points | Flow diagram | `<Valid?> --Yes--> [Process]` |
| Component interactions | Sequence diagram | `Client --[request]--> Server` |
| Entity relationships | ERD | `User 1---* Order` |
| Nested hierarchy | Tree structure | `Parent├─Child1└─Child2` |

---

## Integration with Other Guides

- **Breadboarding** (User Flows): Use in specs for user navigation between screens
- **Wireframing** (UI Layout): Use in designs for visual interface structure
- **Technical Diagrams** (this guide): Use in designs for software architecture and data models

Each guide serves a different purpose—use the right tool for the right job.
