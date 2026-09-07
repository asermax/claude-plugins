---
name: init
description: Seed a docs folder the project then owns: a charter, one folder per kind of note with its own index, and a note template. Re-run it later to add a folder. Use when a project has no docs charter yet, or when mahou:write-documentation or mahou:explore report the docs are not set up.
disable-model-invocation: true
---

Load mahou:basics first, then mahou:docs. Then read `.mahou/init.md` if present.

# Set up the docs

This is the only skill that reads `seeds/`, and that is what makes "no skill carries a template body" true rather than aspirational. Everything you write here **becomes the project's** the moment it lands: the user is free to rewrite any of it, and every other skill will read what they wrote rather than what you seeded.

Say that out loud during the interview. It is the single most important thing about this framework and it is not obvious from the output.

## The prime rule: never overwrite

**Nothing that exists is touched.** Per target: it exists → `kept`; it is missing → `added`. That holds for the charter, folder READMEs, the template, notes, and individual `CLAUDE.md` bullets.

You compare against what *is*, holding no memory of what you wrote last time. That is what makes user edits safe: an edited template is indistinguishable from a hand-written one, and both are left alone.

**One thing is filled in rather than skipped**, because it is a list inside a file that already exists: the charter's **folder table** gains a row for any folder missing one. Add the row, touch nothing else in the file, and report it as `added`. Without this a folder added on a re-run gets its directory and its README but no row, and a folder with no row is invisible to anyone reading the charter.

This is also why a re-run is the way to add something later. A re-run detects any folder lacking a README or a table row and offers to fill each gap, and it accepts an explicit request just as well: *"add a folder for operational procedures"*.

## 1. Detect what is there

Resolve the docs folder as `docs` says. Look for the charter (`README.md` at its root), the folder READMEs, a `_templates/` folder, a docs section in `CLAUDE.md`, and whether the repository has significant code: a brownfield repo answers several interview questions by itself.

**Report what you found before asking anything.** If everything is present and consistent, say so and stop; there is nothing to do.

## 2. Interview

Ask in plain prose, one round at a time, and **propose, never ask cold**: infer from the repository and ask the user to confirm or correct. Skip anything the repo already answers.

1. **Where the docs go.** Propose `docs/`, or an existing documentation directory if there is one. If it already holds markdown, say plainly: *this becomes the docs root, and nothing will be moved.*

2. **What the project is**, in two sentences, for the `CLAUDE.md` opener. Skip it silently if `CLAUDE.md` already opens with one.

3. **The note folders.** The question everything else rests on. For each: the folder name, one line on what it holds, and the human name its index displays.

   Seed the proposal from what is there: existing subdirectories usually already encode the split someone wanted. Failing that, propose one folder for a small repo, or two when the repo has both a codebase and a surface someone uses: one for *how it works*, one for *what it is for*. Do not propose more than two unasked; a third folder reintroduces the "which one does this go in" question that a two-way split answers cleanly.

   **Say that the folders are the project's to add to, rename or remove afterwards.**

4. **Whether the docs folder is also an Obsidian vault.** Offer, default off. When yes, the Obsidian config directory goes in `.gitignore` with its one-line reason (its contents are per-person), and the user is told to point the Templates core plugin at `_templates/` by hand once. Everything seeded renders the same on GitHub and in Obsidian either way.

5. **The commands.** Detect from the lockfile or manifest (never infer a package manager from a language) and confirm two separately: how to run the thing, and what must be green before a change is done. Skip when `CLAUDE.md` already carries them.

## 3. Write the docs

Read `${CLAUDE_PLUGIN_ROOT}/skills/init/seeds/MANIFEST.md`. It carries the landing table, the tokens, the per-folder instantiation rule and the zero-`<<` post-condition, and it is the authority on all four.

## 4. Write the CLAUDE.md section

Append the block below, filled from the interview, or create `CLAUDE.md` if there is none. If the section already exists, **add only the bullets that are missing.** Never rewrite one the user has edited. Omit any field the interview did not answer; the skill that needs it will resolve it and offer to record it.

```markdown
## Docs

- **Docs**: `<path>/`. Read its `README.md` before adding, editing, renaming or moving anything under it.
- **Folders**: <one line per folder: what each holds>
- **Run**: <how to launch it>
- **Checks**: <the commands that must be green before a change is done>

### When adding something

<a list: a kind of change → where it is documented>
```

## 5. Report

Three columns, and nothing else:

- **added**: what you created.
- **kept**: what already existed and was left alone.
- **needs a decision**: anything you found inconsistent: a folder with no README, a table row with no directory, a template nothing uses.

Then say that **everything under the docs folder is the project's now**: edit the template, add a folder, rewrite the charter, and the skills will follow it.
