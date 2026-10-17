---
name: design-tree
description: Loaded by other skills that settle a definition with the user through rounds of questions. Carries the design tree: its format, the frontier, the question and answer rules, how the tree grows, and how a session ends. The loading skill says what the tree is about and how deep its questions go.
user-invocable: false
---

# Design tree

A design tree is the record of a shared understanding built one question at a time. The user reads the tree, not the transcript. The skill that loads this one says what the root is, what the branches cover and what level the questions stay at. Load superpowers:unslop when the tree starts and hold its rules in everything the session writes: leaves, the prose under each branch, questions and reports. When that skill is not installed, say so and continue.

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

When the loading skill works one branch at a time, show the whole tree once it is built. Show it again when a branch settles and the next one opens, and once more at the end. Before every other round, show the branch being worked with its leaves and the rest of the tree collapsed to its branch lines and marks. When the whole frontier is worked at once, show the whole tree before every round and once more at the end.

## Rounds

The frontier is every question whose prerequisites are settled. Ask the whole frontier in one round, then wait. A question whose answer depends on another question still open in the same round belongs to a later round. When the loading skill works one branch at a time, the frontier is that branch's open leaves.

Number questions across the whole session. Q7 in round two is the seventh question asked, not the seventh of that round.

```
❓ **Q1** - **<title>**: <body. The situation and what is undecided. No options.>

---

❓ **Q2** - **<title>**: <body>
```

Ask in plain prose, written straight into the reply. Never use a tool to ask, AskUserQuestion or any other. A tool cannot ask without options, and options are what a question must not carry.

Every question is a decision that changes the outcome if answered differently. Before asking, check that different answers lead to different outcomes, and drop the question when they would not.

State a decision the user already made, in an earlier round or before the tree existed, as a ✓ leaf, and never ask it again. The user corrects a leaf that is wrong; the corrected leaf goes back to ❔ and joins the next frontier.

When an open decision has only one plausible answer, because it follows from decisions the tree already settled or from how the code works today, it stays a ❔ leaf in the tree like any other question, and it is asked as a proposal: the round states the answer and the decision or the behaviour it follows from, and asks the user to confirm or correct it. The leaf becomes ✓ with the answer the user confirms or gives. A decision that more than one answer could reasonably settle is asked open.

## What a question carries

A question states what is undecided and stops. It does not list the ways it could be answered. Once you write the options, the user chooses among yours instead of thinking about the problem, and the answers they would have found on their own never appear.

The body carries the context the user needs to decide, and every piece of it is required when it exists:

- What the decision is about.
- Which earlier answers bear on it, and how. If Q3 settled that the value is derived at request time, a question about where it is stored says so.
- Which other parts of the system the answer will change, whether they are already in the tree or not.
- What the loading skill's source (a ticket, a document) says about it, when it says anything.

The body carries nothing about which answers exist. Each of these proposes an answer and none belongs in a question:

- A list of candidates, however even: "on the order, on the user, or in a separate table". Reference points from outside the tree, such as what another tool does, are context and not candidates (see How a question reads).
- One candidate with a question mark. "Should we store it on the order?" proposes an answer; "where does it live?" does not.
- A default the user did not set: "by default", "typically", "usually", "the standard approach".
- A verdict: "I'd go with", "the obvious choice", "the simplest is", "probably", "it makes sense to", "we should".
- What follows from one particular answer: "if it goes on the order, every read pays for it". Naming that the answer affects reads is context; working out the effect of one answer is a candidate.
- A confirmation, "so it goes on the order?". A decision the user settled is a ✓ leaf, and one they never settled is asked open.

Before sending a round, reread every question. Check that each question's context is complete and that the question follows the unslop rules, and cut anything from the second list. If the user does not know how to answer, they will ask.

When the user asks for the options or for your opinion, give the facts and the current state that bear on the choice: what exists, what earlier decisions constrain it, what a candidate would have to satisfy. Enumerate candidates only when they ask for that, evenly, and give a verdict only when they ask for one explicitly, marked as yours.

## How a question reads

When the user has to read a question twice to parse it, they spend the round working out what it asks instead of deciding.

- The title names the thing being decided in plain words: the field, the record, the step. "What the handler does with the record's `<field>`", not "The `<thing>` the record keeps after a `<operation>`". A title built from the mechanism makes the user reconstruct what the title refers to.
- The body first says what the thing is: what the field holds, where its value comes from, why that value and the new one can differ. Then what is undecided, then why it matters.

