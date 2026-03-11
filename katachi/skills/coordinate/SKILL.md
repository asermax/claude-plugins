---
name: coordinate
description: |
  Orchestrate the full delta workflow with sub-agents and GitHub review.
  Reads DELTAS.md for prioritization, spawns phase-executor agents to run
  each phase, and uses GitHub issues/PRs as the review channel.
argument-hint: "[DELTA-ID | 'next' | 'all']"
disable-model-invocation: true
---

# Delta Coordination Workflow

Orchestrate the full delta lifecycle end-to-end: spawn phase-executor sub-agents that load existing Katachi skills, relay their outputs to GitHub for review, and resume them with user feedback.

## Input

Mode based on `$ARGUMENTS`:
- **Delta ID** (e.g., `DLT-001`): coordinate that delta through its remaining phases
- **`next`**: pick the highest-priority ready delta via `deltas.py next`
- **`all`** or empty: process all deltas by priority order

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles

### Files
- `docs/planning/DELTAS.md` - Delta inventory with priorities, statuses, and dependencies

## Phase Map

Static mapping from current delta status to next action. This is the single source of workflow logic — the coordinator reads current status, looks up the next phase, and delegates accordingly.

| Current Status | Next Skill | Review Channel | Status on Start | Status on Complete |
|---|---|---|---|---|
| Not Started | `katachi:spec-delta` | Issue (create new) | `⧗ Spec` | `✓ Spec` |
| `✓ Spec` | `katachi:design-delta` | Issue (reuse from spec) | `⧗ Design` | `✓ Design` |
| `✓ Design` | `katachi:plan-delta` | PR (refs issue) | `⧗ Plan` | `✓ Plan` |
| `✓ Plan` | `katachi:implement-delta` | PR (reuse from plan) | `⧗ Implementation` | `✓ Implementation` |
| `✓ Implementation` | `katachi:reconcile-delta` | none (auto) | — | `✓ Reconciled` |

**Review channel rules:**
- **Issue** stays open across spec and design phases (same issue, reused)
- **PR** is created for the plan phase referencing the issue, reused for implementation
- When PR is merged after implementation, both PR and issue close together

## Process

### Step 0: Pre-Check

1. Verify framework is initialized (`docs/planning/DELTAS.md` exists)

2. Detect GitHub repo:
```bash
gh repo view --json nameWithOwner --jq '.nameWithOwner'
```

3. Fetch existing labels to check which katachi labels already exist:
```bash
gh label list --json name --jq '.[].name'
```

4. Create any missing labels:
```bash
gh label create "katachi-review" --description "Katachi phase review" --color "0E8A16" 2>/dev/null || true
gh label create "katachi-spec" --description "Katachi spec phase" --color "C5DEF5" 2>/dev/null || true
gh label create "katachi-design" --description "Katachi design phase" --color "BFD4F2" 2>/dev/null || true
gh label create "katachi-plan" --description "Katachi plan phase" --color "D4C5F9" 2>/dev/null || true
gh label create "katachi-implementation" --description "Katachi implementation phase" --color "FBCA04" 2>/dev/null || true
```

### Step 1: Build Work Queue

Run delta analysis:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py next --top 20 --group
python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status list
```

Build the work queue:
1. Filter deltas based on input (single ID, next, or all)
2. For each delta, determine current status and next phase from the Phase Map
3. Check dependency readiness — only include deltas whose dependencies are at or past the required status
4. Sort by priority (from DELTAS.md priority levels)

Present the work queue to the user and proceed immediately:
```
Coordination plan:

1. DLT-003 (Priority 1, ✓ Spec): Next → design-delta
2. DLT-007 (Priority 2, Not Started): Next → spec-delta
3. DLT-012 (Priority 2, ✓ Plan): Next → implement-delta
   ⚠ Blocked by DLT-003 (needs ✓ Implementation)

Starting coordination...
```

### Step 2: Initialize State Tracking

Create or read state file at `/tmp/katachi-coordinate-state.md`:

```markdown
# Coordinate Session State

## Configuration
- Repo: <owner/repo>
- Poll interval: 2 minutes (via CronCreate)

