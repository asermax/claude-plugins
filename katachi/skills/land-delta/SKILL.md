---
name: land-delta
description: |
  Land a reconciled delta branch onto main. Merges main into the delta branch,
  reconciles code and documentation with changes introduced on main, validates
  conflicting areas with reviewer agents, and merges into main with user confirmation.
argument-hint: "[DELTA-ID]"
---

# Land Delta Workflow

Land a reconciled delta branch onto the project's main branch, reconciling any conflicts with changes introduced on main since the delta branched off.

## Input

Delta ID: $ARGUMENTS (e.g., "DLT-001")

If not provided, attempt to parse from the current branch name (look for `DLT-\d+` pattern). If not found, ask the user.

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles

### Feature documentation
- `docs/feature-specs/` - Long-lived feature specifications
- `docs/feature-designs/` - Long-lived feature designs

### Decision indexes
- `docs/architecture/README.md` - Architecture decisions (ADRs)
- `docs/design/README.md` - Design patterns (DES)

## Pre-Check

Run all checks before proceeding:

1. **Clean working tree**: `git status --porcelain` must be empty. If dirty, ask user to commit or stash.

2. **Not on main**: Current branch must not be the main branch. If on main, explain that this skill runs from the delta branch.

3. **Branch matches delta ID**: The current branch name should contain the delta ID (case-insensitive match, e.g., branch `dlt-042/feature-name` matches `DLT-042`). If mismatch, warn the user and ask to confirm before proceeding.

4. **Detect main branch**: Determine the main branch name:
   ```bash
   git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||'
   ```
   If that fails, check for `main` or `master` branches. Ask user if ambiguous.

5. **Commits ahead of main**: Verify the branch has commits that main doesn't:
   ```bash
   git log origin/<main>..HEAD --oneline
   ```
   If no commits ahead, there's nothing to land.

6. **Delta reconciled**: Verify delta working documents have been cleaned up (reconciliation already happened):
   - Check that `docs/delta-specs/$ARGUMENTS.md` does NOT exist
   - Check that `docs/delta-designs/$ARGUMENTS.md` does NOT exist
   - Check that `docs/delta-plans/$ARGUMENTS.md` does NOT exist
   - If any exist, suggest running `/katachi:reconcile-delta $ARGUMENTS` first

## Scratchpad

Use `/tmp/land-$ARGUMENTS-state.md` for state tracking.

Track:
- Delta ID and branch name
- Main branch name
- Conflicts encountered (categorized by: code, feature-specs, feature-designs, decisions)
- Resolution decisions made
- Test/lint/typecheck results
- Documentation reconciliation notes
- Reviewer dispatch decisions and results

## Process

### Phase 1: Gather Context (Silent)

1. **Identify delta**: Resolve delta ID from `$ARGUMENTS`, branch name, or user prompt.

2. **Detect main branch**: Using the method from Pre-Check.

3. **Branch commit log**: Gather what the delta branch has done:
   ```bash
   git log origin/<main>..HEAD --oneline
   ```

4. **Read feature documentation**: Read current state of `docs/feature-specs/` and `docs/feature-designs/` on the branch to understand what the delta reconciled.

5. **Read decision indexes**: Read `docs/architecture/README.md` and `docs/design/README.md`.

6. **Fetch latest main**:
   ```bash
   git fetch origin <main>
   ```

7. **Capture pre-merge references** (these MUST be captured before the merge in Phase 2, as they become invalid after):
   - **Merge base**: `git merge-base HEAD origin/<main>` — save to scratchpad as `$MERGE_BASE`
   - **Delta's own commits**: `git log origin/<main>..HEAD --oneline` — save to scratchpad as the delta summary
   - **Main's changes**: `git log $MERGE_BASE..origin/<main> --oneline`
   - **Main's doc changes**: `git diff $MERGE_BASE..origin/<main> -- docs/`
   Note which feature areas main changed, and whether new ADRs/DES were added.

### Phase 2: Merge Main into Delta Branch (Interactive)

Merge main into the delta branch to incorporate its changes:

```bash
git merge origin/<main>
```

**Track conflict categories** — for each conflicting file, classify it:
- **Code**: Source code, tests, configuration files
- **Feature specs**: Files under `docs/feature-specs/`
- **Feature designs**: Files under `docs/feature-designs/`
- **Decisions**: Files under `docs/architecture/` or `docs/design/`

