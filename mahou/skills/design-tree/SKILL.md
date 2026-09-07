---
name: design-tree
description: Loaded by other skills that settle a definition with the user through rounds of questions. Carries the design tree: its format, the frontier, the question and answer rules, how the tree grows, and how a session ends. The loading skill says what the tree is about and how deep its questions go.
user-invocable: false
---

# Design tree

A design tree is the record of a shared understanding built one question at a time. The user reads the tree, not the transcript. The skill that loads this one says what the root is, what the branches cover and what level the questions stay at. Everything below applies unchanged.

## The tree

The root is one line. Each branch is an area of the definition. Each leaf is one decision, and leaves can group under sub-branches when an area splits into parts the user wants to reason about separately.

Leaves carry their own mark. A branch is settled only when every leaf under it is settled. A branch that has not been opened yet is pending.

```
<root>
├─ <area>                                                    settled
│  ✓ <decision>
│  ✓ <decision>
├─ <area>                                                    open
│  ├─ <part>                                                 settled
│  │  ✓ <decision>
│  └─ <part>                                                 open
│     ✓ <decision>
│     ❔ Q4 <what is undecided>
└─ <area>                                                    pending
```

Show the whole tree before every round and once more at the end. When the tree is long and the work is going one branch at a time, show the branch being worked with its leaves and the rest of the tree collapsed to its branch lines and marks.

## Rounds

The frontier is every question whose prerequisites are settled. Ask the whole frontier in one round, then wait. A question whose answer depends on another question still open in the same round belongs to a later round. When the loading skill works one branch at a time, the frontier is that branch's open leaves.

Number questions across the whole session. Q7 in round two is the seventh question asked, not the seventh of that round.

```
❓ **Q1** - **<title>**: <body. The situation, the options when there are options, and what each option implies.>

---

❓ **Q2** - **<title>**: <body>
```

Ask in plain prose, never through the AskUserQuestion tool. A menu of options is you mapping the sides of the fork, and that biases the choice before the user makes it.

No recommendations. If the user does not know how to answer, they will ask.

Every question is a decision that changes the outcome if answered differently. Before asking, check that the answers lead to different outcomes. If they would change nothing, drop the question. Confirming an already settled decision is a valid question when the loading skill asks for that pass.

## Facts

Never look up a fact on your own initiative. When a question needs a fact you do not have, say inside the question that you lack that context and offer to search for it. The user decides whether the lookup happens.

When the user asks for a check, run it, then report the result before the next round's tree, labelled by the question it unblocks. When the result contradicts a claim the user made or a decision already settled, say so in the first sentence.

## Answers

Each answer becomes a leaf. Read the answer literally. When it approves the question instead of answering it, state the reading you took so the user can correct it.

An answer can do more than settle a leaf:

- It can open new leaves under the same branch, asked in the next frontier.
- It can reveal an area the tree does not have yet. Add a branch for it, put its open decisions under it as ❔ leaves, and ask them in the next frontier.
- It can show that a branch mixes things the user wants apart. Add a level and split the leaves under the new parts.
- It can invalidate a settled leaf. Change the mark back to ❔ and ask again with the new information.

The tree grows during the questioning. It is not fixed at the first round.

An answer that departs from the source the work came from, such as a ticket or a document, is recorded as a decision with the departure named once.

## Ending

The frontier is empty when a round of answers opens no new question. Show the final tree with every leaf marked ✓ and state that it is complete. Ask nothing. What happens after the tree is the loading skill's business.
