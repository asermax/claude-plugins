---
name: promote
description: Promote an idea — decide its objective is worth reaching now that the unknowns are cleared, then build the real thing properly and dispose of what the experiments left behind. Trigger when the user wants to promote, adopt, graduate or build out a backlog idea.
---

# Promote an idea

The decision that an objective is worth reaching, followed by actually reaching it. This operates on an **idea**, never on an experiment — experiments clear unknowns, ideas get built.

Resolve the vault, the lab folders, the trunk, the branch pattern, the code roots and the spike model per `zenku:framework-core` §1. The project's lab charter is the authority on the process.

## 1. Check it is ready to be decided

Read the idea note and every experiment under it.

The unknowns should be empty, or every survivor should be something the user is knowingly accepting as a risk. If real unknowns are outstanding, say which and offer `zenku:experiment` instead — promoting over an open unknown is how a project commits to a shape nobody has tested.

Inconclusive experiments deserve a sentence each. An unknown that defeated an experiment has not gone away because time passed.

**The decision is the user's, and it is only theirs if they can see what it rests on.** Present the record in the conversation: the objective quoted as it stands, each unknown with what it turned out to be, and what the experiments found along the way. Quote them — do not refer to "the remaining unknowns" or summarise an experiment's conclusion in your own words, because the user has very likely not read these notes and cannot weigh a decision built out of your paraphrase of them. Then let them call it. **Do not promote an idea on your own reading of the evidence.**

## 2. Record the decision on the trunk, before any code

So it survives even if the build stalls.

Set the status to promoted and open the idea's conclusion section — it exists for this and nothing else writes to it. What goes in now is the decision and the evidence behind it; step 8 comes back and says what was actually built.

**Show the conclusion text before committing it.** This is the paragraph that answers "why does the code look like this" for everyone who comes after, and it is being written on the user's behalf about a decision they just made — so it has to be in their terms rather than yours. One exchange, then commit.

**The lab notes are on the idea's branch, not on the trunk.** `zenku:experiment` leaves everything it wrote on the branch with the spike it documents, so the trunk has neither the experiment notes nor the idea's struck-through unknowns. Carrying them over is part of this commit — the decision is what they were waiting for:

```bash
git switch <trunk>
git checkout <branch> -- <the lab folder>    # the notes arrive with the decision
# then set the status to promoted and write the conclusion
git add <the lab folder>
git commit                                    # e.g. docs(lab): promote <slug>
```

That also satisfies the framework's rule that every note reaches the trunk before any code is discarded — here, in one move, at the moment it matters, rather than as something to remember in step 9.

## 3. Clear what the experiments left

**Only under a `throwaway` spike model.** Under `graduate-in-place` there is nothing to clear: say so in one line and go to step 4.

The notes are on the trunk now, so nothing on the idea's branch is still needed. **Drop the spike commits rather than reverting their changes:**

```bash
git switch <branch>
git status                       # nothing uncommitted; commit it if there is
git reset --hard <trunk>         # every spike commit comes off in one move
```

Dropping the commits is what you want rather than restoring paths one by one, because a path-level restore leaves behind everything the spike *added* and you then have to notice each one. This way the branch simply is the trunk, and the real thing gets built on it.

The dropped commits stay reachable through the reflog. If the user wants a durable reference — a spike whose graduation has not happened yet, something worth looking at again — **offer to tag the branch tip before resetting**, and say you did.

**The spikes are not a first draft.** They were built with permission to hardcode, skip tests, ignore structure and break every convention the project has, and that permission is what made them cheap. Keeping them and cleaning them up means auditing every line for shortcuts you can no longer see, which is slower and far less reliable than writing the real thing now that the answers are known. Do not skip this and edit on top: a spike you can still see is a spike you will reuse, one function at a time, and the shortcuts arrive with it.

The findings in each experiment note are the version that matters — that is what the log was written live for.

## 4. Build it

Load `zenku:delivering-change` and follow it: agree the shape, build to the project's bar, verify, review for fit, write the note, **stop for the user before anything is committed**, iterate until they are done, and offer to commit.

Two things that skill will ask for and this one can answer:

- **What the experiments deliberately faked** is in each experiment's build-scope section. Which of those fakes now needs to be real is part of the shape conversation; some do not need to be — a hardcoded value is fine if there is only ever one of them.
- **The spike is reference, not source.** Read it to learn what worked and what the constraints really turned out to demand. Under `throwaway`, do not copy it; graduation is a rewrite, which is why step 3 removed it from sight.

## 5. Finish the idea's conclusion

**What was actually built and where it lives** — rarely the shape any spike used — what was accepted knowingly, and the learning stated so it generalises beyond this one case.

The idea note is what someone reads first when they wonder why the code looks like this, so it is worth the paragraph. If a spike was tagged in step 3, name the tag here; a reference nobody can find is not a reference.

## 6. Merge, then dispose of the leftovers — once the user says so

**The merge is the user's call, not a consequence of the build passing.** Committing on the branch settled what the code looks like; merging settles that it lands, and deleting the branch settles that nothing is coming back. Those are separate decisions and the largest of them is last.

So say where things stand — what is committed on the branch, what the trunk would receive, what would be deleted — and wait. If they want changes, go back to step 4 and keep iterating; nothing here is urgent.

When they agree, confirm the notes are on the trunk rather than assuming it. This is the last moment the branch is recoverable, and one deleted before its notes are committed takes the only thing several experiments produced:

```bash
git log <trunk> --oneline -- <each experiment note>
git switch <trunk>
git merge <branch>
git branch -d <branch>
```

Say what was deleted. If the user wants the spike history kept as reference, keep the branch or the tag from step 3 — one stale ref, and the benefit is occasionally real.

## 7. Harvest what is left

Do not stop until nothing lives only in this conversation:

- **A new objective** → `zenku:capture-experiment`.
- **Work this leaves behind** — the furniture the build deliberately deferred, the follow-ups that are now plainly decided → `zenku:capture-backlog`, one item each. This is where "proven, now build the rest of it" goes; there is no separate product backlog.
- **A rule that must not be broken again** → wherever the project records its standing rules, or the note explaining the mechanism if it records none. High bar either way: such a rule is a decision, not a preference.
- **Something about how we work** → a line in the project's lab charter. That is how the process itself improves.
