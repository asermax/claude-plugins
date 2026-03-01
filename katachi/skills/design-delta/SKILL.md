---
name: design-delta
description: Write design rationale for a delta
argument-hint: "[DELTA-ID]"
disable-model-invocation: true
---

# Delta Design Workflow

Write design rationale for a specific delta.

## Input

Delta ID: $ARGUMENTS (e.g., "DLT-001")

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles
- `katachi:working-on-delta` - Per-feature workflow
- `superpowers:using-live-documentation` - Mandatory workflow for fetching current documentation

### Delta inventory
- `docs/planning/DELTAS.md` - Delta definitions

### Delta spec
- `docs/delta-specs/$ARGUMENTS.md` - The specification we're designing for

### Project decisions
- `docs/architecture/README.md` - Architecture decisions (ADRs)
- `docs/design/README.md` - Design patterns (DES)

### Existing design (if present)
- `docs/delta-designs/$ARGUMENTS.md` - Current design to update or create

### Feature documentation (for context and impact discovery)
- `docs/feature-designs/README.md` - Feature design index
- `docs/feature-designs/` - Existing feature designs (read specific docs as needed)
- `docs/feature-specs/README.md` - Feature capability index (for understanding features)
- Reference existing feature designs to understand current architecture
- Use existing design patterns and decisions from feature docs

### Templates and Guides
- `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/delta-design.md` - Structure to follow
- `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/wireframing.md` - UI layout guide (if needed)
- `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/spike-template.md` - Spike investigation template (for flagged unknowns)
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/technical-diagrams.md` - Technical diagram guidance
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/code-examples.md` - Code snippet guidance

## Pre-Check

Verify spec exists:
- If `docs/delta-specs/$ARGUMENTS.md` doesn't exist, suggest running `/katachi:spec-delta $ARGUMENTS` first
- Design requires a spec to design against

## Process

### 1. Check Existing State

If `docs/delta-designs/$ARGUMENTS.md` exists:
- Read current design
- **Check if this is a shape-only seed from spec phase:** If the design doc contains only a `## Shape` section with initial shape parts and the rest of the template sections are empty, treat it as a starting point — not an existing design to iterate on. Summarize the initial shape to the user, note any flagged unknowns (⚠️), and proceed with full design creation.
- **Otherwise (existing design with content):** Check for drift against spec, summarize design approach, key decisions, modeling choices. Ask: "What aspects need refinement? Or should we review the whole design?" Enter iteration mode as appropriate.

