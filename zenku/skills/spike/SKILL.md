---
name: spike
description: Build throwaway code to answer a design question — does this state model hold up, does this API behave, is this fast enough, what should this look like. Use when the user wants to sanity-check an approach before committing to it, or when another skill needs a question answered by trying it rather than by reasoning about it.
---

Load `zenku:codex`.

A spike is **throwaway code that answers a question**. The question decides everything about it, so name the question first, and say what the spike has to show you for that to count as answered. Otherwise you get a demo you like rather than an answer you trust.

## Work in the adventure's spike worktree

**An adventure owns one git worktree, on one branch that is never merged, and every spike under it works in there.** The first spike creates it. Each one after that finds it already standing.

One per adventure rather than one per spike, because spikes compound. The second question usually needs what the first one fetched, cached, stubbed or measured, and a fresh checkout per spike orphans all of it: the new tree has the code but not the corpus, so the cheap question becomes an expensive one. Sharing the tree also means a later spike can be run against an earlier one to compare them.

Nothing else in the framework creates it. A spike written in the main tree either lands hardcoded throwaway code on a branch that gets merged, or forces a branch switch that takes the vault with it. A worktree avoids both: the main tree stays on the adventure's branch throughout, so the quest note stays writable while the spike runs.

A spike under a **loose quest** has no adventure to own a tree. Give it one anyway and dispose of it when the quest closes.

Where a second checkout is expensive, a large repo or per-tree setup the project does not share, use a plain branch instead and say you did, because then switching back before writing the answer becomes something you have to remember.

**Hardcode everything the question does not touch.** Credentials, fixtures, the ugly branch, the case that never happens. Permission to skip all of that is what makes a spike cheap, and every minute spent making it respectable is a minute spent on code that gets deleted.

**No tests.** Nothing here is going to be maintained.

**One command to run it**, and it prints or shows enough state to see what happened. A spike you have to reason about has not answered anything.

The one quality it keeps: **it must be re-runnable.** A result nobody can reproduce, including you tomorrow, is an anecdote.

## Then put it in front of the user

Run it and hand it over. Their reaction is evidence, and where their reading of the output differs from yours, that difference *is* the finding — write it down.

## Capture the answer, keep the worktree

Close the quest with `zenku:solve`. Its index line carries whatever the quest left behind, so **name what you added to the tree**: the script that reproduces this, the data it cached, the command that runs it. The worktree itself gets named once, by the first spike that creates it, and is then the same tree every later line refers to.

**Leave it in place for as long as the adventure is open.** An answer in prose loses whatever nobody thought to write down, and the questions that come back later, *what exactly did we run* and *did we try it with the other adapter*, are answerable in seconds from a live checkout. It sits beside the main tree costing nothing but disk.

**The trunk still never gets the code.** The branch stays unmerged. What gets built later is written fresh with the answer in hand, because the shortcuts that made this cheap are exactly the things that would have to be audited back out. Reference is not a first draft.
