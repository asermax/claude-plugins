---
name: spec-delta
description: Write a specification for a delta
argument-hint: "[DELTA-ID]"
disable-model-invocation: true
---

# Delta Specification Workflow

Write a spec for a specific delta.

## Input

Delta ID: $ARGUMENTS (e.g., "DLT-001")

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles
- `katachi:working-on-delta` - Per-feature workflow

### Delta inventory
- `docs/planning/DELTAS.md` - Delta definitions

### Existing spec (if present)
- `docs/delta-specs/$ARGUMENTS.md` - Current spec to update or create

### Feature documentation (for context and impact discovery)
- `docs/feature-specs/README.md` - Feature capability index
- `docs/feature-specs/` - Existing feature specifications (read specific docs as needed)
- `docs/feature-designs/README.md` - Feature design index (optional, for design context)
- Use existing feature specs to understand current behavior that delta extends/modifies

### Templates and Guides
- `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/delta-spec.md` - Spec structure to follow
- `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/delta-design.md` - Design structure (for seeding design doc)
- `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/breadboarding.md` - UI flow guide (if needed)
- `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/spike-template.md` - Spike investigation template (if needed)

## Process

### 1. Check Existing State

If `docs/delta-specs/$ARGUMENTS.md` exists:
- Read current spec
- Check for drift: Has DELTAS.md description changed?
- Summarize to user: user story, key acceptance criteria, known edge cases
- Ask: "What aspects need refinement? Or should we review the whole spec?"
- Enter iteration mode as appropriate

If no spec exists: proceed with initial creation

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS "⧗ Spec"
```

### 2. Research Phase (Silent)

- Read delta description from `docs/planning/DELTAS.md`
- Explore related codebase areas if needed
- For deltas involving libraries/frameworks/APIs:
  - Research typical usage patterns
  - Understand standard behaviors and edge cases
- **Identify if this is a UI delta:**
  - Does it introduce new screens or views?
  - Does it modify user navigation or workflow?
  - Does it add interactive components (forms, dialogs, buttons)?
  - If YES to any: note key interaction flows that will need breadboarding
  - If NO to all (technical delta, bug fix, API-only): will skip UI Flow section
- Build complete understanding without asking questions

### 3. User Interview

Now that I've researched the delta, I'll present my understanding and collaborate on requirements.

**Present your understanding:**

Briefly summarize:
- What the delta is trying to achieve (the core change)
- The main user story or use case
- Any assumptions about scope, constraints, or priorities
- Key areas where you see multiple valid approaches

**Identify and ask about important decisions:**

Based on your research, propose an initial Requirements table (R table) and use it as the backbone for the interview. R0 should be the core goal; include requirements from the delta description, dependencies, and research with initial status values (Core goal, Must-have, Nice-to-have). Present it as a starting point for collaborative refinement.

Use AskUserQuestion to ask focused questions about:

- **Requirements refinement:**
  - Confirm, adjust, or remove proposed requirements
  - Surface missing requirements you didn't identify
  - Negotiate priority status (Must-have vs Nice-to-have vs Out)

- **Assumptions that need confirmation:**
  - "I'm assuming [X] - is this correct?"
  - "Should this handle [edge case Y] or is that out of scope?"

- **Approach choices where multiple options exist:**
  - "For [problem area], should we [approach A] or [approach B]?"
  - Each option should have a clear description of what it means

- **Scope and priority decisions:**
  - "Should we include [feature X] in this delta or defer it?"
  - "What's more important: [quality A] or [quality B]?"

- **Behavior clarifications:**
  - "When [situation], should the system [option A] or [option B]?"
  - Present options with clear behavioral descriptions

**Guidelines for effective questions:**
- Keep questions high-level and targeted toward important decisions
- Base questions on your research findings and assumptions
- Ask only about decisions that meaningfully affect the spec
- Each question should have 2-4 specific, actionable options
- Include "Other" option automatically for user-provided alternatives
- Avoid asking about obvious details or things already clear from DELTAS.md
- Don't overwhelm - focus on the decisions that truly need user input

**After the interview:**
- Finalize the R table incorporating user's input
- Incorporate user's answers into your understanding
- Note any areas where user deferred decisions or said "it's up to you"
- Proceed to impact discovery with clarified understanding

### 4. Impact Discovery (Silent)

**Auto-discover affected features by:**

1. **Analyze delta description** - identify capability areas mentioned
2. **Search feature-specs/** - find related feature documentation:
   - Glob for all feature docs: `docs/feature-specs/**/*.md`
   - Grep for keywords from delta description
   - Identify overlapping or related capabilities

3. **Determine impact type** for each affected feature:
   - **Adds**: Creates new sub-capability within domain
   - **Modifies**: Changes existing behavior documented in feature
   - **Removes**: Deprecates or removes documented capability

4. **Note impacts** for later inclusion in "Detected Impacts" section

### 5. Draft Complete Spec (with Decision Points)

Create full spec document following template:
- User story (who/what/why - specific and clear)
- Behavior description (inputs, outputs, what can go wrong)
- **Requirements table** (finalized R table from interview)
- **Acceptance criteria** (Given/When/Then format, grouped by requirement area — each R should map to one or more AC groups)
- Dependencies (deltas that must exist first)

**Add User Flow section (conditionally):**

If this is a UI delta (identified in research phase):
1. **Read breadboarding guide**: `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/breadboarding.md`
2. **Create breadboard diagram(s)** showing places, affordances, and navigation connections
3. **Write flow description** with entry point, happy path, decision points, exit points
4. **Ensure alignment with acceptance criteria** - each flow path should match criteria

If NOT a UI delta (technical, bug fix, API-only):
- **Delete the entire User Flow section from the template**
- Do not include empty breadboards

**Draft initial shape (not included in spec):**

After drafting the spec, draft an initial shape parts table:
- Identify the high-level mechanisms needed to satisfy the requirements
- Each part should describe what to build or change — a mechanism, not a constraint
- Flag parts with unknowns using ⚠️ in the Flag column, and include a description below the table for each flagged part explaining what needs investigation — the specific question or uncertainty about HOW
- This is a proposal — the user will refine it in the next step

**Run requirements coverage check (internal, not saved):**

Verify coverage between R table and initial shape:
- Every requirement (R) should have at least one shape part addressing it — missing parts indicate gaps in the solution
- Every shape part should trace back to at least one requirement — orphan parts indicate scope creep
- Note any gaps for presentation in the next step

**Decision Points:** If you encounter choices requiring user input, use AskUserQuestion:
- Ambiguous requirements with multiple interpretations
- Multiple valid technical approaches
- Missing context that affects design choices
- Trade-offs between competing concerns

**Add Detected Impacts section:**
```markdown
## Detected Impacts

