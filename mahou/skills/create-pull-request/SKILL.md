---
name: create-pull-request
description: Opens a pull request from a branch in one repository, detecting its base from commit distance and writing the title and body from every commit on the branch. Use when a branch is ready for review and the user asks for the pull request.
argument-hint: [repo-path] [branch-name]
---

Load mahou:basics first. Then read `.mahou/create-pull-request.md` if present.

# Create pull request

Opens one pull request from one branch. It merges nothing and decides nothing the repository or the user has not settled.

## Step 1: Resolve the repository and the branch

The repository comes from the argument, or from the working directory. Read the owner and name from the remote, supporting both SSH (`git@github.com:owner/repo.git`) and HTTPS (`https://github.com/owner/repo.git`) forms:

```
git -C <repo-path> remote get-url origin
```

The branch comes from the argument, or from `git -C <repo-path> branch --show-current`. Detached HEAD with no argument: ask for the branch.

## Step 2: Find the base branch

Fetch first. Then compare the branch against every remote ref except `HEAD` and its own tracking ref:

```
git -C <repo-path> fetch origin --prune
git -C <repo-path> rev-list --left-right --count origin/<candidate>...HEAD
```

The base is the branch with the fewest commits ahead of HEAD, the one this branch was most likely forked from. Distance ties or an unclear picture go to the user with the numbers; never guess between `main` and `master`. State the base you settled on and its ahead/behind counts.

## Step 3: Analyze every commit on the branch

List the commits the branch has over the base (`git log origin/<base>..HEAD`) and read each one's files changed. The pull request reflects the whole branch, not the latest commit. A PR already open for the branch: report its URL and ask whether to update it instead of creating a second one.

## Step 4: Write the title and body

- **Title.** A single commit takes its subject line. Several commits get one descriptive title covering what the branch accomplishes together. Strip conventional-commit prefixes: "Add cycle recommendations" rather than "feat(study plan): add cycle recommendations".
- **Body.** A `## Summary` with two to four factual bullets on what the branch accomplishes, derived only from the commits. No file listing, no test plan section, no validation section.

Show the title, the body and the base, and wait for the user's confirmation before creating anything.

## Step 5: Create and report

```
gh pr create --repo <owner>/<repo> --head <branch> --base <base> --title "<title>" --body "<body>"
```

Report the pull request's URL. Then stop; the review and the merge are not this skill's.
