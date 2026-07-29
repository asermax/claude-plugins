---
name: commit
description: Group the working changes into conventional commits and make them. Trigger when the user asks to commit, to commit their changes, or to make a commit.
---

# Commit

Read the changes, group them, agree the grouping, commit. The value is in the grouping and in the bodies; the rest of this is guardrails.

Resolve the code roots and the checks per `zenku:framework-core` §1.

## Read everything first

```bash
git status --short
git diff
git diff --staged
git log -6
```

Staged and unstaged both count — the user may have started staging before invoking this.

**Read `git log` for the house style rather than assuming a generic one.** Whether this repo writes real bodies or bare subjects, whether they are hard-wrapped, which scopes it actually uses, whether messages carry a co-author trailer — all of that is visible in the last handful of commits and none of it is this skill's to decide. Match what is there.

## Group by the change, not by the file

One commit is one thing that happened. A change and the doc describing it belong together; two unrelated fixes do not; formatting is its own commit; a rename is its own commit.

Two groupings are the lab's rather than the project's, and they are not obvious from the paths:

- **Lab notes commit apart from the code they are about.** The framework requires a note to reach the trunk on its own, and a spike never does.
- **On an idea's branch, keep each experiment's spike a recognisable commit**, because `zenku:promote` and `zenku:drop` deal with them later as a set — and because dropping them is one `reset`, which is only clean if the boundary is clean.

Beyond those, the project may have groupings of its own — a unit of code that does not compile split across two commits is the usual tell. Read the log and the layout.

## Say the plan before making it

Show the groups with their files and subject lines, and stop for agreement. Grouping is a judgement someone may disagree with, free to change before the commits exist and annoying after.

Where there is a real choice — several plausible groupings, or something you are unsure belongs — put it in `AskUserQuestion`. One obvious group needs a sentence, not a dialog.

## Verify anything under the code roots before committing it

Run the project's `**Checks**`. A commit is the last honest place to check, and the project's own rule is that they are green before a change counts as done.

If any of them fails, say which and **do not commit**. A red commit on the trunk is worse than an uncommitted change.

Two exemptions:

- **A spike on an idea's branch skips this entirely.** Experiment code is exempt from the quality bar, and speed is the whole reason it is cheap enough to throw away.
- **Nothing under the code roots in the group** — notes only, configuration only — means there is nothing to run.

## Then commit

```bash
git add <the files in this group>
git commit -m "$(cat <<'EOF'
<type>(<scope>): what changed

Why, in prose, matching the wrapping this repo uses.
EOF
)"
```

**Name the files. Never `git add -A`, never `git commit -a`** — a stray file in a commit is invisible until someone reverts it.

Subject: type, optional scope, lowercase, imperative, no trailing period, under about 72 characters. A breaking change is a `BREAKING CHANGE:` footer, never a `!`. Bodies say **why** rather than restating the diff. Add the co-author trailer only if the log shows the repo uses one, and copy its exact form.

## Guardrails

**Committing notes to the trunk is normal** and needs no warning — the framework requires them to land there directly. **Code is different:** if a group touches the code roots and you are on the trunk, say so and offer a branch first.

Never force push, never touch git config, never `--no-verify`, and never amend to fix a failed hook — fix it and make a new commit. Nothing to commit, or a conflict in the tree: say so and stop.
