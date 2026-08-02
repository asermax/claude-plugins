---
name: research
description: Investigate a question against high-trust primary sources and capture the findings in the project's vault. Use when the user wants a topic researched, docs or API facts gathered, reading legwork delegated, or when another skill needs a fact settled before a decision can be made.
---

Spin up a **background subagent** to do the reading, so the session keeps moving while it works.

Its job, in order:

1. **Load `zenku:codex`.** A subagent starts with an empty context, so a reference is not enough — it has to load the thing before it writes anywhere near the vault.
2. Investigate the question against **primary sources** — official docs, source code, specs, first-party APIs — never a secondary write-up of one. Follow every claim back to the source that owns it.
3. Report what it found, citing the source for each claim, and say plainly where the sources disagree or go quiet.
4. Capture the findings in the vault. The project decides where research lands and what shape it takes; where nothing covers it, say where you put it.

**Name the quest note when you fire it.** A subagent handed only a question has nowhere to put the answer, and the record it was supposed to close stays empty.

Several research questions are independent, so fire their subagents in parallel. This is the one kind of work that does not keep the pace of one per session.

**The session that fired a subagent closes its quest with `zenku:solve` when it returns**, and that is the main session's job rather than the subagent's, which is gone by then. Findings that arrive after the session has moved on are the easiest thing in the framework to lose: the quest stays claimed, the next session cannot see it, and whatever waited on it never comes into reach.
