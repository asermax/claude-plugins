---
name: shape
description: Finds the holes in a problem and solution definition and fills them with questions, working a design tree in rounds until nothing is left assumed. Stays at the level of behavior and decisions, never implementation. Use after the user has explored a problem and settled its first decisions, and before any design or plan is written.
argument-hint: <the problem and the decisions settled so far>
---

Load mahou:basics first, then mahou:design-tree. Then read `.mahou/shape.md` if present. The tree, the rounds, the question format, the facts rule, how answers grow the tree and how the session ends all come from `design-tree` and apply here as written.

# Shape

Takes an idea the user has already explored and finds what its definition leaves undecided. The output is a design tree with every branch settled.

## The tree

The root is the problem in one line. Each branch is an area of the definition. One branch always exists next to the ones the problem needs: what is out of scope.

```
Problem: <one line>
├─ <area>                                                    settled
│  ✓ <decision>
├─ <area>                                                    open
│  ✓ <decision>
│  ❔ Q4 <what is undecided>
└─ Out of scope                                              settled
   ✓ <what was raised and excluded>
```

## Opening

1. Read the problem and the decisions the user brings. Build the tree from them: the root, one pending branch per area of the definition, the Out of scope branch, and a ✓ leaf under its area for every decision already made. Show it and wait for the user's corrections. Open the first branch in the reply to the approval.

2. Open one branch at a time, in order. When a branch opens, state what is already settled under it in a few lines of prose and ask the user to correct what is wrong. The reply after the confirmation asks the frontier, which is that branch's open leaves. A situation the definition does not mention follows the Scope section of `design-tree`; a deferred one goes under Out of scope.

3. When every leaf of the branch is ✓, show the whole tree and stop. Open the next branch when the user approves.

## What a question is here

Questions are about behavior: what is captured, when it is replaced, who sees it, what happens on failure. Not about endpoints, columns, functions or files. If two answers lead to the same behavior with different code, the question is implementation and is not asked.

## What this skill is not

It does not design the system, write a scope or a plan, write documentation, or touch code. It ends with the settled tree. Anything built on the tree is a separate job the user starts.
