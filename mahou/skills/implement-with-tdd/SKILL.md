---
name: implement-with-tdd
description: Implements a change whose design and test design are settled the way mahou:implement does, but writes each repository's code test first. Per repository, a tester subagent writes the failing tests and validates each round, an implementer subagent writes the code, and this session relays every exchange between them. Use after test-design, before human-review, when the code should be written test first.
argument-hint: <the tasks, the design notes, the test matrices, the repositories and the branch name>
---

Load mahou:basics first, then mahou:implement. Then read `.mahou/implement-with-tdd.md` if present.

# Implement with TDD

Follow `implement` from start to end. Only how each repository's code gets written changes, in `implement`'s Dispatch and collect. The opening, the brief, the agentic review, the design reconciliation, the manual validation and the ending stay as `implement` states them.

## Two subagents per repository

For each repository, spawn two subagents from this session, a tester and an implementer, labelled `<repository>: tester` and `<repository>: implementer`. Both get the repository's full brief from `implement` and work in the same checkout, on the same branch. Neither spawns the other, and they never talk to each other directly. Every exchange passes through this session, which relays it and shows the user what was said as each message arrives.

Neither subagent commits. That is the only change to the brief's repository rules.

## The rounds

1. **Red.** The tester writes the tests for the repository's `test` rows, plus the changes the existing tests need once the new code exists. It runs them and confirms that each new test fails because the behaviour is missing, not because the test is broken. When the tests cannot load before the code exists, it says how it checked the reason for the failure. It reports the row-to-test mapping, the files it changed and why each test fails.
2. **Green.** Relay the failing tests and the changed files to the implementer. It writes the code until the tests pass, then reports the linter and test output tail.
3. **Validate.** Relay the implementer's report to the tester. The tester runs the suite and checks the code against the design's rules and contracts, not only against the tests. It answers with an approval or with concrete feedback. Relay the feedback to the implementer and repeat 2 and 3 until the tester approves.

Rules for the rounds:

- The implementer does not edit test files. When it believes a test is wrong, it says so, and this session relays the claim to the tester.
- The tester does not edit the implementation.
- When either subagent finds a design ambiguity that changes the outcome, this session asks the user. Neither subagent decides it.

## Committing

Once the tester approves, this session commits the repository's changes with mahou:commit-changes, then continues with `implement`'s agentic review for that repository.
