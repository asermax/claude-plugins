# ASCII Wireframing Guide

A technique for documenting UI layouts in design documents using low-resolution ASCII art.

## What are ASCII Wireframes?

ASCII wireframes are text-based visual representations of UI layouts using box-drawing characters. They show **structure and hierarchy**, not pixel-perfect designs.

Purpose: Document layout decisions at the right level of abstraction - detailed enough to guide implementation, but not so detailed that they constrain visual design.

## When to Use Wireframes

### Include Wireframes For:
- New UI components or screens
- Significant layout changes
- Complex form layouts
- Data display layouts (tables, cards, lists)
- Modal/dialog additions

### Skip Wireframes For:
- Technical deltas
- Backend-only changes
- Copy/text-only changes
- Style-only changes (colors, fonts) with no structure impact
- Changes with no layout impact

### Decision Tree

```
Is this a technical delta? → NO wireframes
Does spec have User Flow section? → Likely YES wireframes
Does it add/change visual structure? → YES wireframes
Is it only text/copy changes? → NO wireframes
Is it only styling (colors, fonts)? → NO wireframes
```

## Box Drawing Characters

### Basic Borders

```
Simple:    ┌─┐│└┘     ┌──────────┐
                      │          │
                      └──────────┘

Emphasis:  ╔═╗║╚╝     ╔══════════╗
                      ║          ║
                      ╚══════════╝

Rounded:   ╭─╮│╰╯     ╭──────────╮
                      │          │
                      ╰──────────╯
```

### Layout Dividers

```
Horizontal section:     ────────────────
Vertical division:      │
Section header:         ├───────────────┤
```

### When to Use Each Style

- **Simple (┌─┐)**: Default for most UI elements
- **Emphasis (╔═╗)**: Primary containers, important modals, headers
- **Rounded (╭─╮)**: Cards, friendly dialogs, modern UI elements

## UI Element Notation

### Form Elements

```
Entry field:     [_______________]
Filled field:    [john@example.com]
Text area:       ┌─────────────────┐
                 │ Multi-line      │
                 │ text entry...   │
                 └─────────────────┘
```

### Buttons

```
Button:          [ Submit ]
Primary button:  [[ Submit ]]
Disabled:        [ Submit ] (disabled)
Icon button:     [×]  [✓]  [+]
```

### Selection Controls

```
Checkbox:        [x] Selected  [ ] Unselected
Radio:           (•) Selected  ( ) Unselected
Toggle:          [ON ] or [ OFF]
Dropdown:        [Select option ▼]
```

### Content Placeholders

```
Text:        [Lorem ipsum dolor sit amet...]
Heading:     [Page Title]
Image:       [img: user avatar]
Icon:        [icon: search] or [🔍]
Avatar:      (👤) or (A) or (JD)
Loading:     [···] or [Loading...]
Data:        {user.name} or {count}
```

### Lists and Tables

```
List:        • Item one
             • Item two
             1. Numbered
             2. Items

Table:       ┌────────┬────────┐
             │ Header │ Header │
             ├────────┼────────┤
             │ Cell   │ Cell   │
             │ Cell   │ Cell   │
             └────────┴────────┘
```

## Guidelines

### 1. Low Resolution, Not Pixel-Perfect

Show structure and hierarchy, not exact proportions or spacing.

**Good**: Clear structure, readable
**Bad**: Trying to match exact pixel dimensions

### 2. Show Only Relevant Portions

For a delta that adds a new modal, show the modal. Don't redraw the entire page behind it.

**Relevance by Delta Type:**

| Delta Type | What to Show |
|------------|--------------|
| New dialog/modal | The dialog only, not the background |
| New form fields | The form section being modified, with context dividers |
| New page | The new page structure, reference navigation if relevant |
| Table changes | The table with new columns/rows highlighted |
| Layout refactor | Before/after wireframes showing the change |

### 3. Include State Variations When Relevant

Only show states that affect design decisions, not exhaustive enumeration.

**When to include:**

| State | When to Include |
|-------|-----------------|
| Loading | Async data fetching with meaningful loading UI |
| Empty | Lists, tables, search results that can be empty |
| Error | Form validation, API failures with specific error UI |
| Success | Confirmation messages or success states |
| Partial | Progressive loading, pagination |

### 4. Connect to Breadboards

Wireframes visualize places from the breadboard. Label them consistently.

**Example:**
- Breadboard has place: "Login"
- Wireframe title: "### Login Screen"

### 5. Document Layout Decisions

The wireframe alone is not enough. Always include Layout Explanation with:

#### Purpose
What is this screen for? Which breadboard place does it represent?

**Example**: "This is the Login screen from the authentication flow breadboard. It's the entry point for existing users."

#### Key Elements
Explain the main UI elements and their purpose.

**Example**: "Email and password fields for credentials, primary login button, secondary forgot password link for account recovery."

#### Layout Rationale
WHY are elements positioned this way? What hierarchy is being communicated?

**Example**: "Primary action (Login) is emphasized with double brackets and positioned prominently. Forgot password is secondary and placed below to avoid accidental clicks."

#### Interactions
What happens when user interacts with key elements?

**Example**: "Login button submits credentials and navigates to Dashboard on success. Forgot password link opens password reset flow."

## Basic Example

```
╭────────────────────────────────╮
│ Login                      [×] │
├────────────────────────────────┤
│                                │
│  Email                         │
│  [_______________________]     │
│                                │
│  Password                      │
│  [_______________________]     │
│                                │
│           [[ Login ]]          │
│                                │
│       [Forgot password?]       │
│                                │
╰────────────────────────────────╯
```

