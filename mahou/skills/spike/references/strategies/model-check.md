# Model check

The strategy for questions about a thing that moves between states, where reading the code or the design cannot tell whether a rule always holds: a lifecycle with retries, a workflow two actors drive at once, a protocol where messages arrive late or twice. Adapted from pstack's `statechart` skill.

Each round writes or changes a TLA+ model of the states, runs the TLC model checker over every reachable state, and brings back the shortest path to each state that breaks a rule. The user reads the paths and decides, for each one, whether the system is wrong or the rule is.

## Running TLC

The strategy needs TLC. Look for it on the machine before the first round: a `tlc` command on the `PATH`, or a `tla2tools.jar` together with a `java` command, run as `java -cp tla2tools.jar tlc2.TLC`. When neither is found, offer the user to install it, and install it only once they agree.

Run TLC with one worker, so a path reads the same on every run.

## Writing the model

The model lives in the spike's folder, next to its config and TLC's output.

- **Every rule the user agreed to is an `INVARIANT`.** A rule can be about what a screen shows, a stored value, a result or a message sent. When the model has no variable for a rule, add the variable. Never weaken a rule so it holds; a rule that should not hold is a question for the user.
- **`Next` is a disjunction of named actions**, such as `Submit \/ Approve \/ Pay \/ RetryWebhook`, so each step in a path carries the name of what happened. A `Next` written as one block names every step `Next`.
- **A correct end state is not a deadlock.** TLC reports a state with no step out as a deadlock. Add an action that holds only in the end states and changes nothing, such as `Done == phase \in {"paid", "failed"} /\ UNCHANGED vars`.
- **Keep the model small.** Small constants, or a `CONSTRAINT`, so the run finishes. A model with no bound on its states runs without end.
- **Model only what the question needs.** A call in flight whose return changes nothing is not a state.

## A round

1. Run TLC on the config as written.
2. When a rule breaks, keep TLC's trace for it, remove that rule from the config and run again, until no rule breaks or a run stops at its bound. A rule a run did not reach is listed as not checked: it can hold or break.
3. Draw the result with superpowers:mermaid as one `stateDiagram-v2`:
   - Label each state with what the user sees or cares about ("Paying", "Lease held, write pending"), never a variable name.
   - Label each arrow with what happens as the user sees it ("you press pay", "the webhook is retried"), never the action's name. A step possible only under a condition ends its label with the condition in brackets, such as `you press pay [while the file loads]`.
   - Colour a state that breaks a rule red with a `breaks` class, and a state where only some of the model states behind it break a rule amber with a `mayBreak` class. Never merge two states that break different rules.
   - Aim for about 20 arrows. Merge labels that behave the same before hiding steps; when a step is hidden, keep every state reachable and say which steps the chart hides.
4. Under the chart, one line per broken rule: the rule as the user said it, and the shortest path as numbered steps in the arrows' words.

The next round changes one thing: a rule the user rewrote, a state the user says is missing, a step the model got wrong.

## Replaying the paths

A model is not the real thing, so the spike is not over when the chart is drawn. When the model describes code that exists, replay each path against that code, as a test or a live repro, one step per action. A path that does not reproduce means the model is wrong until shown otherwise. When the code does not exist yet, each path goes back to the design as a question.

## Findings

Per broken rule: the rule, the path, whether the replay reproduced it, and the user's call on it. Also what the model leaves out, the rules not checked, and the command that runs TLC again. Each confirmed path is a case for mahou:test-design.
