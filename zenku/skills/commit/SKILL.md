---
name: commit
description: Analyze uncommitted changes and create grouped conventional commits. Use whenever the user asks to "commit", "commit my changes", "make a commit", or similar.
---

# Commit Workflow

Analyze changes and create appropriately grouped conventional commits.

Load `zenku:framework-core` first — §1 for the project's code roots and checks, §3 for the habit of showing the plan before writing anything.

## Process

### 1. Analyze changes

Run in parallel:

```sh
git status
git diff --staged
git diff
git log -5 --oneline
```

Both staged and unstaged changes are fair game — the user may have started staging selectively before invoking this.

**Read `git log` to match the repository's existing commit style** — its scopes, its trailer, whether it writes real bodies or bare subjects, whether it hard-wraps. None of that is this skill's to decide, and all of it is visible in the last handful of commits.

### 2. Group changes logically

Group changes that should be committed together. Apply judgment — closely related work belongs together even if it spans patterns. Default heuristics:

- Group by the feature/capability being added or changed.
- Keep code and the doc that describes the same change together.
- Separate unrelated changes; separate formatting from logic; separate tests from implementation unless closely related.
- Config/tooling changes are their own commit unless clearly part of one change.

**Don't mix unrelated changes** in a single commit. Keep commits atomic but meaningful.

Two groupings are the lab's rather than the project's, and neither is obvious from the paths:

- **Lab notes commit apart from the code they are about.** The framework requires a note to reach the trunk on its own, and a spike never does.
- **On an idea's branch, each experiment's spike is its own recognisable commit.** `zenku:promote` drops those commits with a single reset, which is only clean if the boundary is clean.

Where the project's own layout implies a grouping — a unit of code that does not compile if split — follow it. The log and the surrounding structure will show it.

### 3. Draft commit messages

Conventional commits format:

```
type(scope): brief description

Longer explanation if needed.
- Detail 1
- Detail 2
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

**Scopes:** derive from the area touched, or omit for repo-wide changes. Follow the scope conventions evident in `git log`.

**Message quality:**
- Imperative mood ("add", not "added" or "adding").
- No period at end of subject line.
- Subject line under 50-72 characters.
- Body wrapped at 72 chars when needed, unless the log shows otherwise.
- Bodies say **why** rather than restating the diff.
- Do NOT use `!` after type/scope for breaking changes — use a `BREAKING CHANGE:` footer instead.
- Do NOT use internal tracking IDs as the scope.
- Include a co-author / generated-by trailer only if the project's convention, evident in `git log`, uses one — and copy its exact form.

### 4. Verify anything under the code roots

Run the project's checks before committing code. A commit is the last honest place to check, and the project's own rule is that they are green before a change counts as done.

If any of them fails, say which and **do not commit**.

Two exemptions:

- **A spike on an idea's branch skips this entirely.** Experiment code is exempt from the quality bar, and speed is the whole reason it is cheap enough to throw away.
- **Nothing under the code roots in the group** — notes only, configuration only — means there is nothing to run.

### 5. Present plan and get confirmation

**Always** use `AskUserQuestion` to present the proposed groups and get confirmation, even for a single obvious group. Include the full breakdown with file lists in the question text.

- Do NOT use markdown formatting in the question text — it doesn't render. Use plain text with indentation and dashes.
- Do NOT include "Other" as an option — the system adds it automatically.

Options:
- "Proceed with these N commit group(s)" (recommended)
- If there are 4+ groups: "Merge into fewer commits"

Example:

```
Question: "I've analyzed the changes and propose the following commit groups:

feat(auth): add token refresh
   - src/auth/refresh.ts (new)
   - src/auth/index.ts (modified)

docs: update setup instructions
   - README.md (modified)

How would you like to proceed?"

Options:
- "Proceed with these 2 commit groups"
```

### 6. Execute commits

For each approved group:

```sh
git add <files>
git commit -m "$(cat <<'EOF'
type(scope): description

Optional body.
EOF
)"
```

Stage exactly the files in the current group — never `git add -A` or `git commit -a`. A stray file in a commit is invisible until someone reverts it.

## Safety

- Never force push, never modify git config, never skip hooks unless explicitly requested.
- **Committing lab notes to the trunk is normal** and needs no warning — the framework requires them to land there directly. **Code is different:** if a group touches the code roots and you are on the trunk, say so and offer a branch first.
- If a pre-commit hook fails: fix the issue, re-stage, create a **new** commit rather than amending.
- No changes to commit → say so and stop.
- Merge conflicts present → list them, ask the user to resolve, stop.
