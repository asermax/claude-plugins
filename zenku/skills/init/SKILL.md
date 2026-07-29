---
name: init
description: Set up the framework in a project — seed an Obsidian vault the project then owns (charter, templates, bases, folder indexes, the lab) and record its conventions in CLAUDE.md. Also the way to fill a gap later: adding a folder, a template or a base, or bringing an existing vault up to date. Use when starting in a repo for the first time, or when a skill reports the project is not initialized.
---

# Set up the vault

This is the only skill that reads `seeds/`, and that is what makes "no skill carries a template body" true rather than aspirational. Everything you write here **becomes the project's** the moment it lands: the user is free to rewrite any of it, and every other skill will read what they wrote rather than what you seeded.

Say that out loud during the interview. It is the single most important thing about this framework and it is not obvious from the output.

Load `zenku:framework-core` first — §2 is the description of the CLAUDE.md section you will write, and §1 is what every other skill will use to find what you produce.

## The prime rule: never overwrite

**Nothing that exists is touched.** Per target: it exists → `kept`; it is missing → `added`. That holds for templates, bases, charters, folder READMEs, notes, and individual CLAUDE.md bullets.

You hold **no memory of what you wrote last time.** You compare against what *is*. That is precisely what makes user edits safe: an edited template is indistinguishable from a hand-written one, and both are left alone.

This is also why a re-run is the way to add something later. There is no separate skill for "add a folder" — a re-run detects any folder lacking a charter, a base, a table row or a template and offers to fill each gap, and it accepts an explicit request just as well: *"add a folder for operational procedures"*. One skill, because those four artifacts have to agree with each other and drift between them is the whole failure mode.

## 1. Detect what is there

Look for a vault (a directory holding a `README.md` and a templates folder), the lab folders, the templates, the bases, a lab section in `CLAUDE.md`, and whether the repository has significant code — a brownfield repo can answer several interview questions by itself.

**Report what you found before asking anything.** If everything is present and consistent, say so and stop; there is nothing to do.

## 2. Interview

One question at a time. **Propose rather than asking cold** — infer from the repository and ask the user to confirm or correct — and skip anything the repo already answers.

1. **Where the vault goes.** Propose an existing docs directory if there is one. If it already holds markdown, say plainly: *this becomes the vault root, and nothing will be moved.*

2. **What the project is**, in two sentences, for the CLAUDE.md opener. Skippable, and skip it silently if CLAUDE.md already opens with one.

3. **The note folders.** The load-bearing question. For each: the folder name, one line on what it holds, its tag, and the name its index should display.

   Seed the proposal from what is there — existing subdirectories usually already encode the split someone wanted. Failing that, propose one generic notes folder for a small repo, or two when the repo has both a codebase and a surface someone uses: one for *how it works*, one for *what it is for*. Do not propose more than two unasked; a third folder reintroduces the "which one does this go in" question that a two-way split answers cleanly.

   **Say that the folders are the project's to add to, rename or remove afterwards.**

4. **Whether anything else belongs in the vault as a record rather than a note** — meeting transcripts, operational logs, a decision register. Offer, default off, and do not talk anyone into one. A project that wants a standing-rules list or a decision folder gets it here, as its own structure.

5. **The lab folder names.** Propose a lab directory holding ideas, experiments and work; take any override.

6. **The spike model and the branch pattern.** Explain the two models in one line each and what each trades off (`zenku:framework-core` §1 L5). Default to throwaway spikes on one branch per idea.

7. **The commands.** Detect from the lockfile or manifest — never infer a package manager from a language — and confirm two separately: how to run the thing, and what must be green before a change is done.

8. **Seeing it work.** Ask it in the project's own terms: *"beyond the checks, how does someone confirm a change actually works here — and what fails silently?"* Most projects have a failure mode that passes every check and still does not work, and this field is where the project names theirs. If the user has no answer yet, leave it out; a later skill will ask again at the moment it matters.

## 3. Write the vault

Read `seeds/MANIFEST.md` for what lands where and which tokens each seed carries. In short:

- The **charter** at the vault root — the folder table, the naming rule, the frontmatter contract, how to write a note, the house style.
- The **templates**, one per kind the project will use.
- The **bases**, one per index — the lab's, plus one per note folder.
- One **folder README** per note folder, carrying that folder's charter and embedding its base.
- The **lab charter**, covering both backlogs and both lifecycles.
- A `.gitkeep` in each lab folder that starts empty, so it is tracked.

Two seeds are instantiated **once per folder** — the folder README and the notes base — which is what makes an arbitrary number of project-chosen folders work. There is no built-in set of folders anywhere in this plugin; there are only instantiations.

**Post-condition: zero `<<` tokens remain in anything you wrote.** Check it. That is why the seeds use token substitution rather than "adapt this prose to the project": a generative adaptation produces different output every run, and different output makes the never-overwrite comparison impossible.

## 4. Write the CLAUDE.md section

Per `zenku:framework-core` §2, filled from the interview. Append it, or create `CLAUDE.md` if there is none.

If the section already exists, **add only the bullets that are missing.** Never rewrite one the user has edited.

Omit any field the interview did not answer. A missing field is not a defect — the skill that needs it will resolve it and offer to record it.

## 5. Git hygiene

- Add the Obsidian config directory to `.gitignore` if it is not there, **with the one-line reason**: its contents are per-person, which is exactly why the templates and the bases sit *outside* it and survive the ignore rule.
- Point Obsidian's template setting at the templates folder if you can, and say plainly that it is per-person and gitignored, so each person enables the **Templates** and **Bases** core plugins by hand once. This is worth stating rather than assuming: a base with the plugin disabled renders as nothing.

Do not touch `.gitattributes`, LFS, or any other repository setting. Not this skill's business.

## 6. Report

Three columns, and nothing else:

- **added** — what you created.
- **kept** — what already existed and was left alone.
- **needs a decision** — anything you found inconsistent: a folder with no charter, a table row with no directory, a base whose tag nothing carries, a template for a kind nothing uses.

Then the two sentences that matter: **everything under the vault is the project's now** — edit any template, add a folder, rewrite the charter, and the skills will follow it. And what to do next: capture an objective with `zenku:capture-experiment`, write down something already decided with `zenku:capture-backlog`.
