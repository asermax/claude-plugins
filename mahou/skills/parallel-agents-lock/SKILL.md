---
name: parallel-agents-lock
description: Makes subagents that work at the same time on one machine run their heavy commands one at a time (installs, linters, typechecks, test suites, and commits whose hooks run them), through a flock wrapper in the change's scratch folder. Writes the wrapper and gives each subagent the rule, in its brief or as a directive to one already running. Use when two or more subagents run at once on the same machine, or when the user asks that they stop competing for the machine. Loaded by mahou:implement.
---

Load mahou:basics first. Then read `.mahou/parallel-agents-lock.md` if present.

# Parallel agents lock

Subagents that run at the same time on one machine compete for it when each runs its own install, linter or test suite. With the lock, one heavy command runs at a time and the others wait for the lock.

## The wrapper

Write the wrapper into the change's scratch folder, in the folder of the skill that runs the subagents, such as `implement/heavy.sh`, and make it executable. The lock file sits next to it.

```bash
#!/usr/bin/env bash
# Runs one heavy command at a time across every subagent of the run (linters, typecheck, tests, installs,
# and commits, since the pre-commit hook runs the full check). Waits for the lock instead of failing.
set -euo pipefail

LOCK=<absolute path of the scratch folder>/<skill folder>/heavy.lock

exec flock --verbose "$LOCK" "$@"
```

Run it once with a command that does nothing heavy, such as `heavy.sh echo ok`, and check that it prints the lock line and the output.

## The rule

A subagent not yet started gets the rule in its brief, with the wrapper's path and the instruction to load this skill. A subagent that loads this skill follows only this section; the session that dispatches it writes the wrapper and gives the ending. A subagent already running gets the same as a directive, in the form its delegation mechanism uses, such as a `<supervisor-agent>` prompt. A subagent in the middle of a turn reads the directive when the turn ends.

- Run every heavy command through the wrapper, by its absolute path, from the subagent's own checkout. Heavy commands are installs, the project's check, test, typecheck and lint scripts, the task runner, the test runner, the type checker, the linter, the formatter, and `git commit` when a commit hook runs any of them. Name the commands the project uses, such as `pnpm install`, `pnpm check`, `pnpm test`, `turbo`, `vitest`, `tsc`, `oxlint`, `oxfmt`. For example `heavy.sh pnpm check`.
- Never nest the wrapper, and never run one of these commands outside it.
- Expect to wait for the lock. Never kill another process that holds the lock.

When the subagent's brief lists the contents of its final message, repeat that list in the directive.

## Ending

Say where the wrapper is and which subagents got the rule, in the brief or as a directive. A command that a running subagent started before the directive arrived finishes outside the lock; say so when this happens.
