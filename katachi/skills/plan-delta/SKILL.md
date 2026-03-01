---
name: plan-delta
description: Create step-by-step implementation plan for a delta
argument-hint: "[DELTA-ID] [team]"
disable-model-invocation: true
---

# Implementation Plan Workflow

Create an implementation plan for a specific delta.

## Input

Delta ID and optional team mode from: $ARGUMENTS

Parse arguments:
- First word: Delta ID (e.g., "DLT-001")
- Second word (optional): `team` to enable agent team planning. If absent, team mode is off.

Use the delta ID wherever file paths and status commands reference the delta (e.g., `docs/delta-specs/$ARGUMENTS[0].md`).

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles
- `katachi:working-on-delta` - Per-feature workflow

### Delta inventory
- `docs/planning/DELTAS.md` - Delta definitions

### Delta documents
- `docs/delta-specs/$ARGUMENTS[0].md` - What to build (requirements)
- `docs/delta-designs/$ARGUMENTS[0].md` - Why/how (design rationale)

### Project decisions
- `docs/architecture/README.md` - Architecture decisions (ADRs)
- `docs/design/README.md` - Design patterns (DES)

### Feature documentation (for reconciliation planning)
- Read affected feature specs from delta-spec's "Detected Impacts" section
- Read affected feature designs from delta-design's "Detected Impacts" section
- Plan should note which feature docs will need reconciliation after implementation

### Existing plan (if present)
- `docs/delta-plans/$ARGUMENTS[0].md` - Current plan to update or create

### Template
- `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/implementation-plan.md` - Structure to follow

## Pre-Check

Verify spec and design exist:
- If `docs/delta-specs/$ARGUMENTS[0].md` doesn't exist, suggest `/katachi:spec-delta $ARGUMENTS[0]` first
- If `docs/delta-designs/$ARGUMENTS[0].md` doesn't exist, suggest `/katachi:design-delta $ARGUMENTS[0]` first
- Plan requires both spec and design

## Process

### 1. Check Existing State

If `docs/delta-plans/$ARGUMENTS[0].md` exists:
- Read current plan
- Check for drift: Have spec or design changed?
- Summarize: steps, pre-implementation items, files to change
- Ask: "What aspects need refinement? Or should we review the whole plan?"
- Enter iteration mode as appropriate

If no plan exists: proceed with initial creation

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS[0] "⧗ Plan"
```

### 2. Research Phase (Silent)

- Read delta spec (`docs/delta-specs/$ARGUMENTS[0].md`)
- Read delta design (`docs/delta-designs/$ARGUMENTS[0].md`)
- Read relevant ADRs and DES patterns (not just indexes)
- Read dependency code as needed
- Explore codebase for implementation patterns
- Build complete understanding without asking questions

### 3. Draft Complete Plan (Silent)

Create full implementation plan following template:

**Pre-Implementation Checklist:**
- Spec read
- Design read
- Dependency code to read (specific files)
- Relevant ADRs (specific documents)
- Relevant DES patterns (specific documents)

**Implementation Steps:**
For each step:
- Create/modify: specific file paths
- What to do: specific instructions
- Test: how to verify this step

**Code Snippets in Plans:**
- Use snippets to indicate implementation points (e.g., where to add code)
- Include brief comments explaining what should happen at each point
- Do NOT include complete implementation logic
- The implementation agent has access to spec, design, ADRs, and DES patterns—the plan should provide structural guidance, not code

Example of appropriate snippet usage:
```python
# In src/services/auth.py, after the existing validate_token function:

# Add new function here to handle token refresh
# - Should follow DES-002 error handling pattern
# - Must validate refresh token expiry per spec AC-3
```

Example of over-specified snippet (avoid):
```python
def refresh_token(refresh_token: str) -> TokenResponse:
    if not refresh_token:
        raise AuthError("Missing refresh token")
    decoded = jwt.decode(refresh_token, SECRET_KEY, algorithms=["HS256"])
    if decoded["exp"] < time.time():
        raise AuthError("Token expired")
    # ... full implementation
