---
name: rebase
description: Brings a branch up to date with its base by fetching, rebasing, resolving, and verifying, then reports what moved. Never pushes.
argument-hint: [repo-path]
---

Load mahou:basics first. Then read `.mahou/rebase.md` if present.

# Rebase

Moves a branch onto the current tip of its base and proves it still works. It does not push, does not open or update a pull request, and does not rewrite the branch's own commit structure.

## Step 1: Fetch and find the real base

`git -C <repo-path> fetch origin --prune` first. Everything after this depends on refs that are actually current.

Then work out which branch this one is based on. Do not assume, and do not trust `origin/HEAD`. A repository's remote default is often not the branch feature work integrates into, and the two can diverge by a long way. Determine it from the branch's own history (`git merge-base`, `git log`), from where sibling branches sit, or by asking. State which base you settled on and why before touching anything.

Read ahead and behind counts from the **remote** ref, never a local branch of the same name. A stale local copy reports a distance that is not real:

```
git -C <repo-path> rev-list --left-right --count origin/<base>...HEAD
```

If the branch is already at zero behind, say so and stop. There is nothing to do, and rebasing anyway rewrites hashes for no reason.

## Step 2: Report what will be replayed

Before moving anything, report:

- the commits the base has gained (`git log HEAD..origin/<base>`)
- the files those commits changed, against the files this branch changes

Files changed on both sides are where conflicts will come from. No files in common usually means a clean replay. Either way the user learns what is coming before it happens rather than after.

## Step 3: Rebase

`git rebase origin/<base>`. Resolve conflicts by understanding both sides: read the incoming commit to see what it was doing, not just the markers. When a conflict is genuinely ambiguous, stop and ask rather than picking the reading that produces less work.

If the base changed a lockfile, reinstall dependencies before running anything. A suite that fails on a missing import after a rebase is usually this and not the rebase.

## Step 4: Verify

Run the repository's linters and test suite.

When the branch carries more than one commit, check out each one and run the suite against it. A history that only passes at the tip cannot be bisected, and a rebase is where that breaks without anyone noticing. When it is a single commit, the tip is the whole branch and one run covers it.

Confirm the content survived: `git diff` between the pre-rebase tip and the new one should be empty. Anything else is a conflict resolved wrongly, so report the difference rather than explaining it away.

## Step 5: Report

Give the base and its new tip, the commits replayed, what conflicted and how it was resolved, and the verification results. Then stop. Pushing is a separate decision and it is the user's.
