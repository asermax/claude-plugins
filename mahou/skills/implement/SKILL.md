---
name: implement
description: Implements a change whose design and test design are settled, by delegating one subagent per repository with the full context: the tasks, the design notes, the test matrix rows for that repository, the repository rules and the report shape. Collects the results, then delegates the manual validation rows one repository at a time against the local system, fixing failures against previous decisions until every row passes, the round-based agentic review on the branches, and the design reconciliation. Use after test-design, before human-review.
argument-hint: <the tasks, the design notes, the test matrices, the repositories and the branch name>
---

Load mahou:basics first. Then read `.mahou/implement.md` if present: it is where a project names its task tracker, the tool that reaches it and the states a task moves through. Follow the wiki indexes only far enough to know which entries exist; the subagents read the entries for the code they touch.

# Implement

Takes a change the user has designed and test-designed and gets it written, one repository at a time, by subagents that receive everything a person joining the work would need. It composes the briefs, dispatches, relays what comes back, and delegates the passes that follow the code, in this order: the manual validation, which fixes what fails against previous decisions, the agentic review, and the consistency check, each to a subagent per repository.

## Opening

1. **Collect the inputs.** The tasks when the project tracks them, the design notes, the test-design trees with their matrices, the repositories the change touches, the branch name, and the subagent model and effort the user wants. Ask for whatever is missing in one round; do not start a subagent without the matrix rows for its repository.

2. **Group the repositories.** One subagent per repository. A change ported from one surface to another, web to mobile for instance, goes to a single subagent that does the source repository first, because the port needs its context. Show the grouping and wait for the user's approval.

## The brief

Every subagent gets the same brief, filled for its repository. Nothing in it is optional, and the brief leaves the subagent nothing to look up.

- **The change.** The design notes by path or URL, and a design summary in the brief itself: what changes, the shapes that cross systems, the rules the design settled, what is out of scope. Tell it to read the notes before touching code, with the reasoning effort the user named.
- **The tasks.** The ones assigned to its repository, each with what it requires in one or two sentences and the order to work them in. Without a tracker, the list comes from the test-design trees and the user.
- **The tests.** The matrix rows of the subagent's repository, verbatim, with each row's `★` mark, expected outcome and kind, plus any `Deleted:` lines under each branch, read from the change's scratch folder at `test-design/<repo>.md` when test-design wrote them there. On `test` rows (including `test + manual`), a `★` row is a new test the subagent writes, at the level the repository's conventions name and named after what the test proves; an unstarred row whose expected outcome is the one the suite already checks is a regression row, left untouched and still passing; an unstarred row whose expected outcome changed is updated to match it; a test listed under `Deleted:` is removed from the suite. The rows carry ids for the matrix only: no row id, tracker id, or scratch path appears in a test name, comment, or docstring; the mapping stays in the scratch folder and out of the repository. The `manual` rows are for later; the subagent does not run them.
- **Repository rules.** Fetch and pull the default branch as mahou:changeset resolves it, create the branch the user named from it; stop and ask when the working tree is dirty or the repository sits on another branch with unpushed work. Follow the project's `AGENTS.md`, `.mahou/basics.md` when present, the wiki entries for the technologies it touches, and the user's own coding style file. Where a wiki entry defines a component or library for what you are building, use it instead of writing a custom equivalent; on frontend screens, start from the wiki's frontend entries. The prototype and the program design bind the code only as far as mahou:agentic-review says under "Fixing without asking". Within those bounds, write the code the wiki entries, the project's rules and the user's style file ask for, and report each place where the code departs from the program design. Keep changes minimal and consistent with the surrounding code. Run linters and the full relevant suites; everything must pass. Commit on the branch through mahou:commit-changes, and commit the groups it proposes without asking the user to confirm them; do not push, do not open a pull request. Do not touch other repositories. Avoid `rm -rf` when another way works, such as `rm -r` on a named path or leaving temporary files in `/tmp`, because a permission rule can turn `rm -rf` into a dialog that blocks the subagent until the user answers.
- **Tracker states**, only when the project tracks tasks: move each task to the tracker's in-progress state when it starts it and to its done state when its change is implemented, tested and committed, using the tool and the state names the project declares. The list stays current: work the tracker does not register becomes a new task, created and worked like the rest; a task that dissolves mid-work is closed with a line saying why. Each is named in the report. The tracker can be anything (Linear, Jira, Notion, GitHub issues, a beads database) and the brief names it concretely.
- **How to answer.** A report in the shape mahou:report gives: the branch, the commits, a summary per change, the row-to-test mapping, the linter and test output tail, and what it could not resolve. The report is the whole of the subagent's final message, because the session that collects the result reads only that message. A shorter message sent after the report replaces it. Every later instruction to the subagent repeats this. A design ambiguity that changes the outcome is a question back through the subagent's question channel, not a guess. The subagent applies a fix the user decided exactly as the user decided it. When the subagent thinks another fix fits better, it asks through the same channel instead of applying its own.

## Dispatch and collect

Start the subagents together with the mechanism the session offers, the Agent tool or a delegation skill the user names. One task per repository, labelled by repository. Wait for each result without polling. Do not relay results to the user as they land. Record each one in `implementation-status.md` (below), and dispatch the next subagent. Every decision you record, whether a flag, a question or a departure from the design, carries enough context for the user to decide without asking back. Start with why the subagent raises the decision. Answer the subagent's questions with the user's decisions and no others. Release a subagent once its result is collected and nothing remains to ask it.

When a subagent cannot continue without an answer, send the subagent's question to the user as soon as the question arrives, with that same context. Repeat it at the top of every later reply until the user answers it.

The user asks for the state with mahou:implementation-status-report.

