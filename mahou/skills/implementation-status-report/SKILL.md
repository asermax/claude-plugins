---
name: implementation-status-report
description: Reports where an implement run stands, from the change's implementation-status.md. Gives, per repository, a short update against the previous report in the conversation, the highlights since then, and every open item with the context to settle it. Use in the middle of an implement or implement-with-tdd run, and at its end, where implement loads it for the final report.
---

Load mahou:basics first, then mahou:report. Then read `.mahou/implementation-status-report.md` if present.

# Implementation status report

`implement` keeps `implementation-status.md` in the change's scratch folder current while subagents work. This skill prompts, spawns and closes no subagent, and writes no file.

## What it reads

`implementation-status.md`, then the conversation, for the last status report given in it, if there is one.

## The report

Start with the blocking questions: each question a subagent is waiting on, with the repository, the subagent's label, what it asked and why it cannot continue without the answer.

At the end of a run, when `implementation-status.md` holds design friction groups, give them next, in their own section. Each group is an open item, numbered with the others: the spot in the program design, what the program design says there, every entry with its repository and code reference, and what the entries have in common, so the user can decide whether the program design changes there. Before the groups exist, a departure appears only as a highlight of its repository.

Then one section per repository that changed since the last report:

1. **Status.** One or two lines: the stage the repository is in, the commits since the last report, and the subagent or check running on it. With no earlier report in the conversation, give every repository its full status.
2. **Highlights.** What happened in the repository since the last report that the status does not show: a departure from the design, a fact that changed a plan, a crash and the work it lost.
3. **Open items.** Every item in the repository that waits on the user, numbered across the whole report. Give each item the context to decide without asking back: why the item exists (why the reviewer proposed the change, why the subagent raised the flag), what the code does today, why it was skipped or held, and the changes each answer would require. An item the user already settled in the conversation does not appear.

When the same change, highlight or open item applies to several repositories, describe that change, highlight or item once, in a separate section before the repositories, naming the repositories it covers. Each repository's section then gives only what differs for it.

The repositories that did not change since the last report share a single entry after the repository sections: one line naming them, with the stage each one is in. A repository with open items still gets its own section, even if nothing else changed.

Keep the highlights short.