### Affected Features
- **[path/to/feature.md]** - [Adds/Modifies/Removes]: [description]

### Notes for Reconciliation
- [What needs to change in feature docs]
- [New feature docs that need to be created]
```

Note any uncertainties or assumptions clearly.

### 6. Shape Collaboration

Present the initial shape parts table to the user for collaborative refinement. The shape bridges spec to design — the user must validate it before it gets seeded.

**Present:**
- The shape parts table with mechanism descriptions and unknowns
- A brief R→Shape mapping showing which parts address which requirements
- Any coverage gaps identified in the internal check

**Collaborate:**

Use AskUserQuestion or open discussion to refine the shape with the user:
- Confirm or adjust mechanism descriptions
- Add missing parts or remove unnecessary ones
- Discuss unknowns — does the user have insight that resolves them, or should they remain for design-phase spikes?
- Refine unknown descriptions: are they specific enough to guide investigation?
- Negotiate scope: are any shape parts over-engineering the solution?

Iterate until the user approves the shape. The approved shape is what gets passed to the reviewer and eventually seeded into the design doc.

### 7. External Validation (Silent)

Dispatch the spec-reviewer agent:

```python
Task(
    subagent_type="katachi:spec-reviewer",
    prompt=f"""
Review this delta specification.

## Delta Description (from DELTAS.md)
{delta_description}

## Completed Spec
{spec_content}

## Shape Parts (validated with user)
{shape_parts_table}

## Review Criteria (if spec includes User Flow section)
- Does breadboard accurately represent the described flows?
- Do affordances match acceptance criteria?
- Are all paths from breadboard covered by acceptance criteria?
- Are decision points in the flow documented?
- Is the flow description complete (entry, happy path, decisions, exit)?
"""
)
```

### 8. Apply Validation Feedback (Silent)

Apply ALL recommendations from spec-reviewer automatically:
- Fix coverage gaps
- Add missing edge cases
- Clarify ambiguous criteria
- Improve testability

**Decision Points:** If applying a recommendation requires a choice (multiple valid ways to fix, conflicts with earlier decisions), use AskUserQuestion.

Track changes made for presentation in next step.

**Auto-apply (no user input):**
- Clear fixes (typos, formatting, obvious gaps)
- Adding missing sections with clear content
- Reordering for clarity
- Standard compliance fixes

### 9. Present Validated Spec

Present the complete validated spec to the user in its entirety.

**Also present the final shape table** alongside the spec — show the shape parts table with any adjustments from reviewer feedback in step 8. Highlight changes from the version the user approved in step 6 if any were made. The user should see the complete output of the spec phase before finalizing.

Highlight any unresolved issues requiring input.
Invite feedback: "What needs adjustment in this spec or the shape?"

### 10. Iterate Based on User Feedback

Apply user corrections, additions, or changes to the spec and/or shape.
Re-run validation (steps 5-7) if significant changes.
Repeat until user approves both the spec and the shape.

### 11. Finalize

Finalize document to `docs/delta-specs/$ARGUMENTS.md`

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS "✓ Spec"
```

### 12. Seed Design Document

If `docs/delta-designs/$ARGUMENTS.md` does not already exist:

1. Read the delta-design template: `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/delta-design.md`
2. Create `docs/delta-designs/$ARGUMENTS.md` following the template structure:
   - Header linking to the spec, Status: Draft
   - `## Shape` section populated with the user-approved shape parts table from steps 5-10
   - All remaining template sections included but left empty for the design phase to fill

This bridges spec and design — the design phase starts with the shape already drafted.

Present summary:
```
"Delta spec complete:

ID: $ARGUMENTS
Detected impacts: [list of affected feature docs]
Design doc seeded with initial shape: docs/delta-designs/$ARGUMENTS.md

Next step: /katachi:design-delta $ARGUMENTS
```

## Workflow

**This is a validate-first process:**
- Research silently, then interview user on key decisions — build R table collaboratively
- Draft spec with R table and grouped AC, draft initial shape (not in spec)
- Run requirements coverage check internally, then **present shape to user for collaborative refinement**
- Auto-discover affected features
- Validate spec and user-approved shape with spec-reviewer agent (silent)
- Apply all validation fixes automatically (ask decisions when needed)
- Present validated spec **and final shape** with applied changes summary
- User provides feedback on both spec and shape
- Iterate until approved
- Finalize spec, then seed design doc with user-approved shape
