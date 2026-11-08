---
name: validate-setup
description: Writes and keeps up `.mahou/validate.md`, the file mahou:validate reads to bring a project's system up, drive it, capture evidence and clean up, with one file per feature under `.mahou/validate/features/`. Learns each part from the repository, asks only what the repository does not show, and proves the file by driving one feature end to end. Re-run on an existing file to check it against the repository and a live pass. Use when a project has no `.mahou/validate.md`, or when validation keeps stumbling on how the system runs.
argument-hint: [upkeep]
disable-model-invocation: true
---

Load mahou:basics first. Then read `.mahou/validate-setup.md` if present.

# Validate setup

mahou:validate works out how a system runs from the project's setup every time it starts, and asks when the setup does not say. This skill writes that knowledge down once, in `.mahou/validate.md`, so every later run starts from it. The reader is an agent that has never seen the system, reading the file in the middle of a run.

With no `.mahou/validate.md`, the skill writes one. With a file present, it runs the upkeep pass, as it does when the user passes `upkeep`.

## Read the repository first

Answer each question from the repository: its `AGENTS.md`, README, package scripts, Makefile, compose and task files, existing end-to-end specs, and the references under mahou:validate's `references/`. Ask the user only what the repository does not show, in one round, in plain prose in the reply. Every choice between two ways of doing something goes to the user too, such as which of two dev commands to use or which surface is the primary one.

- **Surface.** What a person or a caller touches: a browser UI, an API, a mobile app, a CLI. A repository can have several; list each.
- **Launch.** The command that starts the system for validation, from an empty data folder, migrations and seed data included, and how to tell it is ready.
- **Drive.** How an agent reaches each surface: the validate reference that fits, and the stable handles this repository offers, such as ARIA labels, data attributes, route paths or prompt strings.
- **Evidence.** What can be captured: screenshots, response bodies, logs, exit codes, database rows.
- **Isolation.** Whether a second instance can run beside the user's own, through other ports, data folders or profiles. When it cannot, the file says so, and validate refuses to drive an instance the user is using.

When the checkout does not build or start as it is, stop and report what fails with its output. A file written against a broken base teaches wrong steps.

## The file

`.mahou/validate.md` has one section per part, each holding commands and handles read from this repository, never placeholders:

- **Launch**: the exact commands, what ready looks like and how to stop it. Ready means usable: a login works, a page renders, a request returns data. A process that answers on its port can still be running its migrations.
- **Doctor**: one read-only check that says whether the running instance is worth driving: the processes are up, the build is the branch under validation, the port belongs to this instance, the identity used is still valid. mahou:validate runs it before the first row and after any failure.
- **Drive**: per surface, the validate reference to load and the handles to use.
- **Evidence**: what a row captures and where it goes. When the safe way to run something is a dry run or a test mode, the file says what that mode still does, observed by running it, because some dry runs still reach the network.
- **Cleanup**: how to stop what a run started. Stop the processes the run started, by the id the run recorded, never by name. Cleanup removes instances and scratch data and never the evidence, which stays where Evidence says.

A helper script the file relies on lives in `.mahou/validate/`, is executable, and its call is written in the section that uses it.

## The feature files

Seed `.mahou/validate/features/` with a `README.md` listing the files and one file per user-facing feature the repository shows, from its routes, commands, menus or docs. Propose the list and let the user cut, merge or add before writing any. Each file answers, from the user's point of view, under four headings:

- **Sub-features**: the parts of the feature, one line each.
- **How to get to it**: every entry point a person uses.
- **Driving it**: the preconditions, then each step with the action, the handle and what the screen or response shows after it.
- **Gotchas**: what trips a run, such as a key that types into a focused field instead of acting, or seed data missing a precondition.

When the seed data lacks what a feature needs, the step fails and the reason goes under Gotchas. Never weaken a step so it passes.

## Prove it

Run the file once end to end: launch, doctor, drive one feature the user picks, capture its evidence, clean up. After cleanup, check that the evidence is still where Evidence says. Fix what fails in the file and run Cleanup after every failed attempt, so no attempt leaves processes or ports behind. A file that was never run is a draft; say so when the run could not finish, and what stopped it.

Show the file and the feature files before writing them, and write them once the user approves.

## Upkeep

Checks an existing file against the repository and a live run.

1. **Index.** Read `features/README.md` and the files beside it. Report entries with no file, files with no entry and duplicates.
2. **Source.** One `mahou:code-scout` per feature file, in parallel, asked how the feature works today and where the file disagrees with the code, citing the lines. Scouts never drive the system or edit files.
3. **Live.** Launch from the file and drive every feature at least once, one instance driven in turn. Run Doctor before the first drive and after every failed one. A feature that cannot be reached is recorded with the precondition it needs and the route tried.
4. **Sort.** Each difference is one of three:
   - **Doc drift**: the file describes the system wrongly. Propose the correction.
   - **Harness gap**: the system works and the file cannot drive it. Propose the fix to the file or its helper, and drive it again before proposing.
   - **Product regression**: the system no longer does what the file describes. Report it with its evidence; never change the file to hide it, and never touch product code.

The reply loads mahou:report and gives one outcome: clean, changed (the proposed corrections, applied once the user approves each), or blocked (what stopped the pass), with every feature covered and every regression found.

## What this skill is not

It does not run validation rows; mahou:validate does. It does not edit product code. It does not commit.