**If clean (no conflicts):**
- Proceed silently
- Note `conflicts_occurred = false` in scratchpad
- No reviewers will be dispatched in Phase 5

**If conflicts arise:**
- Note `conflicts_occurred = true` and record which categories had conflicts
- For each conflicting file:
  - Read the conflict markers
  - **Auto-resolve** simple conflicts:
    - Non-overlapping edits that git flagged conservatively
    - Whitespace or formatting-only changes
    - Import ordering differences
    - Additive changes from both sides (both added content to the same section)
  - **Ask the user** about complex conflicts:
    - Show what the delta changed vs what main changed
    - Explain the semantic meaning of each side
    - Present resolution options (accept delta's version, accept main's version, propose a merged version)
- After all conflicts resolved:
  ```bash
  git add .
  git commit
  ```

**If merge becomes untenable:**
- Offer `git merge --abort`
- Discuss alternatives with the user

### Phase 3: Code Reconciliation (Silent with checkpoint)

Verify the codebase still works after incorporating main's changes:

1. **Run test suite**
2. **Run linting**
3. **Run type checking**

**If all pass:** Proceed silently.

**If failures:**
- Analyze each failure to determine if it's caused by semantic conflicts with main's changes
- **Auto-fix** simple issues:
  - Import path changes due to main's refactoring
  - Renamed references (functions, variables, types)
  - Minor API changes from main (added required parameters, changed return types)
- **Ask the user** about complex issues:
  - Present what main changed that likely caused the breakage
  - Explain the semantic conflict
  - Propose fix options
- Re-run tests after fixes until green

### Phase 4: Documentation Reconciliation (Silent with checkpoint)

Compare how both the delta and main changed documentation:

1. **Delta's documentation changes** (use merge base captured in Phase 1):
   ```bash
   git diff $MERGE_BASE..HEAD -- docs/feature-specs/ docs/feature-designs/
   ```

2. **Main's documentation changes** (use merge base captured in Phase 1):
   ```bash
   git diff $MERGE_BASE..origin/<main> -- docs/feature-specs/ docs/feature-designs/ docs/architecture/ docs/design/
   ```

**Check for:**

1. **Same feature docs modified by both**: Semantic conflicts in feature specs or designs where both sides changed the same sections with different intent.

2. **New ADRs/DES on main**: Check if main added ADRs or DES patterns that weren't present when the delta was being worked on. Cross-reference against the delta's feature area.

3. **Feature docs deleted on main**: If main deleted feature docs that the delta updated, the merge would have surfaced this as a conflict. If not caught in merge, note as informational.

4. **New feature docs on main**: Check for overlap with the delta's reconciled documentation.

**If no issues:** Proceed silently.

**If issues found:**
- **Auto-fix** non-conflicting doc updates (additive changes from both sides, formatting adjustments)
- **Ask the user** about:
  - Semantic conflicts: present both sides with context, offer merge options
  - New ADRs/DES on main that affect the delta's feature area: present them, ask if the delta's code or docs need adjustment to comply
  - Contradictions between main's changes and the delta's documentation

### Phase 5: Targeted Validation (Silent, only if conflicts occurred)

**Skip this phase entirely if `conflicts_occurred = false`** — the delta was already validated during implementation and reconciliation, and a clean merge means no integration risks.

If conflicts occurred, dispatch **only the reviewers relevant to the conflicting categories**. Run applicable reviewers in parallel.

**Code review** (only if code files had conflicts):

```python
Task(
    subagent_type="katachi:code-reviewer",
    prompt=f"""
Review this delta's code after merging main's changes.
Focus specifically on INTEGRATION concerns:

## Delta Summary
{delta_summary_from_commits}

## Changes introduced by main since delta branched
{main_changes_summary}

## Merge conflict files and resolutions
{conflict_resolutions}

## Current code diff (delta vs main after merge)
{code_diff}

## Relevant ADR/DES Documents
{adr_des_content}

Focus on:
- Semantic conflicts (code compiles but behaves incorrectly)
- Pattern compliance with any new ADRs/DES added on main
- Integration issues between delta changes and main changes
- Do NOT review the delta's implementation quality (already reviewed)
"""
)
```

**Spec review** (only if feature-specs had conflicts):

