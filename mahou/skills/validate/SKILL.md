---
name: validate
description: Runs a change's manual validation rows against the running system and leaves an evidence report. Takes the manual rows from mahou:test-design, or the scenarios the user names when there is no test design, drives each one through a browser, over HTTP, or on an Android device, records what it observed with before and after state, fixes a failing row when the fix only makes the code do what previous decisions settled, and reports every other failure and every bug outside the rows without fixing it. Use after the tests are green, before human-review, or whenever the user asks to see a change working.
argument-hint: <the manual rows or scenarios, the change under validation and the repositories it touches>
---

Load mahou:basics first. Then read `.mahou/validate.md` if present: it is where a project says how its local system is brought up, which surfaces it has and how each one is reached and authenticated. When it is absent, the project's own setup carries that: its `CLAUDE.md`, its README, its compose or task files. Say what you found before touching anything, and ask when neither says how the system runs.

# Validate

Proves a change against the running system, by hand, after the automated tests have passed. The tests prove the units; this proves the assembled thing does what the design said, through the path a real caller takes.

The rows come from mahou:test-design: every row marked `manual` or both, with its expected outcome and its setup. Without a test design, the user names the scenarios, and the skill records them in the same row shape before running any. The skill adds no scenario of its own.

## Inputs to ask for

Before driving anything, decide whether the surface under validation needs authenticated inputs, and ask for everything in one round, in plain prose in the reply and never through a tool:

- **An identity**, when the surface needs one: a user, an account, a token. Name the surface and what the identity must be able to reach.
- **The access state** that gates the flow: a record the identity owns, a role, a feature switch.
- **Domain inputs** the change names. Read the project's docs for the kind of input its domain deals with, then ask for concrete values. The docs shape the question; they do not answer it.

A surface that needs none of these skips the ask. Do not mine the conversation for values the user did not give; the unconditional ask costs less than the recovery.

## The running system

The system is yours to bring up, not the user's. Bring up everything the rows need without asking, following the project's setup: the services, the optional integrations and the workers, whether the system is down or running without them. List what you started in the report. Stop and ask only when a credential is missing or a service fails to come up, and do not work around either.

Everything runs against the local system only. Never against a production database or a shared environment.

## Mutating data to reach a row

When the existing data does not reach the code path a row exercises, mutate the local data to make it reachable. When no existing record can be changed to reach the path, insert the records the path needs. Neither needs the user's approval.

Some rows need an error the system does not produce on its own, such as an upstream that is down, an error response or a request that hangs. Force that failure on the local system. Mutate data for it only as the last resort, when no seeded data, configuration or input reaches the path. The discipline below applies to a forced failure too: record what you changed, restore it before the run is declared complete, and report the pair.

A temporary code change can force the failure when no input or configuration reaches it. Make the smallest change that produces the error, run the row, then restore the file with `git checkout -- <file>` and confirm with `git status` that it is clean before the next row. Run it while nothing else is running on the system, because the change reloads the server that runs the code. Record the change and its restore in the report like any other mutation.

The discipline:

- **Capture the original value first**, with a read that prints what you are about to overwrite, before any mutating write. The revert depends on it.
- **Pair every mutation with a revert** that restores the captured value verbatim, and run the revert before the run is declared complete.
- **An inserted record is a mutation whose revert is a delete.** Record its key when you insert it and delete it before the run is declared complete. Delete the records the run creates through the product the same way, such as a record that a click in a row creates.
- Keep the mutation as small as possible: one field on one record.
- Resetting a flow's state between rows follows the same pattern. A flow that only advances one way at the API level may need a direct write to return to an earlier step; capture, mutate, revert.
- Every mutate and revert pair goes at the top of the report, so the user can audit it.

When no real input has what a row needs, such as a page with every element the row combines, build a synthetic input, the smallest artifact that has those elements and looks like the real thing. Keep it in the change's scratch folder and serve it locally, behind a tunnel when the system under test runs remotely and must reach it. Say in the row which parts of the expected outcome it could not cover.

## Running the rows

Load the reference for the surface under validation:

- [references/browser.md](references/browser.md) for a surface a person drives in a browser.
- [references/http.md](references/http.md) for an API driven with `curl`.
- [references/android.md](references/android.md) for a mobile app driven on an Android device or emulator.

When a change touches more than one surface, load each reference and run each row against its surface. Follow each row's setup, perform its steps, observe, and record PASS or FAIL with the evidence the reference names. Every row runs, in id order; a failing row is recorded and the run continues.

## Fixing what fails

A row fails when the system departs from the row's expected outcome, or from what previous decisions settled for that path. Fix that failure without asking, then re-run the row and any row the fix's code reaches, until every row passes or is blocked. The bounds:

- The fix makes the code do what previous decisions settled. It never changes a row's expected outcome or a previous decision, and it never adds behaviour no previous decision settled.
- The fix stays in the repositories of the change under validation.
- Linters and the relevant suites pass after each fix.

A failure whose fix would break a bound is blocked: record it with its evidence, say what the fix would change in what previous decisions settled, and continue with the rest of the rows. When a blocked row blocks later rows, say which rows it blocks and ask before skipping them.

A bug the run finds that no row and no previous decision covers, such as a defect that predates the change on the path a row takes, or a problem in a flow the change does not touch, is not fixed. Record it with its evidence and hand it to the user as a finding.

Leave the fixes uncommitted unless the caller says to commit them, and list each one in the report with the row it fixed.

## The report

Validation produces a report artifact on disk and a summary in the reply that points at it. The artifact is not optional.

One HTML file per run, in the change's scratch folder at `reports/<surface>/index.html`, per the convention in mahou:basics, with every asset in the same folder referenced by relative path. Self-contained, no external resources. Build it as the rows run, not at the end, so a run that stops half way still leaves what it saw.

In order:

1. **Header**: the change, the branches and commits under validation, how the system was brought up, the identities and inputs used.
2. **Setup and mutations**: what the run started, every configuration change made for the run, and the mutate and revert pair of every record touched or inserted, with before and after values.
3. **One section per row**, in the order they ran: the setup the row needed, the steps performed, what was observed, PASS or FAIL, the evidence in the shape the surface's reference gives, and each fix made for the row: what failed, what the fix changed, and the run that passed after it.
4. **Bugs not fixed**: every bug found that no row and no previous decision covers, with its evidence.
5. **Summary table**: every row with its result (passed, passed after a fix, blocked), and the rows that could not be run with the reason.

The reply loads mahou:report and gives: the artifact path, which surfaces were exercised, the rows that passed, each fix with the row it fixed, what failed and what the fix changed, every blocked row stated as a failure with where its evidence sits and what its fix would change, every bug left unfixed, and every row not run with why.

## Boundaries

- Do not hand-roll a way to start the system when the project has one; follow its setup.
- Drive an API through the path real callers take. When the project routes traffic through a gateway or a proxy, go through it; hitting a service directly hides routing, auth and middleware bugs.
- Do not invent browser-driving strategies; the browser reference defers to the `agent-browser` CLI's own skill content.
- Do not treat green tests as validation. Both are required, in that order.
