---
name: drop
description: Drop an idea — decide its objective is not worth reaching, record why so nobody re-argues it later, and dispose of what the experiments left behind. Trigger when the user wants to drop, reject, abandon or close out a backlog idea.
---

# Drop an idea

The decision that an objective is not worth reaching. Like `zenku:promote`, it operates on an **idea** rather than on an experiment, and it produces a real deliverable: the reason, written down well enough that nobody re-argues this from scratch in a year.

A dropped idea is not a failure and not a waste. An objective abandoned because its experiments priced it honestly is the process working.

Resolve the vault, the lab folders, the trunk and the branch pattern per `zenku:framework-core` §1.

## 1. Check what is actually being dropped

Read the idea note and every experiment under it. Then be clear about which of these it is, because they read very differently later:

- **Answered and not wanted** — the unknowns were cleared and the thing turned out not to be worth having.
- **Priced out** — it would work, and it costs more than it returns. Say what the price was.
- **Overtaken** — something else made the objective irrelevant. Name the something else and link it.
- **Abandoned unanswered** — the unknowns are still open and nobody intends to spend more on them. Legitimate, but say so plainly rather than dressing it as a conclusion.

**The decision is the user's, and it is only theirs if they can see what it rests on.** Quote the objective as it stands and each unknown with what it turned out to be, rather than summarising the notes in your own words — the user has very likely not read them, and a case for dropping built out of your paraphrase is a case they cannot argue with. Then let them call it.

Ask whether the objective as written is still the objective, too. An idea that grew apparatus nobody asked for looks far more expensive than the thing the user originally wanted, and dropping it on that basis drops the wrong idea. If what they actually want turns out to be smaller, that is a simpler idea and not a dead one.

## 2. Consider whether it is a drop at all

Worth one sentence before proceeding, and no more than one:

- If it is *not now* rather than *not ever*, the lowest priority keeps it in the backlog at almost no cost, and the backlog is short by design.
- If part of the objective survives, that part is a new capture and the rest is dropped. Say which is which.

Then drop it, and do not keep arguing for it.

## 3. Write the reason on the idea, on its branch

Everything happens on the idea's branch, as in `zenku:promote` — the notes are there with the spike they document, and unlike a promotion there will be no code left to remember any of it by.

```bash
git switch <branch>
git status                       # nothing uncommitted; commit it if there is
git merge <trunk>                # so the branch is current
```

Then write the idea's conclusion section — it exists for this and nothing else writes to it:

- **Which of the four cases** above it is.
- **What the experiments established**, stated so it generalises beyond this one case. This is what survives; the branch will not.
- **What would reopen it.** The most valuable line in a dropped note, and usually a condition rather than an argument — a capability that does not exist yet, a scale nobody has tried, a cost that would fall. It is the difference between an idea that stays closed and one that gets re-litigated every few months.
- **How far the evidence reaches**, if the drop rests on evidence at all.

Set the status to dropped. **Leave the unknowns in place, cleared and uncleared alike** — the list is the record of what was and was not learned.

**Show the conclusion text before committing it**, and particularly the reopening condition. It is written on the user's behalf about a judgement they just made, and it is the line that decides whether this comes back — so it has to say what they would actually want to hear, not what you would.

## 4. Drop the spike commits, keep the notes

The goal is a branch that is **the trunk plus the notes and nothing else**, so the merge in step 5 carries only the record.

Note that a plain `git reset --hard <trunk>` — what `zenku:promote` uses — is wrong here. In a promotion the notes are already on the trunk before the reset happens; here they are still on this branch, so a hard reset would take them with it. A **soft** reset drops the commits while keeping every change they made:

```bash
git reset --soft <trunk>                               # branch is the trunk again; all its changes stay staged
git restore --staged --worktree -- <the code roots>    # throw the spike's edits away
git clean -fd -- <the code roots>                      # and the files it added
git status                                             # only the lab folder should remain
git add <the lab folder>
git commit                                             # one commit: the notes, and nothing else
```

The conclusion written in step 3 is still uncommitted in the working tree, so it lands in that single commit along with everything the experiments wrote. One commit for the whole record is what you want here — the branch is about to become the trunk plus that.

Check the `git status` before committing. If anything outside the lab folder is still staged, the spike touched somewhere the code roots do not cover — say so rather than committing it.

The dropped commits stay reachable through the reflog. If the user wants a durable reference — a spike whose approach might be worth revisiting when the reopening condition fires — **offer to tag the branch tip before the reset**, and name the tag in the conclusion.

## 5. Merge and delete the branch — once the user says so

**The merge is the user's call.** They have just decided not to do something; landing that decision on the trunk and destroying the only copy of the work are separate acts, and the second is irreversible in practice.

Say what the trunk would receive and what would be deleted, and wait. Then:

```bash
git log <branch> --oneline           # notes present, spike commits gone
git switch <trunk>
git merge <branch>                   # fast-forward: just the notes
git branch -d <branch>               # -d, not -D — it is merged now
```

`-d` rather than `-D` is the point: if git refuses, the branch is not merged and something is about to be lost. Do not force it — find out what is unmerged first.

Say what was deleted. If a note is missing, fix that before anything is deleted.

## 6. Harvest what is left

A dropped idea usually leaves more behind than a promoted one, because nothing about it is preserved in code. Do not stop until nothing lives only in this conversation:

- **A finding about how something works, or about what the thing is for** → the note that covers it. Read the vault's charter first; the note folders have a writing charter and the lab does not. `zenku:note` does this.
- **A rule that must not be broken again** → wherever the project records its standing rules, or the note explaining the mechanism if it records none. High bar: such a rule is a decision, not a preference.
- **A different objective the work suggested** → `zenku:capture-experiment`.
- **Work the drop leaves behind** — something to remove, a fallback to keep → `zenku:capture-backlog`.
- **Something about how we work** → a line in the project's lab charter.
