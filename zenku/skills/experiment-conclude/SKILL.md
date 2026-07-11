---
name: experiment-conclude
description: Close an experiment — force a verdict against the pre-registered criteria, write the learnings entry, and park promoted pieces in PRODUCT.md under a milestone. Trigger when the user wants to conclude, close, or write up an experiment.
---

# experiment-conclude

Load `zenku:framework-core` first — it holds the workflow principles, the
templates list, and the project conventions.

**Project extensions:** if `.zenku/experiment-conclude.md` exists, read it now
and fold its steps into the flow where it indicates (a project uses this to
sync the outcome somewhere durable — e.g. reflect the verdict back into a
source idea note and bump its last-iterated date). See the
project-extension-hooks section in `zenku:framework-core`.

An experiment ends with a **decision, not code**. If the honest summary is
"we learned a lot" with no decision, the experiment isn't concluded — say so
and help the user either extract the decision or record it as inconclusive
with a follow-up.

## Steps

1. **Reread the one-pager** (`experiments/NNN-slug/README.md`) — especially
   the hypothesis, the judging criteria written before running, and the
   insight log in Notes. The verdict is rendered against *those*, not against
   how the result feels now.

2. **Interview for the outcome.** Walk each pre-registered criterion — the
   task lens and the insight lens separately — and judge it against the
   insight log, not against memory. Watch for post-hoc rationalization: if
   the user is redefining success, name it, and record the original criterion
   as unmet alongside whatever was genuinely learned. Negative results are
   first-class — a documented dead end is the point of the log.

3. **Harvest everything else.** The log won't have caught it all — interview
   for what's missing before anything decays into the conversation history:
   - surprises or side observations the log skipped,
   - things learned about the *process* itself (judging protocol, tooling,
     how the sessions ran),
   - ideas the experiment sparked.

   Route every item somewhere durable: into the verdict, into the LEARNINGS
   entry, into `BACKLOG.md` (via `/capture`), or into a process change
   (skills / templates / CLAUDE.md). Don't stop until the user confirms
   there's nothing left that lives only in their head or this conversation.

4. **Force the decision.** One of:
   - **Promote** — some piece proved durable; it gets parked in `PRODUCT.md`
     under a milestone. Implementation happens later, from the product
     backlog — never directly out of a conclusion.
   - **Drop** — the approach is dead; record why.
   - **Follow-up** — the answer reshaped the question; define the successor
     idea in `BACKLOG.md` (or suggest `/experiment-start` if it's ripe).

5. **Write it down:**
   - Fill the **Verdict** section of the one-pager, including its scope (how
     far the evidence reaches — e.g. self-use on your own project, N sessions
     — not evidence it generalizes beyond that).
   - Append a `LEARNINGS.md` entry following
     `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/learnings-entry-template.md`
     (believed / observed / learned / scope / therefore).
   - Update the index table in `experiments/README.md` with a one-line verdict.
   - If the decision is **Promote**, draft the `PRODUCT.md` milestone entry
     now, following
     `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/product-entry-template.md`:
     what proved out, the implementation-relevant constraints the sessions
     discovered, and pointers back to the one-pager and the spike code
     (reference material — implementation is a rewrite, not a copy). These
     pointers are what let the later `zenku:spec` skill ground itself in the
     experiment's evidence, so don't drop them. This is a draft — the
     milestone placement is finalized in step 7.

6. **Validate (silent).** Dispatch the `zenku:conclusion-reviewer` agent with
   the concluded one-pager, the new `LEARNINGS.md` entry, the draft
   `PRODUCT.md` entry (if promoting), and a summary of the harvest routing
   from step 3. It audits the verdict against the pre-registered criteria and
   the insight log, checks scope honesty, and hunts unrouted learnings.
   Apply its recommendations: factual fixes directly; anything that would
   soften or change the verdict goes through AskUserQuestion — the reviewer
   guards the contract, but the verdict is the user's. Present what changed.

7. **If promoting, park it in the product backlog.** Finalize the drafted
   `PRODUCT.md` entry from step 5 (adjusted per step 6's review): decide the
   milestone with the user (AskUserQuestion when it's a real choice) — the
   milestone in progress, or a new/later one — and commit the entry under it.
   The spike code stays where it is; the project's shared/production code is
   populated by the implementation activity, not by conclusions.

Finish with the verdict in one sentence and what it unlocks next.
