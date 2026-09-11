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

One HTML file, written to `/tmp`, with its CSS and script inline and no external dependencies, no build step and no framework. It is opened with `xdg-open` and reopened from the same path on every round so the user's browser tab keeps its place.

The file shows the element inside enough of its surroundings for the user to judge its placement: the region of the existing screen it lands on, sketched with the same spacing and hierarchy, not reproduced. Match the existing screen only as far as the user has described it or pointed at it. Do not read the frontend's code for styling unless the user asks.

Example data is one fixed set, used by every alternative and every state, so the user compares the design and not the data.

## States and interactions

The prototype is interactive from the first file:

- A control strip above the element switches what it sees: each state the loading skill names, the empty case, and any other data variation the user asks for. The element re-renders from the selected data; each state is not a separate copy.
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
