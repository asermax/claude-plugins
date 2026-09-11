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

1. Investigate only what the question needs. Do not widen the search to things the user has not asked about yet, even when you can see they will matter.

2. Route the investigation through scouts by default, so the reading stays out of this conversation and the user's context is spent on the answers:
   - `mahou:code-scout` for where something is implemented, which parts are involved, or how the code behaves. One per repository the question touches, given the repository's absolute path and the question.
   - `mahou:docs-scout` for how something is meant to work, why a decision was made, or what a note commits someone to. Given the project's docs folder (resolved as `docs` says) and the question.
   - Both, in parallel, when the question has a code side and a documentation side.
   - Neither, when the question is about a library, a tool or anything else outside the project's own code and docs. Scouts read the project. An external fact goes to a general-purpose subagent, or is settled by a direct trial: install the thing somewhere disposable, run it against the real input, read what it returns. A trial's result is a verified fact; a subagent's summary of documentation is not, and the answer says which it is.

   Dispatch them in a single message so they run together. Read a file directly only when the user points at it, or when an earlier answer in the same session already located it. A `grep` you run yourself over the project's tree is not a substitute for a scout. It puts the whole search into this conversation and misses the other places the question touches.

3. Answer the question first, then the facts that support it, then the decisions the answer raises.
   - Keep verified facts apart from what a source asserts.
   - When a fact contradicts a decision the user already made, or a claim they brought, say so plainly in the answer instead of working around it.
   - Write the decisions as questions. State no preference unless the user asks for one.

4. Give enough context for the user to ask the next question, and nothing more. Do not answer questions they have not asked.

5. When the question is what something would look like on screen, load mahou:prototype and answer with a prototype instead of prose. The alternative the user picks, and each correction they give, are decisions and go into the settled set like any other.

## Decisions

When the user settles a decision, record it in one line and read the whole settled set back each time it changes. The user reads the set, not the transcript.

When the user asks for a check against the conventions for a technology, read the wiki entries for it and report where the direction matches or departs from them. Do not read entries otherwise.
