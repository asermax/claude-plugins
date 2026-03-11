---
name: coordinate
description: |
  Orchestrate the full delta workflow with sub-agents and GitHub review.
  Reads DELTAS.md for prioritization, spawns phase-executor agents to run
  each phase, and uses a GitHub PR as the review channel.
argument-hint: "[DELTA-ID | 'next' | 'all']"
disable-model-invocation: true
---

# Delta Coordination Workflow

Orchestrate the full delta lifecycle end-to-end: spawn phase-executor sub-agents that load existing Katachi skills, delegate GitHub PR updates to a pr-updater agent, and poll for feedback via a feedback-checker agent on a cron schedule.

## Input

Mode based on `$ARGUMENTS`:
- **Delta ID** (e.g., `DLT-001`): coordinate that delta through its remaining phases
- **`next`**: pick the highest-priority ready delta via `deltas.py next`
- **`all`** or empty: process all deltas by priority order

## Context

**You must load the following skill before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles

### Delta Inventory

!`cat docs/planning/DELTAS.md`

## Agents

The coordinator delegates work to three specialized agents:

| Agent | Purpose | When Used |
|---|---|---|
| `katachi:phase-executor` | Execute a delta phase skill, relay outputs | Foreground, one per phase |
| `katachi:pr-updater` | Commit, update PR description, post comments | After each phase-executor output |
| `katachi:feedback-checker` | Poll PR for new comments/reviews | Via cron every 10 minutes |

## Phase Map

Static mapping from current delta status to next action. This is the single source of workflow logic.

| Current Status | Next Skill | Status on Start | Status on Complete |
|---|---|---|---|
| Not Started | `katachi:spec-delta` | `⧗ Spec` | `✓ Spec` |
| `✓ Spec` | `katachi:design-delta` | `⧗ Design` | `✓ Design` |
| `✓ Design` | `katachi:plan-delta` | `⧗ Plan` | `✓ Plan` |
| `✓ Plan` | `katachi:implement-delta` | `⧗ Implementation` | `✓ Implementation` |
| `✓ Implementation` | `katachi:reconcile-delta` | — | `✓ Reconciled` |

**Branch and review rules:**
- A **branch** `katachi/<DELTA-ID>` is created at the start of each delta
- A **PR** is created immediately and used as the single review channel for all phases
- All phase outputs are **committed to the branch** after every sub-agent update — the user can leave inline comments on files in the PR diff
- The PR description preserves all phase history using collapsible sections — previous phases are collapsed, current phase is always visible
- Phase labels are added as the delta progresses
- When PR is merged after reconciliation, the delta is complete

## Process

### Step 0: Pre-Check

The following context was pre-loaded at skill invocation time:

**GitHub repo:** !`gh repo view --json nameWithOwner --jq '.nameWithOwner'`

**Existing labels:**
!`gh label list --json name --jq '.[].name'`

Create any missing katachi labels from this list: `katachi-review`, `katachi-spec`, `katachi-design`, `katachi-plan`, `katachi-implementation`, `katachi-reconcile`. Use `gh label create` for any that don't appear above:
```bash
gh label create "<name>" --description "<description>" --color "<color>" 2>/dev/null || true
```

Label colors: review=`0E8A16`, spec=`C5DEF5`, design=`BFD4F2`, plan=`D4C5F9`, implementation=`FBCA04`, reconcile=`E99695`.

### Step 1: Build Work Queue

**Delta analysis (priority order):**
!`python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py next --top 20 --group`

**Current statuses:**
!`python ${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py status list`

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
- Poll interval: 10 minutes (via CronCreate)

