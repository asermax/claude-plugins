---
name: release-check
description: Finds what breaks when the repositories of a change are released in a given order, and gives the order that breaks nothing. Compares each branch with the deployed version on both sides of every service boundary, including services the change does not touch, and runs code-blast-radius alongside. Use before opening the pull requests of a change that touches more than one repository, or one that other services or a distributed client depend on.
argument-hint: [repo-path ...]
---

Load mahou:basics first. Then read `.mahou/release-check.md` if present.

# Release check

Before a change lands, finds which version pairs cannot run together and in which order the repositories have to be released. It changes nothing and merges nothing.

## Step 1: Establish the changeset and prepare the repositories

Load mahou:changeset. It settles which repositories are in the change, the base of each branch and the diff.

For each repository in the change, record the deployed version, which is the latest release tag, or the default branch when the repository has no releases. Fetch tags so you can read the deployed version locally.

```
git -C <repo-path> remote get-url origin
gh release list --repo <owner>/<repo> --limit 1 --json tagName
git -C <repo-path> fetch origin --tags --prune
```

The neighbours found in Step 2 are not in the change, so read them at their deployed state. For each neighbour: clone it when it is missing, into the same parent directory as the repositories already in the change; pull it when it is clean on its default branch; stop and ask the user when it is on another branch or carries uncommitted changes. Never stash, reset or check out on your own.

## Step 2: Find the boundaries

A boundary is a caller and callee pair where at least one side is in the change. There is no dependency map to read here, so the boundaries come from two places:

- The diff. A request the change sends to or accepts from another service names that service. Read the URLs, clients and payload types the diff touches, and list every service on the other end.
- The user. Present the candidates you found and ask for the boundaries you could not see: which services call the ones in the change, and which they call, including the ones the change does not touch. Do not guess a boundary; a service that talks to the changed one and is not listed goes untested, and that is the pair that breaks in production.

Mark the boundaries whose caller keeps running an old build after a release, such as a mobile app or a distributed CLI. On those, the old caller against the new callee lasts hours or weeks, not the minutes a deploy takes.

## Step 3: Check every boundary in parallel

Dispatch one `compat-checker` per boundary, and mahou:code-blast-radius on the whole change, all in a single message. Spawn the checkers as plain subagents.

Give each checker the caller and callee repositories with absolute paths, which of the two is in the change, the base and branch tip of each changed side, the deployed version of each side, and whether the caller keeps running an old build. Each checker tests both directions and the migrations of the changed side, and reports only the pairs that break, with the lines that prove each one.

## Step 4: Verify what comes back

Checker findings arrive unverified. Read the lines each finding cites before it goes in the report. Drop a finding that does not name a request or response that fails, a validation that rejects, or a query that no longer resolves. Add the `code-blast-radius` findings that cross a service boundary; the ones inside one repository belong to that skill's report.

Keep the attribution of each finding: introduced by this change, or pre-existing and widened by it.

## Step 5: Derive the order and report

The order follows from the findings. When the new callee breaks the old caller, the caller releases first. When the new caller breaks the old callee, the callee releases first. When both directions break, the two sides have to release together or the change needs a compatibility step; say so and let the user decide. When an old build of a client breaks against the new callee, no order fixes it; report it for the user to decide.

Report, in this order:

- the changeset composition, in one line
- the boundaries checked, and which ones came from the user rather than the diff
- the findings, each with the boundary, the direction, the file and line on each side, and the attribution
- the release order, with the reason for each position
- the periods inside one repository when old and new code run together, such as migrations against instances still running the old code, for the user to decide on

Repositories with no dependency between them can release in any order; say so.

When nothing breaks in any order, say so in one line and list the repositories.

Stop there.