## Complex Example: Form with Sections

```
╭─────────────────────────────────────╮
│ Edit Profile                    [×] │
├─────────────────────────────────────┤
│                                     │
│  Profile Photo                      │
│  (👤)  [ Upload Photo ]             │
│                                     │
├─────────────────────────────────────┤
│  Basic Information                  │
├─────────────────────────────────────┤
│                                     │
│  Name                               │
│  [___________________________]      │
│                                     │
│  Email                              │
│  [___________________________]      │
│                                     │
│  Phone (optional)                   │
│  [___________________________]      │
│                                     │
├─────────────────────────────────────┤
│  Bio                                │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Tell us about yourself...   │    │
│  │                             │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│  {charCount}/500                    │
│                                     │
├─────────────────────────────────────┤
│           [ Cancel ] [[ Save ]]     │
╰─────────────────────────────────────╯
```

## State Variations Example

### Normal State
```
╭──────────────────────╮
│ Search               │
├──────────────────────┤
│ [Search... 🔍]       │
│                      │
│ • Result 1           │
│ • Result 2           │
│ • Result 3           │
╰──────────────────────╯
```

### Loading State
```
╭──────────────────────╮
│ Search               │
├──────────────────────┤
│ [Loading results...] │
│                      │
│     [···]            │
│                      │
╰──────────────────────╯
```

### Empty State
```
╭──────────────────────╮
│ Search               │
├──────────────────────┤
│ [No results found]   │
│                      │
│  [icon: 🔍]          │
│  Try a different     │
│  search term         │
│                      │
╰──────────────────────╯
```

### Error State
```
╭──────────────────────╮
│ Search               │
├──────────────────────┤
│ [Search failed]      │
│                      │
│  [icon: ⚠️]          │
│  Could not connect   │
│  [ Retry ]           │
│                      │
╰──────────────────────╯
```

## Layout Patterns

### Card Grid
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ [img]       │  │ [img]       │  │ [img]       │
│             │  │             │  │             │
│ [Title]     │  │ [Title]     │  │ [Title]     │
│ [desc...]   │  │ [desc...]   │  │ [desc...]   │
│ [ View ]    │  │ [ View ]    │  │ [ View ]    │
└─────────────┘  └─────────────┘  └─────────────┘
```

### Sidebar Layout
```
┌────────────┬──────────────────────────────┐
│            │                              │
│ • Nav 1    │  [Page Title]                │
│ • Nav 2    │                              │
│ • Nav 3    │  [Content area]              │
│            │                              │
│            │                              │
└────────────┴──────────────────────────────┘
```

### Modal Over Content
```
[Background content dimmed...]

    ╔════════════════════════╗
    ║ Confirm Action     [×] ║
    ╟────────────────────────╢
    ║                        ║
    ║ Are you sure?          ║
    ║                        ║
    ║ [ Cancel ] [[ OK ]]    ║
    ╚════════════════════════╝
```

### Responsive Hint
```
Desktop:                Mobile:
┌─────┬──────────┐     ┌──────────┐
│ Nav │ Content  │     │   Nav    │
│     │          │     ├──────────┤
└─────┴──────────┘     │ Content  │
                       │          │
                       └──────────┘
```

## Common Mistakes

### ❌ Too Detailed
```
┌─────────────────────────────────────────┐
│ Button with exactly 16px padding and   │
│ 2px border-radius in #007bff color     │
└─────────────────────────────────────────┘
```
This is too detailed. Wireframes don't specify colors or exact dimensions.

### ❌ No Context
```
┌──────────┐
│ [Button] │
└──────────┘
```
What screen is this? What's around it?

### ❌ Entire Application
```
[Drawing every screen in the app including
navigation, headers, footers, sidebars...]
```
Only show delta-relevant portions.

### ✅ Good Wireframe
```
╭────────────────────────────────╮
│ Add Task                   [×] │
├────────────────────────────────┤
│                                │
│  Task name                     │
│  [_______________________]     │
│                                │
│  Due date                      │
│  [2024-01-24 ▼]                │
│                                │
│        [ Cancel ] [[ Add ]]    │
│                                │
╰────────────────────────────────╯
```

## Integration with Breadboards

- **Breadboards** (in specs) show flow between places
- **Wireframes** (in designs) show layout within a place
- Place names should match between both
- Not every place needs a wireframe - only those with layout decisions
- Wireframes should reference which breadboard place they represent

## Accessibility Considerations

When documenting wireframes, note accessibility decisions:

```
╭────────────────────────────────╮
│ [icon: 🔍] Search              │  ← Icon has label for screen readers
├────────────────────────────────┤
│ [Search products...]           │  ← Placeholder is accessible
│                                │
│ Results (aria-live region):    │  ← Note dynamic content updates
│ • Item 1                       │
│ • Item 2                       │
╰────────────────────────────────╯
```

## Tools and Tips

### Creating Wireframes

Most text editors support box-drawing characters:
- macOS: Character Viewer
- Windows: Character Map
- Linux: Unicode input (Ctrl+Shift+u)

### Box Drawing Quick Reference

Copy these for easy reuse:
```
┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼ ─ │
╔ ╗ ╚ ╝ ╠ ╣ ╦ ╩ ╬ ═ ║
╭ ╮ ╰ ╯
```

### Maintaining Alignment

Use a monospace font in your editor to ensure proper alignment of ASCII art.
