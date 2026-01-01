---
description: Create or update the project vision document
---

# Vision Document Workflow

Guide the user through creating planning/VISION.md.

## Context

**Skill to load:**
Load the `katachi:framework-core` skill for workflow principles.

**Vision document:**
`@planning/VISION.md` - if it exists

## General Guidance

Follow the collaborative workflow principles from the framework-core skill.

**Vision-specific guidance:**

**Use a scratchpad** - Track state in `/tmp/vision-state.md`:
- Current section being worked on
- Questions asked and answered
- Gaps identified
- Topics to revisit

## Process

### 0. Check Existing State

If `planning/VISION.md` exists:
- Read current vision document
- Read project state (features, specs, implementation progress if any)
- Summarize current state to user
- Ask: "What aspects need refinement? Or should we review the whole vision?"
- Enter iteration mode as appropriate

If no vision exists: proceed with initial creation

### 1. Understand the Problem

- What problem are you trying to solve?
- Who experiences this problem?
- How do they currently deal with it?

### 2. Research Existing Solutions

Use Task tool (general-purpose agent) to research:
- Existing solutions (commercial and open source)
- Technical approaches (models, frameworks, libraries)
- Known issues with alternatives
- Best practices and patterns

Synthesize findings to inform questions.

### 3. Define Core Workflows

- What are the main things a user will do with this software?
- For each workflow:
  - What triggers this workflow?
  - What's the end result?
  - What are the key steps?

### 4. Set Scope Boundaries

- What MUST be in v1? (included)
- What is explicitly NOT in v1? (excluded)
- Challenge scope creep: "Is this really necessary for v1?"

### 5. Technical Context

- Where does this run? (platform)
- How do users interact with it?
- What external systems does it connect to?
- DETECT: Platform/language/storage choices → prompt for ADR

### 6. Write the Document

- Show draft to user
- Ask for feedback
- Iterate until approved

### 7. External Validation

Dispatch a general-purpose subagent to review the completed vision.

Request structured critique covering:
- **Clarity**: Is the problem, solution, and scope clearly articulated?
- **Completeness**: Are workflows fully specified? Is technical context sufficient?
- **Internal consistency**: Do all sections align? Do workflows solve the problem?
- **Unstated assumptions**: What's implied but not explicit?
- **Scope boundaries**: Is v1 scope realistic? Are exclusions clear?
- **Gaps**: Between problem/workflows, workflows/scope, scope/technical context
- **Edge cases**: What scenarios aren't addressed?

Review subagent findings with user.
Ask: "Should we iterate on any section based on this feedback, or is the vision complete?"

## Decision Detection

When user mentions hard-to-change choices, offer to create ADRs:
- Platform choice → "Should we create an ADR for platform?"
- Language choice → "Should we create an ADR for language?"
- Storage approach → "Should we create an ADR for storage?"
- Model/library choice → "Should we create an ADR for this choice?"

## Workflow

**This is a collaborative process:**
- Ask one question at a time
- Agent proposes, user confirms
- User makes all decisions
- Provide research-backed alternatives
- Never fill gaps yourself
- Iterate until approved
