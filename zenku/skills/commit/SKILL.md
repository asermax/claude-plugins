---
name: commit
description: Analyze uncommitted changes and create grouped conventional commits.
disable-model-invocation: true
---

# Commit

Load `zenku:codex` first, for the project's code roots and checks and for the habit of showing the plan before writing anything.

## 1. Analyze

Run in parallel: `git status`, `git diff --staged`, `git diff`, `git log -5 --oneline`. Staged and unstaged changes are both fair game — the user may have started staging selectively before invoking this.

**Read `git log` to match the repository's existing style**: its scopes, its trailer, whether it writes bodies or bare subjects, whether it hard-wraps. None of that is this skill's to decide, and all of it is visible in the last handful of commits.

## 2. Group

Closely related work belongs together even when it spans patterns. Group by the capability being changed; keep code with the doc describing that same change; separate unrelated changes, formatting from logic, and tests from implementation unless they are one thing. Where the project's layout implies a grouping — a unit that does not compile if split — follow it.

Two groupings are this framework's rather than the project's, and neither is visible from the paths:

- **Quest log records commit apart from the code they are about.** A record has to stand on its own on the trunk; the code it describes may never get there.
- **A struck effort is one commit of its own**, holding every deletion and nothing else. Those deletions are the effort's entry in the project's history and the only place its name survives, so the message says what shipped and points at the lore page. Never fold them in with the code they were about, and never split them across the journey and the raid: the effort ended once.
- **Spike commits stay in the adventure's spike worktree**, on a branch that is never merged, so they never reach a group here at all.

## 3. Draft the messages

Conventional commits: `type(scope): brief description`, optionally a body saying **why**.

Scopes derive from the area touched, or are omitted for repo-wide changes — follow what `git log` shows.

Add a co-author or generated-by trailer only if `git log` already uses one, copying its exact form.

## 4. Verify anything under the code roots

Run the project's `**Checks**` before committing code. A commit is the last honest place to check. Anything red: say which, and do not commit.

Two exemptions: a **spike** skips this entirely, because exemption from the quality bar is what made it cheap enough to throw away, and a group with **nothing under the code roots** has nothing to run.

## 5. Confirm

**Always** use `AskUserQuestion` to present the groups, even for a single obvious one. Put the full breakdown with file lists in the question text, as plain text with indentation and dashes — markdown does not render there, and do not add an "Other" option because the system adds it.

Offer "Merge into fewer commits" when there are four or more groups.

## 6. Execute

Stage exactly the files in the group, never `git add -A` or `git commit -a`. A stray file in a commit is invisible until someone reverts it.

## Safety

**Nothing gets committed that the user has not approved in step 5.** That holds however obvious the change looks and however recently they approved a previous one.

- **Committing quest log records to the trunk is normal** and needs no warning. **Code is different:** if a group touches the code roots and you are on the trunk, say so and offer a branch first.
- A failing pre-commit hook: fix it, re-stage, and make a **new** commit rather than amending.
