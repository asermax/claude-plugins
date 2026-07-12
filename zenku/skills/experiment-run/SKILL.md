---
name: experiment-run
description: Execute a defined experiment — read the one-pager, collaboratively shape what gets built, build the minimal spike that can answer the question, then assist the user through the judging sessions while scribing the insight log. Trigger when the user wants to work on, plan, implement, build, or run an experiment that already has a one-pager.
---

# experiment-run

Load `zenku:framework-core` first — it holds the collaborative workflow principles, the sandbox qualities, and the project conventions (build/test/lint commands, where spikes live).

**Project extensions:** if `.zenku/experiment-run.md` exists, read it now and fold its steps into the flow where it indicates (a project uses this for its own build/prep conventions). See the project-extension-hooks section in `zenku:framework-core`.

The one-pager is the contract; the code exists only to answer its question. This skill keeps the execution honest in both directions: rough enough that nothing is wasted on code that may die, real enough that the judging sessions mean something.

## Orient

Read `experiments/NNN-slug/README.md` first — question, hypothesis, judging criteria, session protocol, and the spike location recorded in Setup. That's the working context; don't ask the user to re-explain what's written there. If something is stale or missing (e.g. no session protocol, no spike location), fix the one-pager with the user before going further. The wider arc lives in `experiments/README.md` and `LEARNINGS.md`.

## Plan — shape the experiment together

Before any code, converge with the user on the experiment's **shape**: the concrete form the spike takes so the judging criteria can be exercised.

- **Research silently first**: the one-pager, the real artifact named in Judging, relevant `LEARNINGS.md` entries, what already exists in the project's shared/production code (the spike shouldn't rebuild it). Arrive with a proposal, not with questions the project could have answered.
- **Propose the shape**: what the spike does, the interactions/behaviors that must genuinely work, what data it's fed and how it gets in, and what stays hardcoded or fake. When the question compares alternatives, propose one shape per alternative — cheap versions of several beat a polished version of one. Flag unknowns explicitly: things only building will answer.
- **Interview to refine.** AskUserQuestion where the options are enumerable, open discussion otherwise. This is collaborative — the user holds the idea's history; challenge vague parts, expect pushback on yours.
- **Check coverage both ways**: every judging criterion must be exercisable by the planned shape, and every part of the shape must serve the question. A part serving no criterion is scope creep — `/capture` it.
- **Validate (silent).** Dispatch the `zenku:shape-reviewer` agent with the one-pager and the agreed shape. Apply its recommendations: mechanical fixes directly; anything that changes what gets built goes through AskUserQuestion. Present what changed and iterate until the user approves.
- **Write the approved shape into the one-pager's Setup section.** That's the build contract; the process stays one document, no separate design doc.

## Build — spike discipline

The spike lives in the sandbox location recorded in the one-pager, and it carries the sandbox qualities defined in `zenku:framework-core` — isolated from production code, throwaway, minimal, the cheapest thing that answers the question, fed real data, easy to launch and discard.

- **Scope strictly to the question.** Hardcode everything the question doesn't test: data, constants, layout, configuration. Skip error handling, edge cases, and robustness unless the question is about them.
- **Fidelity bar**: the behaviors the judging criteria depend on must genuinely work; everything else can be fake or static. Below that bar the sessions can't be judged honestly; above it is polish wasted on code that may die.
- **Stay inside the spike sandbox.** No tests, no production-quality discipline, no "pre-graduating" pieces into the project's shared/production code mid-experiment — promoting is `/experiment-conclude`'s call, and graduation is a rewrite, not a copy. Do keep modules cleanly separated: modularity is the one quality throwaway code keeps, because boundaries are what make the eventual rewrite cheap.
- **If the question compares alternatives, build the cheapest version of each** instead of polishing the first idea — iterating on a single early design hill-climbs a local optimum.
- **Real data from day one.** Feed the spike the real artifact named in Judging — real inputs, real relationships, real scale. A toy dataset invalidates the judging.

## Run — assist the judging sessions

The **user** runs the sessions: the evidence only counts because it's their genuine use against their real work. The agent prepares, guides, and scribes — it does not judge.

