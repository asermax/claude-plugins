---
name: review-priorities
description: Conversational session to review and assign delta priorities
argument-hint: ""
disable-model-invocation: true
---

# Review Priorities

A conversational discovery session to assess and assign delta priorities holistically.

## Purpose

When you have multiple deltas and need to determine what to work on, this command helps you:
- Assess current priorities against your goals
- Identify priority inconsistencies
- Assign or reassign priorities based on current context
- Get recommendations for what to focus on

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles and priority tracking

### Delta inventory
- `docs/planning/DELTAS.md` - All deltas with current status and priority
- `docs/planning/DEPENDENCIES.md` - Delta dependencies

## Pre-Check

Verify framework is initialized:
- If `docs/planning/` doesn't exist, suggest `/katachi:init-framework` first
- If DELTAS.md or DEPENDENCIES.md missing, explain what's needed

## Process

### 1. Load Current State

Gather the full picture:

```bash
# Get summary of all deltas
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py summary

# Get priority breakdown
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py priority list

# Get ready deltas
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py ready
```

### 2. Present Initial Analysis

Summarize the current state for the user:

```
"Here's your current delta landscape:

**Status:**
- X ready to work on
- Y in progress
- Z blocked by dependencies

**Priority Distribution:**
- Critical (1): N deltas
- High (2): N deltas
- Medium (3): N deltas [includes X at default]
- Low (4): N deltas
- Backlog (5): N deltas

**Observations:**
- [High-impact blockers: deltas that block many others]
- [Deltas without explicit priority: still at default 3]
- [Any obvious inconsistencies]

Let's discuss your current priorities."
```

### 3. Discovery Questions

Ask about the user's current context. Ask ONE question at a time and wait for the answer.

**Goal-oriented questions:**
- "What are you trying to achieve this week/sprint?"
- "Are there any external deadlines or commitments?"
- "Which part of the system needs the most attention right now?"

**Constraint-oriented questions:**
- "Is there anything blocking you from working on certain areas?"
- "Are there any deltas you want to explicitly defer?"
- "Any dependencies on external factors (other teams, APIs, etc.)?"

**Clarification questions (as needed):**
- "You mentioned [X] - does that mean [specific deltas] should be higher priority?"
- "How urgent is [specific capability]?"

### 4. Propose Priority Assignments

Based on the conversation, draft a priority proposal:

```
"Based on our discussion, I suggest:

**Critical (1):**
- DLT-015: User authentication - blocks 5 other deltas, aligns with your deadline

**High (2):**
- DLT-008: API refactor - needed before auth, currently blocking
- DLT-012: Error handling - you mentioned reliability focus

**Medium (3):** (unchanged)
- DLT-003, DLT-007

**Low (4):**
- DLT-001: UI polish - nice to have, no urgency

**Backlog (5):**
- DLT-002: Advanced analytics - explicitly deferred

Does this align with your thinking? Any adjustments?"
```

### 5. Validate Priorities

Dispatch the priority-reviewer agent to check for inconsistencies:

```python
Task(
    subagent_type="katachi:priority-reviewer",
    prompt=f"""
Review these priority assignments for consistency.

## Proposed Priorities
{priority_assignments}

## Dependency Matrix
{dependency_info}

## User Goals
{stated_goals}

Check for:
- Priority inversions (high priority blocked by low priority)
- Bottlenecks (high-impact deltas with low priority)
- Goal alignment
"""
)
```

If the reviewer finds issues, present them to the user and iterate.

### 6. Iterate Based on Feedback

- Apply user corrections
- Re-validate if significant changes
- Repeat until user approves

### 7. Apply Priority Updates

Once confirmed, apply the changes:

```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py priority set DLT-015 1
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py priority set DLT-008 2
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py priority set DLT-012 2
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py priority set DLT-001 4
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py priority set DLT-002 5
```

### 8. Summary

Present the final state:

```
"Priorities updated:

**Changes made:**
- DLT-015: 3 → 1 (Critical)
- DLT-008: 3 → 2 (High)
- DLT-012: 3 → 2 (High)
- DLT-001: 3 → 4 (Low)
- DLT-002: 3 → 5 (Backlog)

**Suggested next delta:**
[Run `next` command and show result]

**Next actions:**
- Start work: /katachi:spec-delta [suggested delta]
- Review later: /katachi:review-priorities
"
```

## Workflow Principles

**This is a discovery session, not a checklist:**
- One question at a time
- Let the user's answers guide the conversation
- Don't go delta-by-delta; work at a strategic level
- Agent proposes, user confirms

**Focus on understanding context:**
- Goals and deadlines matter more than individual deltas
- Dependencies create implicit priorities
- Bottlenecks deserve attention

**Validate before applying:**
- Use priority-reviewer agent to catch inconsistencies
- Present issues to user, don't auto-fix
- User has final say on all assignments

## Error Handling

**No deltas exist:**
- Explain that priorities require deltas
- Suggest `/katachi:init-framework` or `/katachi:add-delta`

**User is unsure about goals:**
- That's OK - help them think through it
- Ask concrete questions: "What would success look like next week?"
- Suggest deferring explicit priority assignment until clearer

**Too many changes:**
- If adjusting 10+ priorities, confirm user wants to proceed
- Offer to focus on top-priority changes first
