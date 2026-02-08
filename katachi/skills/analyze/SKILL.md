---
name: analyze
description: Review project state, find gaps, assess change impact
disable-model-invocation: true
---

# Gap Analysis Workflow

Analyze the project state, find documentation gaps, and assess completeness.

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles

### Project state
- `docs/planning/VISION.md` - Project vision

### Feature documentation
- `docs/feature-specs/README.md` - Feature capability index
- `docs/feature-designs/README.md` - Feature design index
- Read all feature-specs/ and feature-designs/ for completeness analysis

### Decision indexes
- `docs/architecture/README.md` - Architecture decisions (ADRs)
- `docs/design/README.md` - Design patterns (DES)

## Process

### 1. Read Current State

Read all documentation:
- Vision document
- Feature specs index (README.md)
- Feature designs index (README.md)
- All feature-specs/ documents and domain READMEs
- All feature-designs/ documents and domain READMEs
- All ADRs and DES

### 2. Check Feature Documentation Completeness

For each capability domain:
- Does it have a README.md index?
- Are all sub-capabilities documented?
- Do sub-capabilities have both specs AND designs?
- Are related decisions referenced?

For the feature specs structure:
- Is docs/feature-specs/README.md present and complete?
- Are all domains listed in the top-level index?
- Do domain READMEs list all sub-capabilities?
- Are sub-capability descriptions accurate?

For the feature designs structure:
- Is docs/feature-designs/README.md present and complete?
- Does it mirror the specs structure?
- Are design docs paired with spec docs?
- Are design decisions documented?

Generate gap report:

```
## Feature Documentation Gaps

### Missing Domain READMEs
- auth/: No README.md to index sub-capabilities
- payments/: No README.md to index sub-capabilities

### Missing Feature Specs
- api/users.md: Referenced in design but no spec exists
- reporting/analytics.md: Mentioned in vision but not documented

### Missing Feature Designs
- auth/login.md: Has spec but no design document
- api/endpoints.md: Has spec but no design rationale

### Incomplete Domain READMEs
- auth/README.md: Missing sub-capability "password-reset"
- projects/README.md: Sub-capability statuses not updated

### Missing Top-Level Indexes
- feature-specs/README.md: Not present (need to create)
- feature-designs/README.md: Not present (need to create)

### Orphaned Documents
- feature-designs/old-auth.md: Not referenced in any README
```

### 3. Check Decision Coverage

Look for undocumented decisions:
- Code patterns that aren't in DES
- Technology choices without ADRs
- Conventions followed but not documented
- Feature specs/designs missing decision references

```
## Potential Undocumented Decisions

### Technology Choices
- Using [library X] for [purpose] - no ADR exists
- Chose [approach Y] for [problem] - no ADR exists

### Patterns
- [Pattern Z] used in multiple features - no DES exists
- [Convention] followed across designs - should be DES

### Missing Decision References
- auth/login.md design doesn't reference ADR for token storage
- api/endpoints.md design doesn't reference DES for error handling
```

### 4. Check Cross-Reference Integrity

Verify references between documents:
- Do feature designs reference relevant ADRs?
- Do domain READMEs list all sub-capabilities?
- Are capability domains listed in top-level README?
- Are decision indexes up to date?

```
## Cross-Reference Issues

### Broken References
- payments/refund.md references ADR-012 which doesn't exist
- auth/README.md lists "mfa.md" which doesn't exist

### Missing References
- api/users.md design should reference ADR-005 (database choice)
- reporting/analytics.md should reference DES-003 (query patterns)
```

### 5. Check Vision Alignment

Compare documented features with vision:
- Are all workflows covered by features?
- Are core requirements addressed?
- Are features aligned with project goals?

```
## Vision Alignment

### Workflows
- [x] Workflow 1: Covered by auth/ and api/ features
- [ ] Workflow 2: No features documented yet
- [x] Workflow 3: Covered by reporting/ features

### Core Requirements
- [x] Requirement A: Addressed by auth/login.md, auth/oauth.md
- [ ] Requirement B: Not yet documented
- [x] Requirement C: Addressed by api/ features

### Out of Scope
- Feature X appears to be out of v1 scope - should it be removed?
```

### 6. Present Analysis

Show comprehensive report to user.

Organize by severity:
1. **Critical**: Missing core feature documentation, broken structure
2. **Important**: Incomplete domains, missing decisions
3. **Minor**: Documentation improvements, style consistency

### 7. Offer Next Steps

Based on gaps found:

```
"Based on this analysis, I recommend:

1. Create missing feature docs: api/users.md (spec + design)
2. Create domain READMEs: auth/README.md, payments/README.md
3. Document decision for [library X] as ADR
4. Extract [pattern Z] into DES
5. Fix broken reference: payments/refund.md → ADR-012

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
