---
name: sync-to-filadd
description: Sync the mahou plugin with the Filadd marketplace's experimental-dev plugin in both directions, plus the few dev and docs skills that pair with mahou or superpowers ones. The two plugins share a base but diverge on purpose, so the skill lists what can move each way, waits for the user to pick, and ports each item generalized for the side it lands on. Use when the user asks to "sync to filadd", "sync with experimental-dev", "sync mahou with filadd", "bring the filadd changes over" or "port this back to filadd".
---

# Sync to Filadd

mahou and experimental-dev grew from the same skills. Each side keeps changing, and a change that is not tied to one side's project is worth having on the other.

Paths:

- mahou: `~/workspace/asermax/claude-plugins/mahou`
- experimental-dev: `~/workspace/filadd/cc-plugin-marketplace/plugins/experimental-dev`
- dev and docs: `~/workspace/filadd/cc-plugin-marketplace/plugins/dev`, `.../plugins/docs`

Several experimental-dev skills are symlinks into `dev` (`find plugins/experimental-dev -type l` lists them). Editing one through either path edits the `dev` plugin.

## Ported content

Shared content never names the other plugin. Port the idea and rewrite it in the terms of the side it lands on, using the substitution table below. A ported sentence that would read wrong in the other repository is not ported yet.

mahou also never recommends. A sentence such as "recommend running design first" becomes "say that mahou:design has not run, and ask whether to run it first".

## Step 1: Find what changed

Read the date under Last synced at the end of this file. Then list each side's commits since the start of that day. A bare date makes git count from the current time of day on that date, which drops the commits made earlier that day:

```bash
git -C ~/workspace/asermax/claude-plugins log --since='<date> 00:00' --format='%h %ad %s' --date=short -- mahou superpowers/skills/unslop
git -C ~/workspace/filadd/cc-plugin-marketplace log --since='<date> 00:00' --format='%h %ad %s' --date=short -- plugins/experimental-dev plugins/dev/skills/commit-changes plugins/dev/skills/create-pull-request plugins/dev/skills/validate-feature plugins/docs
```

Include uncommitted changes on both sides (`git status --short`). Then diff every paired file (see Pairs) and write the diffs to `/tmp` so you can read them in parts. Most of each diff is the substitution table applied. Read each commit's own diff (`git show <sha> -- <path>`) to tell a real change from a substitution.

## Pairs

Every skill and agent present under the same path on both sides is a same-name pair. Compare `skills/` and `agents/` with a loop over the file list and print the count of differing lines per file, plus the files present on one side only.

Renamed pairs:

