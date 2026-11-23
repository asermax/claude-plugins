# Committing your own changes from a shared checkout

verified: 2026-11-23

Answers how to commit only your own changes when several agents work in one checkout at the same time. In that checkout, another agent may have staged files, may have uncommitted edits in a file you also changed, and may leave unfinished work that fails the pre-commit hook.

## Knowledge

- `git commit -- <paths>` (the `--only` form) commits those paths and leaves the rest of the index as it is, so another agent's staged files stay staged. It commits the whole working-tree file, though, including another agent's hunks in a file you both changed.
- To commit only your hunks of a shared file, build a separate index. `GIT_INDEX_FILE` points every git command at it, and the shared index is not touched:

```bash
export GIT_INDEX_FILE=/path/to/commit.index
git read-tree HEAD
git add -- <files that hold only your changes>
blob=$(git hash-object -w <copy of the shared file: HEAD's version plus only your hunks>)
git update-index --cacheinfo 100644,"$blob",<path of the shared file>
git diff --cached --stat
git commit -F message.txt
```

- Build the separate index right before each commit attempt. `git commit` makes a commit whose parent is the current HEAD and whose tree is that index. If another agent commits after `read-tree`, the tree lacks their change and your commit reverts it.
- After a commit made through a separate index, the shared index still holds the old blobs for your paths, so `git status` shows them as staged changes that undo your commit. `git reset -q -- <your paths>` sets those entries back to HEAD. Check `git diff --cached -- <paths>` first: it should show only the reverse of your own change.
- A pre-commit hook that checks the whole working tree (a repository-wide typecheck, lint or format check) fails on another agent's unfinished edits even when your commit is clean. Never bypass it. Commit from a worktree that holds only your changes, so the hook checks what you commit:

```bash
base=$(git rev-parse HEAD)
git worktree add --detach ../repo-commit "$base"
# copy your files into ../repo-commit and install dependencies there
git -C ../repo-commit add -- <your paths>
git -C ../repo-commit commit -F message.txt
git update-ref refs/heads/<branch> <new commit> "$base"
git reset -q -- <your paths>
git worktree remove --force ../repo-commit
```

- `git update-ref <ref> <new> <old>` moves the branch only while it still points at `<old>`, and fails if another agent committed in the meantime, so no commit is lost. The shared checkout's working tree already holds your content, so after the reset your paths show as clean.

## Sources

- git 2.x behaviour of `GIT_INDEX_FILE`, `git commit --only`, `git update-index --cacheinfo`, `git worktree` and `git update-ref`, used in a checkout shared by several coding agents, 2026-11-23.