### implementation-status.md

Keep `implementation-status.md` in the change's scratch folder for the run. Create it when the first subagent starts and give it its line in `status.md`. Update it in place rather than appending to it:

- **Blocking questions.** Each question a subagent is waiting on, until the user answers it.
- **Shared.** A change, highlight or open item that applies to several repositories, described once with the repositories it covers.
- **One section per repository**, with:
  - **Status.** Its checkout and branch, the stage it is in (implementing, validating, fixing blocked rows, validated, reviewing round n, reviewed, reconciling), its commits, the checks' last result, and the subagent or check running on it. Rewrite it when any of these changes.
  - **Highlights.** One line per event that the status does not show and that a later report must mention, such as a departure from the design or a fact that changed a plan. Remove a line once a report has carried it and the event no longer bears on anything open.
  - **Open items.** Every decision waiting on the user, each with the full context the report needs. Remove an item when the user settles it, and record the settlement where `basics` says decisions live.

A subagent kept for further work, such as the manual validation, a fix or the review, carries every earlier task in its context. Check its context use whenever it finishes a task. When its context use nears half, have the subagent run `/compact` with a list of what to keep, such as the checkout it works in, the safety rules and where the briefs live, then send the next task. Compact only between tasks, never while the subagent is working on one.

When the user steers mid-run, forward the steering to every subagent it concerns as a supervisor directive; a subagent that is mid-turn picks the directive up when it finishes the turn.

## Manual validation

Validation runs before the review, so the review runs once over the code that passes validation instead of after every batch of fixes.

The manual rows run one repository at a time against the shared local system, from the repository the others depend on outward, so two subagents never mutate the same system at once. A repository's validation starts once its implementation subagent has reported and the repository before it has finished its validation run. For each repository, one subagent gets the manual rows with their expected outcomes and setup, and the identities and inputs the user provides; the repository's implementation subagent, when still available, gets only that, and a newly spawned one gets the full implementation brief as well. It loads mahou:validate, runs the rows through it, and produces the report artifact `validate` requires. It brings up everything the rows need without asking, and stops to ask only when a credential is missing or a service fails to come up. It captures and restores every record it creates or mutates.

### Fixing without asking

The subagent fixes a failing row without asking, inside the bounds mahou:validate gives, and re-runs the rows until every row passes or is blocked. Every fix stays in the subagent's repository: when the cause sits in another repository, the row is blocked and the report names the cause and the repository. A bug the run finds that no row and no previous decision covers is reported, not fixed. The subagent commits its fixes through mahou:commit-changes without asking the user to confirm the groups, and reports the rows with their results, each fix with what failed, what the fix changed and its commit, each blocked row, and each bug it left unfixed.

Record the fixes in the repository's status, each blocked row as a blocking question with the evidence and what each way out changes in the designed behaviour, and each unfixed bug as an open item. The next repository's validation starts without waiting for the user's answers.

### Fixing what the user decides

Once the user settles a blocked row, the repository's subagent applies the decision exactly as the user decided it, commits it, and re-runs the affected rows, plus any row the fix's code reaches. When the decision needs another repository, that repository's subagent applies it and the rows that depend on it re-run in both. A re-run waits for the system like any other run. Repeat until every row of every repository passes; the repository's stage is then validated.

## Agentic review

When every repository is validated, dispatch the agentic review for every repository at once: a subagent invokes mahou:agentic-review on that repository's changeset, the branch measured against the default branch. When the repository's implementation subagent is still available, send it only this new instruction; when a new subagent is spawned, its brief carries the same change context, tasks and repository rules the implementation brief did, plus the instruction. The review runs in rounds, each with fresh reviewers and the ledger of the earlier rounds' fixes and skips, so a fix is not undone in a later round. It fixes inside its own bounds and leaves its fixes uncommitted. The review does not change behaviour, so validation does not run again after it.

The ledger of each repository's review is the round status the user reads mid-run; point to it from the repository's status. When the review ends, the subagent that ran it commits the fixes on the branch through mahou:commit-changes, committing the groups `commit-changes` proposes without asking the user to confirm them. Record the fixes and their commits in the repository's status.

Then record every finding the review skipped as an open item of the repository: apply it or leave it. Give each finding with enough context to rule on it without asking back: the problem the reviewer saw and why the reviewer proposed the change, then why the review skipped the finding. A finding the user decides to apply is applied by an implementation subagent and committed; it gets no further review round, since mahou:human-review reads it next. Record each finding the user leaves as skipped in the change's scratch folder.

## Design reconciliation

The code that lands is what was actually built, and the notes drift from it the moment a child deviates, simplifies, or meets a platform fact. When every repository's review has ended and its skipped findings are settled, collect the drift: every flag a subagent raised about a design mismatch, every pointing callout in a touched note whose condition has now landed, and every diagram that renders a shape the change altered. Then dispatch a `mahou:consistency-checker` per repository with a summary of what the change replaced. It finds the leftovers and disagreements that no flag named. The user settles each item. An implementation subagent applies the agreed code fixes, re-runs the manual rows those fixes reach, and commits; the fixes get no review round, since mahou:human-review reads them next. The agreed documentation updates run through mahou:write-documentation once, with the whole documentation in view. Update the files in the change's scratch folder that record what drifted in the same pass, and show those edits with the rest.

## Ending

When every subagent is done, give the final report through mahou:implementation-status-report, then add per repository the manual rows with their results, every failure validation fixed without asking (the row, what failed, what the fix changed and its commit), the report artifact path and the review ledger path. mahou:human-review follows when the user asks for it.

## What this skill is not

It does not write code, does not design tests, does not decide a design ambiguity on the subagents' behalf, and does not push or open pull requests.
