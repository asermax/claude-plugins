---
name: shape
description: Finds the holes in a problem and solution definition and fills them with questions, working a design tree in rounds until nothing is left assumed. Stays at the level of behavior and decisions, never implementation. Use after the user has explored a problem and settled its first decisions, and before any design or plan is written.
argument-hint: <the problem and the decisions settled so far>
---

Load mahou:basics first, then mahou:design-tree. Then read `.mahou/shape.md` if present. The tree, the rounds, the question format, the facts rule, how answers grow the tree and how the session ends all come from `design-tree` and apply here as written. This skill only says what the tree is about.

# Shape

Takes an idea the user has already explored and stress-tests its definition. The output is a design tree with every branch settled. The tree is the record of the shared understanding.

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

## What a question is here

Questions are about behavior: what is captured, when it is replaced, who sees it, what happens on failure. Not about endpoints, columns, functions or files. If two answers lead to the same behavior with different code, the question is implementation and is not asked.

## What this skill is not

It does not design the system, write a scope or a plan, write documentation, or touch code. It ends with the settled tree. Anything built on the tree is a separate job the user starts.
