---
name: experiment
description: Define, run and conclude an experiment — take unknowns off a backlog idea, write what a successful run looks like, build the spike on the idea's branch, then score it and write the answers back to the idea. Trigger when the user wants to start, define, run, work on or conclude an experiment.
---

# Define, run and conclude an experiment

One experiment, start to finish. It clears **unknowns off an idea** — it never decides whether the idea is worth building, and it never disposes of anything. Those are `zenku:promote` and `zenku:drop`.

Resolve the vault, the lab folders, the templates, the commands, the spike model and the branch pattern per `zenku:framework-core` §1. The project's lab charter is the authority on the whole process; read it if anything here is unclear, and where it is more specific than this file, it wins.

Apply `zenku:framework-core` §3 throughout — **nothing lands in a file the user has not seen.** Every step here writes to the vault, and this is the skill where that matters most.

If the user is picking up an experiment that is already running, skip to step 5.

## 1. Get the idea to the point where an experiment can start

Start from a note in the project's ideas folder. If there is none, run `zenku:capture-experiment` first — an experiment with no idea above it has nothing to be measured against and nothing to be promoted later.

**Open by reading the note back.** Quote the objective and every unknown as they stand, then ask whether that is still what the user wants. This is not ceremony: an idea can have been sitting there for months, or have been written by a session the user barely remembers, and it may have drifted well past what they ever asked for. Finding that out costs one message here and is unrecoverable three steps later.

What you are getting to is the state where **the unknowns are named and at least one could be cleared starting today.** The project's charter names that status. Getting there is a conversation, not a form:

- The objective is a sentence and nothing else → what do we actually want to be able to do, and what does it look like when we can?
- The objective is stated but nothing stands enumerated → what stands in the way? Each unknown must be something a single experiment could clear, phrased so that clearing it has an outcome someone could point at. "Will it be good" is not an unknown. "Does the model expose enough to tell which layer a thing attached to" is one.

Ask what is needed and no more. Where you can answer an unknown by reading the code — or by looking up current documentation for a library rather than trusting what you remember of it — do that first and bring the answer. But bring it as something the user can see and disagree with, not as a premise already folded into the next question. If you rule an option out, say which constraint it failed; a rejection the user can re-litigate beats a silent omission.

**Then dispatch `zenku:idea-reviewer`** on the objective and the unknowns as you propose to write them. It checks the framing — is the objective a goal rather than a smuggled question, is each unknown something one experiment could clear, is any of them already answered by a concluded experiment in this vault, has the note grown apparatus nobody asked for. Fix what it finds; anything that is a real choice goes to the user.

**Write it back to the idea note**, once the wording has been agreed in the conversation. Update the unknowns, move the status, and sharpen the objective if the conversation moved it. Refinement that lives only in the experiment note is refinement the next experiment on this idea has to redo — and it leaves the idea claiming to be untouched while work happens underneath it.

If the conversation makes the idea **simpler** — fewer unknowns, a plainer objective, apparatus removed — write that back too. An idea that only ever grows is a sign the notes are being written at the user rather than for them.

If it cannot get there, stop. Say what is missing and do not branch. An idea nobody can name the unknowns of is not ready to be spent time on.

## 2. Pick the unknowns this one goes after

Usually one. Sometimes a cluster that genuinely cannot be separated — an attach path and what the attached thing can see are one build.

**Going after all of them is how you clear none of them.** Everything not picked stays on the idea and waits for another experiment; there is no cost to leaving it, because the idea outlives every experiment under it.

**The pick is the user's, and they need the list in front of them to make it.** Lay the unknowns out in full — the text of each one, and what it would take to clear it, since that is the part they cannot see and you can. Then recommend one and say why. What you must not do is offer a choice phrased in terms only you can resolve: an option that reads "unknowns 1 and 2" or "the model one" is unanswerable by anyone who has not read the same file you just did.

## 3. Write the note before writing code

In the project's experiments folder, from the project's experiment template. Kebab-case, named for what is being built or probed rather than for the idea — that keeps it from colliding with the idea note, and vault names have to be unique.

Fill in the frontmatter the template carries, and note that where it records a branch, **the branch is the idea's, not this experiment's.** Every experiment under one objective works on one branch, so the second spike can start from what the first one left instead of rebuilding it. Link the idea.

Then the sections. Whatever the template calls them, four things get written now:

