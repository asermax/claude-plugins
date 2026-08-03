---
name: init
description: Seed an Obsidian vault the project then owns, and re-run it later to add a folder, a template or a base.
disable-model-invocation: true
---

# Set up the vault

This is the only skill that reads `seeds/`, and that is what makes "no skill carries a template body" true rather than aspirational. Everything you write here **becomes the project's** the moment it lands: the user is free to rewrite any of it, and every other skill will read what they wrote rather than what you seeded.

Say that out loud during the interview. It is the single most important thing about this framework and it is not obvious from the output.

Load `zenku:codex` first. It describes the CLAUDE.md section you are about to write, and it is what every other skill will use to find what you produce.

## The prime rule: never overwrite

**Nothing that exists is touched.** Per target: it exists → `kept`; it is missing → `added`. That holds for templates, bases, charters, folder READMEs, notes, and individual CLAUDE.md bullets.

You compare against what *is*, holding no memory of what you wrote last time. That is precisely what makes user edits safe: an edited template is indistinguishable from a hand-written one, and both are left alone.

**Two things are filled in rather than skipped**, because they are lists inside a file that already exists: the vault charter's **folder table** gains a row for any folder missing one, and the CLAUDE.md section gains any missing bullet. Add the row, touch nothing else in the file, and report it as `added`. Without this a folder added on a re-run gets its directory, its README and its base but no row, which is the one broken combination the charter itself warns about.

This is also why a re-run is the way to add something later. There is no separate skill for "add a folder." A re-run detects any folder lacking a charter, a base, a table row or a template and offers to fill each gap, and it accepts an explicit request just as well: *"add a folder for operational procedures"*. One skill, because those four artifacts have to agree with each other and drift between them is the whole failure mode.

## 1. Detect what is there

Look for a vault (a directory holding a `README.md` and a templates folder), the quest log, the templates, the bases, a vault section in `CLAUDE.md`, and whether the repository has significant code: a brownfield repo can answer several interview questions by itself.

**Report what you found before asking anything.** If everything is present and consistent, say so and stop; there is nothing to do.

## 2. Interview

One question at a time. **Propose, never ask cold** (infer from the repository and ask the user to confirm or correct) and skip anything the repo already answers.

1. **Where the vault goes.** Propose an existing docs directory if there is one. If it already holds markdown, say plainly: *this becomes the vault root, and nothing will be moved.*

2. **What the project is**, in two sentences, for the CLAUDE.md opener. Skippable, and skip it silently if CLAUDE.md already opens with one.

3. **The note folders.** The load-bearing question. For each: the folder name, one line on what it holds, its tag, the name its index should display, and what its summary column should be headed — what a note there *does*, in a word or two.

   Seed the proposal from what is there: existing subdirectories usually already encode the split someone wanted. Failing that, propose one generic notes folder for a small repo, or two when the repo has both a codebase and a surface someone uses: one for *how it works*, one for *what it is for*. Do not propose more than two unasked; a third folder reintroduces the "which one does this go in" question that a two-way split answers cleanly.

   **Say that the folders are the project's to add to, rename or remove afterwards.**

4. **Whether anything else belongs in the vault as a record rather than a note**: meeting transcripts, operational logs, a decision register. Offer, default off, and do not talk anyone into one. A project that wants a standing-rules list or a decision folder gets it here, as its own structure.

5. **The quest log folder name.** Propose one directory holding both adventures and quests, and take any override. One folder rather than two: what tells them apart is a tag, and the index queries both.

6. **The branch pattern.** Commonly one branch per adventure. Spikes are not a choice and are not asked about: one worktree per effort, on a branch that is never merged.

7. **The commands, and the code roots.** Detect the commands from the lockfile or manifest (never infer a package manager from a language) and confirm two separately: how to run the thing, and what must be green before a change is done. Then confirm which roots a change actually touches, proposing what the repository layout suggests. That last one is worth asking rather than inferring, because it is the field a skill consults before running anything destructive.

## 3. Write the vault

Read `${CLAUDE_PLUGIN_ROOT}/skills/init/seeds/MANIFEST.md`. It carries the landing table, the tokens, the per-folder instantiation rule and the zero-`<<` post-condition, and it is the authority on all four.

## 4. Write the CLAUDE.md section

The block `zenku:codex` describes, filled from the interview. Append it, or create `CLAUDE.md` if there is none.

If the section already exists, **add only the bullets that are missing.** Never rewrite one the user has edited.

Omit any field the interview did not answer. A missing field is not a defect: the skill that needs it will resolve it and offer to record it.

## 5. Git hygiene

- Add the Obsidian config directory to `.gitignore` if it is not there, **with the one-line reason**: its contents are per-person, which is exactly why the templates and the bases sit *outside* it and survive the ignore rule.
- Point Obsidian's template setting at the templates folder if you can, and say plainly that it is per-person and gitignored, so each person enables the **Templates** and **Bases** core plugins by hand once. This is worth stating rather than assuming: a base with the plugin disabled renders as nothing.

## 6. Report

Three columns, and nothing else:

- **added**: what you created.
- **kept**: what already existed and was left alone.
- **needs a decision**: anything you found inconsistent: a folder with no charter, a table row with no directory, a base whose tag nothing carries, a template for a kind nothing uses.

Then the two sentences that matter: **everything under the vault is the project's now**; edit any template, add a folder, rewrite the charter, and the skills will follow it. And what to do next: write something down with `zenku:log`, clear ground with `zenku:travel`, or build something already decided with `zenku:raid`.
