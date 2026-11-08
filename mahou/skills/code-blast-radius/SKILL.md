---
name: code-blast-radius
description: Traces what an already-written change reaches. Fans out a tracer per changed element, proves the one fact the change is safe because of by running the real code, and reports only the places where behavior changes for someone, each with how far its proof got. Use after code is written, before it is reviewed or merged.
---

Load mahou:basics first. Then read `.mahou/code-blast-radius.md` if present.

# Code blast radius

Answers one question about a change that already exists: what else does it touch, and does any of it break. This is not a review. It says nothing about whether the change is good and does not hunt for bugs inside the diff.

A blast-radius report reads as convincing whether or not it is true, so every claim in it carries how far it was proven.

## How sure a claim is

Push each claim as far down this ladder as is cheap, and record the rung where it stopped:

1. **Said so.** Worth nothing on its own.
2. **Line cited.** A reference to the line in the project or in the library's own source.
3. **Failure walked through.** The bad case traced step by step to the point where it stops, or to the user it reaches.
4. **Script run.** A script or test that calls the real code, the same library at the version the project installs, and fails loudly when the claim is wrong. Keep it in the change's scratch folder at `blast-radius/`, and keep its output next to it.
5. **Reproduced in the app.** The case driven in the running system, started the way `.mahou/validate.md` or the project's own setup says.

A claim that stops at rung 1 or 2 is unproven, and the report says so.

## Step 0: Load what the tracing needs

Load mahou:changeset for the repositories, the base, and the diff. Read the project's `AGENTS.md` and the layout it describes, so you know which layers a change can travel through and which other repositories it can reach.

## Step 1: Inventory the changed elements

List every element the change alters that something else can depend on:

- function and method signatures, including defaults and the types behind them
- return types, raised exceptions, and error codes
- endpoint paths, request payloads, response shapes, status codes
- exported types and shared components
- database models and columns
- test factories and fixtures, which reach every test in the suite

Skip anything nothing can depend on. A renamed local has no users.

## Step 2: Name the fact the change is safe because of

Most changes that look risky are safe because of a single fact, such as "this call only drops cache entries nothing reads any more". Read the diff, including what the code now does that the diff does not spell out, and write that fact in one sentence. When it holds, it clears most of the risky cases at once, so the time goes into proving it rather than into a long list of possibilities.

When no single fact covers the change, say so in one line and continue with the trace.

## Step 3: Trace each element

Dispatch one `mahou:usage-tracer` per element, all in a single message so they run together. Give each one the element, the absolute path of the repository it lives in, the base, and the absolute paths of the other repositories in scope.

Spawn them as plain subagents. Do not name them. A named agent becomes a teammate, its report arrives through the message channel, and long reports get truncated there.

## Step 4: Merge what comes back

Tracer findings arrive unverified. Drop any that fails to name a user and what that user does differently. Check the rest against the code yourself before they reach the report, and record the rung each one reached. A tracer reads and never runs code, so its findings arrive at rung 2 or 3 at most.

Collapse findings that different tracers raised about the same user, and keep the attribution each tracer gave: introduced by this change, pre-existing, or pre-existing and made reachable more often by this change. A pre-existing problem goes in the report only in the third case.

## Step 5: Prove the safety fact and the findings

Write a script that calls the real code and checks the safety fact, run it, and keep the script and its output in the change's scratch folder at `blast-radius/`. Do the same for each finding where a script is cheap. Reproduce in the running app only what a script cannot reach, such as a teardown order that depends on the framework.

A script that never fails proves nothing. Before trusting it, break the claim it checks, such as by calling the function with the case the claim rules out, and see the script fail.

## Step 6: Report

State the base and the diff composition in one line. Then the safety fact with its rung and its proof, the path of the script and what it printed, or `unproven` with the rung where it stopped.

Then the findings, ordered by reach, with the ones outside the change's own feature first. Give each one its file and line, what changes for whom, its attribution and its rung. Do not list everything the change touched, and do not pad the report with the users you cleared.

Close with the cheapest test that catches each finding, or catches the safety fact failing, before the change merges: the script from step 5 when one exists, else the command or the steps to run.

When nothing changes for anyone, say so in one line, with the safety fact and its rung.
