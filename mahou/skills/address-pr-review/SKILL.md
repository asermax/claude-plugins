---
name: address-pr-review
description: Works the review left on an open pull request. Fetches the live threads, verifies each finding against the code, settles them with the user, applies what they approve, then commits, pushes and resolves the threads. Use when a reviewer, a person or a bot, has commented on a PR. Typed by the user, or run by mahou:land when a review arrives.
argument-hint: [pr-number]
---

Load mahou:basics first. Then read `.mahou/address-pr-review.md` if present.

# Address PR review

The review that sits on GitHub, verified and settled with the user before anything changes. The local pass before a PR exists belongs to mahou:human-review; this skill starts where that one ends.

Landing is the one place this skill bends the rule against committing as a side effect. Once the user has approved the findings and then the commit grouping, the commit, the push and the thread resolution follow without another question. Resolving threads is the only write this skill ever makes to the PR.

## Step 1: Establish the changeset

Load mahou:changeset. The repository path, the base and the introduced-versus-pre-existing rule all come from there. The PR's base branch is the changeset base.

## Step 2: Locate the PR

Use the number the user passed. Otherwise, `gh pr view --json number,url,baseRefName` on the current branch names it. If there is no PR for the branch, say so and stop.

## Step 3: Fetch the review

One query returns everything. The two obvious alternatives both lose information: `gh pr view --json reviews` returns bodies with no resolution state, so settled threads look live, and `gh pr view --comments` returns issue comments, which are not where the findings are.

```bash
gh api graphql -f query='
query($owner:String!,$repo:String!,$number:Int!){
  repository(owner:$owner,name:$repo){
    pullRequest(number:$number){
      reviews(first:20){nodes{author{login} state body}}
      reviewThreads(first:100){nodes{
        id isResolved isOutdated path line originalLine
        comments(first:20){nodes{author{login} body}}
      }}
    }
  }
}' -f owner=OWNER -f repo=REPO -F number=N
```

Reading the result:

- Skip threads with `isResolved: true`. They are settled.
- `line` is null when `isOutdated` is true. Use `originalLine`.
- A reply from the user inside a thread is a ruling they already made. Carry it into the report as decided; do not ask again.
- The review body is framing (summary, tables, counts), but a finding that appears only there, with no thread, is still a finding. Include it.

## Step 4: Verify every finding

A review is a claim, not a fact. Read the flagged lines before responding. Give each finding a verdict, either Confirmed, Partly, Not a bug, or Intended, with the lines that settle it quoted, and say whether the change introduced it or it predates the change, which `changeset` covers.

Test the premise, not only the conclusion. A finding often states a fact on the way to its point ("the redirect's referer is internal", "nothing catches this"). Go read that fact. A correct conclusion on a wrong premise is usually sized wrong, and sometimes points the other way.

Check the finding against rulings already made: earlier in this session, in the change's scratch folder, in the project's docs. A finding the user already declined is reported in one line as previously declined, with the reviewer's new argument if there is one. It is not re-argued.

## Step 5: Present, then stop

Load mahou:report for the shape. Verdicts stay short. Confirmed findings get the evidence and the fix. Not a bug and Intended get one line for the reason. The user routinely overrides that verdict, and that is the correct outcome, so do not argue it down at length.

Answer any question a reviewer asked before listing findings, because an answer changes what gets applied.

Change nothing yet. Never apply the obvious ones unasked. Where two readings of a finding produce different code, ask which one.

## Step 6: Apply what the user approves

Before writing code, read the project's `CLAUDE.md` and `.mahou/basics.md` when present, and read the wiki entries for the technologies the fix touches. Follow the conventions of the repository you are in.

A reviewer's suggested code is a sketch. When it fails the repository's own checks (a lint rule it did not know about, a type the repository forbids), substitute an equivalent and say what changed and why.

Run the repository's linters and tests afterwards, scoped to the files you touched rather than the whole tree. The project's `CLAUDE.md` usually names the commands; when it does not, detect them from the lockfile or manifest and say which you ran.

## Step 7: Land

No further question. The user approved the findings; the commit procedure asks about the grouping; nothing else needs consent.

1. Commit following `${CLAUDE_PLUGIN_ROOT}/skills/commit-changes/SKILL.md`, read and followed as written. mahou:commit-changes is typed only, so it cannot be invoked from here; its procedure owns the grouping and the message format all the same.
2. Push the branch.
3. Resolve every thread the user ruled on, applied or declined, by its `id` from Step 3:

```bash
gh api graphql -f query='
mutation($threadId:ID!){resolveReviewThread(input:{threadId:$threadId}){thread{isResolved}}}' \
-f threadId=PRRT_xxx
```

Findings the user has not ruled on stay open.

### Never write to the PR

Resolving a thread is the only write to GitHub this skill performs. Never post a thread reply, a PR comment or an issue comment: not to note that a finding was applied, not to justify a declined one, not to add context the reviewer lacked. Everything worth saying goes to the user in the reply, where they can push back. A thread reply puts assistant-authored commentary on the permanent record for every other reader of the PR, and that pull is strongest on declined findings. Resolve the thread and tell the user the reasoning.
