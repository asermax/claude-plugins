---
name: prototype
description: Loaded by other skills to show the user a screen element as a working HTML prototype and iterate it with them, round by round, until it matches what they want. Carries how the file is built, how states and interactions are made switchable, how alternatives are offered and how corrections are applied. The loading skill says what the prototype is of and which decisions it stands for.
user-invocable: false
allowed-tools: Read, Write, Bash
---

Load mahou:basics first. Then read `.mahou/prototype.md` if present.

# Prototype

A prototype is a picture the user can look at and poke, standing in for a screen element that does not exist yet. It answers "what would this look like" faster than prose, and it exposes the questions prose hides: where the element sits, what each state shows, what happens when the data is missing. The skill that loads this one says what the element is and what is already decided about it. The prototype shows only that; it decides nothing.

## The file

One HTML file, written to the change's scratch folder at `prototypes/`, per the convention in mahou:basics, with its CSS and script inline and no external dependencies, no build step and no framework. It keeps the same path on every round.

Open the file with Plannotator, backgrounded, every round:

```
plannotator annotate --render-html {absolute-path-to-prototype.html} --title "{element name}"
```

The command returns when the user submits, and its output carries their annotations on the rendered page. Read them as that round's pick or corrections. Never poll; the result arrives on its own. When the session times out before the user submits, start it again with the same command and tell the user it restarted. The user can also answer in the chat instead of annotating; take whichever arrives first.

The file shows the element inside enough of its surroundings for the user to judge its placement: the region of the existing screen it lands on, sketched with the same spacing and hierarchy, not reproduced. Match the existing screen only as far as the user has described it or pointed at it. Do not read the frontend's code for styling unless the user asks.

Before building, read the wiki entries and the project's rule files on the frontend that match the element, and follow the patterns they set for the screen's chrome, lists, forms and actions. They are not the frontend's code, so read them without waiting for the user to ask.

Example data is one fixed set, used by every alternative and every state, so the user compares the design and not the data.

The screen shows only what the product would show. Put text that explains the prototype or the design to the reader in the text above the controls or in an alternative's line. Examples are who sees an element and what a control is for.

A new prototype starts from the prototypes already settled for the same product in the change's `prototypes/` folder. It reuses their header, menus, titles, components and badges as they are, and changes only what the new element needs. When a subagent builds it, the subagent's prompt names those files as the base.

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

After the pick, the other alternatives leave the page. Every round takes the user's corrections as given, applies all of them to the chosen alternative, and reopens the file.

A correction that implies a decision the loading skill has not settled is applied as the user stated it and named as a new decision in the same message, so it gets recorded rather than absorbed into the picture.

When a correction cannot be shown, for instance a rule that produces the data, say so and show its effect through the example data instead.

## Reconciling

When the loading skill asks for the prototype to match a settled set of decisions, walk the decisions one by one against the file and change whatever differs before reopening it. Name each change made in the message, so the user sees where the picture had drifted from the decisions.

The file is the loading skill's to use once the rounds end; what becomes of it is that skill's concern.
