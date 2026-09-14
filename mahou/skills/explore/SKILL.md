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
   - For questions about the project, two scouts are available. `mahou:code-scout` covers where something is implemented, which parts are involved, or how the code behaves; dispatch one per repository the question touches, with the repository's absolute path and the question. `mahou:docs-scout` covers how something is meant to work, why a decision was made, or what a note commits someone to; give it the project's docs folder, resolved as `docs` says, and the question. Both go out together in parallel, so you get the relevant information from both sides whichever way the question is phrased. Discrepancies between their reports are findings in themselves. State both sides rather than resolving silently. When a diagram helps explain the answer, validate it with superpowers:mermaid-validation before showing it.
   - For questions about a library, a tool or anything else outside the project's own code and docs, the scouts read nothing. Send an external fact to a `mahou:researcher`, or settle it by a direct trial: install the thing somewhere disposable, run it against the real input, read what it returns. A trial's result is a verified fact; a subagent's summary of documentation is not, and the answer says which it is.

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