## Work Queue
1. [ ] DLT-003: design (Issue #__)
2. [ ] DLT-007: spec → design → plan → implement (Issue #__)
3. [ ] DLT-012: implement (Issue #__, PR #__)

## Current
- Delta: <none>
- Phase: <none>
- GitHub: <none>
- Sub-agent: <none>

## Decisions Log
```

If state file exists from a previous session, read it and resume from where it left off.

### Step 3: Main Loop

For each delta in the approved queue, process through all remaining phases:

#### 3a. Determine Next Phase

Read current status from DELTAS.md. Look up the Phase Map to determine:
- Which skill to invoke
- Whether the review channel is an issue or PR
- What status markers to set

#### 3b. GitHub Channel Setup

**For spec phase** (first phase, creates the issue):
```bash
gh issue create \
  --title "[DELTA-ID] Delta name from DELTAS.md" \
  --body "Phase: Spec — awaiting initial draft" \
  --label "katachi-review,katachi-spec"
```
Record the issue number in state.

**For design phase** (reuses the issue):
```bash
gh issue edit <ISSUE-NUMBER> --add-label "katachi-design"
```

**For plan phase** (creates branch and PR):
```bash
git checkout -b katachi/<DELTA-ID>
git push -u origin katachi/<DELTA-ID>
gh pr create \
  --title "[DELTA-ID] Delta name" \
  --body "Closes #<ISSUE-NUMBER>" \
  --label "katachi-review,katachi-plan"
```
Record the PR number in state.

**For implementation phase** (reuses the branch/PR):
```bash
gh pr edit <PR-NUMBER> --add-label "katachi-implementation"
```

#### 3c. Spawn Phase-Executor Sub-Agent

Spawn a `katachi:phase-executor` agent in the **foreground** (coordinator waits for response):

```python
Agent(
    subagent_type="katachi:phase-executor",
    model="opus",  # use "sonnet" for implement-delta only
    prompt=f"""
Execute the {phase_name} phase for delta {delta_id}.

## Assignment
- Delta: {delta_id}
- Skill: Call Skill(skill: "katachi:{phase_skill}", args: "{delta_id}")

## Working Directory
{project_root}

Follow the skill's full workflow. Relay outputs instead of asking the user
directly, and delegate reviewer dispatch instead of spawning agents.
See your agent instructions for the relay format.
"""
)
```

Record the sub-agent ID in state for resumption.

**Model selection:**
- `opus` for spec-delta, design-delta, plan-delta (deep reasoning needed)
- `sonnet` for implement-delta (more mechanical execution)

#### 3d. Relay Loop

This is the core coordination cycle. Repeat until the phase is complete:

**When sub-agent returns `RELAY_TO_USER`:**

1. Parse the document content and questions from the response

2. Update GitHub channel description with the document:
   - **Issue (spec phase)**: update issue body with the spec document
   - **Issue (design phase)**: update issue body with spec in a collapsible section + design document:
     ```markdown
     <details>
     <summary>Spec: DELTA-ID</summary>

     [spec document content]

     </details>

     # Design

     [design document content]
     ```
   - **PR (plan/implement)**: update PR body with document summary, then commit and push the full document to the branch:
     ```bash
     git add docs/delta-plans/$DELTA_ID.md  # or relevant changed files
     git commit -m "katachi: update $PHASE for $DELTA_ID"
     git push
     ```

3. Post questions as a **comment** on the issue/PR:
   ```bash
   gh issue comment <NUMBER> --body "## Questions from phase executor\n\n[questions]"
   # or for PRs:
   gh pr comment <NUMBER> --body "## Questions from phase executor\n\n[questions]"
   ```

4. Log to terminal:
   ```
   "Updated GitHub issue/PR: <URL>
   Questions posted as comment. Polling for response every 2 minutes..."
   ```

5. Schedule a cron job to poll for user response every 2 minutes:
   ```python
   CronCreate(
       cron="*/2 * * * *",
       prompt=f"""
   Check for new GitHub comments on {issue_or_pr} #{number}.

   Run:
   gh {issue_or_pr} view {number} --json comments \
     --jq '.comments[-1] | {{body, createdAt, author: .author.login}}'

   If the latest comment is newer than the last known comment timestamp
   ({last_comment_timestamp}), was authored by a user (not a bot), and
   is not from the coordinator:
   - Delete this cron job via CronDelete(id="{cron_job_id}")
   - Resume the phase-executor sub-agent (ID: {sub_agent_id}) with the
     user's feedback
   - Continue the coordination workflow from step 3d.6

   If no new comment found, do nothing (cron will fire again in 2 minutes).
   """
   )
   ```

   Record the cron job ID in state. The coordinator is now idle — the cron job will fire when a response arrives and resume the workflow.

6. **When the cron job detects a response**, delete the cron job and **resume** the same sub-agent with the user's feedback:
   ```python
   Agent(
       resume=<sub_agent_id>,
       prompt=f"""
   User feedback from GitHub review:

   {user_comment_body}

   Apply this feedback and continue the workflow.
   """
   )
   ```

**When sub-agent returns `DISPATCH_REVIEWER`:**

1. Parse the agent name and context from the response

2. Dispatch the reviewer agent:
   ```python
   Agent(
       subagent_type="katachi:{reviewer_agent}",
       model="opus",
       prompt=f"{reviewer_context}"
   )
   ```

3. **Resume** the same sub-agent with the review results:
   ```python
   Agent(
       resume=<sub_agent_id>,
       prompt=f"""
   Reviewer results from {reviewer_agent}:

   {reviewer_output}

   Apply the recommendations per the skill's instructions and continue.
   """
   )
   ```

**When sub-agent returns `PHASE_COMPLETE`:**

1. Update GitHub with the final document version (same as relay, but no questions)

2. Post a completion comment:
   ```bash
   gh issue comment <NUMBER> --body "## Phase complete: <phase>\n\n<summary>\n\nReview the final document above. Comment 'approved' to proceed to the next phase."
   ```

3. Schedule a cron job to poll for approval every 2 minutes:
   ```python
   CronCreate(
       cron="*/2 * * * *",
       prompt=f"""
   Check for approval on {issue_or_pr} #{number}.

   Run:
   gh {issue_or_pr} view {number} --json comments \
     --jq '.comments[-1] | {{body, createdAt, author: .author.login}}'

   Check the latest comment from a non-bot user after timestamp {last_comment_timestamp}:
   - If it contains "approved" (case-insensitive): delete this cron job,
     mark phase complete in state, and proceed to the next phase (step 3e)
   - If it contains feedback/changes: delete this cron job, resume the
     phase-executor sub-agent (ID: {sub_agent_id}) with the feedback
     (back to relay loop step 3d)
   - For PRs, also check: gh pr view {number} --json reviews \
       --jq '[.reviews[] | select(.state == "APPROVED")] | length'
     If approved via PR review, treat as approval.
   - If no new comment, do nothing (cron fires again in 2 minutes).
   """
   )
   ```

   Record the cron job ID in state. The coordinator is idle until the cron job detects a response.

4. On **approval** (detected by cron): mark phase complete in state, proceed to next phase (3a)

5. On **feedback** (detected by cron): **resume** the same sub-agent with the feedback (back to relay loop)

#### 3e. Phase Transition

After a phase is approved:

1. Update state file: mark current phase as done
2. Determine next phase from Phase Map
3. If moving from design to plan: switch from issue to PR (step 3b)
4. If moving from implementation to reconcile: run reconcile directly without a sub-agent or GitHub review:
   ```python
   Skill(skill="katachi:reconcile-delta", args="<DELTA-ID>")
   ```
   The coordinator executes this itself since reconcile is an internal documentation update.
5. For all other transitions: **spawn a new sub-agent** for the next phase (do not resume the previous one)

#### 3f. Delta Completion

After all phases are complete for a delta:
1. Mark delta as done in state
2. If on a feature branch, switch back to main:
   ```bash
   git checkout main
   git pull
   ```
3. Move to next delta in the queue

### Step 4: Session Summary

After all deltas in the queue are processed (or if interrupted):

```
Coordination session complete:

Processed:
- DLT-003: ✓ Design (Issue #42)
- DLT-007: ✓ Spec (Issue #45)

In progress:
- DLT-012: ⧗ Implementation (PR #15)

GitHub:
- Issues: #42, #45
- PRs: #15

State saved to /tmp/katachi-coordinate-state.md
```

## Error Handling

**Sub-agent fails or returns unexpected output:**
- Log error to terminal
- Retry the phase once with a new sub-agent
- If retry fails, skip the delta and continue with the next one in the queue

**GitHub API errors:**
- Retry once after a short delay
- If persistent, log error and skip to next delta

**Dependency blocks:**
- Skip blocked deltas automatically
- Process unblocked deltas first, report blocked ones in the summary

**State file missing mid-session:**
- Reconstruct from DELTAS.md statuses and GitHub issue/PR state
- Resume automatically from reconstructed state

**Cron job cleanup:**
- On any error or skip, delete active cron jobs before moving on
- On session end, all cron jobs are cleaned up automatically (session-only)

## Workflow Summary

```
Pre-check → Build queue → Start automatically →
For each delta:
  For each remaining phase:
    Setup GitHub channel →
    Spawn phase-executor →
    Relay to GitHub + schedule cron poll (every 2 min) →
    [idle until cron detects response] →
    Resume sub-agent with feedback / dispatch reviewer →
    Repeat until PHASE_COMPLETE →
    Schedule cron poll for approval (every 2 min) →
    [idle until cron detects approval] →
    Phase transition (new sub-agent) →
  Delta complete →
Session summary
```
