---
description: Review project state, find gaps, assess change impact
---

# Gap Analysis Workflow

Analyze the project state, find documentation gaps, and assess completeness.

## Context

**Skill to load:**
Load the `katachi:framework-core` skill for workflow principles.

**Project state:**
`@planning/VISION.md` - Project vision
`@planning/FEATURES.md` - Feature inventory
`@planning/DEPENDENCIES.md` - Dependency matrix

**Decision indexes:**
`@docs/architecture/README.md` - Architecture decisions (ADRs)
`@docs/design/README.md` - Design patterns (DES)

Read specs/, designs/, plans/ directories as needed for gap analysis.

## Process

### 1. Read Current State

Read all documentation:
- Vision document
- Features list with status
- Dependency matrix
- All specs, designs, plans
- All ADRs and DES

### 2. Check Documentation Completeness

For each feature:
- Does it have a spec?
- Does it have a design?
- Does it have a plan?
- Is status up to date?

Generate gap report:

```
## Documentation Gaps

### Missing Specs
- CORE-003: Feature description (no spec exists)
- UI-002: Feature description (no spec exists)

### Missing Designs
- CORE-002: Feature description (spec exists, no design)

### Missing Plans
- CORE-001: Feature description (design exists, no plan)

### Status Inconsistencies
- CORE-001: Status is "✓ Design" but no design file exists
```

### 3. Check Decision Coverage

Look for undocumented decisions:
- Code patterns that aren't in DES
- Technology choices without ADRs
- Conventions followed but not documented

```
## Potential Undocumented Decisions

### Technology Choices
- Using [library X] for [purpose] - no ADR exists
- Chose [approach Y] for [problem] - no ADR exists

### Patterns
- [Pattern Z] used in multiple files - no DES exists
```

### 4. Check Dependency Accuracy

Compare dependency matrix with actual code:
- Are all dependencies captured?
- Are there unused dependencies?
- Is phase ordering still correct?

```
## Dependency Concerns

### Possible Missing Dependencies
- CORE-003 appears to import from CORE-002 but no dependency marked

### Possible Stale Dependencies
- CLI-001 marked as depending on CORE-005 but no import found
```

### 5. Check Vision Drift

Compare current implementation with vision:
- Are all workflows being addressed?
- Is scope being followed?
- Are "not now" items creeping in?

```
## Vision Alignment

### Workflows
- [x] Workflow 1: Covered by CORE-001, CORE-002
- [ ] Workflow 2: No features address this yet
- [x] Workflow 3: In progress (DICT-001)

### Scope Concerns
- Feature X appears to be out of v1 scope
```

### 6. Present Analysis

Show comprehensive report to user.

Organize by severity:
1. **Critical**: Missing core documentation
2. **Important**: Gaps affecting future work
3. **Minor**: Nice-to-have improvements

### 7. Offer Next Steps

Based on gaps found:

```
"Based on this analysis, I recommend:

1. Create missing specs for: CORE-003, UI-002
2. Document decision for [library X] as ADR
3. Extract [pattern Z] into DES

Which would you like to address first?"
```

## Workflow

**This is an analytical process:**
- Read all documentation
- Check completeness
- Check decision coverage
- Check dependencies
- Check vision alignment
- Present findings
- Offer next steps
