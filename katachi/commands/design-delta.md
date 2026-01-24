---
argument-hint: [DELTA-ID]
description: Write design rationale for a delta
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
- `docs/planning/DEPENDENCIES.md` - Delta dependencies

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

### Template
- `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/delta-design.md` - Structure to follow

## Pre-Check

Verify spec exists:
- If `docs/delta-specs/$ARGUMENTS.md` doesn't exist, suggest running `/katachi:spec-delta $ARGUMENTS` first
- Design requires a spec to design against

## Process

### 1. Check Existing State

If `docs/delta-designs/$ARGUMENTS.md` exists:
- Read current design
- Check for drift: Has spec changed?
- Summarize: design approach, key decisions, modeling choices
- Ask: "What aspects need refinement? Or should we review the whole design?"
- Enter iteration mode as appropriate

If no design exists: proceed with initial creation

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS "⧗ Design"
```

### 2. Research Phase (Silent)

**Internal Research:**
- Read delta spec (`docs/delta-specs/$ARGUMENTS.md`)
- Read dependencies from `docs/planning/DEPENDENCIES.md`
- Read dependency specs if they exist
- Read relevant ADRs from index
- Read relevant DES patterns from index
- Explore related codebase areas if needed

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

### 3. Impact Discovery (Silent)

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

### 4. Draft Complete Design (with Decision Points)

Create full design document following template:
- Problem context (what problem, constraints, interactions)
- Design overview (high-level approach, main components)
- Modeling (entities, relationships, domain model)
- Data flow (inputs → processing → outputs)
- Key decisions (choice, why, alternatives, consequences) - see research requirements below
- System behavior (scenarios, edge cases)

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

### 5. External Validation (Silent)

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
"""
)
```

### 6. Apply Validation Feedback (Silent)

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

### 7. Present Validated Design

Show complete validated design to user.
Include summary of validation findings that were applied.
Highlight any unresolved issues requiring input.
Invite feedback: "What needs adjustment in this design?"

### 8. Iterate Based on User Feedback

Apply user corrections, additions, or changes.
Re-run validation (steps 5-6) if significant changes.
Repeat until user approves.

### 9. Detect Patterns for DES

If agent or user identifies repeatable patterns:
- Ask if pattern should become a DES
- Offer to create DES document
- Update design to reference new DES

### 10. Finalize

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
- Research silently, then draft (ask decisions when needed)
- Auto-discover affected feature designs
- Validate with design-reviewer agent (silent)
- Apply all validation fixes automatically (ask decisions when needed)
- Present validated design with applied changes summary
- User provides feedback
- Iterate until approved
- Surface patterns for DES
- Finalize after user approval