- **What objective this serves**, with a link to the idea. An experiment that cannot name what it is in service of has nothing to be measured against.
- **Which of the idea's unknowns this goes after** — quoted from the idea, so the note reads on its own.
- **What gets built, and what it deliberately fakes.** Everything the unknowns do not touch is hardcoded.
- **`## Acceptance criteria`** — what a successful run looks like, and when to stop.

**Draft the build scope and the acceptance criteria in the conversation and get them agreed before the file exists.** They are the two the user has to actually hold you to, and both are cheap to argue about now and expensive later: a criterion nobody agreed to is one you will score yourself against, and a scope nobody agreed to is a build the user did not ask for. Keep the draft short enough to read in one go — if a plan needs a table to be understood, that is a sign the experiment is doing too much.

**Do not proceed without acceptance criteria.** This is the framework's one non-negotiable section, and the reason is timing rather than rigor: decided afterwards, they will be met — not through dishonesty, but because a result is much easier to admire once it is the only one you have. If the project's template has no such heading, add it and say you added it.

They do not have to be numeric and do not have to be designed to fail. They have to be **observable** — something a person could point at and agree on without having been in the room. "It works well" is not a criterion. "The panel shows which layer a thing attached to" is one, and it costs nothing to write. Where the unsuccessful case is not simply the absence of the successful one, say what it looks like.

**Where the real subject cannot exercise a criterion, pre-register a synthetic probe for it** — a fixture built to carry exactly the case the real one lacks — and say plainly that it is synthetic, kept separate from the judgment made against real material. A criterion nothing can test is a criterion that will quietly be dropped.

Include when to stop. If it needs more than a couple of sittings, that is itself a finding.

Then point the idea note back at this experiment, so the link works both ways.

## 4. Get onto the idea's branch, then commit the note there

```bash
git switch -c <branch>          # or: git switch <branch>, if a previous experiment made it
git add <the experiment note> <the idea note>
git commit                      # e.g. docs(lab): define the <slug> experiment
```

The branch follows the project's pattern, resolved per §1 L5 — one branch per idea, created by whichever experiment gets there first. If it already exists, merge the trunk into it before starting so the branch is current, and keep this experiment's commits recognisable: a spike per experiment on a shared branch is what lets the idea's eventual decision deal with all of it at once.

The note is committed **before any code exists**, which is the part that matters. Acceptance criteria written after the fact are criteria that will be met.

Everything this skill produces stays on the branch, notes included. Nothing here puts anything on the trunk — the notes travel to the trunk with the decision, in `zenku:promote` or `zenku:drop`.

## 5. Build the spike

The project's `**Spikes**` field decides what kind of build this is.

**Under `throwaway`:**

- **Hardcode everything the unknowns do not touch.** One case, one path, no configuration, no persistence, magic numbers inline.
- **Do not pre-graduate.** Resist building it the way the real code will want it — that is `zenku:promote`'s job, and doing it now costs time before anyone knows whether there will be a real version.
- **Keep it modular anyway**, only so far as it makes the later rewrite cheap. Modularity is the one quality throwaway code keeps.
- **No tests yet.** Tests are part of building the real thing, not part of clearing an unknown.

**Under `graduate-in-place`:** build it small but to the project's bar, tests included, faking only what the unknowns do not touch. Be aware of what this costs and say it out loud when it starts happening: production hardening absorbed inside an experiment's timebox is time the experiment did not spend on the question, and it makes the timebox a bad estimate of what the *answer* cost.

Either way, **the project's standing rules still apply.** A spike is exempt from the quality bar and not from those — a spike that cannot be re-run is an anecdote rather than a result.

Where you are comparing alternatives, build the cheapest version of each rather than a good version of one. And feed it real material from the start: a spike judged on a toy input has answered a question nobody asked.

## 6. Log findings as they happen

Append dated entries to the note's findings section **while running**, not reconstructed afterwards. Include the things you expected to find and did not — those are the entries that change someone's mind six months later.

If you change how the experiment is being run, write that down *before* running the changed version. A protocol change recorded afterwards is indistinguishable from a rationalisation.

Where the user is the one judging, you are the scribe: record what they say as they say it, and record the order they explored things in. Do not summarise a session from memory once it is over.

## 7. See it work

Run the project's `**Run**` command, then do whatever its `**Seeing it work**` field says.

