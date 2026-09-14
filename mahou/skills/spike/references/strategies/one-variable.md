# One variable per round

The strategy for narrowing in on failures when a working baseline exists.

Each round changes one thing and re-runs. When the spike's output fails somewhere, fix that failing case alone. The fix must generalize, not special-case the case that happened to fail. After every fix, re-run everything that already passed. A fix that breaks a passing case is not a fix, and only the sweep can see it, because the failing case itself will look solved.

One variable per round keeps cause and effect readable. A round that changes three things produces an outcome nobody can attribute, and the next round builds on a guess.

The loop ends when the whole corpus passes, not when the last failing case does.