| mahou | Filadd |
|---|---|
| `skills/validate/` | `dev/skills/validate-feature/` (its `mobile.md` reference is mahou's `android.md`) |
| `skills/commit-changes/` | `dev/skills/commit-changes/` (mahou's is a condensed rewrite; port single rules, never the file) |
| `skills/create-pull-request/` | `dev/skills/create-pull-request/` (same) |
| `skills/write-documentation/`, `skills/docs/` | `docs/skills/doc-writing/`, `docs/skills/doc-basis/` (Notion-specific except for display and placement rules) |
| `agents/code-scout.md`, `agents/docs-scout.md` | `dev/agents/repo-scout.md`, `dev/agents/doc-scout.md` |
| `agents/conventions-reviewer.md` | `experimental-dev/agents/standards-reviewer.md` |
| `agents/documentation-reviewer.md` | `docs/agents/design-doc-validator.md` |
| `superpowers/skills/unslop/` rules 16, 32 and 34 to 39 | `docs/skills/unslop/` rules 15, 29 and 30 to 34 (16 is Filadd's 15, 32 is 29, 34 is 30, 35 is 31, 36 is 32, 38 is 33, 39 is 34; Filadd has no 37) |

`program-design/references/representations/` exists on both sides in one format (What it covers, What to check before proposing, Representation, When it fits), and the files present on both sides name no skill from either plugin, so they sync as whole files. The exception is one line each in Filadd's `callstack.md`, `component-tree.md`, `derivation-ledger.md` and `interfaces.md` under What to check before proposing, which names a `dev-standards` guide (`endpoints`, `components`, `common`) or the `gateway` repository; those lines stay Filadd-only, and the rest of each file stays identical. `standards.md` is per side (dev-standards guides against wiki entries and rule files), and `package-layout.md` is mahou's only. A new representation that applies to both sides is written in the same plugin-neutral way and copied to both.

## Substitution table

These differences are expected and are never sync items:

| mahou | experimental-dev |
|---|---|
| `mahou:<skill>` | `filadd-experimental-dev:<skill>` |
| `Load mahou:basics first. Then read .mahou/<skill>.md if present.` above the title | `Load filadd-experimental-dev:basics first.` under the title |
| the wiki, the project's `CLAUDE.md`, `.mahou/basics.md` | `dev-standards` hubs and guides |
| nothing, or ask the user | `project-knowledge` (repository catalog, dependency script) |
| the docs folder, `write-documentation`, `docs-scout` | the Notion Docs database, `doc-writing`, `create-doc-changelog`, `doc-search` |
| a task tracker declared in `.mahou/implement.md`, `tasks` | the Board, `scope-tasks`, `Estado` |
| `superpowers:unslop`, `superpowers:mermaid-validation` | `filadd-docs:unslop`, `filadd-docs:unslop-pass`, `filadd-experimental-dev:mermaid` |
| `code-scout`, `docs-scout`, `researcher` | `code-search`, `doc-search`, `data-search`, a general-purpose subagent |
| inline clone-or-pull steps | `prepare-repo` |
| the project's own release process | `release-repo` |
| `.mahou/validate.md`, the project's setup | `local-services` |
| `main` or `master` | `develop`, `main` or `master` |
| instances | pods |
| `test` rows | `integration` rows |
| "from the repository the others depend on outward" | data APIs, then BFFs, then frontends |
| `<owner>/<repo>` from the remote | `filadd/<repo>` |

## Deliberate divergences

Leave these as they are unless the user asks:

- mahou's `guide` matches goals against skill descriptions; experimental-dev's keeps a routing table.
- mahou never recommends, so Filadd lines such as "where they do not, recommend and move on" stay out.
- mahou's `basics` carries "Never use the phrase 'load-bearing'".
- Filadd-only: `validate-pitch`, `update-pitch-context`, `scope-tasks`, `shape-up-entities`, the Notion link handling in `explore`, the `Depends-on:` trailers and `release-repo` in `land`.
- mahou-only: `telepathy`, `tasks`, `init`, `wiki`, `docs`.
- `create-scopes` and `validate-pitch`'s out-of-scope list are Filadd-only (Shape Up scopes on the Board, and a skill mahou does not have).
- `design-with-canvas` ends in `design`'s Recording section on the mahou side and its Documentation section on the Filadd side.

When a new divergence is settled during a sync, add it here.

## Step 2: List the candidates and wait

Group the list by direction: experimental-dev → mahou, dev and docs → mahou or superpowers, mahou → experimental-dev or dev. Number every item across the whole list so the user can pick by number. Each item names the file, the change in one or two sentences, and the commit it came from. Add a "Not syncing" section with the Filadd-only changes and the divergences found, each with its reason.

Apply nothing until the user picks.

## Step 3: Port

Apply each picked item as an exact text replacement that fails unless the old text matches once. Rewrite it with the substitution table. For a new skill, copy the directory and then rename anything that names the other side: the load lines, skill references, cache paths, package names, product URLs.

Once the items are in, grep everything the sync added for the other side's names:

```bash
git -C ~/workspace/asermax/claude-plugins diff mahou superpowers | grep '^+' | grep -i 'filadd\|experimental'
grep -rn -i 'filadd\|experimental-dev\|notion\|pitch' <new mahou skill dirs> --exclude-dir=node_modules
git -C ~/workspace/filadd/cc-plugin-marketplace diff | grep '^+' | grep 'mahou'
```

## Step 4: Update the docs

On the mahou side, update `mahou/README.md` and the mahou section of this repository's `CLAUDE.md` for every new skill and every change in what a skill does. Date the entry and do not say where the change came from. When an unslop rule changed, update the unslop entry under "Custom modifications" too. On the Filadd side, update `plugins/experimental-dev/CLAUDE.md` for a new skill.

## Step 5: Record and stop

Set the date under Last synced to today. Commit nothing and bump no version on either side. Report the files changed per repository and tell the user that the `commit` skill handles the commit and the version bumps here, and the Filadd marketplace commits its side with its own flow.

## Last synced

2026-10-10