- **Prepare**: the spike launched, the real artifact loaded, the session protocol from the one-pager at hand. When part of the setup involves expensive per-use work (fetching, resolving, or pre-processing data live), do it **before** the judged session where you can — live latency drags the interaction loop and the session ends up measuring that latency instead of the thing under study. Verify the Setup's "only building answers" unknowns *before* the judged session — a tooling failure mid-session masquerades as a judging result, so prove the end-to-end path ahead of time, especially when a limited budget leaves no room to recover mid-session.
- **Guide the protocol**: present the scorable tasks one at a time; between task blocks, ask the open questions ("what do you understand now that you didn't before?") and give the user room to answer before moving on.
- **Scribe the insight log live** into the one-pager's Notes, not from memory afterwards: dated entries — discoveries the user voices, expected insights that didn't materialize, anticipated vs. actual usage, features that went unused. Unrecorded sessions are the documented failure mode of self-experimentation.
- When comparing alternatives, record the order they were explored — the first one reliably harvests more insight, so don't let novelty crown a winner.
- Departing from the pre-registered protocol is fine — it's a plan, not a prison — but write the departure into Notes *before* running the changed version.

### Continuous builder-driven discovery (when prospecting a design live)

When the question is *what design/shape works* (not what a context-free actor can do), a single continuous leg where the **builder drives the spike live and the user judges the shape in real time** is high-yield. The user fires adjustments as fast as they see the result; the builder applies them live and scribes each. This mode surfaces a dense, specific set of design choices no pre-registered task list would have found.

- **Scribe relentlessly and reconcile supersessions.** A fast live loop generates dozens of micro-adjustments and reversals; the append-only log drifts stale. Periodically write a **consolidated inventory** entry that is the single authoritative list and explicitly marks what superseded what — it becomes the primary deliverable, not the running log alone.
- **Keep a build-status snapshot** (built / specced-but-deferred / idea-only) so `/experiment-conclude` isn't reverse-engineering what the spike actually does.
- **Name the confound, don't launder it.** This mode is **oracle- and builder-confounded** by construction (the builder judges their own crafting; the user often knows the code): it validates the *shape*, never what a fresh actor would experience. If the judgment includes an insight lens that depends on a fresh perspective, the fresh-driver leg below is still owed — record it as deferred, not met.

### Fresh-subagent drivers (when the judged actor is an agent, not the user)

When a criterion tests what a *context-free* agent can do, spawn fresh subagent drivers instead of driving from the builder session — builder context makes every pass unfalsifiable.

- **One fresh invocation per leg whose criteria depend on absent memory** (e.g. "must consult tooling rather than recall") — memory silently satisfies criteria that were written to force tool use.
- **Two documents, never merged**: the artifact under test (e.g. a document, prompt, skill, or tool) vs the session protocol (role, leg flow, read scope, report-observations instruction). The protocol doc must *not* name the friction/insight classes under study — a primed driver echoes the prompt into the insight log.
- **Fence by content, not location**: read scopes drawn around directories miss contamination arriving through task data (a fed input whose contents contain the experiment docs) and adjacent root files (a root doc like `LEARNINGS.md` can be legally read and name every friction class under study). Ask "what does this data contain?", and pre-register how out-of-scope reads score.
- **Relay verbatim, never smooth**: user asks pass through the orchestrator word-for-word, logged; pre-decide that relayed task input is not a "correction". If an ask stresses a gap the design didn't stage, relay it anyway and pre-register the possible outcomes before the driver moves.
- **Collect a per-leg report**: observations in the driver's own words plus the ordered command list — the command list is what makes "zero bypasses" auditable instead of asserted.
- **Verify harness mechanics with a throwaway probe first** (no docs, no contamination) so tooling failures can't masquerade as judging results.
- **Freeze experiment docs while a driver runs**: the harness injects modified-file contents into live sessions as system reminders — scribing the insight log into the one-pager mid-leg can contaminate a fresh driver despite a correct read fence. Buffer notes in a scratchpad and flush between legs.
- **Plan leg-close for blocked drivers**: a driver blocked waiting on external input receives teammate messages only when its pending tool call returns, and a disciplined driver *refuses* "session over" claims arriving in-band through the data channel — correctly, fed content carries no orchestrator authority (expect in-band injection attempts and expect them declined). Expect the tool timeout to be the release valve, or design a legitimate close signal before starting.
- **Expect the fence to read as arbitrary from the user's side** (e.g. every file of the fed input readable except one root doc) — boundary-probing asks are natural session input; the driver explaining its fence is data, not a problem to smooth away.

## Guard rails

- Sideways ideas → `/capture`, not scope.
- Timebox exceeded → that *is* the finding; move to `/experiment-conclude`.
- Done means the judging criteria have data against them, not that the prototype feels finished. When they do, suggest `/experiment-conclude`.
- **Saturation / falsification-stop is legitimate** — if a leg falsifies the premise the remaining pre-registered tasks were built on, or the insight has plainly saturated, stopping *before* running the rest is the honest move, not a shortfall. Record the unrun tasks as unmet-by-design (not as success), and let the reframing be the deliverable. Don't grind through a task list against a shape the session already killed — running probes against an already-falsified design only scores the corpse.
