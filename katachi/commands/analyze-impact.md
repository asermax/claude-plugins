---
description: Analyze the impact of a proposed change on features and dependencies
argument-hint: "[change description]"
---

# Analyze Impact

Analyze the impact of a proposed change on existing features, dependencies, and documentation.

## Input

Change description: $ARGUMENTS (optional - will prompt if not provided)

## Context

**Skill to load:**
Load the `katachi:iterative-development` skill for impact analysis workflow.

**Feature inventory:**
`@planning/FEATURES.md` - Feature definitions and status
`@planning/DEPENDENCIES.md` - Feature dependencies and phases

**Decision indexes:**
`@docs/architecture/README.md` - Architecture decisions (ADRs)
`@docs/design/README.md` - Design patterns (DES)

Read specs/ and designs/ as needed during analysis.

## Pre-Check

Verify framework is initialized:
- If `planning/` doesn't exist, explain this command requires initialized framework
- If minimal features exist, note the analysis may be limited

## Process

### 1. Capture Change Description

If not provided in arguments, ask:
```
"Describe the change you're considering:
- What are you planning to change?
- Why is this change needed?
- What areas do you think might be affected?"
```

### 2. Dispatch Impact Analyzer

```python
Task(
    subagent_type="katachi:impact-analyzer",
    prompt=f"""
Analyze the impact of this proposed change:

## Change Description
{change_description}

## FEATURES.md
{features_content}

## DEPENDENCIES.md
{dependencies_content}

## Existing Specs
{list_of_spec_paths}

## Existing Designs
{list_of_design_paths}

Trace dependencies and report affected features, documents, and risk level.
"""
)
```

### 3. Present Findings

Show the analysis results in a clear format:

```
## Impact Analysis

### Change Summary
[What's being changed]

### Risk Level: [Isolated | Moderate | Significant | Structural]

### Directly Affected Features
| Feature | Impact | Reason |
|---------|--------|--------|
| CORE-001 | High | [reason] |
| API-002 | Medium | [reason] |

### Transitively Affected Features
| Feature | Path | Impact |
|---------|------|--------|
| UI-003 | CORE-001 → UI-003 | Medium |

### Documents Requiring Updates
- specs/CORE-001.md - Update acceptance criteria for X
- designs/API-002.md - Revise data flow for Y
- docs/architecture/ADR-005.md - Consider superseding

### Recommendations
1. [Action item]
2. [Action item]
```

### 4. Discuss Next Steps

Based on risk level, offer appropriate next steps:

**Isolated (1-2 features, no transitive):**
```
"This is a contained change. You can proceed with implementation.

Would you like to:
A) Start implementing (update affected specs first)
B) See more details about affected features
C) Cancel and reconsider"
```

**Moderate (3-5 features or limited transitive):**
```
"This change has moderate impact. I recommend reviewing affected specs before proceeding.

Would you like to:
A) Review affected specs
B) Create an ADR to document this decision
C) See the full dependency chain
D) Cancel and reconsider"
```

**Significant (5+ features or broad transitive):**
```
"This is a significant change with broad impact.

I recommend:
1. Creating an ADR to document the decision and rationale
2. Reviewing all affected specs and designs
3. Considering a phased implementation approach

Would you like to:
A) Create an ADR for this change
B) Review affected documents
C) Plan a phased approach
D) Cancel and reconsider"
```

**Structural (architecture or cross-cutting):**
```
"This change affects core architecture and has structural implications.

Before proceeding, I strongly recommend:
1. Creating an ADR with thorough alternatives analysis
2. Reviewing all affected areas in detail
3. Considering if this should be a new phase

This is a significant decision. Would you like to:
A) Start a detailed architecture discussion
B) Create an ADR to explore options
C) See affected areas in detail
D) Cancel and reconsider"
```

### 5. Execute Chosen Action

**Review affected specs:**
- Read and summarize each affected spec
- Highlight which acceptance criteria are impacted
- Ask which to update

**Create ADR:**
- Transition to `/katachi:decision`
- Pre-fill context with impact analysis

**Plan phased approach:**
- Suggest breaking change into phases
- Show which features could be in each phase
- Offer to create implementation plan

## Integration with Other Commands

This command integrates with:
- `/katachi:decision` - For documenting significant changes
- `/katachi:spec-feature` - For updating affected specs
- `/katachi:add-feature` - When change requires new features

## Workflow

This is an informational command:
- Gather change description
- Dispatch agent for analysis
- Present findings clearly
- Offer appropriate next steps based on risk
- Execute user's chosen action
