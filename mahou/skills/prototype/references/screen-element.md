# Screen element

## Surroundings

The file shows the element inside enough of its surroundings for the user to judge its placement: the region of the existing screen it lands on, sketched with the same spacing and hierarchy, not reproduced. Match the existing screen only as far as the user has described it or pointed at it. Do not read the frontend's code for styling unless the user asks.

Before building, read the wiki entries and the project's rule files on the frontend that match the element, and follow the patterns they set for the screen's chrome, lists, forms and actions. They are not the frontend's code, so read them without waiting for the user to ask.

## States and interactions

The prototype is interactive from the first file:

- A control strip above the element switches what it sees: each state the loading skill names and any other data variation the user asks for. The element re-renders from the selected data; each state is not a separate copy.
- Before the first round, check the loading skill's states against the states the element can reach in its context. Examples: loading, with a skeleton or a placeholder; empty; error; disabled; success. Name to the user each state the element can reach that the loading skill did not name, including states the list leaves out, and add it to the strip once the user settles it.
- The element itself responds to the interactions that have been decided: expanding, hovering, tapping, whatever the design gives it. An interaction that has not been decided is not invented.
- A "show all states" control lays every state out with the same example data, for comparison at a glance, and switches back to the single interactive view.

## First round: alternatives

When the user has not chosen a shape yet, the first file offers several alternatives on one page, labelled by letter, each with its own control strip and its own interactions, and one line under it naming what that alternative trades against the others. The line describes; it does not recommend. Alternatives differ in where the element sits, what it shows and how each value is encoded, not in polish.

Stop after opening the file and wait for the pick. The pick is a decision and goes back to the loading skill to record.

## Following rounds: corrections

After the pick, the other alternatives leave the page. Every round takes the user's corrections as given, applies all of them to the chosen alternative, and reopens the file. A user may pick parts from several alternatives; the next round combines exactly those parts.

A correction that implies a decision the loading skill has not settled is applied as the user stated it and named as a new decision in the same message, so it gets recorded rather than absorbed into the picture.

When a correction cannot be shown, for instance a rule that produces the data, say so and show its effect through the example data instead.

## Reconciling

When the loading skill asks for the prototype to match a settled set of decisions, walk the decisions one by one against the file and change whatever differs before reopening it. Name each change made in the message, so the user sees where the picture had drifted from the decisions.
