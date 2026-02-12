---
description: Generate an abridged summary from a situation state file, separating ongoing from resolved and using checklists
argument-hint: <state-file> [output-file]
allowed-tools: Read, Write, Edit, Glob, AskUserQuestion
---

# Generate Summary from Situation State

Produce an abridged version of a situation state file (created by `/evolve-situation-state`) — condensing content, separating ongoing from resolved, using checklists for action items, and minimizing redundancy.

## Parameters

- **$1 (state-file)**: Path to the situation state file (REQUIRED)
- **$2 (output-file)**: Output path for the generated summary (optional, defaults to `./state-summary.md` in the same directory as the state file)

## Example Usages

```bash
/superpowers:generate-summary-from-situation-state "./state.md"
/superpowers:generate-summary-from-situation-state "./project/state.md" "./project/summary.md"
```

## Command Workflow

### Step 1: Read & Analyze

**Read the full state file and understand its structure.**

- Identify all sections present (standard and custom)
- Note which items are resolved/completed vs active/pending in each section
- Understand the project's purpose from the Purpose field and Current State Overview
- Identify redundancy: same information repeated across sections

### Step 2: Generate Abridged Version

**Apply these transformation rules section by section:**

#### Summary (from Current State Overview)

Condense into 3-5 sentences max. Cover:
- Current phase/status
- What the project does (one sentence)
- Key constraints: appetite, timeline, resource allocation
- Main dependencies or blockers

Drop historical narrative (how we got here). Only state current reality.

#### Scope (from Scope Prioritization or equivalent)

- Keep the prioritized/numbered list but shorten each item's description to one line
- Deferred/nice-to-have items go under a `#### Deferred` subsection

#### Key Context Sections (country-specific rules, approaches, etc.)

- Keep but condense to current state only
- Drop historical evolution (e.g., "originally we thought X, then shifted to Y" → just state Y)
- If a section is purely static background (Problem Statement, Goals), omit it — that belongs in the pitch, not a status summary

#### Decisions (from Firm Decisions)

- **Group thematically**, not chronologically. Identify themes by scanning decision topics (e.g., "Architecture", "UX", "Resources", "Country-specific rules")
- For each theme, only state the **current/active** decision. If a decision was superseded, only the replacement appears in the main list
- Use bulleted lists within each theme group
- Superseded/reversed decisions go under a `#### Superseded` subsection with strikethrough and a brief note of what replaced them

#### Blockers (from Blockers & Issues)

- **Active/unresolved** blockers as unchecked checklist items: `- [ ] **Title** — brief description *(Owner)*`
- **Resolved** blockers under a `#### Resolved` subsection as checked items: `- [x] Title → brief resolution`

#### Action Items

- **Convert from table to checklist format**
- Group into subsections:
  - `### In Progress` — items with "In Progress" status: `- [ ] Description *(Owner)*`
  - `### Pending` — items with "Pending" status: `- [ ] Description *(Owner)*`
- **Completed, superseded, and "not necessary"** items go under a `#### Completed` subsection: `- [x] Description *(Owner)* — brief outcome if notable`
- Drop items that are clearly obsolete or duplicated by other items in the list

#### Open Questions

- **Only unresolved questions**. Drop answered ones entirely (they're captured in Decisions or resolved items already)
- Use a bulleted list, not numbered (the original numbering is meaningless in the summary)

#### Metrics

- Keep as-is if already brief (3-5 lines)
- Condense if verbose

#### Sections to Omit Entirely

These are reference material, not status — they belong in the full state file:
- Change Log
- Source History
- Key Participants
- Project Context subsections that are static background (Problem Statement, Goals, Strategic Vision)

#### Custom Sections

If the user added custom sections to the state file, include them only if they contain active/current status information. Omit if they're purely reference material.

#### Redundancy Elimination

If the same information appears in multiple sections (e.g., a decision is also mentioned as a resolved blocker), keep it in the **most relevant** section only:
- Technical decisions → Decisions section
- Resolved problems → Blockers Resolved subsection
- Completed work → Action Items Completed subsection

### Step 3: Write File

**Add a note at the top of the generated file:**

```markdown
> _Subsections marked with #### (Resolved, Completed, Superseded, Deferred) can be converted to collapsible/toggle blocks if stored in Notion._
```

Write the generated markdown to the output path ($2 or default).

### Step 4: Review & Iterate

Tell the user the file has been written and its path. Ask them to review it.

**Use AskUserQuestion:**
- "The summary has been written to `<path>`. Review the file and let me know if you'd like adjustments."
- Options: "Looks good", "Needs adjustments", "Too long still"

**If "Needs adjustments":**
1. Read the current file
2. Apply the user's requested changes using Edit
3. Tell the user the file has been updated
4. Ask again if more changes are needed

**If "Too long still":**
1. Ask what to cut or prioritize using AskUserQuestion
2. Apply cuts
3. Re-present

Repeat until satisfied.

### Step 5: Done

Confirm the final file path and that the summary is ready.

---

## Important Notes

### State File Format

This command assumes the state file follows the `evolve-situation-state` template structure. If sections are missing, skip them — the summary should only include sections that have content in the source file. Don't generate empty sections.

### Current State, Not History

The most important principle: the summary reflects **current reality only**. Historical evolution, how decisions changed over time, meeting-by-meeting progress — all of that stays in the full state file. The summary is a snapshot of "where things stand right now."

### Checklist Format

Action items use this format:
```markdown
- [ ] Brief description of what needs to be done *(Owner if known)*
- [x] Brief description of what was done *(Owner)* — outcome note
```

### Subsection Hierarchy

The summary uses these heading levels:
- `##` for main sections (Summary, Scope, Decisions, Blockers, etc.)
- `###` for subsections within main sections (In Progress, Pending, theme groups)
- `####` for resolved/completed/superseded groups that could become collapsibles

### Don't Invent Content

Only include information that exists in the state file. Don't infer, assume, or add context that isn't in the source. If something is unclear in the state file, it should be unclear in the summary too — or omitted.
