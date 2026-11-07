---
name: agentic-review
description: Refines the code in a change before a human reads it. Runs four facet reviewers and one conventions reviewer per wiki entry and per project rule file on each repository, fixes what they find without changing how the change looks or behaves, and repeats for up to three rounds. Typed by the user, or invoked by mahou:implement once a repository's code lands.
---

Load mahou:basics first. Then read `.mahou/agentic-review.md` if present.

# Agentic review

Cleans up a change so mahou:human-review spends its attention on judgment instead of on mechanical findings. It reviews for reuse, simplification, efficiency, altitude, and conformance to the conventions the wiki holds.

It does not look for correctness bugs. Those belong to the human pass, where someone can weigh whether the behavior was intended.

## Fixing without asking

`basics` says every decision belongs to the user and every choice goes back to them as a question. This skill is the exception, and it holds inside these bounds:

- It fixes nothing that would change how the change looks or behaves.
- It keeps the change's contracts with other repositories (the requests, responses and events that cross a deployable's boundary), the change's architecture (which deployable and which layer does each job), and the cases the change's tests check. Everything else inside the repository can change when a finding asks for it, even when the program design, the prototype or a user decision set it. That includes names, file locations, how the code is split into functions, components and hooks, the interfaces between those parts, and the names of tests. Design reconciliation brings the design files up to date with what the review changed, so the review never skips a finding because a design file or a decision set it another way.
- It may create a new file or edit a file the changeset does not touch when the fix reduces complexity or duplication, or otherwise improves the code.
- It leaves everything uncommitted, so the user can read the whole pass with one `git diff` and discard it as a whole.
- It reports every fix and every skip.

A finding whose fix would break any of those becomes a skipped finding in the report, for the user to rule on.

## Step 1: Establish the changeset

Load mahou:changeset for the repositories, the base, and the diff.

Then settle the conventions list, the sources the conventions reviewers check the change against. When the caller passes one, use it as given. When it does not, follow the wiki indexes, global and local, to the entries about the technologies the diff touches, and add the project's `CLAUDE.md` and `.mahou/basics.md` when present. Open every source on the list. Every fix has to follow them.

## Step 2: Dispatch the facet reviewers

Per repository, one reviewer per facet and one conventions reviewer per source on the list, all in a single message so they run together.

| Facet | Agent | Looks for |
|---|---|---|
| Reuse | `mahou:reuse-reviewer` | new code re-implementing something the codebase already has |
| Simplification | `mahou:simplification-reviewer` | redundant or derivable state, copy-paste with variation, deep nesting, dead code left behind |
| Efficiency | `mahou:efficiency-reviewer` | redundant computation, repeated I/O, independent work run sequentially, closures pinning large scopes |
| Altitude | `mahou:altitude-reviewer` | special cases layered on shared infrastructure where the mechanism underneath should generalize instead |
| Conventions | `mahou:conventions-reviewer`, one per source | departures from the one wiki entry or rule file it is given |

Give each one the repository's absolute path, the base, the diff, and the path to write its findings to. Give each conventions reviewer the path of its source as well, and a findings path of its own.

Reviewers write findings to that file and return the path and a count. Nothing comes back in the message body, which truncates long reports and costs a round trip to recover.

Every round spawns fresh reviewers; never resume one from an earlier round. A reviewer that has seen its own last report defends it and repeats what was skipped, and a reviewer resumed per facet only hears about its own fixes, so it can undo what another facet fixed. From the second round on, give every reviewer the ledger (Step 4) as well.

## Step 3: Apply what came back

Read every findings file. Collapse findings that different facets raised about the same line or mechanism, then fix each survivor.

Skip a finding when its fix would change intended behavior, reach outside the bounds above, or when you judge it a false positive. Record the skip with why the reviewer proposed the change, the problem the reviewer saw in the code, and why you skipped the finding. Never argue with it.

Then read every comment the diff adds, yourself, against the project's comments rule: a wiki entry, the project's `CLAUDE.md` or a rule file in the repository. The reviewers do not flag comments. Remove or rewrite every comment the rule does not allow. When the project states no comments rule, say so and leave the comments as they are.

Run the repository's linters and tests afterwards, scoped to the files you touched rather than the whole tree. The project's `CLAUDE.md` usually names the commands; when it does not, detect them from the lockfile or manifest and say which you ran.

## Step 4: Record the round and show it

Keep one ledger per repository at `agentic-review/<repo>.md` in the change's scratch folder. At the end of each round, append a section for the round with every fix applied (file, line, the facet that raised it, what changed) and every skip with its reason, then the linter and test results.

Show the user the round's status: per repository the count of fixes and skips, one line per fix, each skip with its reason, and the checks' result. Then start the next round without waiting for an answer.

## Step 5: Round again, up to three times

Run Step 2 again with fresh reviewers and the ledger. Tell each reviewer:

- Every fix in the ledger is settled. Do not propose reverting or reshaping one, unless the fix itself introduced a problem on your angle; then cite the ledger entry.
- Every skip in the ledger is settled. Do not raise it again.
- Report only what still stands on your angle in the current diff.

When applying the round's findings, drop any finding that reverses a ledger fix or repeats a ledger skip, and record it as dropped in the round's section.

Stop when a round returns no findings that survive, or after the third round, whichever comes first.

## Step 6: Report and hand off

Per repository: what each round fixed, what it skipped, and the linter and test results, with the ledger path. Write each skipped finding so the user can rule on it without asking back: the problem the reviewer saw and why the reviewer proposed the change, then why the review skipped the finding. Everything stays uncommitted.

Then hand off to mahou:human-review.