## Work Queue
1. [ ] DLT-003: design (PR #__)
2. [ ] DLT-007: spec → design → plan → implement → reconcile (PR #__)
3. [ ] DLT-012: implement → reconcile (PR #__)

## Current
- Delta: <none>
- Phase: <none>
- PR: <none>
- Phase-executor ID: <none>
- Cron job ID: <none>
- Last activity timestamp: <none>

## Decisions Log
```

If state file exists from a previous session, read it and resume from where it left off.

### Step 3: Main Loop

For each delta in the approved queue:

#### 3a. Delta Setup (once per delta)

Create a branch and PR for this delta:
```bash
git checkout -b katachi/<DELTA-ID>
git push -u origin katachi/<DELTA-ID>

gh pr create \
  --title "[DELTA-ID] Delta name from DELTAS.md" \
  --body "# [DELTA-ID] Delta name\n\n**Current phase:** spec (awaiting initial draft)" \
  --label "katachi-review,katachi-spec"
```
Record the branch name and PR number in state.

#### 3b. Determine Next Phase

Read current status from DELTAS.md. Look up the Phase Map to determine:
- Which skill to invoke
- What status markers to set

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
- `opus` for spec-delta, design-delta, plan-delta, reconcile-delta (deep reasoning needed)
- `sonnet` for implement-delta (more mechanical execution)

#### 3d. Relay Loop

This is the core coordination cycle. Repeat until the phase is complete:

**When phase-executor returns `RELAY_TO_USER`:**

1. Delegate to the **pr-updater** agent to commit, update PR, and post questions:
   ```python
   Agent(
       subagent_type="katachi:pr-updater",
       prompt=f"""
   Update PR #{pr_number} for delta {delta_id}.

   - PR number: {pr_number}
   - Phase: {phase_name}
   - Delta ID: {delta_id}
   - Action: relay

   ## Document Content

   {document_content}

   ## Questions

   {questions}
   """
   )
   ```

2. Log to terminal:
   ```
   "PR #{pr_number} updated. Polling for response every 10 minutes..."
   ```

3. Record the current timestamp as last activity timestamp in state.

4. Schedule a **feedback-checker** cron job to poll every 10 minutes:
   ```python
   CronCreate(
       cron="*/10 * * * *",
       prompt=f"""
   Check for feedback on PR #{pr_number} for the katachi coordination workflow.

   Spawn a feedback-checker agent:
   Agent(
       subagent_type="katachi:feedback-checker",
       prompt=\"\"\"
   Check PR #{pr_number} for new activity.

   - PR number: {pr_number}
   - Last activity timestamp: {last_activity_timestamp}
   \"\"\"
   )

   Based on the feedback-checker result:
   - If type is "none": do nothing, cron fires again in 10 minutes
   - If type is "approved": delete this cron job (CronDelete(id="{cron_job_id}")),
     mark phase complete in state, proceed to next phase (step 3e)
   - If type is "feedback" or "changes_requested": delete this cron job,
     resume the phase-executor sub-agent with the feedback:
     Agent(
         resume="{sub_agent_id}",
         prompt="User feedback from GitHub review:\\n\\n" + feedback_body
     )
     Then continue the relay loop (step 3d)
   """
   )
   ```

   Record the cron job ID in state. The coordinator is now idle — the cron job will fire when activity is detected and resume the workflow.

**When phase-executor returns `DISPATCH_REVIEWER`:**

1. Parse the agent name and context from the response

2. Dispatch the reviewer agent:
   ```python
   Agent(
       subagent_type="katachi:{reviewer_agent}",
       model="opus",
       prompt=f"{reviewer_context}"
   )
   ```

3. **Resume** the same phase-executor with the review results:
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

**When phase-executor returns `PHASE_COMPLETE`:**

1. Delegate to the **pr-updater** agent to commit final output and post completion comment:
   ```python
   Agent(
       subagent_type="katachi:pr-updater",
       prompt=f"""
   Update PR #{pr_number} for delta {delta_id}.

   - PR number: {pr_number}
   - Phase: {phase_name}
   - Delta ID: {delta_id}
   - Action: phase_complete

   ## Document Content

   {final_document_content}

   ## Summary

   {phase_summary}
   """
   )
   ```

2. Record the current timestamp as last activity timestamp in state.

3. Schedule a **feedback-checker** cron job to poll for approval every 10 minutes (same pattern as relay, but the cron prompt handles approval detection — see above).

4. On **approval** (detected by cron): proceed to phase transition (3e)

5. On **feedback** (detected by cron): **resume** the same phase-executor with the feedback (back to relay loop)

#### 3e. Phase Transition

After a phase is approved:

1. Update state file: mark current phase as done
2. Determine next phase from Phase Map
3. **Spawn a new phase-executor** for the next phase (do not resume the previous one)

#### 3f. Delta Completion

After all phases are complete for a delta (reconcile approved):
1. Mark delta as done in state
2. Switch back to main:
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
- DLT-003: ✓ Design (PR #42)
- DLT-007: ✓ Spec (PR #45)

In progress:
- DLT-012: ⧗ Implementation (PR #15)

State saved to /tmp/katachi-coordinate-state.md
```

## Error Handling

**Sub-agent fails or returns unexpected output:**
- Log error to terminal
- Retry the phase once with a new sub-agent
- If retry fails, skip the delta and continue with the next one in the queue

**GitHub API errors (pr-updater or feedback-checker):**
- Retry once after a short delay
- If persistent, log error and skip to next delta

**Dependency blocks:**
- Skip blocked deltas automatically
- Process unblocked deltas first, report blocked ones in the summary

**State file missing mid-session:**
- Reconstruct from DELTAS.md statuses and GitHub PR state
- Resume automatically from reconstructed state

**Cron job cleanup:**
- On any error or skip, delete active cron jobs before moving on
- On session end, all cron jobs are cleaned up automatically (session-only)

## Workflow Summary

```
Pre-check → Build queue → Start automatically →
For each delta:
  Create branch katachi/<DELTA-ID> + PR →
  For each remaining phase (spec → design → plan → implement → reconcile):
    Spawn phase-executor (foreground) →
    On output: delegate to pr-updater (commit + update PR + comment) →
    Schedule feedback-checker cron (every 10 min) →
    [idle until cron detects response] →
    Resume phase-executor with feedback / dispatch reviewer →
    Repeat until PHASE_COMPLETE →
    Delegate to pr-updater (commit final + collapse previous phase) →
    Schedule feedback-checker cron for approval (every 10 min) →
    [idle until cron detects approval] →
    Phase transition (new phase-executor) →
  Delta complete → switch back to main →
Session summary
```
