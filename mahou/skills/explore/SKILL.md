---
name: explore
description: User-guided investigation mode. The user provides context to use as the basis and then steers the investigation one question at a time. The agent reads only that context up front and, for each question, dispatches a scout at exactly what the question needs. Use when the user wants to build their own understanding of a problem before defining a change. Not for producing a report, a plan or a scope.
argument-hint: <context and the problem in plain words>
---

Load mahou:basics first, then mahou:docs. Then read `.mahou/explore.md` if present.

# Explore

The user builds the understanding. You bring facts on demand. You edit nothing, open no branch and write no report. The conversation is the record.

## Opening

1. Read only the context the user provided. Do not read the code it refers to.

2. State the problem back as the sources state it, in their own terms. Separate:
   - what the sources ask for
   - what the user has already decided that departs from the sources
   - where the sources contradict each other or the user's direction

3. Stop and wait for the first question. Do not propose where to look next.

## Each question

1. Route the investigation through mahou:lookup, so the reading stays out of this conversation and the user's context is spent on the answers.

2. Answer the question first, then the facts that support it, then the decisions the answer raises.
   - Keep verified facts apart from what a source asserts.
   - When a fact contradicts a decision the user already made, or a claim they brought, say so plainly in the answer instead of working around it.
   - Write the decisions as questions. State no preference unless the user asks for one.

3. Give enough context for the user to ask the next question, and nothing more. Do not answer questions they have not asked.

4. When the question is what something would look like on screen, load mahou:prototype and answer with a prototype instead of prose. The alternative the user picks, and each correction they give, are decisions and go into the settled set like any other.

5. When the question is which parts a system has and how they connect, or how options for changing them compare, load mahou:architecture-exploration and answer on its canvas instead of prose. The option the user keeps, and each correction they give, are decisions and go into the settled set like any other.

6. When the question can only be answered by running code, such as whether an approach works on the real platform, load mahou:spike and answer with what the spike found. The decisions its findings raise go to the user as questions, and the ones the user settles go into the settled set like any other.

## Decisions

When the user settles a decision, record it in one line and read the whole settled set back each time it changes. The user reads the set, not the transcript.

When the user asks for a check against the conventions for a technology, read the wiki entries for it and report where the direction matches or departs from them. Do not read entries otherwise.

## Final check

When the user asks whether anything is left before moving on, report:

- What is still open: the questions waiting on the user, and what nobody has investigated yet, split into what shapes the decisions still ahead and what can wait for a later stage. Name the decision or fact each item touches.
- Where the settled decisions contradict each other, or contradict a fact found during the exploration. Write each contradiction as a question. When one answer follows from both sides, propose it as mahou:basics rule 2 says. Then list what was checked and found consistent, with the fact that settled it.

Route any fact the check needs through mahou:lookup. Record each answer the user gives like any other decision.

## Ending

When the exploration ends, or before the user moves on to the next stage, save what exists only in the conversation and the settled decisions depend on. Write it to the change's scratch folder:

- `decisions.md`: the settled decisions in the order they were settled, each with the question it answered, with each decision that a later one replaced marked as replaced, and what is still open. It also holds the diagrams the decisions depend on, as their source, such as a mermaid block.
- `findings.md`: the facts behind the decisions, each with its source and whether it was verified or asserted.

Leave out proposals the user did not settle. Then check the scratch folder as mahou:basics says under Status.
