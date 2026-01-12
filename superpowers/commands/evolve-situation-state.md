---
description: Evolve a living state document from transcripts, documents, and external sources
argument-hint: <input> [state-file]
allowed-tools: Read, Write, Glob, Bash(find:*), Bash(stat:*), Bash(gh:*), WebFetch, mcp__notion__*, AskUserQuestion
---

# Evolve Situation State

Maintain a living state document that reflects the current reality of a project or situation, evolved incrementally from various inputs (transcripts, documents, external sources).

## Parameters

- **$1 (input)**: File path, directory path, or URL to process (REQUIRED)
- **$2 (state-file)**: Path to state markdown file (optional, defaults to `./state.md`)

## Processing Overview

1. Validate and detect input type
2. Load or initialize state file (with purpose inference for new files)
3. Clarify context if needed
4. Fetch content using available tools
5. Extract state-relevant information (guided by stored purpose)
6. Confirm changes with user
7. Merge updates into state
8. Report summary

---

## Step 1: Input Validation and Type Detection

**First, verify that input argument was provided** - it's required. If $1 is empty, show error and exit.

Determine what type of input you're working with:

```bash
# Check if input is a file or directory
stat "$1"

# Check if input looks like a URL (starts with http/https)
```

**Input type classification:**
- **Local file**: Check file extension (.txt, .md, .pdf, etc.)
- **Directory**: Find all processable files within
- **URL**: Detect domain pattern and select appropriate fetching tool

If input is a directory, discover processable files:
```bash
find "$1" -type f \( -name "*.txt" -o -name "*.md" -o -name "*.pdf" \)
```

Ask user which file(s) to process if multiple files are found.

**State file**: Use $2 if provided, otherwise default to `./state.md`

---

## Step 2: State File Handling

**If state file doesn't exist:**

1. Ask user for situation/project name using AskUserQuestion
2. Infer the state's purpose from the provided input content, then confirm with the user

   Analyze the input to determine what type of state this appears to be. Examples:
   - **Project progress tracking**: Input discusses milestones, deliverables, timelines → focus on progress, not technical details
   - **Feature design evolution**: Input contains technical decisions, architecture discussions → include technical details to keep design current
   - **General situation status**: Input covers personal or evolving matters → include all details relevant to that situation

   Present your inferred purpose to the user using AskUserQuestion:
   - Show what you understood from the input
   - Propose a purpose statement
   - Ask user to confirm or adjust

3. Initialize state file with this template:

```markdown
# [Situation/Project Name] - State

**Last Updated:** [current timestamp]
**Status:** 🔵 Active
**Purpose:** [confirmed purpose description]
**Sources:** [empty initially]

---

## Current State Overview
[Will be populated from first input]

## Firm Decisions
| Decision | Rationale | Date | Source |
|----------|-----------|------|--------|

## Blockers & Issues
### Unresolved

### Resolved

## Action Items
| Item | Owner | Status | Due |
|------|-------|--------|-----|

## Open Questions
[Categorized as needed]

## Key Participants
[People involved and their roles]

## Change Log
| Date | Source | Summary |
|------|--------|---------|

## Source History

---
<!-- Additional situation-specific sections can be added below -->
```

**If state file exists:**

Read the current state file to understand:
- Existing sections (including any custom sections the user added)
- Current decisions, blockers, action items, questions
- Previous sources processed
- Overall situation context

---

## Step 3: Clarify Context When Needed

**Before processing the input**, assess whether you have enough context to properly extract and update information.

**Clarify with the user if:**
- The state file doesn't exist (new situation)
- The input's purpose or type is unclear from its name/content
- You're uncertain what aspects to focus on during extraction
- The situation context is ambiguous or missing key information

**What to clarify:**
Use AskUserQuestion to gather whatever context you need to understand:
- What this situation/project is about and what's being tracked
- What this specific input represents and why it matters
- What information is most relevant to extract
- Any specific concerns or focus areas for this situation

**Guidelines:**
- Ask only what you actually need - don't ask unnecessary questions
- Frame questions based on what's unclear from the existing state and input
- Be specific about why you're asking (what will it help you do better)
- Skip clarification if the context is clear from the state file and input

---

## Step 4: Content Fetching

Use a smart, adaptive approach to fetch content:

### For Local Files
Read directly using the Read tool.

### For URLs

**Dynamic tool discovery approach:**

1. **Check what tools are available** - Inspect the environment for MCP servers and CLI capabilities
2. **Match tool to resource type** based on URL pattern:

   Known patterns (examples):
   - **Notion URLs** (`notion.so/*`) → Try `mcp__notion__fetch` if available
   - **GitHub URLs** (`github.com/*`) → Try `gh` CLI if available
   - **Other URLs** → Use `WebFetch` as fallback

   Use ANY other available MCP tools that can fetch the resource.

3. **Graceful degradation** - If no tool can successfully fetch the content:
   - Inform user what tools were attempted
   - Ask user to provide the content directly (paste, export file, etc.) using AskUserQuestion

**Examples:**

For Notion URL:
```bash
# Try Notion MCP if available
# mcp__notion__fetch with the URL
# If not available, inform user and request paste
```

For GitHub URL:
```bash
# Try GitHub CLI
gh api repos/owner/repo/readme
# Or try gh issue view, gh pr view, etc.
# If not available, try WebFetch
# If both fail, request from user
```

---

## Step 5: Analysis & Extraction

**Before extracting, review the state file's Purpose field** to understand what level of detail and which aspects are most relevant. The purpose guides your extraction focus - for example, a "project progress" state needs less technical detail than a "feature design" state.

