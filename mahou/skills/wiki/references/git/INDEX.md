# git

- [`partial-commits`](partial-commits.md): committing only your own hunks from a checkout where other people have staged and unstaged edits, through a temporary index or a worktree when their unfinished work fails the commit hook, rebasing the worktree's commits when the branch moved before `update-ref`, staging a file version that differs from HEAD and the working tree, resyncing the real index afterwards, and restoring the shared hooks a worktree install rewrote
