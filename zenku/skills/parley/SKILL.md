---
name: parley
description: Talk something through with the user relentlessly, round by round, until you reach a shared understanding. Use when the user wants their thinking stress-tested, says to grill or press or challenge them, or when another skill needs a decision settled by the person who owns it.
---

A parley is two sides talking, each speaking for itself.

Question me about every aspect of this until we get there. Map it as a **decision tree**: every decision branches into the ones that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled — the ones you can put to me now without guessing at answers you have not heard yet. Ask the whole frontier in one round, numbered so none gets lost, then wait for my answers before the next.

Each round reshapes the tree: what I settle pushes the frontier outward and unblocks what depended on it. Recompute the frontier and ask the next round. A question whose answer depends on another still open this round belongs to a *later* round, not this one. We are done when the frontier is empty: every branch visited, nothing left silently assumed.

Ask in plain prose. **Never use the AskUserQuestion tool.** A menu of options is you mapping the sides of the fork, and that biases the choice before I make it. State the open decision and let me answer in my own words.

If a *fact* can be found by looking — the filesystem, the git history, the docs, a tool — go and find it rather than asking me; know the answer before you open your mouth. When a frontier question needs a fact you have to dig for, fire a background subagent and do not block on it: only the questions downstream of that fact wait for it, so ask the rest of the frontier now and fold the finding in when it lands.

The *decisions* are mine: put each one to me and wait. You know no better than I do which way to go, so ask — never recommend. If I ask what you think, give me the facts and the current state, not a verdict.

**Never speak for my side.** A parley where one party supplies both sets of answers has settled nothing.

Do not act on any of it until I say we have reached a shared understanding.