This is a **content-driven** process - read and understand the actual content, then extract what's meaningful.

### For Meeting Transcripts

Transcripts typically have predictable structure (speakers, timestamps). Extract:
- **Speakers**: Who participated
- **Decisions made**: Firm conclusions or agreements reached
- **Action items assigned**: Tasks with owners
- **Blockers raised**: Problems or obstacles mentioned
- **Questions asked**: Unresolved questions or uncertainties
- **Agreements reached**: Consensus points

### For Other Documents

**Read and understand the content** - don't just summarize. Identify concrete, actionable information:

What to extract based on **what the document contains**:
- **Decisions or conclusions**: Firm choices made
- **Problems, blockers, or issues**: Obstacles or challenges
- **Tasks, action items, or next steps**: Work to be done
- **Questions or unknowns**: Areas of uncertainty
- **People involved and their roles**: Key participants
- **Timeline or milestone information**: Dates, deadlines, phases
- **Technical details or specifications**: Implementation details
- **Context that changes understanding**: New information that affects the situation

**Important**: Extract concrete facts and actionable items, not just general summaries. For example:
- Don't just say "discussed authentication"
- Instead: "Decided to use JWT tokens for authentication; Owner: Sarah; Due: Dec 30"

---

## Step 6: Confirm Changes with User

Before updating the state file, present the extracted information to the user for confirmation.

### Summary Guidelines

Present a clear summary of what will be added or updated, organized in a way that makes sense for the state's purpose and the content extracted.

**Tailor the summary to the state's purpose:**

- For **project progress tracking**: Focus on milestones, deliverables, status changes, blockers affecting progress
- For **feature design evolution**: Emphasize technical decisions, architecture changes, design rationale updates
- For **general situation status**: Highlight key developments, status changes, resolved/new concerns

**Types of information to include (when present):**

- New items being added to the state
- Existing items being updated or resolved
- Status changes or transitions
- Key participants or roles identified
- Important context or details

**Format guidance:**

- Group related changes together logically
- Use counts (X new, Y updates) to give scope at a glance
- List items briefly - just enough detail for user to understand what's changing
- Distinguish between new additions vs. updates to existing content

### Confirmation

Use AskUserQuestion with these options:
- **Apply changes**: Proceed to update the state file
- **Cancel**: Abort without modifying the state file

If user cancels:
- Report that no changes were made
- Exit the command gracefully

If user confirms:
- Proceed to Step 7 (State Update)

---

## Step 7: State Update with Intelligent Merging

Update the state file following these rules:

### Never Replace - Only Add or Update

**For each extracted item:**

1. **Check if it updates existing content**:
   - Decision mentioned again with new info → Update the existing row
   - Blocker marked as resolved → Move from Unresolved to Resolved
   - Action item status changed → Update the existing row
   - Question answered → Move to answered or remove from Open Questions

2. **If it's new content**:
   - Add new row to appropriate table
   - Add new question to Open Questions
   - Add new participant to Key Participants

### Track Sources

Every change must be linked to its source:
- Add source column entry (filename, URL, or "Manual input - [date]")
- Include date for all updates

### Update Metadata

- **Last Updated**: Current timestamp
- **Sources**: Add input source to the list if not already present
- **Status**: Update if situation status changed (optional)

### Preserve Custom Sections

If the user has added any custom sections below the standard template, **preserve them completely** - never modify or remove user-added sections.

### Add Change Log Entry

For every evolution, add an entry to the Change Log:

```markdown
| [current date] | [source name/path] | [brief summary of what was added/updated] |
```

### Add Source History Entry

Add a new section under Source History:

```markdown
### [Source Title] - [Date]
- Type: [transcript/document/url/manual]
- Link: [file path or URL if applicable]
```

---

## Step 8: Summary Output

After updating the state, provide a clear summary to the user:

**Report:**
1. **Input processed**: Name and type of source
2. **What was extracted**:
   - X decisions added/updated
   - X blockers added/resolved
   - X action items added/updated
   - X questions added/answered
   - X participants identified
3. **State file updated**: Path to state file
4. **Items needing attention**: Highlight any critical blockers or urgent action items

**Example summary:**
```
Processed: recording_20251226_142022.txt (meeting transcript)

Extracted:
- 3 decisions added
- 1 blocker resolved (API authentication)
- 4 action items added
- 2 new participants identified

State updated: ./project-state.md

⚠️  Critical blocker: Database migration pending (Owner: Alex, Due: Dec 28)
```

---

## Important Notes

### State Evolution Philosophy
- This is an **incremental, additive process** - you're building up a comprehensive picture over time
- State should reflect **current reality** - update items when new information changes their status
- **Traceability matters** - always link information to its source

### Content Quality
- Extract **concrete, actionable information** - not just summaries
- When in doubt, **read the full content** - don't skim
- **Preserve context** - include rationale and background when available

### Handling Ambiguity
- If a document doesn't clearly indicate decisions/actions/blockers, that's okay - extract what you can
- If you're unsure whether something is a decision vs. a question, ask the user
- If tool fetching fails, gracefully ask the user for help

### Directory Processing
- When given a directory, offer to process files individually or in batch
- Each file gets its own Source History entry
- Change Log can have multiple entries from the same batch

### Multiple Inputs
- You can run this command multiple times on different inputs
- Each run adds to the existing state
- Previous extractions are preserved and can be updated with new information

### Extensibility
- Users may add custom sections (e.g., "Technical Architecture", "Budget Tracking")
- Always preserve these sections - never remove or modify them
- Only update the standard sections defined in the template
