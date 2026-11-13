---
name: distill-to-wiki
description: Surveys a project's codebase, one repository or several, for the technologies it uses, the conventions it repeats and the architectural decisions that shape it, compares each with the global and local wiki, and proposes new entries, iterations and contradictions for the user to rule on. It surveys the whole codebase by default, or the part the user names. Writes only wiki entries.
argument-hint: [repositories, folders, technologies or a question to scope the survey]
disable-model-invocation: true
---

Load mahou:basics first. Then read `.mahou/distill-to-wiki.md` if present.

## Scope

The repositories are the one the session started in, or the ones the user names, each by absolute path. The survey covers each repository whole unless the user names a part: a folder, a technology, or a question such as "how are hooks written here". Restate the scope in one line before starting, so the user corrects it before the survey runs.

## Read the wiki

Read both root indexes, global and local, and every folder index under them, so you know every topic and entry before the survey starts. Read an entry in full when a finding touches its topic.

The local wiki is per repository: `.mahou/wiki/` in each repository in scope.

## Survey

Start by reading each repository yourself: its `AGENTS.md` or `README.md`, its manifests and lockfiles, its lint, format and compiler configs, and its folder tree. These name the technologies and the parts of the code.

Then read the code itself. When a part is too large to read in this context, or several parts can be read independently, dispatch one `codebase-surveyor` per part, in parallel, briefed with the repository's absolute path, the part, and the scope the user gave. Decide which parts go to a surveyor as you read, and say which parts you dispatched and why.

A finding is a pattern or a decision:

- **A pattern**: something the code does the same way in several places. The more places follow it, the stronger the finding. Count them, cite some, and list the places that break it.
- **A decision**: a technology or architectural choice that shapes the code around it even when it appears once, such as a repository layer over the ORM, one state library for every screen, or a module boundary every import respects. Cite where it is made and what it shapes.

A finding is about a technology, a tool or a convention. Rules about how the product behaves, invariants and standing rules for a mahou skill are out of scope.

## Verify

Every proposal a surveyor returns is a claim. Open the files it cites, check the count and the counterexamples, and drop what does not hold. Say which proposals you dropped and why.

## Compare with the wiki

Place each verified finding against the wiki:

- **New**: no entry covers it.
- **Covered**: an entry already says this. Drop it.
- **Extends**: an entry covers the topic and the finding adds to it, which makes it an iteration of that entry.
- **Contradicts**: the code does the opposite of what an entry says.

Then propose where each new or extending finding lands. A finding is global when it holds in any project using the technology or following the convention, and local when it is true only for this repository.

## Report

Load mahou:report. Write the report to the change's scratch folder at `distill-to-wiki/report.md`, then show it. Group the findings by what you propose to do with them: new global entry, new local entry, iteration of an existing entry, contradiction. Each finding carries its statement, whether it is a pattern or a decision, its evidence as references in the form mahou:basics defines, the counterexamples, and the entry or index it would land in.

Each contradiction carries both sides quoted, the entry's and the code's, and the user rules on it:

- **Include**: the code is right and the global entry changes.
- **Override locally**: the global entry stays and a local entry records how this repository departs from it.
- **Fix the code**: the entry stays and the code is wrong. Record the ruling in the report with the places to fix. Fixing the code is a separate job and this skill does not do it.

The user approves, corrects or drops each finding separately; do not ask for a single approve-everything answer, though the user may give one.

## Fidelity

An entry reproduces what the code does exactly. Do not adapt it, improve it, or generalize it beyond what the cited places show.

Examples inside an entry are generic. A code example names its components, hooks, endpoints and fields after a generic resource, such as `ResourceActionButton` or `useResourceAction`, never after the repository's features. The repository and the paths go in the entry's `## Sources`, with the date.

## Drafting

1. **Draft every approved finding in one reply**, in the report's order, each under its own heading, with the file it lands in. Follow the entry format in mahou:wiki. For a new entry, give the full text and its line in the index at the right level; for an iteration, the old and new text. Before showing the drafts, write them to the change's scratch folder at `distill-to-wiki/drafts/` and run `superpowers:unslop` over them.

2. **Write each approved item** to its place: a global entry to `skills/wiki/references/<topic>/<entry>.md` in the plugin, a local one to `.mahou/wiki/` in its repository, each with its line in that folder's `INDEX.md`, and a new folder's line in the index above it. Leave everything uncommitted.
