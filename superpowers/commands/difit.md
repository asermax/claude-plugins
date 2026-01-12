---
description: Open difit to review git changes and collect feedback for processing
argument-hint: [context]
allowed-tools: Bash(difit:*), Bash(git:*), Read, Edit, Write, Glob, Grep, KillShell, TodoWrite
---

# Difit Review

Open difit (a GitHub-style git diff viewer) for reviewing changes, collect user feedback, then process the review by creating todos and applying changes.

**Note:** This command uses `--mode inline` by default, which displays diffs in a unified, single-column format (like traditional `git diff`). This is more compact and easier to scan than the default side-by-side view.

## Parameters

- **$1 (context)**: Optional free-text context describing what to review
  - Interpret naturally to determine the appropriate difit command
  - Default (empty): Shows all uncommitted changes (`difit .`)
  - Examples: "staged changes", "compare with main", "last 3 commits", "the auth module changes"

## Usage Examples

```bash
/difit                           # Review all uncommitted changes
/difit staged changes            # Review only staged changes
/difit compare with main branch  # Review changes vs main
/difit the auth refactor         # Context hint for the review
```

---

## Step 1: Determine Diff Scope

Interpret the optional `$1` argument to determine which difit command to run.

**Interpretation rules:**
- If empty → `difit --mode inline .` (all uncommitted changes)
- If mentions "staged" → `difit --mode inline staged`
- If mentions "working" or "unstaged" → `difit --mode inline working`
- If mentions comparing to a branch (e.g., "main", "master") → `difit --mode inline @ <branch>`
- If mentions a commit hash → `difit --mode inline <hash>`
- Otherwise, use best judgment to interpret context and select appropriate command

**Difit command reference:**
- `difit --mode inline .` - All uncommitted changes
- `difit --mode inline staged` - Staged changes only
- `difit --mode inline working` - Unstaged changes only
- `difit --mode inline @ <branch>` - Compare HEAD vs branch
- `difit --mode inline <hash>` - Show specific commit

**Check for changes:**

Before launching difit, check if there are any changes to review:

```bash
git status --porcelain
```

If no changes exist (empty output), inform the user and exit gracefully:
```
No uncommitted changes found. Nothing to review.
```

---

## Step 2: Launch Difit in Background

Run difit with the determined command using `run_in_background: true`.

**Example:**
```bash
difit --mode inline .
```

**CRITICAL:** Use the Bash tool with `run_in_background: true` parameter. This:
- Returns a task ID that can be used later with KillShell to stop difit
- Allows Claude to continue execution and prompt the user

**Save the task ID** from the response - you'll need it in Step 4 to close difit.

**If difit fails to start:**

The command may fail if difit is not installed. If you see an error like "command not found", simply inform the user:

```
Difit is not installed. Please install it with: npm install -g difit
```

Then exit gracefully without continuing to Step 3.

---

## Step 3: Prompt for Review and Stop

After successfully starting difit, output a message to the user:

```
Difit has been opened in your browser at http://localhost:4966

Please review the changes and provide your feedback below.

When you're done reviewing:
- Paste your review comments as your next message
- You can request changes, point out issues, or approve the changes

I'll process your feedback and close difit automatically.
```

**IMPORTANT:** Then **STOP execution** and wait for the user's next message. Do NOT use AskUserQuestion or any other tool - just output the prompt text and stop.

---

## Step 4: Process Review Feedback (Next Turn)

When the user provides their review feedback in their next message, process it:

### Step 4a: Close Difit

Use KillShell with the task ID from Step 2 to properly stop difit:

```
KillShell(shell_id: "<task-id-from-step-2>")
```

### Step 4b: Parse Feedback

Read and understand the user's review feedback. Look for:
- **Specific change requests**: "Change X to Y", "Update the function to...", "Fix the bug in..."
- **Issues or concerns**: "This breaks...", "There's a problem with...", "Need to handle..."
- **Questions**: "Why did you...", "What about...", "Should we..."
- **Approvals**: "Looks good", "LGTM", "Ship it"

**Difit's export format:**

When users use difit's "Copy All Prompt" feature, feedback follows this structure:

```
path/to/file.ts:L25
Comment or question about this line
=====
path/to/file.ts:L71-L72
Comment about this line range
=====
another/file.ts:L10
Another comment
```

- **File reference**: `file_path:L<line>` or `file_path:L<start>-L<end>` for ranges
- **Comment**: Lines following the file reference until the next separator
- **Separator**: `=====` between comments

When parsing this format, extract each comment block and associate it with its file/line context for targeted changes.

### Step 4c: Create Todos

For each actionable item in the feedback, create a todo using TodoWrite:

