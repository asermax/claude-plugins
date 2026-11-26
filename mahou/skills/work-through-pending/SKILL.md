---
name: work-through-pending
description: Works through a list of pending items with the user one at a time on a canvas. The canvas has a progress card, the active item drawn with everything needed to decide it, a pending area for what waits on the user, and a column of settled items to the side. Each settled item that needs work goes to a delegated subagent right away, up to three at once, and each subagent's commits get a code review. Use when a list of open items, findings or decisions needs working through with the user.
---

Load mahou:basics first, then mahou:canvas. Then read `.mahou/work-through-pending.md` if present.

# Work through pending

Takes a list of pending items, such as open decisions, skipped findings or gaps between the code and the docs, and settles them with the user one at a time on a canvas. Each item opens with everything the user needs to decide it. Once the user settles an item, the work it needs starts at once in a subagent, while the next item opens.

## The items

Collect the items from wherever they are listed. When an item exists only as a label, with no detail behind it, send scouts to rebuild it from the code before drawing it. Each scout reports what the item is about, the code it touches, what acting on it would change, and how sure the scout is that the code matches the label.

Order the items by priority, most important first, and show that order on the progress card. The user can reorder them.

## The canvas

The document is `canvas/pending.tldr.json` in the change's scratch folder. Its title names what the items come from. It holds four regions:

- **Progress card**, at the top left. It lists every item in priority order, each with its id, a short title and a mark: ⬜ not started, 👉 open in the working spot, 🛠️ settled and a subagent is working on it, ✅ done (built and reviewed), 🚫 left as is. The card ends with a legend that explains each mark in those words. A worked item carries its commits next to its mark: the implementation's commits while a subagent works on the item, then the review's commits. An Agent note beside the card says how the canvas works: each item opens in the working spot, the user answers with sticky notes or by voice, and settled items move to the right.
- **Pending area**, under the progress card. It holds everything waiting on the user other than the active item: a proposed docs change, a question a subagent raised, a commit the user has to confirm. Each entry carries its whole content, such as the full diff, the code or the text, so the user decides from the entry alone. An entry leaves the area once the user settles it.
- **Working spot**, beside the progress card. The active item is an area here, and every new item opens in this same place, so the user never moves around the canvas to find it.
- **Settled column**, far to the right, under a title. Settled items' areas sit here, each labelled `<id> · <title> · settled: <decision> · <status>`. The status in the label reads "subagent working" while a subagent works on the item, then lists the item's commits.

## An item's area

The active item's area holds whichever of these the item has:

- **What happens.** A card that states in plain words the problem, how likely it is to show up and why it matters, and names and quotes any rule the problem breaks.
- **A diagram** when a flow explains the problem better than prose, such as the path a request takes to the failure.
- **The current code**, as snippets with the file and lines, with gutter notes marking the lines that matter.
- **Where the code is used**, with its callers and the tests that already cover it.
- **The pattern that already exists**, when the codebase solves the same problem elsewhere.
- **Options**, in a blue card, lettered. Each option says what it changes, which files and shapes it touches, its size, and what it costs. The card recommends none of them.
- **An Agent note**, the item's place for the agent's messages.

When the user asks a question about the item, answer it in the item's Agent note and in the chat. When the user asks for something before deciding, such as research, a prototype or a spike, run it, draw its result as a green card in the item's area, and rewrite the options card with what the result changed.

Write how you read each answer in the Agent note, so the user can correct the reading. When an answer leaves part of an option open, ask the user about that part instead of filling it in.

## Settling an item

When the user settles an item:

1. Relabel its area with the decision and rewrite its Agent note to state the decision as the user gave it.
2. Move the area to the settled column and open the next item in the working spot.
3. Update the item's mark on the progress card.
4. When the decision needs work, start its subagent at once. A decision that needs no work gets the mark `🚫` or `✅` and no subagent.

## The subagents

Start each subagent with the delegation mechanism the session offers, from a folder where the plugin's skills load. Run at most three at once and queue the rest; start a queued subagent when a running one finishes. A code review counts as one of the three. Keep `queue.md` in the change's scratch folder with what is running, queued and done, each with its brief's path and its commits.

Load mahou:parallel-agents-lock before the first subagent and give every brief its rule.

Each brief carries:

- The repository and its rules file, and the decision exactly as the user gave it, with the option's details.
- The code the item touches, by file and line, and the tests to add or change.
- Commit and push when the work is done, as conventional commits that go through the hooks. Stage only the subagent's own files, by explicit path, because other subagents work in the same checkout.
- Docs: the subagent never edits the docs folder. It writes in its report each docs change it proposes, with the full text.
- The wiki: the subagent records in the wiki what the task taught about a technology or tool, and commits that right away in the wiki's repository, without pushing.
- Never ask; decide where the brief is silent and list each decision in the report.
- The report as the final message: commits, changes per file, tests with their names, the tail of the checks, docs proposals, decisions, and what is left unresolved.

When a subagent reports, close it, record its commits on the progress card and in `queue.md`, and start its code review: a new subagent that loads mahou:agentic-review and runs it over the first subagent's commits, under the same rules. Give it its own ledger folder, `agentic-review/<item>/`, so reviews running side by side do not overwrite each other. When the review reports, record its commits and mark the item ✅.

Put every docs change a subagent proposes in the pending area, with its full text or diff. Apply it once the user approves it, and commit it only on the user's explicit go-ahead.

When a subagent asks something through a dialog, read the dialog and put the question in the pending area, with what the subagent asks, in which tab, and the context the user needs to answer. Answer the dialog only when the user says to.

## Ending

When every item is settled and every subagent has reported, give the user the list of items with their decisions and commits, and what is left in the pending area. Then stop the canvas.
