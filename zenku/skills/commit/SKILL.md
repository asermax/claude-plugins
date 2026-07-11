---
name: commit
description: Analyze uncommitted changes and create grouped conventional commits. Use whenever the user asks to "commit", "commit my changes", "make a commit", or similar.
---

# Commit Workflow

Analyze changes and create appropriately grouped conventional commits.

Load `zenku:framework-core` first for the collaborative workflow principles.

**Project extensions:** if `.zenku/commit.md` exists, read it now and fold its
rules in — a project uses this to declare its own grouping conventions (which
paths commit together, scope names, co-author trailer). Those rules refine the
generic grouping guidance below; they never waive the atomic-commit discipline.
See the project-extension-hooks section in `zenku:framework-core`.

## Process

### 1. Analyze changes

Run in parallel:

```sh
git status
git diff --staged
git diff
git log -5 --oneline
```

Both staged and unstaged changes are fair game — the user may have started
staging selectively before invoking this. Read `git log` to match the
repository's existing commit style (scopes, trailer, tone).

### 2. Group changes logically

Group changes that should be committed together. Apply judgment — closely
related work belongs together even if it spans patterns. Default heuristics:

- Group by the feature/capability being added or changed.
- Keep code and the doc that describes the same change together.
- Separate unrelated changes; separate formatting from logic; separate tests
  from implementation unless closely related.
- Config/tooling changes are their own commit unless clearly part of one change.

If `.zenku/commit.md` declares project-specific grouping, that table wins over
these defaults.

**Don't mix unrelated changes** in a single commit. Keep commits atomic but
meaningful.

### 3. Draft commit messages

Conventional commits format:

```
type(scope): brief description

Longer explanation if needed.
- Detail 1
- Detail 2
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

**Scopes:** derive from the area touched, or omit for repo-wide changes. Follow
any scope conventions in `.zenku/commit.md` or evident in `git log`.

**Message quality:**
- Imperative mood ("add", not "added" or "adding").
- No period at end of subject line.
- Subject line under 50-72 characters.
- Body wrapped at 72 chars when needed.
- Do NOT use `!` after type/scope for breaking changes — use a
  `BREAKING CHANGE:` footer instead.
- Do NOT use internal tracking IDs as the scope.
- Include a co-author / generated-by trailer only if the project's convention
  (in `.zenku/commit.md` or evident in `git log`) uses one.

### 4. Present plan and get confirmation

**Always** use `AskUserQuestion` to present the proposed groups and get
confirmation, even for a single obvious group. Include the full breakdown with
file lists in the question text.

- Do NOT use markdown formatting in the question text — it doesn't render.
  Use plain text with indentation and dashes.
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

### 5. Execute commits

For each approved group:

```sh
git add <files>
git commit -m "$(cat <<'EOF'
type(scope): description

Optional body.
EOF
)"
```

Stage exactly the files in the current group — never `git add -A` or
`git commit -a`.

## Safety

- Never force push, never modify git config, never skip hooks unless
  explicitly requested.
- Warn before committing to `main`/`master`.
- If a pre-commit hook fails: fix the issue, re-stage, create a **new**
  commit rather than amending.
- No changes to commit → say so and stop.
- Merge conflicts present → list them, ask the user to resolve, stop.