```
TodoWrite(todos: [
  {content: "Change function name to camelCase", status: "pending", activeForm: "Changing function name to camelCase"},
  {content: "Add error handling to API call", status: "pending", activeForm: "Adding error handling to API call"},
  {content: "Fix typo in comment", status: "pending", activeForm: "Fixing typo in comment"}
])
```

**If feedback is approval only** (e.g., "LGTM", "Looks good"):
- Don't create todos
- Just acknowledge the approval
- Exit gracefully

**If feedback has questions only**:
- Answer the questions
- Don't create todos unless questions lead to action items
- Ask follow-up questions if needed

### Step 4d: Implement Changes

For each todo created:

1. **Mark todo as in_progress** before starting work
2. **Read relevant files** to understand context
3. **Make the change** using Edit or Write tools
4. **Mark todo as completed** when done
5. **Move to next todo**

**Process todos systematically:**
- One at a time, in order
- Complete each before moving to next
- Update todo list as you go

### Step 4e: Report Summary

After processing all todos, provide a summary:

```
Processed review feedback:

✅ Changed function name to camelCase (src/utils/helpers.ts)
✅ Added error handling to API call (src/api/client.ts)
✅ Fixed typo in comment (src/components/Button.tsx)

All requested changes have been applied.
Files modified: 3
```

---

## Important Notes

### Background Process Management

**Always use `run_in_background: true`** when starting difit. This allows:
- Claude to continue prompting the user
- Proper cleanup with KillShell later
- Non-blocking execution

**Save the task ID** returned by the Bash tool when starting difit - you need it to close difit properly with KillShell.

### Git Changes Context

**Default behavior** (no argument):
- Show all uncommitted changes with `difit --mode inline .`
- This includes both staged and unstaged changes
- Most common use case for agent-initiated reviews

**User can narrow scope** with context argument:
- "staged changes" → review only what's in staging area
- "working changes" → review only unstaged modifications
- "vs main" → review all changes compared to main branch

### No Changes to Review

**Always check for changes first** with `git status --porcelain` before launching difit:
- Prevents launching difit with nothing to show
- Provides clear feedback to user
- Avoids wasted execution

### Difit Not Installed

**Don't try to handle installation** - just inform the user:
- Simple message with install instructions
- Exit gracefully
- User can install and try again

### Context Interpretation

**Use natural language understanding** to interpret the context argument:
- Don't require exact keywords like "staged" or "working"
- Understand variations: "staging area", "staged files", "what's staged"
- Be flexible: "compare to main" vs "vs main branch" vs "diff with main"
- When ambiguous, choose the most reasonable interpretation

### Feedback Processing

**Parse feedback intelligently:**
- Distinguish between change requests, questions, and approvals
- Create todos only for actionable items
- Don't over-process simple approvals
- Answer questions directly without creating todos

**Work through todos systematically:**
- Mark each as in_progress before starting
- Mark as completed immediately after finishing
- Don't batch completions - update todo list continuously
- Show progress as you work

---

## Error Handling

### Difit Failed to Start

```
Error: difit: command not found

Difit is not installed. Install it with:
npm install -g difit

Then try again.
```

### No Changes to Review

```
No uncommitted changes found. Nothing to review.

Use /difit <branch> to compare against a specific branch.
```

### KillShell Failed

If KillShell fails (process already stopped):
```
Warning: Difit process already stopped or not found.
Continuing with feedback processing...
```

This is not critical - proceed with processing the feedback.

---

## Example Workflows

### Example 1: Review all uncommitted changes

```bash
/difit
```

**Command will:**
1. Check for uncommitted changes with `git status --porcelain`
2. Start `difit --mode inline .` in background
3. Prompt user to review and provide feedback
4. Stop and wait for user input
5. (Next turn) Close difit, parse feedback, create todos, apply changes

### Example 2: Review staged changes only

```bash
/difit staged changes
```

**Command will:**
1. Interpret "staged changes" → `difit --mode inline staged`
2. Check for staged changes
3. Start `difit --mode inline staged` in background
4. Prompt user for feedback
5. Stop and wait
6. (Next turn) Process feedback as in Example 1

### Example 3: Compare with main branch

```bash
/difit compare with main branch
```

**Command will:**
1. Interpret "compare with main branch" → `difit --mode inline @ main`
2. Start `difit --mode inline @ main` in background
3. Prompt user for feedback
4. Stop and wait
5. (Next turn) Process feedback as in Example 1

### Example 4: User approves changes

User's review feedback: "LGTM, looks great!"

**Command will:**
1. Close difit with KillShell
2. Parse feedback → approval only, no action items
3. Don't create todos
4. Respond: "Review approved. No changes requested."
