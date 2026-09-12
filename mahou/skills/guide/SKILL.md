---
name: guide
description: Entrypoint to the mahou plugin when unsure which skill fits. Give it your goal in plain words and it identifies the matching skill and activates it with your request as context.
argument-hint: <goal in plain words>
---

Load mahou:basics first. Then read `.mahou/guide.md` if present.

Routes a goal to the skill that handles it. Performs no work of its own.

## Procedure

1. Restate the user's goal in one line, in your own words. If the restatement is wrong, the user corrects it now rather than after a skill has run.
2. Look at every skill whose name starts with `mahou:` and match the goal against their descriptions. Skip the ones that are loaded by other skills rather than run (`basics`, `docs`, `design-tree`, `changeset`) and the ones marked typed-only; neither is a goal to route toward.
   - Exactly one fits. Say which one and why in one line, then run it with the original request as context.
   - Several could fit. List them with one line each and ask the user to choose. Never pick for them.
   - None fits. Say so plainly. If the gap is worth filling, mention mahou:learn.
3. Hand off. Do not do the work yourself, do not summarize what the skill is about to do, and do not run a second skill afterwards unless the user asks.

## The usual order

When the goal is a piece of work rather than a single task, the skills form a line. mahou:explore builds the understanding, mahou:shape settles the decisions, mahou:design settles the system and mahou:program-architecture settles the program that implements it. The code gets written by hand or by another tool. Then mahou:code-blast-radius, mahou:agentic-review and mahou:human-review look at it, and mahou:write-documentation records what got built. Say where in that line the goal sits when it helps the user pick, and route to that one stage only.
