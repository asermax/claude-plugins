# zenku

An experiment-driven way of working, run out of an Obsidian vault the project owns.

**The plugin owns the process. The project owns the structure.**

That seam is the whole design. The process is zenku's: an idea is an objective plus the unknowns standing between us and it; experiments clear those unknowns one at a time; acceptance criteria are written before the code; the decision about whether an objective is worth reaching happens once, at the idea, and it is the user's.

Everything else is the project's: which folders exist and what each holds, every template body, every index, the tags, the note headings, the commands, what "seeing it work" means, the code style, the branch pattern. `zenku:init` seeds a sane default and then gets out of the way. From that moment the files belong to the project: edit a template, add a folder, rewrite the charter, and the skills read what is there rather than what was seeded.

The test applied to every line of every skill: **a skill that contains a string which would be wrong in a different repository is a bug.**

## Which backlog does this go in

|  | Experiment backlog | Work backlog |
|---|---|---|
| Holds | An **objective** (something we want to be able to do) plus the **unknowns** standing between us and it | Work already decided: a defect, an agreed slice, a chore |
| Written by | `zenku:capture-idea` | `zenku:capture-backlog` |
| Done by | `zenku:experiment`, then `zenku:promote` or `zenku:drop` | `zenku:work-on-backlog` |

The test for which one you have: *is there anything here we would have to find out before we could start?* Nothing → a work item. Something real → an idea. An objective is a goal and does not come out true or false; falsifiability lives one level down, in the unknowns. A bug has neither, and pushing one through a shaping lifecycle produces states that mean nothing.

They feed each other, which is what replaces a product backlog: a work item that turns out to carry a real unknown becomes an idea, and a promoted idea leaves its deferred furniture behind as work items.

## Which skill does what

| Skill | Does |
|---|---|
| `zenku:init` | Seed a vault the project then owns; re-run to fill a gap or add a folder |
| `zenku:capture-idea` | Write an objective and its unknowns into the lab, in seconds |
| `zenku:capture-backlog` | Write down something already decided, in seconds |
| `zenku:experiment` | Define, run and conclude one experiment against one idea's unknowns |
| `zenku:promote` | Decide the objective is worth reaching, then reach it |
| `zenku:drop` | Decide it is not, and record what would reopen it |
| `zenku:work-on-backlog` | Build a defined work item |
| `zenku:note` | Write or update a durable note, per the project's own charter |
| `zenku:commit` | Group the working changes into conventional commits |

Two more are loaded rather than invoked: `framework-core` carries the runtime-resolution contract every skill uses to find the project's vault and conventions, and `delivering-change` carries the build discipline shared by `promote` and `work-on-backlog`.

Two reviewers: `zenku:idea-reviewer` checks an idea's framing before it is written back, and `zenku:change-reviewer` checks a built change for fit with the rest of the project.

## What the framework never bends on

**Acceptance criteria are written before the code.** The reason is timing rather than rigor: decided afterwards, they will be met, because a result is much easier to admire once it is the only one you have. A criterion need not be numeric; it has to be **observable**.

**Every note reaches the trunk before any code is discarded.** Code lives on the idea's branch and is expected to be thrown away. The notes travel to the trunk with the decision.

**Promoting is not a cleanup.** The decision about the objective comes first and separately from the shape of what gets built, and the spike commits are dropped rather than cleaned up: the permission to hardcode is what made them cheap, and auditing it back out is slower and less reliable than writing the real thing with the answers in hand.

**What gets built is reviewed before it is committed.** Green checks say the code runs, not that it is the thing anyone wanted. Nothing is committed until the user has looked at it.

## Getting started

1. `zenku:init`: answer the interview, look at what it wrote, change whatever you disagree with. It is yours now.
2. `zenku:capture-idea` when you want something you do not know how to get; `zenku:capture-backlog` when you know exactly what needs doing.
3. `zenku:experiment` to clear an unknown; `zenku:promote` or `zenku:drop` when the list is empty.

## Documents

Durable knowledge lives in **narrative notes**: mechanism first, with the reasoning in a callout beside the thing it justifies. Not decision records: no requirements tables, no acceptance criteria, no traceability columns, no status ladders. Those describe work being planned; a note describes something that exists, and it should be readable by someone auditing the system rather than administering it.

A project that wants a standing-rules list, a decision register or anything else keeps one **as its own structure**. zenku names no such artifact, which is why it cannot impose one.

## What this replaced

The previous version carried a second half: a product-development track of roadmap, feature spec, feature design, implement and reconcile skills, with ADR and DES decision records, requirements tables, Given/When/Then acceptance criteria and a status ladder, plus nine reviewer subagents. It is gone, and so are `BACKLOG.md`, `PRODUCT.md`, `LEARNINGS.md` and `ROADMAP.md` as artifacts.

What survives of it: requirements-before-code lives on as the experiment's acceptance criteria, the only place the framework insists on it. The shape conversation those documents existed to force still happens, in `delivering-change`. It just leaves no artifact of its own. A decision's reasoning lives in a callout beside the mechanism it justifies, and the record of what was decided and on what evidence lives in the idea's conclusion. Ordering lives in a priority field and a generated index.

What does not survive, deliberately: the documents between an answer and the code, the monotonic experiment numbering, and the per-skill project override files. A project's own behaviour now goes where a human will read it: the vault's charter, a folder's README, or a labelled field in the project's agent instructions.