Give the user the context they need to decide, beyond the facts. Use these when the question calls for them:

- Start from a concrete case: one input, what the system produces from it today, and what it would produce under the decision. Use the project's own data when the session has it.
- Give reference points from outside the tree: what comparable tools or libraries do with the same thing, or examples of what the answer could be about. "PostHog keeps console output inside the recording" is a reference point; "should we keep it inside the recording?" is a candidate. The question itself still offers no candidates.
- Compare a finding with the leaves the tree already settled. Say which leaves it agrees with and which it contradicts, instead of describing it on its own.
- Name what breaks or is lost, and for whom, rather than the rule that causes it.
- Say what a term means the first time the question uses it.
- Use a representation when prose makes the user hold several parts at once. Use a diagram for where something runs, in what order, or across which boundary. Use a table when findings compare several things on the same points. Use a worked example with real values. In text, diagrams are mermaid through superpowers:mermaid and tables are markdown. The loading skill names what else its medium offers.

When the user says they do not understand a question, or asks what it means, restate it with the concrete case, reference points and representations listed above, starting from what the user can see rather than from the mechanism. The restatement replaces the question's body, keeps the question's number, and stays open.

## Scope

A question is about what the definition covers. A situation the definition does not mention is a hypothetical: a value that might be missing, a step that might fail, two requests arriving at once, a feature that might come later. A checklist in the loading skill or in a type reference may name such situations. The checklist says what to look for. It does not make each item a decision to ask.

Never ask a hypothetical as a decision on its own. Ask a hypotheticals question only when you noticed a situation that would change what the branch defines. Ask it at most once per branch, as a single question that names the situations and asks which of them the user wants to consider now. Not "what happens when X and Y are missing" but "do we consider that X and Y might be missing?". Naming situations is not naming answers. The options rule forbids candidates for a decision, not the subjects a decision could be about.

Each situation the user picks becomes a ❔ leaf in the next frontier. Record each one they defer where the loading skill says, so that it is not raised again.

## Facts

Never look up a fact on your own initiative. When a question needs a fact you do not have, say inside the question that you lack that context and offer to search for it. The user decides whether the lookup happens; when it does, it goes through mahou:lookup.

When the user asks for a check, run it, then report the result before the next round's tree, labelled by the question it unblocks. A fact about a library, a tool or anything else outside the project goes to a `mahou:researcher`, with the requirements taken from the branch being worked. A fact about the project's own code or docs goes to a scout. When the result contradicts a claim the user made or a decision already settled, say so in the first sentence.

## Answers

Each answer becomes a leaf. Read the answer literally. When it approves the question instead of answering it, state the reading you took so the user can correct it.

An answer can do more than settle a leaf:

- It can open new leaves under the same branch, asked in the next frontier.
- It can reveal an area the tree does not have yet. Add a branch for it, put its open decisions under it as ❔ leaves, and ask them in the next frontier.
- It can show that a branch mixes things the user wants apart. Add a level and split the leaves under the new parts.
- It can invalidate a settled leaf. Change the mark back to ❔ and ask again with the new information.
- It can reopen a settled branch, by adding a leaf under it or widening what it covers. The branch's mark goes back to open, its settled leaves keep their ✓, and the new leaves are asked in the next frontier. There is no separate mark for a reopened branch.
- It can drop a branch or leaf outright. Remove it from the tree. Nothing takes its place by default. A loading skill that wants a trace of what was dropped says so itself.

The tree grows during the questioning.

An answer that departs from the source the work came from, such as a ticket or a document, is recorded as a decision with the departure named once.

## Merging

The user may ask to merge parts of the tree that turn out to be one decision or one area.

### Questions

Two open questions that one answer would settle become one. The merged question keeps the lower number, its title names what both decide, and its body carries the context of both. Remove the other question's leaf and do not reuse its number. The merged question's leaf records the merge, for instance "❔ Q3 <what is undecided> (Q5 merged)". A merged question that waits on a lookup waits on every lookup the two had.

### Branches

A branch whose decisions another branch already settled folds into the receiving branch. Its settled leaves that the receiving branch does not hold yet move there, its open decisions become questions there, and the receiving branch goes back to open if it was settled. The folded branch stays in the tree as one line, marked "merged into <n>", with a leaf saying where its content went. Keeping it there leaves the numbers of the other branches unchanged.

## Ending

The frontier is empty when a round of answers opens no new question. Show the final tree with every leaf marked ✓ and state that it is complete. Ask nothing. What happens after the tree is the loading skill's business.