If no design exists: proceed with initial creation

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS "⧗ Design"
```

### 2. Research Phase (Silent)

**Internal Research:**
- Read delta spec (`docs/delta-specs/$ARGUMENTS.md`)
- Read dependencies from delta's `**Depends on**` field in `docs/planning/DELTAS.md`
- Read dependency specs if they exist
- Read relevant ADRs from index
- Read relevant DES patterns from index
- Explore related codebase areas if needed
- **Check if spec has User Flow section:**
  - If YES: Identify which places (screens) need wireframes
  - If NO: Check if UI component layer exists in design
  - Note which UI elements need wireframe documentation

**External Research (Mandatory):**

Your training data is outdated. Current documentation is always more accurate.

For each library, framework, or technical approach identified in the spec:

1. **Dispatch documentation-searcher agents** for all libraries/frameworks involved:
   - Provide library name, specific topic/feature, and what patterns you need
   - Get current API signatures, recommended patterns, version-specific guidance
   - Check for deprecation notices or migration guides

2. **Research alternative approaches** using WebSearch:
   - Query: "[problem domain] best practices [current year]"
   - Query: "[library name] vs alternatives [current year]"
   - Look for recent blog posts, conference talks, or official recommendations

3. **Research available up-to-date options**:
   - Search for current solutions to the problem domain (not just the library you know)
   - Query: "[problem we're solving] modern solution [current year]"
   - Discover options you might not have considered from training data
   - Compare approaches: performance, maintenance status, community adoption, compatibility

**Research must answer:**
- What are the current best solutions for this problem? (not just the ones we already know)
- Which options are actively maintained and recommended?
- What are the recommended patterns for our use case per current documentation?
- What alternatives exist and why should we prefer one over another?
- Are there newer, better approaches than what training data suggests?

Build complete understanding without asking questions, but do not proceed to design until external research is complete.

### 3. User Interview

Now that I've researched the spec, existing patterns, and current documentation, I'll present my design thinking and ask about important decisions.

**Present your design understanding:**

Briefly summarize:
- Your initial design approach based on research
- Key architectural decisions you're leaning toward
- Technology/library options you've discovered and your initial assessment
- Areas where multiple valid approaches exist
- Any uncertainties or assumptions from the spec

**Identify and ask about important decisions:**

Use AskUserQuestion to ask focused questions about:

- **Architectural approach choices:**
  - "Based on current research, should we use [approach A] or [approach B]?"
  - Each option should describe the trade-offs clearly (complexity vs flexibility, etc.)

- **Technology/library selections:**
  - "For [problem area], current research shows [option A] and [option B] - which should we prefer?"
  - Include key differences from your research (maintenance status, community adoption, etc.)

- **Design trade-offs:**
  - "Should we prioritize [quality A] or [quality B]?"
  - Present options with clear implications (e.g., "performance" vs "simplicity of implementation")

- **Uncertainties from spec:**
  - "The spec mentions [ambiguous requirement] - how should this be handled?"
  - Present design options that address different interpretations

- **Integration with existing patterns:**
  - "This could follow [existing pattern X] or use [new pattern Y] - which is better?"
  - Reference specific ADRs or DES from your research

**Guidelines for effective questions:**
- Keep questions high-level and targeted toward important decisions
- Base questions on your external research findings (documentation, search results)
- Ask only about decisions that significantly affect the design direction
- Each question should present 2-4 specific options with clear trade-offs
- Include "Other" option automatically for user-provided alternatives
- Avoid asking about trivial implementation details - focus on architectural and strategic decisions
- Don't re-validate spec decisions unless they impact design approach
- Don't overwhelm - focus on the decisions that truly need user input

**After the interview:**
- Incorporate user's preferences into your design approach
- Note any areas where user deferred decisions
- Proceed to impact discovery with clarified design direction

### 4. Impact Discovery (Silent)

**Auto-discover affected feature designs by:**

1. **Read delta spec** - identify affected features from "Detected Impacts" section
2. **Search feature-designs/** - find related design documentation:
   - For each feature path identified in spec
   - Grep for overlapping design concepts or components

3. **Determine design impact type**:
   - **Adds**: Creates new components or patterns within domain
   - **Modifies**: Changes existing design approach documented in feature
   - **Removes**: Deprecates or removes documented patterns

4. **Note impacts** for later inclusion in "Detected Impacts" section

### 5. Draft Complete Design (with Decision Points)

**Evolve the shape:**

If a design doc with initial shape parts exists (seeded by spec-delta):
- Read the initial shape parts table
- For any flagged unknowns (⚠️): dispatch `katachi:spike-runner` subagent(s) to investigate, then validate findings with the user
- Spikes may surface new requirements — if so, update the spec's R table and AC in `docs/delta-specs/$ARGUMENTS.md` before continuing
- Resolve flags: remove ⚠️ and update mechanism descriptions based on findings
- Evolve shape parts into more detailed mechanisms informed by research

If no initial shape exists: draft shape parts from scratch based on spec requirements.

The shape parts table stays in the design as a permanent section — it is not removed after evolution.

**Run requirements coverage check (internal, not saved):**

Verify coverage between the spec's R table and the evolved shape:
- Every requirement should have at least one shape part addressing it
- Every shape part should trace to at least one requirement
- Surface gaps to the user if found

**Create full design document following template:**
- Problem context (what problem, constraints, interactions)
- Design overview (high-level approach, main components)
- Shape (evolved shape parts table)
- Modeling (entities, relationships, domain model)
- Data flow (inputs → processing → outputs)
- Key decisions (choice, why, alternatives, consequences) - see research requirements below
- System behavior (scenarios, edge cases)

**Add UI Layout section (conditionally):**

If spec has User Flow section OR design involves UI components:
1. **Read wireframing guide**: `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/wireframing.md`
2. **Create ASCII wireframe(s)** for each place/screen, showing only delta-relevant UI
3. **Write layout explanation (REQUIRED)** with purpose, key elements, rationale, interactions
4. **Add state variations** if relevant to design decisions (loading, error, empty)

**Scope**: Show only delta-relevant portions (modal = just modal, form = just form section)

If NOT a UI delta (no User Flow section, no UI components):
- **Delete the entire UI Layout section from the template**
- Do not include empty wireframes

**Key decisions research requirements:**
- **Must include research sources**: Cite documentation version, search results, or official recommendations
- **Must address alternatives**: Document why alternatives were rejected based on research
- **Must confirm currency**: Note that proposed libraries/patterns are current per documentation

**For each technology choice, document:**
| Field | Content |
|-------|---------|
| Choice | The selected approach |
| Why | Reasoning based on research findings |
| Sources | Documentation version, WebSearch results, official docs |
| Options Researched | All solutions found for the problem, including ones not previously known |
| Why This Over Alternatives | Comparison based on current research, not training data assumptions |
| Consequences | Trade-offs, maintenance implications |

**Decision Points:** If you encounter choices requiring user input, use AskUserQuestion:
- Multiple valid architectural approaches
- Trade-offs between competing concerns (performance vs simplicity, etc.)
- Technology or library choices
- Missing context that affects design choices

**Add Detected Impacts section:**
```markdown
## Detected Impacts

