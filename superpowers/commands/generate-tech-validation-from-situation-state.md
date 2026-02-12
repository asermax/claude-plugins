---
description: Generate a technical validation document from a situation state file, identifying and categorizing technical challenges
argument-hint: <state-file> [output-file]
allowed-tools: Read, Write, Edit, Glob, Grep, AskUserQuestion
---

# Generate Technical Validation from Situation State

Extract technical challenges from a situation state file (created by `/evolve-situation-state`), interview the user to fill gaps, and produce a structured technical validation markdown document.

## Parameters

- **$1 (state-file)**: Path to the situation state file (REQUIRED)
- **$2 (output-file)**: Output path for the generated document (optional, defaults to `./technical-validation.md` in the same directory as the state file)

## Example Usages

```bash
/superpowers:generate-tech-validation-from-situation-state "./state.md"
/superpowers:generate-tech-validation-from-situation-state "./project/state.md" "./project/tech-validation.md"
```

## Command Workflow

### Step 1: Read & Extract

**Read the state file and scan for technical challenges.**

Look through these sections (standard `evolve-situation-state` template):

- **Firm Decisions**: Filter for technical decisions (architecture choices, tool selections, implementation strategies). Ignore process/organizational decisions.
- **Blockers & Issues (Unresolved)**: Technical blockers that affect implementation.
- **Blockers & Issues (Resolved)**: Previously technical blockers whose resolution informs the validation (e.g., "backend infra already exists").
- **Technical Considerations**: The primary source — scan the entire section for implementation details, architecture discussions, and identified challenges.
- **Open Questions**: Filter for technical/implementation questions.
- **Custom sections**: Scan any user-added sections that contain implementation, architecture, or infrastructure content.

**For each challenge found, extract:**
- A short descriptive title
- The context/description from the state file
- Current status (resolved, in progress, pending, unknown)
- Whether it depends on external work (look for cues: "foundational pitch", "other team", "prerequisite", "design doc", "enabler", external URLs to design documents)
- Source references (which meetings/dates it was discussed)

**Deduplication**: The same challenge may appear across multiple sections (e.g., as a decision AND a blocker AND a technical consideration). Merge these into a single item, combining the context from all mentions.

### Step 2: Present & Interview

**Show the extracted list to the user and gather input.**

Present the challenges as a numbered list with title and a one-line summary each. Then use AskUserQuestion to ask:

1. **Completeness check**: "Is this list complete, or are there technical challenges I'm missing or items you'd like to remove/merge?"
   - Options: "List looks good", "Need to add/remove", "Merge some items"

2. **Detail level**: "What level of detail do you want for each challenge?"
   - Options:
     - "Brief (Recommended)" — title + 1-2 sentence implication
     - "Medium" — title + short paragraph with context and impact
     - "Detailed" — full context, alternatives considered, and implications

**If user wants to add/remove/merge**: Apply their changes to the list.

**Fill gaps**: For challenges where the build implication is unclear from the state file alone, ask targeted questions. Batch related questions together using AskUserQuestion (up to 4 questions at a time). Frame questions with specific options when possible rather than open-ended.

**Repeat** the interview if the user added new items or if new questions arise from their answers. Stop when the list is stable and all items have sufficient context for the chosen detail level.

### Step 3: Generate Markdown

**Produce the technical validation document.**

Structure:

```markdown
# Technical Validation

> _Sections below can be converted to collapsible/toggle blocks if stored in Notion._

### <emoji> <Challenge Title>

<Description paragraph explaining the build implication. If this is a dependency on external work, state it explicitly here (e.g., "Depends on the foundational pitch — requires X to be built before this pitch can use it."). If there's a related design document, link to it.>

<If the challenge has sub-items (e.g., multiple tools needed, multiple components), use a bulleted list:>
- Sub-item 1
- Sub-item 2
- Sub-item 3
```

**Guidelines:**
- Use `###` headings for each challenge (not `##`, to leave room for the user to add grouping headers above if desired)
- Add a relevant emoji to each title to make the document scannable
- Keep descriptions at the detail level the user chose in Step 2
- If a challenge is a dependency, weave that into the description naturally — don't create a separate section
- If a challenge references a design document or external resource, include the link
- Items with multiple sub-components (e.g., "backend tools: fetch, create, edit, delete") should use bulleted lists

**Write the file** to the output path ($2 or default).

### Step 4: Review & Iterate

Tell the user the file has been written and its path. Ask them to review it.

**Use AskUserQuestion:**
- "The technical validation has been written to `<path>`. Review the file and let me know if you'd like adjustments."
- Options: "Looks good", "Needs adjustments"

**If user wants adjustments:**
1. Read the current file
2. Apply the user's requested changes using Edit
3. Tell the user the file has been updated
4. Ask again if more changes are needed
5. Repeat until satisfied

### Step 5: Done

Confirm the final file path and that the document is ready.

---

## Important Notes

### State File Format

This command assumes the state file follows the `evolve-situation-state` template structure. If a section is missing, skip it — don't error. The command should work with partial state files that have at least some technical content.

### Interview Efficiency

- Batch questions together (up to 4 per AskUserQuestion call)
- Use specific options instead of open-ended questions when possible
- Don't ask about every item — only ones where the build implication is genuinely unclear from the state file
- One round of questions per batch, not one-by-one per item

### No Duplication

If the same technical fact appears in the state file across multiple sections (e.g., "backend tools exist" in both Decisions and Resolved Blockers), mention it once in the most relevant challenge item.

### Dependencies vs Challenges

Don't create separate sections for dependencies and challenges. Instead, if an item depends on external work, make that explicit in the item's own description. This keeps the document flat and scannable while still conveying dependency relationships.
