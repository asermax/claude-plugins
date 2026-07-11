---
name: experiment-start
description: Define and scaffold a new experiment — turn a backlog idea (or a fresh one) into a numbered one-pager with a pre-registered question, hypothesis, and judging criteria, plus a place for its spike to live. Trigger when the user wants to start, define, or spin up an experiment.
---

# experiment-start

Load `zenku:framework-core` first — it holds the collaborative workflow
principles, the sandbox qualities, the templates list, and the project
conventions (read from the zenku section of the project's CLAUDE.md).

**Project extensions:** if `.zenku/experiment-start.md` exists, read it now and
fold its steps into the flow where it indicates (a project uses this to add its
own spike scaffolding — e.g. create and register a route, then run the build).
See the project-extension-hooks section in `zenku:framework-core`.

Turn an idea into a defined experiment. The value of this skill is the
interview: the question, hypothesis, and judging criteria must be written
**before** any code exists, so the result can't be rationalized after the fact.

## Steps

1. **Pick the idea.** If the user named one, find it in `BACKLOG.md`; otherwise
   show the backlog's "Next up" / "Ideas" sections and ask which to promote
   (AskUserQuestion). A brand-new idea not in the backlog is fine too.

2. **Interview until the definition is sharp.** Use AskUserQuestion where the
   options are enumerable, free discussion otherwise. You must end up with:
   - **Question** — exactly one. If the draft contains an "and", split it and
     push the rest back to the backlog.
   - **Hypothesis** — what the user expects to happen, phrased falsifiably.
   - **Judging** — how the answer will be recognized, including the **real
     work artifact the experiment is judged against** — the real thing the
     project produces (a diff/PR, a dataset, a document, a task outcome), not
     a toy — and a kill criterion or timebox (default: a few focused sessions
     — if it needs more, that itself is the finding). Require both lenses: a
     **task** criterion (concrete, checkable against the real artifact) and an
     **insight** criterion (what understanding the work should produce).
     Optimizing the task metric alone is a documented failure mode — a
     solution can score well on the task and still produce no transferable
     understanding.
   - **Setup** — the minimal thing to build, plus the session protocol: the
     2-3 scorable tasks to run against the real artifact, interleaved with
     open-ended "what do I understand now that I didn't?" blocks.

   Challenge vague answers ("it feels better" → better *at what task*?). Do
   not proceed while the question is compound or the judging is unfalsifiable.

   **If the project states a purpose** (in the zenku section of its CLAUDE.md),
   check the question serves it — not a general engineering question wearing an
   experiment costume. If the project states no purpose, skip this check rather
   than inventing one.

   **Discovery-mode is legal — pre-register the judgment, not the shape.**
   When the real question is *where* something lives (which representation,
   layout, approach, or interaction produces the desired result) rather than
   whether a known design works, it's legitimate to leave the **build shape to
   discovery** while still pre-registering the **judgment** (the real artifact
   + the insight criterion + a kill/timebox). What must be fixed before running
   is *how the answer is recognized*, not *what gets built* — the anchor is
   what stops self-experimentation from rationalizing whatever emerged. An
   experiment can even invert its own sub-question mid-run and stay honest, as
   long as the judgment anchor held while the shape moved.

   **Research when the hypothesis needs it.** If the hypothesis is about to
   be written on top of a knowledge gap — which mechanisms exist, what prior
   art solved this, what a library can actually do — dispatch the
   `zenku:experiment-researcher` agent before locking it in. Give it the
   problem, the experiment question, the constraints to rank under (the user's
   + the project's stated purpose, if any), and any candidates already
   suspected; relay constraint changes the user voices while it runs. Fold the
   report back into the interview: the research grounds the hypothesis and
   kills dead options before they get spiked, but the pick stays the user's. A
   cheap survey that kills an option or reframes the question pre-spike beats
   discovering the same thing during the build.

3. **Allocate the number.** Next `NNN` after the highest in `experiments/`
   (numbers are never reused, including abandoned ones). Slug: short kebab-case.

4. **Write the one-pager** at `experiments/NNN-slug/README.md` following
   `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/onepager-template.md`
   (Question / Hypothesis / Judging + `## Setup` (including the spike location)
   + `## Notes` insight-log + `## Verdict`). Add a row to the index table in
   `experiments/README.md` (verdict column empty).

5. **Establish where the spike lives.** Determine the spike sandbox location:
   from the project's zenku-conventions (in CLAUDE.md) if it names one;
   otherwise ask the user once and record the choice. **Record the spike
   location in the one-pager's Setup section** — every one-pager records where
   its own spike lives. A good sandbox is isolated from production code,
   throwaway, and the cheapest thing that answers the question — see the
   sandbox qualities in `zenku:framework-core` (with an optional worked web
   example at
   `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/sandbox-example-web.md`
   — one example, not the default). The actual building is `/experiment-run`'s
   job; here you only fix and record the location.

6. **Validate (silent).** Dispatch the `zenku:onepager-reviewer` agent with the
   draft one-pager (and the backlog idea, if it came from one). Apply its
   recommendations: obvious fixes directly; anything requiring a choice or
   reopening an interview decision goes through AskUserQuestion. Then present
   what changed. Iterate if the user's answers reshape the contract.

7. **Clean the backlog.** If the idea came from `BACKLOG.md`, remove it (the
   one-pager supersedes it). If the interview spawned side-ideas, capture them
   in the backlog instead of widening the experiment.

Finish by restating the question, hypothesis, judging criteria, and timebox in
one short block, so the contract is visible in the conversation.