```

Ensure:
- Every acceptance criterion has implementing steps
- Steps are in dependency order
- Steps are atomic and verifiable

**Files Changed:**
- List all files to be modified
- Include test files

### 3b. Plan Team Structure (Only when team mode is on)

Skip this step entirely if team mode is off.

After drafting the implementation steps, analyze them for agent separation:

**Separation criteria** (in priority order):
1. **Stack separation**: Backend vs frontend steps that touch entirely different file sets
2. **Independent backend paths**: Different endpoints, services, or modules with no shared state changes
3. **Independent frontend paths**: Different pages, features, or component trees with no shared components being modified

**Rules for agent separation**:
- Each agent must work on a completely independent set of files — no two agents may modify the same file
- Prefer fewer agents over more — only split when there is genuine parallelism
- Maximum 4 agents (diminishing returns beyond this; coordination overhead grows)
- If all steps are sequential with shared file dependencies, do NOT create a team (even if team mode is on) — note this in the plan and explain why
- Each agent should have at least 3 steps to justify the overhead

**What to include in the Team Structure section**:
- Agent table: name, scope (language/area), assigned steps
- Per-agent pre-implementation checklist items (which files each agent needs to read)
- Synchronization notes: cross-agent dependencies, ordering constraints, shared types or schemas
- Steps grouped under agent headers (e.g., `### Backend Agent`, `### Frontend Agent`)

**Step grouping**: When team structure is present, group steps under agent headers:

```markdown
### Backend Agent

#### Step 1: ...
#### Step 2: ...

---

### Frontend Agent

#### Step 3: ...
#### Step 4: ...
```

Each agent's steps should be independently sequential (ordered within the agent), but agents run in parallel with each other.

**If team structure is NOT viable** (all steps share files, fundamentally sequential, or < 6 total steps), omit the Team Structure section from the plan and add a note explaining why a single-agent approach is better.

### 4. External Validation (Silent)

Dispatch the plan-reviewer agent to validate the draft:

```python
Task(
    subagent_type="katachi:plan-reviewer",
    prompt=f"""
Review this implementation plan.

## Delta Spec
{spec_content}

## Delta Design
{design_content}

## Implementation Plan
{plan_content}

## Relevant ADR/DES Summaries
{adr_des_summaries}
"""
)
```

### 5. Apply Validation Feedback (Silent)

Review the plan-reviewer findings and apply improvements:
- Address any coverage gaps (missing acceptance criteria)
- Fix dependency ordering issues
- Resolve ADR/DES conflicts
- Incorporate suggested improvements
- If team structure is present, address any team structure issues (file conflicts, missing sync points, agent count concerns)

If the reviewer identified critical issues that require clarification, note them for discussion with the user.

### 6. Present Validated Plan

Present the complete validated plan to the user in its entirety.
Highlight any unresolved issues that need user input.

If team mode is on and a team structure was included, highlight the agent assignments and synchronization points for the user to review.
If team mode was on but team structure was deemed not viable, explain why.

Invite feedback: "What needs adjustment in this plan?"

### 7. Iterate Based on Feedback

Apply user corrections, additions, or changes.
Re-run validation if significant changes are made.
Repeat until user approves the plan.

### 8. Finalize

Once user approves, save to `docs/delta-plans/$ARGUMENTS[0].md`

Update status:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status set $ARGUMENTS[0] "✓ Plan"
```

Present summary:
```
"Delta plan complete:

ID: $ARGUMENTS[0]

Next step: /katachi:implement-delta $ARGUMENTS[0]
```

## Workflow

**This is a validate-first process:**
- Research silently, then draft
- Analyze for team structure (if team mode is on)
- Validate with plan-reviewer agent
- Apply validation feedback
- Present validated plan to user
- User provides feedback
- Iterate until approved
- Finalize after user approval
