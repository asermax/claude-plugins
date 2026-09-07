---
name: design
description: Turns a settled problem definition into a system design, working a design tree one area at a time from data model to flows to rules, with the user settling every leaf and choosing how each area is represented, then hands the tree to mahou:write-documentation so the project's docs record it. Stays above endpoints, functions and files. Use after shape, before program design.
argument-hint: <the settled shape tree, or where to find it>
---

Load mahou:basics first, then mahou:design-tree and mahou:docs. Then read `.mahou/design.md` if present. The tree, the rounds, the question format, the facts rule and how answers grow the tree come from `design-tree` and apply here as written. Diagrams are validated with superpowers:mermaid-validation before they are shown; when that skill is not installed, say so and show the diagram unvalidated.

# Design

Takes a definition the user has settled and designs the system that satisfies it: what is stored, how it moves, what rules apply, and whatever else the change needs. The level is system design. Endpoints, function names, files, migrations and test cases belong to program design and are not decided here. The output is a settled design tree, each branch carrying its prose and its representation, handed to mahou:write-documentation to be recorded.

## Opening

1. Read the settled shape tree. Do not read code unless the user asks a question that needs it; when they do, a `mahou:code-scout` keeps the reading out of the conversation.

2. List what has to be designed. Each item names what must be specified, not how. Order the list from abstract to concrete so each item builds on the previous one, typically data model, then how data moves, then the rules that produce it, then whatever the change adds on top. Do not propose representations yet.

3. Wait for the user's corrections. Items that are implementation (a migration, a schema field list, a function) are dropped or moved into the item they serve. Items about prior artifacts (an earlier branch, a superseded document) are absorbed into the design rather than named. Verification is deferred to after program design.

4. Build the tree. The root is "System design", each item is a branch, every branch pending. When the change contains several independent pieces, for instance two APIs or two features designed in one session, each piece is its own root with its own areas, worked one root at a time.

```
System design
├─ 1 <area>                                                            pending
├─ 2 <area>                                                            pending
└─ 3 <area>                                                            pending
```

## Working a branch

Open one branch at a time, in order, when the user says so.

1. **Pick the type.** Check `references/types/` for a reference matching the branch (see Types). A reference says how the branch is usually split, what it needs to question and which representation has worked. It is a guide, not a rule: when the case needs a different split, different questions, another format or another diagram, work that out with the user. When no reference matches, ask the user how they want to split and represent the branch before opening it.

2. **State the branch as discussed so far**, in simple prose, before asking anything. The prose stands on its own: no references to the current implementation, no comparison with how things work today, no mention of prior artifacts, nothing that belongs to another branch. It may say what the thing is for, not the flows that use it.

3. **Ask the frontier.** The reference lists what the branch needs to question. A question the earlier exploration or the shape tree already answered is asked anyway, as a confirmation, so the user sees the answer in its new context. The rest are asked as open questions. The representation is the one the reference proposes by default, adapted when the case calls for it, or the one the user proposes; it is asked only when none of these applies.

4. **Split when asked.** When the user wants the parts of a branch reasoned about separately, add a level, one sub-branch per part, and work them one at a time, each with its own prose, frontier and representation.

5. **Render when settled.** Once every leaf is ✓, produce the branch's representation: the diagram, validated, then the prose under it that explains what the diagram does not show. Numbered steps in prose refer to the diagram's numbers. Show the tree with the branch settled and stop until the user opens the next one.

### Types

| The branch is about | Reference |
|---|---|
| What is stored: new entities, fields, their shape and meaning | `references/types/data-model.md` |
| How a value moves between components: who produces it, who carries it, who persists it | `references/types/data-flow.md` |
| How a value is derived or a decision is made from an input | `references/types/rules.md` |

A branch that fits none of these is worked out with the user. A type that turns out to generalize beyond this session is a candidate for mahou:learn to add to this table.

## Recording

When the tree is complete, the project's docs record it, and mahou:write-documentation owns that. Before handing off:

1. **Existing notes the change touches.** List them from what was read during the work, with what each would need. When the set is unknown or incomplete, say so and offer a `mahou:docs-scout` to find them. The user settles each one: update it, add the minimum and point to the new note, or skip it.

2. **New notes.** The change may need one note or several. Propose the split, and the user settles it.

Then run mahou:write-documentation once per note, giving it the tree. Each settled branch already carries its prose and its representation, so the draft is mostly a move; `write-documentation` fits it to the project's charter and templates, which this skill never reads.

## What this skill is not

It does not choose endpoints, functions, files or test cases, does not write code, does not commit, and does not write into the docs folder itself. When the user decides that a piece of the change goes straight into a repository, that is their call and happens outside this skill.