If that field is not recorded, ask once — *"beyond the checks, how would you confirm this actually works, and what fails silently here?"* — and offer to record the answer. Most projects have a failure mode that passes every check and still does not work, and the whole value of the field is that someone has named theirs.

## 8. Stop when the criteria have data against them, or when the timebox is spent

Not when the prototype feels finished. Blowing the timebox is **a finding** — about what the thing costs — rather than a reason to keep going.

Stopping early is legitimate too: once the criteria have been decisively answered, running the remaining probes only scores a result that is already in. Record the unrun ones as unrun and say why.

Unknowns that turn up sideways go to the idea, or to `zenku:capture-experiment` if they belong to a different objective, or to `zenku:capture-backlog` if they are just work. They do not get absorbed into this experiment's scope.

## 9. Score it against what was written down

Reread the acceptance criteria and the findings, and judge against **that record** rather than against how it felt — memory reliably improves a result, which is the reason the log exists.

Walk the criteria one at a time and say for each whether it was met, not met, or never judged. If a finding contradicts what a criterion asked for, say so plainly. Quietly restating what would have counted is the failure mode this whole folder exists to prevent, and it has a tell: if the criterion has been reworded between being written and being scored, name the rewording rather than scoring the new version.

**Say the score in the conversation before writing it.** Which criteria were met, which were not, and the status you think follows — the user was not watching the build and the note is where they find out what happened. A verdict they read for the first time in a committed file is a verdict they were not party to.

Then set the status. The framework's vocabulary, which the project's charter will also list:

- **cleared** — the criteria were met and the unknowns have answers.
- **partial** — some cleared and some not, or the answer arrived from somewhere the criteria did not anticipate. Common, and not a failure.
- **inconclusive** — the criteria were not met and the unknowns are still open. A blown timebox lands here and is a real result about cost rather than an absence of one.

Write the conclusion: what the unknowns turned out to be, the learning stated so it **generalises beyond this one case**, and **how far the evidence actually reaches** — how many inputs, how many people, on whose machine. That scope sentence carries real weight; one person on one case is a narrow base, and saying so is what stops the result being over-trusted a year from now.

Name the confounds rather than laundering them. If the same person built the thing and judged it, that is worth one sentence: a builder-driven session can settle a shape and cannot tell you whether anyone else wants it.

If the note cites material that is not in the repository — output that was never committed, a session nobody logged — say so in the scope sentence rather than letting the result read as reproducible.

Record the concluded date if the template carries one, and update the summary so it carries the **answer** rather than only the intent. Where the project's index displays that field, it is what someone reads instead of the note.

## 10. Write the answers back to the idea

The step this skill exists to reach. On the idea note:

- **Strike the cleared unknowns** and record what each turned out to be — struck through, answered in place, linked to this experiment, so the list reads as a history rather than a to-do:

  ```markdown
  - ~~Does the model expose which layer a thing attached to?~~ → **No.** It captures the layer in a closure. [[this-experiment]]
  ```

- **Add the unknowns this turned up**, if any — and no more than that. An experiment that ends with the idea carrying more unknowns than it started with should have to justify each one out loud.
- **Adjust the status** only if it needs it. It stays where it is while unknowns remain.
- Link the experiment both ways, if step 3 did not.

Show the struck-through answers before writing them. They are the sentence someone reads a year from now instead of the whole note, so the wording is worth one exchange.

**Do not write the idea's conclusion, and do not set it promoted or dropped.** That section is where the idea ends and it belongs to `zenku:promote` and `zenku:drop`. An experiment that writes a conclusion onto the idea has made the decision on the user's behalf and hidden it inside a status update.

Then say plainly which it is: **unknowns still open** → another experiment. **List empty** → the idea is ready for a decision, which is `zenku:promote` or `zenku:drop`, and the user makes it.

## 11. Commit the notes on the branch

**Before anything else, and whatever the result.**

```bash
git add <the experiment note> <the idea note>
git commit                      # e.g. docs(lab): conclude <slug> — <status>
```

Commit the spike too, if it is not committed already. An uncommitted working tree follows a branch switch, so code left loose ends up wherever the next command goes — and a spike nobody committed is a spike the next experiment on this objective cannot start from.

Then stop, on the branch. The notes stay here with the code until the idea is decided.

## Where this stops

An experiment clears unknowns and says what they turned out to be. Whether the objective is worth reaching now that its cost is known is a different judgement, made once, at the idea — by `zenku:promote` or `zenku:drop`, and by the user rather than by you.