### Affected Feature Designs
- **[path/to/feature-design.md]** - [Adds/Modifies/Removes]: [description]

### Notes for Reconciliation
- [What needs to change in feature design docs]
- [New design sections that need to be created]
- [Design decisions that need to be documented]
```

Note any uncertainties or assumptions.

### 6. External Validation (Silent)

Dispatch the design-reviewer agent:

```python
Task(
    subagent_type="katachi:design-reviewer",
    prompt=f"""
Review this delta design.

## Delta Spec
{spec_content}

## Completed Design
{design_content}

## ADR Index Summary
{adr_summary}

## DES Index Summary
{des_summary}

## Additional Review Criteria
- Verify all technology choices cite current documentation sources
- Check that options were researched broadly (not just validating a pre-assumed choice)
- Confirm research discovered current solutions, not just validated known libraries
- Validate design decisions are supported by up-to-date research, not training data
- Shape coverage: Does each spec requirement have at least one shape part? Are all flagged unknowns resolved? Are parts mechanisms (not constraints)?

## UI Layout Review (if design includes UI Layout section)
- Do wireframes correspond to places in the spec's breadboard?
- Are wireframes at appropriate detail level (not too detailed, not too sparse)?
- Are state variations covered where relevant to design decisions?
- Do layout decisions align with documented design rationale?
- Is wireframe scope appropriate (showing only delta-relevant UI)?
- Are layout explanations complete (purpose, key elements, rationale, interactions)?
"""
)
```

### 7. Apply Validation Feedback (Silent)

Apply ALL recommendations from design-reviewer automatically:
- Fix coherence issues
- Address pattern violations
- Add missing decision documentation
- Improve component clarity

**Decision Points:** If applying a recommendation requires a choice (multiple valid ways to fix, conflicts with earlier decisions), use AskUserQuestion.

Track changes made for presentation in next step.

**Auto-apply (no user input):**
- Clear fixes (formatting, missing sections with obvious content)
- Adding referenced patterns or decisions
- Clarifying component responsibilities
- Standard compliance fixes

### 8. Present Validated Design

Present the complete validated design to the user in its entirety.
Highlight any unresolved issues requiring input.
Invite feedback: "What needs adjustment in this design?"

### 9. Iterate Based on User Feedback

Apply user corrections, additions, or changes.
Re-run validation (steps 5-6) if significant changes.
Repeat until user approves.

### 10. Detect Patterns for DES

If agent or user identifies repeatable patterns:
- Ask if pattern should become a DES
- Offer to create DES document
- Update design to reference new DES

### 11. Finalize

Finalize document to `docs/delta-designs/$ARGUMENTS.md`

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS "✓ Design"
```

Present summary:
```
"Delta design complete:

ID: $ARGUMENTS
Detected impacts: [list of affected feature design docs]

Next step: /katachi:plan-delta $ARGUMENTS
```

## Decision Detection

When design reveals hard-to-change choices:
- Offer to create ADRs
- Offer to create/update DES patterns
- Ensure design references existing ADRs/DES

## Workflow

**This is a validate-first process:**
- Research silently (internal + external), then interview user on design decisions
- Draft incorporating user's input (ask additional decisions when needed)
- Auto-discover affected feature designs
- Validate with design-reviewer agent (silent)
- Apply all validation fixes automatically (ask decisions when needed)
- Present validated design with applied changes summary
- User provides feedback
- Iterate until approved
- Surface patterns for DES
- Finalize after user approval