```python
Task(
    subagent_type="katachi:spec-reviewer",
    prompt=f"""
Review feature specs after merging main's changes into delta branch.

## Delta Summary
{delta_summary_from_commits}

## Feature Spec Changes (delta's reconciled updates)
{delta_spec_changes}

## Feature Spec Changes from Main
{main_spec_changes}

## Merged Feature Specs (current state)
{current_feature_specs}

Verify that merged feature specs:
- Remain internally consistent after incorporating both sets of changes
- Acceptance criteria don't contradict each other
- User stories are coherent
"""
)
```

**Design review** (only if feature-designs had conflicts):

```python
Task(
    subagent_type="katachi:design-reviewer",
    prompt=f"""
Review feature designs after merging main's changes into delta branch.

## Delta Summary
{delta_summary_from_commits}

## Feature Design Changes (delta's reconciled updates)
{delta_design_changes}

## Feature Design Changes from Main
{main_design_changes}

## Merged Feature Designs (current state)
{current_feature_designs}

## ADR Index
{adr_index}

## DES Index
{des_index}

Verify that merged feature designs:
- Maintain design coherence after incorporating both sets of changes
- Properly reference all relevant ADRs/DES (including any new ones from main)
- Component interactions remain consistent
"""
)
```

**Decision review** (only if decision docs had conflicts):

```python
Task(
    subagent_type="katachi:decision-reviewer",
    prompt=f"""
Review decision consistency after merging main's changes into delta branch.

## Delta Summary
{delta_summary_from_commits}

## New ADRs Added on Main
{new_adrs_from_main}

## New DES Added on Main
{new_des_from_main}

## Delta's Implementation Approach
{delta_implementation_summary}

## Existing ADR Index
{adr_index}

## Existing DES Index
{des_index}

Check for:
- New decisions from main that the delta's code doesn't comply with
- Contradictions between delta decisions and new main decisions
- Patterns that should be documented as DES given both sets of changes
"""
)
```

After all dispatched reviewers return:
- Auto-fix all issues found
- Run full test suite one final time
- If issues remain after fixes: present to user with context and discuss

### Phase 6: Merge into Main and Cleanup (Interactive)

Present landing summary to the user:

```
"Ready to land DLT-XXX onto <main>:

Commits: [N commits]
Merge from main: Clean / Resolved N conflicts
Tests: All passing
Documentation: Consistent / Updated N files
Validation: [Passed / Skipped (no conflicts)]

Merge into <main>?"
```

**On user confirmation:**

```bash
git checkout <main>
git merge <delta-branch>
```

Present success message.

**Offer to push main:**
- Ask if the user wants to push main to remote: `git push origin <main>`

**Offer branch cleanup:**
- Delete local branch: `git branch -d <delta-branch>`
- If remote branch exists: ask about `git push origin --delete <delta-branch>`

## Edge Cases

**No conflicts (clean merge):**
Skip Phase 2 conflict resolution AND Phase 5 validation. Still run Phases 3-4 (code/doc reconciliation) since semantic issues can exist without merge conflicts.

**Merge conflicts that can't be auto-resolved:**
Present conflict context with both sides explained. Offer options: resolve manually, accept ours/theirs, or abort the merge entirely with `git merge --abort`.

**Working tree is dirty:**
Pre-check catches this. Ask user to commit or stash before proceeding.

**Delta not yet reconciled:**
Detected by presence of delta working documents (`docs/delta-specs/<ID>.md`, etc.). Suggest running `/katachi:reconcile-delta $ARGUMENTS` first.

**New decisions on main contradict delta decisions:**
Present both the new decision and the delta's approach in Phase 4. Ask user how to proceed: update delta code to comply, update the decision document, or note the exception.

**Multiple deltas on same branch:**
Ask user which delta to focus on. The code/doc reconciliation works the same regardless of which delta ID is specified — the merge reconciles all changes on the branch.

**Branch name doesn't match delta ID:**
Pre-check warns the user and asks for confirmation. The user may have a valid reason (e.g., renamed branch, or branch covers multiple deltas).

## Workflow

**This is a merge-reconcile-land process:**
- Pre-check (clean tree, correct branch, reconciled delta)
- Gather context (branch commits, main changes, feature docs, decisions)
- Merge main into branch (resolve conflicts interactively)
- Code reconciliation (tests, lint, typecheck — auto-fix or ask)
- Documentation reconciliation (semantic doc conflicts — auto-fix or ask)
- Targeted validation (only conflicting categories get reviewed)
- Merge into main (with user confirmation)
- Optional branch cleanup
