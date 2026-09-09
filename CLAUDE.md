# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a personal collection of Claude Code plugins that provide workflow automation for development tasks. The repository is structured as a local marketplace containing multiple plugins, each with their own commands and functionality.

## Repository Structure

- **Root level**: Marketplace configuration (`.claude-plugin/marketplace.json`)
- **`.claude/skills/`**: Marketplace-level skills available when working inside this repo (currently `sync-upstream`, `commit`). These are scoped to maintaining the marketplace itself, not shipped to plugin consumers.
- **Plugin directories**: Each subdirectory (`aur/`, `superpowers/`, `lesserpowers/`, `beads/`, `haft/`) is a separate plugin
  - `.claude-plugin/plugin.json`: Plugin metadata
  - `commands/`: Slash command definitions (`.md` files)
  - `.mcp.json`: MCP server configuration (if applicable)
  - `README.md`: Plugin documentation

## Repo-level skills

These live at `.claude/skills/<name>/SKILL.md` and trigger contextually based on natural-language requests when this is the working directory.

- **sync-upstream**: Sync this marketplace's skills, commands, and context from their upstream source repos (`~/workspace/random/superpowers`, `~/workspace/random/quint-code`, `~/workspace/random/agentic-evolve`, `~/workspace/random/agent-browser`, `~/workspace/random/dmmulroy-skills`, `~/workspace/random/plannotator`, `~/workspace/random/cursor-plugins`). Preserves plugin customizations (namespace prefixes, removed cross-skill references) and asks before applying.
- **commit**: Create conventional commits with automatic semantic version bumps for both the marketplace (`.claude-plugin/marketplace.json`) and any affected plugin's `plugin.json`. Groups related files, derives scopes, proposes bumps with reasoning, and asks before each commit.

## Plugin Architecture

### Plugin Metadata
Each plugin has a `plugin.json` file with:
- `name`: Plugin identifier
- `version`: Semantic version
- `description`: Brief description of functionality
- `author`: Plugin author information

### Slash Commands
Commands are defined as markdown files in the `commands/` directory with:
- Frontmatter containing:
  - `description`: Command description shown in help
  - `argument-hint`: Optional parameter hints (e.g., `<repo-name>`)
  - `args`: Optional structured argument definitions with validation
- Body containing the full command prompt/instructions

### MCP Servers
Some plugins include MCP server configurations in `.mcp.json` to extend functionality with external integrations (e.g., GitHub API).

## Available Plugins

### aur
AUR (Arch User Repository) package management automation.

**Commands:**
- `/aur:bump-version [version]`: Updates PKGBUILD version, regenerates checksums, updates .SRCINFO, commits and pushes
- `/aur:create-aur-package <package-name> <source-type>`: Scaffolds new AUR package with PKGBUILD, .gitignore, git setup

**Key workflows:**
- Supports automatic version detection from package sources
- Handles NPM package specifics (scoped packages, registry URLs, permission fixes)
- Uses conventional commits (`chore: bump to <version>`)
- Commands: `updpkgsums`, `makepkg --printsrcinfo`

### superpowers
Curated development workflow skills for browser automation, documentation, and code directives. The secondary skills and evolutionary-algorithm commands were split into the companion `lesserpowers` plugin (see below).

**Commands:**
- `/superpowers:evolve-situation-state <input> [state-file]`: Maintain a living state document that evolves incrementally from various inputs (transcripts, documents, external sources); auto-detects input types and uses available tools to fetch content
- `/superpowers:generate-summary-from-situation-state <state-file> [output]`: Generate an abridged summary from a situation state file
- `/superpowers:generate-tech-validation-from-situation-state <state-file> [output]`: Generate a technical validation document from a situation state file
- `/superpowers:process-directives <request>`: Scan and process code directives (@implement, @docs, @refactor, @test, @todo) based on natural language request; applies context-dependent transformations

**Skills:**

*Core Development Workflow:*
- **using-code-directives**: Recognize and handle code directives (@implement, @docs, @refactor, @test, @todo) embedded in comments with context-dependent transformations and security validation for external URLs

*Documentation and Research:*
- **using-live-documentation**: Dispatch subagents to fetch library documentation with massive context savings (10,000-20,000 tokens per search)
- **using-antigravity**: Analyze images, videos, fetch web content, and search Google using the Antigravity CLI

*Diagrams and Rendering:*
- **mermaid-validation**: Validate mermaid diagram syntax after writing code blocks using bundled merval-based script (~552KB, auto-installs on first run)
- **show-markdown**: Render markdown content in the browser with styling

*Browser Automation:*
- **agent-browser**: Browser automation CLI for web testing, form filling, screenshots, and data extraction (synced from `~/workspace/random/agent-browser`). The plugin file is a **discovery stub** — the workflow content ships inside the installed CLI and loads on demand via `agent-browser skills get <name>`, which is why it cannot go stale against the binary and why syncing it is nearly always a one-line catalog change. The specialized skills it points at are the CLI's to change, not ours: `core`, `electron`, `slack`, `dogfood`, `derive-client`, `vercel-sandbox`, `agentcore`. **derive-client** (added upstream 2026-08) records a site's network traffic to a HAR once, mines it for the internal JSON API, and generates a standalone typed client that calls those endpoints directly — no browser after the first recording. Two things to know before reaching for it: a HAR holds live cookies, tokens and POST bodies, so it is a secret and must stay out of version control; and per-session CSRF tokens or signed/expiring request params do not reduce to a plain HTTP client, so those flows stay browser-driven while the rest is derived

*Plan and Code Review:*
- **plannotator-review** (`/superpowers:plannotator-review [pr-url]`), **plannotator-annotate** (`/superpowers:plannotator-annotate <file|url|folder>`), **plannotator-last** (`/superpowers:plannotator-last`): Open Plannotator's browser review UI — on the worktree diff or a PR, on a markdown/HTML file or folder, or on the last assistant message — then act on the annotations that come back. All three are manual-only (`disable-model-invocation: true`) and run the `plannotator` CLI at skill load via `!` preprocessing, so each blocks until the user closes the browser session. Synced verbatim from `~/workspace/random/plannotator` (`apps/skills/claude/`). The CLI is a separate install (`plannotator-bin` on AUR); without it on PATH the skills fail at load

*Terminal Orchestration:*
- **herdr**: Control the Herdr terminal multiplexer via its CLI — inspect and create workspaces/tabs/panes, start and prompt sibling coding agents, run background processes, read pane output, wait on state changes. Guards on `HERDR_ENV=1` and stops when unset. Synced verbatim from `~/workspace/random/dmmulroy-skills`

*Writing:*
- **unslop** (`/superpowers:unslop`): Strip AI tells from any writing. Named patterns across content, language, style, chatbot artifacts, filler, jargon and plain speech (em dashes, "not just X but Y", inline-header lists, abstract metaphor nouns, mannered prose, over-compression, passive voice), each with the concrete fix. Rule numbers are stable ids that other skills cite, so upstream leaves gaps where it removed a rule (1, 2, 4, 6, 21 are gone) rather than renumbering. Synced from `~/workspace/random/cursor-plugins` (`pstack/skills/unslop/`) with two locally added patterns appended (34 and 35, see "Custom modifications"). Upstream dropped the "add soul" pass in its density pass of 2026-08 and also set `disable-model-invocation: true`; the plugin follows the first and not the second. Instead of upstream's `Must always apply.` description the plugin copy is scoped to document writing (documentation, READMEs, design notes, specs, PR descriptions, and when another skill asks for a writing pass), so it fires there and stays off code and chat replies. It has to stay model-invocable because mahou's `write-documentation` calls it by name

*Other:*
- **bro** (`/superpowers:bro`): Restate the last message in plain language, no jargon. Manual-only (`disable-model-invocation: true`). Synced verbatim from `~/workspace/random/dmmulroy-skills`

**Key workflows:**
- Skills directory contains full skill definitions from upstream repositories
- Upstream sources synced via the marketplace-level `sync-upstream` skill (see "Repo-level skills"):
  - `~/workspace/random/agent-browser` - Browser automation CLI
  - `~/workspace/random/dmmulroy-skills` - `bro` and `herdr` (clone of `github.com/dmmulroy/skills`; only those two are tracked)
  - `~/workspace/random/plannotator` - the three `plannotator-*` skills (clone of `github.com/backnotprop/plannotator`; only `apps/skills/claude/` is tracked)
  - `~/workspace/random/cursor-plugins` - `unslop` (clone of `github.com/cursor/plugins`; only that one skill out of the whole plugin monorepo is tracked)
- Shows high-level summary of changes before updating
- Intelligently merges updates while preserving plugin-specific customizations
- Skills are automatically available via Claude Code's skill system
- All skills use `superpowers:` namespace prefix for skill references

### lesserpowers
Secondary workflow skills and commands split out of `superpowers` to keep that plugin focused on its most-used surface. Functionality is unchanged from when these lived in superpowers — only the plugin (and namespace) differs. Skills are referenced as `lesserpowers:<skill>`.

**Commands:**
- `/lesserpowers:evolve <problem>`: Master dispatcher for evolutionary algorithm discovery - routes to specialized modes:
  - `/lesserpowers:evolve-perf`: Optimize runtime speed (ops/sec, latency)
  - `/lesserpowers:evolve-size`: Optimize code size (bytes, chars) - code golf
  - `/lesserpowers:evolve-ml`: Optimize ML metrics (F1, loss)

**Skills:**

*Debugging and Testing:*
- **systematic-debugging**: Four-phase debugging framework ensuring understanding before solutions (includes supporting techniques: root-cause-tracing, defense-in-depth, condition-based-waiting)

*Documentation and Research:*
- **self-maintaining-claude-md**: Keep CLAUDE.md instruction file current with high-level project state

*Code Review:*
- **hunk-review**: Interactive terminal diff review via the `hunk` CLI — inspect live sessions, navigate files/hunks, reload contents, and add inline review comments (plugin ships a thin wrapper that inlines the live SKILL.md from the installed Hunk CLI via `hunk skill path` — no syncing needed)

*Multi-Agent Collaboration:*
- **agent-communication**: Enable communication between multiple Claude Code instances across repositories using file-based chat system (agent daemon, chat CLI)

*Other:*
- **financial-summary**: Parse and analyze personal financial transaction CSV exports

**Hooks:**
- `hooks/background-daemons.sh`: PreToolUse hook that auto-backgrounds `agent.py` commands for the agent-communication skill (moved here from superpowers along with that skill)
- `hooks/auto-approve.sh`: PermissionRequest hook that auto-approves `lesserpowers:` skill invocations and bash commands referencing lesserpowers paths

**Key workflows:**
- Upstream sources synced via the marketplace-level `sync-upstream` skill (see "Repo-level skills"):
  - `~/workspace/random/superpowers` - `systematic-debugging`
  - `~/workspace/random/agentic-evolve` - evolve commands (dispatcher + perf/size/ml)
- All skills use `lesserpowers:` namespace prefix for skill references

### haft
FPF (First Principles Framework) methodology for artifact-centric decision engineering. Successor to the previous `quint` plugin — upstream `quint-code` was renamed to `haft`, with the MCP binary renamed `quint-code` → `haft`. As of the upstream **v8 governance-substrate pivot**, haft's surface is a catalog of host-AI **skills** plus the MCP server — the standalone agent, TUI, desktop wrappers, and the old slash-`command` files were dropped. The reasoning kernel, artifact graph, FPF spec retrieval, and WorkCommission lifecycle are unchanged (no schema change); only the surface changed.

**Skills (12-skill catalog, mirrored from `internal/cli/skill/h-*/SKILL.md`):**

Upstream **v9 ("source-native governance")** collapsed the v8 subroutines (`h-abduct`, `h-boundary-unpack`, `h-semio-review`) back inside the public skills and replaced `h-spec-cover` with `h-spec`. Every skill now carries a `when_to_use` frontmatter field next to its description. Upstream also ships a second copy of the catalog under `packages/haft-pi/skills/` for a different host; those differ from the `internal/cli/skill/` ones and are not tracked.

*Auto-triggering* — fire when their description matches operator context:
- `h-reason`: Source-first umbrella for FPF-aware reasoning. Manual `/h-reason` always works; auto-fires on broad "let's think this through" signals where no specialized skill matches sharply
- `h-frame`: Shape an under-articulated problem without assuming a solution or forcing a project phase
- `h-diagnose`: Diagnose a concrete failure with parallel rival-hypothesis testing (one subagent per hypothesis, prevents anchoring)
- `h-explore`: Generate 3-5 genuinely distinct candidate approaches with each one's weakest link kept visible
- `h-compare`: Fair comparison under an explicit characteristic space and parity basis, returning a non-dominated set rather than a scalar winner
- `h-decide`: Route one direct, unambiguous operator request to bind a bounded choice as a DecisionRecord. **No longer manual-only as of v9** (`disable-model-invocation: false`): when effect, subject, selected option and scope are all unambiguous it binds without a confirmation round trip, otherwise it presents a Human Gate Brief and binds nothing. A typed `/h-decide` is a route hint, not an approval receipt
- `h-verify`: Baseline → measure → evidence loop with drift detection
- `h-status`: Read-only project cockpit: problems, decisions, notes, evidence freshness, drift, commissions, spec lifecycle, module coverage
- `h-spec`: Typed specification lifecycle and source-currentness repair (inspect SpecSections, draft or clarify carriers, classify semantic fanout)
- `h-onboard`: Bootstrap haft for a repository, or review a project-profile declaration or relation change
- `h-note`: Persist a non-binding fact, observation or caveat when the operator asks for it

*Manual-only* (`disable-model-invocation: true`, Transformer Mandate — never auto-fired):
- `h-commission`: WorkCommission lifecycle — grant bounded execution authority from an active DecisionRecord

**Recommended workflow:** describe the problem (h-frame fires) → `/h-explore` → `/h-compare` → `/h-decide` → `/h-verify`. Upstream stresses these are independent entries, not phases: completing one does not imply another must follow. Routing reliability is testable via `haft check routing`.

**MCP Server:**
- Binary built on-demand via SessionStart hook (first use)
- Built to `${CLAUDE_PLUGIN_ROOT}/bin/haft` (within plugin)
- Source cached in `~/.cache/claude-plugins/haft/` for building
- Build entrypoint: `./cmd/haft` in upstream repo
- Manages state in `~/.haft/projects/<project-id>/` (unified storage; auto-migrates `.quint/` → `.haft/`)

**Context Injection:**
- SessionStart hook injects PRINCIPLES.md (upstream's CLAUDE.md)
- Prepares agent with FPF methodology and decision frameworks
- Context synced from `~/workspace/random/quint-code/CLAUDE.md` (the upstream repo path is unchanged — only the project rebranded internally)

**Key concepts:**
- **R_eff (Effective Reliability)**: Trust score (0-1) = min(evidence_scores) — strict weakest-link, never average
- **WLNK**: Weakest link principle — system reliability ≤ min(component reliabilities)
- **Congruence Level**: CL3 (same context, no penalty) → CL0 (opposed context, -0.9 penalty)
- **Evidence Decay**: Evidence has `valid_until`; expired scores 0.1 (weak, not absent)
- **DRR (Decision Record)**: Problem Frame + Decision/Contract + Rationale + Consequences
- **Module Coverage**: Tracks which codebase areas have decisions vs blind spots
- **Transformer Mandate**: Agents generate options, humans decide — no autonomous architectural decisions
- **Artifact Lifecycle**: active → refresh_due → superseded/deprecated

**Key workflows:**
- Skills mirrored from `~/workspace/random/quint-code/internal/cli/skill/h-*/SKILL.md` (direct copy, no customization)
- PRINCIPLES.md updated from upstream CLAUDE.md during sync
- MCP binary builds automatically on first session start (slow), then cached (fast)
- Skills call MCP tools directly via `allowed-tools` (`mcp__haft__haft_*`); the MCP server key `haft` matches the tool namespace
- Use for architectural decisions with long-term consequences
- Tactical mode available for simple reversible decisions — record via `/h-decide` `mode="tactical"` with `_skips`/`_skip_reason`
- Skip entirely for quick fixes or easily reversible decisions

### beads
Dependency-aware issue tracking for AI-supervised workflows.

**Context Injection:**
- SessionStart hook injects full beads documentation on startup, resume, and compact
- No skill invocation needed - documentation always available in context

**Key concepts:**
- **bd ready**: Find unblocked work ready to claim
- **Dependency types**: blocks, related, parent-child, discovered-from
- **Epic-task hierarchy**: Parent-child relationships for complex features
- **Cycle prevention**: DAG enforcement prevents circular dependencies

**Key workflows:**
- Check for `.beads/*.db` before using bd (use `bd init` if missing)
- Create issues immediately when discovering work
- Model dependencies when creating issues (not later)
- Use `bd ready` to find next work (not `bd list`)
- Feedback from reviews becomes new tracked issues

**Plugin-specific:**
- No upstream repository - maintained locally
- Documentation in `beads/hooks/BEADS.md` is injected directly via hook

### memu
Agentic memory framework for long-term memory across sessions.

**Skills:**
- `recall-memory`: Retrieve information from past sessions and stored knowledge using fork capability

**Hook:**
- SessionEnd: Auto-memorizes conversations in background when session completes

**Key concepts:**
- **Resources**: Raw multimodal data (conversations, documents, images, video, audio)
- **Items**: Extracted memory units (preferences, skills, opinions, habits)
- **Categories**: Aggregated markdown summaries
- **Retrieval methods**: RAG (fast, vector-based) and LLM (deep semantic understanding)

**Key workflows:**
- Auto-memorization: SessionEnd hook automatically saves conversations to memU cloud API
- On-demand retrieval: `recall-memory` skill triggers on questions needing historical context
- Per-project scoping: Memory isolated by project using git remote URL hash
- Fork capability: Retrieval runs in forked process to avoid blocking main conversation

**Environment setup:**
- Requires `MEMU_API_KEY` environment variable (from memu.so cloud service)
- Python 3.7+ (no external libraries required - uses built-in modules)
- Script: `skills/recall-memory/scripts/memu.py` handles API communication

**Plugin-specific:**
- No upstream repository - maintained locally
- Uses memU cloud API (https://api.memu.so) instead of local SDK
- Background fork for memorization prevents session exit blocking
- Skill description optimized for broad retrieval query triggering

### zenku
A way of working on things you do not yet understand, run out of an Obsidian vault **the project owns**. Rewritten again at 3.0.0 toward the shape of `github.com/mattpocock/skills`: short skills that prescribe a method rather than scripting the conversation, a primitive layer other skills compose **by name**, and one dispatcher instead of a decision the user has to make. The experiment concept, the two-backlog split, the promote/drop pair and both reviewer agents are gone.

**The governing seam:** *the plugin owns the process, the project owns the structure.* Everything not process belongs to the project: folders, every template body, every index, tags, headings, commands, code style, branch pattern. `init` seeds defaults and then gets out of the way; every other skill resolves structure at runtime and **never carries a template body**, because a plugin-side shape written into a project's vault is indistinguishable from something the project chose. The test applied to every line: *a skill containing a string that would be wrong in a different repo is a bug.*

**One backlog, the quest log.** A **quest** is one session's work. An **adventure** is too big and too foggy for that, and carries a **destination**, its **bearings**, its **trials**, and a **solved** index. A **trial** is an ordeal you can sense but cannot yet phrase as a single quest — the test is whether you can state the question precisely *now*, not whether you can answer it — and it graduates into a quest the moment you can. Quests **in reach** are open, unblocked and unclaimed. Two rules: **find the path** (decisions before deliverables) and **keep the pace** (one quest per session, research excepted).

**Two kinds of adventure, added at 3.1.0** after watching wayfinder in practice, where a finished map hands off to a fresh parent ticket full of build tickets rather than absorbing them. An adventure's `kind` says which, and **every adventure states it**. At 3.1.0 a record with no `kind` was *read* as a venture, a parsing fallback that let the split ship as a minor; **3.2.0 dropped it** along with the rename, because every known vault now fills the field. The base filters Journeys on the positive `kind == "journey"` rather than `not (kind == "raid")`, so a record missing the field lands in neither view and its absence from both is what surfaces it — a silent default into one of them was the worse failure.
- A **journey** clears ground. Destination is *knowing how to build the thing*; holds research, design and spike quests and **never a build quest**.
- A **raid** builds. Destination is *the thing working*; reads its journey's solved quests, reconciles them into one shape, slices that into build quests, lands them one per session.

Three things fall out of the split. **Find the path stops needing enforcement** — a journey cannot hold a build quest, so the rule is structural rather than a prohibition. **The consolidation discriminator disappears** — a journey is done when no trials remain, a raid when its build quests are solved, two end conditions with nothing to infer. And **"one session" stops covering two sizes**: an investigation and a vertical slice differ by roughly 10:1, and they no longer share an adventure.

**Typed (`disable-model-invocation: true`):** `travel` (clear ground: find the record, parley breadth-first, shape a journey or take a quest, hand off to a raid when the ground is clear), `raid` (build: muster — reconcile the journey's solved quests and slice them — then land one slice per session, and own the ending), `init`, `commit`.

**Primitives, model-invoked, reached by name:** `parley` (the interview: **frontier rounds** — ask every decision whose prerequisites are settled in one numbered round, recompute after answers — not one-at-a-time; **never the AskUserQuestion tool**, because an options menu maps the fork and biases the choice; facts are yours to look up (non-blocking subagent when a fact needs digging), decisions are the user's, never answer for the witness and never recommend — the agent knows no better than the user which way to go), `log`, `take` (**the shared session loop** both dispatchers call: load the adventure at low resolution, read the bearings, claim, get onto the branch, read the quest in full — its body, what it links, the solved quests it rests on — then **present it before any solving**: the user brought up to speed in the agent's own words anchored to the record's, understanding confirmed both ways, and anything the record leaves open — an unmade decision, ambiguous wording, a contradiction with the bearings — parleyed with the user first (under a raid such a question is one the muster missed: settled there or named a trial); only then solve by type and close with `solve`), `design` (one descent, not two modes: the whole thing (modules, seams, data flow, data structures, patterns) → this change against it (what is added, modified, deleted) → inside each one (classes, functions, types, signatures). As of 3.3.0 **the agent decides nothing here** — it brings the current state (what exists, what earlier quests in this adventure decided, what a choice depends on) and the *user* settles the shape; the agent maps no options and offers no lean, because framing the fork is deciding it, and assists only when asked. Facts findable by looking get a non-blocking background subagent; a fact only findable by trying is a trial. Carries three **report-only** diagnostics adapted from Matt Pocock's `codebase-design` — the deletion test, one-vs-two adapters, depth — each a fact the agent reports, never a decision it makes. **Go down until the user hits something they cannot settle: that is a trial**, which is why shaping a journey stops partway and building goes to the bottom. Signatures yes, file paths no — one exception, a spike fragment that pins a decision more precisely than prose.), `research`, `spike`, `build`, `lore`, `solve` (the closer, and the only thing that moves a quest into reach: write the answer, set the status, **clear it from every `blocked_by` naming it**, gist it into the solved index, graduate what it made visible), `loot` (three routes out of a session: decided work → `log`, a finding → `lore`, a process lesson → the charter's own section), `strike` (**the only thing that deletes a record** — check the effort really ended, close out what is open, `loot`, remove the spike tree, delete every record in the effort, offer one commit named after it).

**Loaded, not invoked:** `codex` — **the single definition site for the vocabulary** (adventure/quest/trial/destination/bearings/in reach/solved) and the two rules, then a one-table resolution guide (vault, quest log, folders, template, commands, branch, trunk, code roots — each with what to do when it is not recorded), the CLAUDE.md `## The vault` block, and the three write habits. Skills load it whole and cite no section numbers; `travel` and the seeded charter both defer to it rather than restating the vocabulary. **Four exceptions to never-assume-structure**, each because the process is defined in terms of it: the status vocabulary plus the four quest types plus the classifying tag (all declared *process*, so `travel` may branch on them); an adventure's structural sections; a quest's sections plus the four routing fields (`status`, `kind`, `adventure`, `blocked_by`); and `README.md` as every folder's index filename. Section names resolve off the project's **templates**, field vocabularies off its **charter** — the charter explains how records work, the templates are what a record is made of.

**Key conventions:**
- **Nothing is committed unprompted** is the only surviving non-negotiable. There is no review gate: `build` works in slices and shows each as it lands, so nothing arrives unseen.
- Composition is **prose invocation** (`Run zenku:parley`), never a path or a cross-file include. Shared material lives in the skill that owns it.
- No config file and **no `.zenku/` extension files**. A project's own behaviour goes where a human will read it: the vault charter, a folder README, or a labelled field in the project's `## The vault` CLAUDE.md section. Fields are discovered lazily and any skill offers to add a missing one.
- `init/seeds/` is the only place template bodies live, and `init` is the only skill that reads it. Two token syntaxes: `{{title}}`/`{{date:…}}` pass through untouched (Obsidian's, so one file serves both human "Insert template" and agent scaffolding), `<<TOKEN>>` is init's, and the post-condition **zero `<<` remain** is what makes the never-overwrite comparison possible on a re-run.
- Indexes are Obsidian **Bases** embedded in folder READMEs, so a note joins its index by existing, and a wrong tag drops it out silently. `_templates/` and `_bases/` sit *outside* `.obsidian/` on purpose, because that directory is per-person and gitignored.
- A quest's `blocked_by` field **empties as its blockers are solved** rather than accumulating history, which is what lets the In-reach view read the field directly instead of following a chain. `solve` clearing it is a required step, on **every** terminal outcome including a drop; the order things happened survives in the solved index and in git. Emptied means `blocked_by: []` and never a bare `blocked_by:`, because a null is in neither the In-reach nor the Blocked view and the quest vanishes from both.
- **One effort owns one spike git worktree**, on an unmerged branch, shared by every spike. One per effort rather than one per spike because spikes compound: a fresh checkout orphans whatever the last one fetched or cached. It **outlives the journey** and is inherited by the raid, because the build is who wants to go and look; **the raid strikes it**, after the lore and never before. A journey nobody raids strikes its own when it closes. The trunk never gets the code.
- **An effort ends by striking its records**, added at 3.2.0. The journey, the raid that followed it and every quest under both are **deleted**, in one commit named after the effort; a solved loose quest goes the same way as soon as it lands. There is no archive folder and no archived status — **git is the archive** (`git log --diff-filter=D`, `git show <sha>^:<path>`). The reason a status is not enough: a record that ended reads exactly like a live one to anything searching by name or content, which is most of what a session does before it decides anything, so emptying the folder is what keeps that search honest. All of it lives in one primitive, `strike`, which the two dispatchers call rather than restating: extracting it pulled `loot` out with it, since Loot was duplicated verbatim in `travel` and `raid` and also runs at the end of sessions that delete nothing. **Only a dispatcher strikes** — `solve` is a leaf closer called many times per adventure and `take` deliberately ends by returning, so a loose quest's ending is `travel`'s (both routes into `take`) exactly as a raid's is `raid`'s. Ordering inside `strike` is fixed because each step destroys what the one before it reads — close out, **`loot`**, strike the worktree, strike the records — with the lore written by the caller beforehand, which promotes Loot from a tidy-up to the designed escape hatch: for an effort that stopped short it is the *only* survivor, reopening condition included. `strike` has to be model-invoked for the dispatchers to reach it, so its guard is prose (name which ending this is, refuse when anything is still in reach) and its real safety is that it deletes without committing. Two obligations fall out: **lore never links a record** (that link dangles the moment the effort ends, and a dangling link is the one cost git does not cover), and all three entry points that look for a record — `log`, `travel` and `raid` — search **the notes as well as the quest log**, because something already built shows up only as the note describing it, so an empty quest log is not evidence nobody has been here. The **journey handed off to a raid is the one ending that clears nothing away** — the raid inherits both the worktree and the records and strikes them at its own ending, which is what makes `done` and `closed` mean different things. The base's History view became **Ended**, now a cleanup list rather than a memory: anything in it is mid-session or an ending somebody left half-finished, and it should empty.
- Durable docs are **lore**: mechanism first, reasoning in a callout beside the thing it justifies, a what-is-not-built-yet section, and no ceremony. **Lore explains the code, it never reprints it** — a declaration belongs in the file where it is typechecked; the surface goes in a table of what each member answers, behaviour goes in prose or a diagram, a snippet survives only where the code *is* the insight at two to four lines. **Use mermaid whenever the subject has a shape.** A quest's `## Design` is most of the lore draft already, minus the signatures.
- **A decision lives in exactly one place: the quest that settled it.** Only a quest carries `## Design`; an adventure carries none, and nothing is ever copied upward. The solved index points at the quests instead, one line each, which is what keeps an adventure readable at its twelfth session. The whole shape is reconciled **once**, at the raid's muster step: every one of the journey's solved quests read together, disagreements settled. That reconciliation **goes into no file** — it is agreed in conversation and becomes the build quests. A disagreement that cannot be settled there is a trial, and it means the ground was not clear: it goes back to a journey rather than being guessed at mid-build.
- **Who writes lore, and when.** A **loose quest** writes it in `build`, as it lands. A **raid** writes it **once, at the very end**, out of every solved quest's design at once — the journey's and its own — as the first step of the ending, before the worktree and the records are struck. No build quest writes any, because a page per slice describes parts of a shape nobody has seen whole and reconciling those costs more than writing it once. The payoff is that lore never has to describe something unbuilt, so `lore`'s describe-the-present rule holds without an exception. A **journey** writes none at all: its output is its solved quests. An effort that **stopped short** built nothing and writes no page; what it learned leaves through Loot.
- **Bearings** are the adventure's per-effort standing context, read at the top of every session: the ground it works in and what it does not touch, what to read before deciding anything, and the standing preferences **including the negative ones** (a branch that looks related and is not, an approach already ruled out). Nothing else in the framework carries the per-adventure layer — `codex` holds the generic rules, the CLAUDE.md block holds the project-wide facts.
- **No `Seeing it work` field.** It was v2 gate infrastructure for a gate that no longer exists; `build` now says run it and drive the real path, in one line, without a recorded answer.
- The seeded house style discourages three habits that read as machine-written: it prefers commas, colons and full stops to dashes, avoids headings of the bare form "The X", and drops antithesis used for emphasis ("it is not X, it is Y"). The last is applied narrowly, because a negation stating a prohibition, a permission, a correction of a likely assumption, or a real distinction is content rather than a tic.

### mahou
Small, single-job software engineering skills where the human makes every decision and the agent executes. Grown from real sessions through `learn` rather than designed upfront. Most of the process skills were brought over from the `filadd-experimental-dev` plugin in `~/workspace/filadd/cc-plugin-marketplace`, with every Filadd dependency (project-knowledge, dev-standards, the Notion docs database, the scouts' repository catalog) replaced by two things the project itself carries: its `docs/` folder and the mahou wiki.

**Two seams:**
- **Process lives in skills, knowledge lives in the wiki, the project's own documentation lives in the project.** The wiki (`skills/wiki/references/`, one `INDEX.md` per folder listing only its own level, entries carrying a `verified` date) is the standard the `conventions-reviewer` measures a change against; it is what dev-standards was in the Filadd plugin. The project's `docs/` folder is what the Notion docs database was: a `README.md` charter saying what each folder holds and how a note is written, one `README.md` per folder as its index, `_templates/` optional. `docs` (loaded, never typed, by `write-documentation`, `explore`, `design`, `init` and the `docs-scout`/`documentation-reviewer` agents) carries the resolution order (`.mahou/basics.md` → a `CLAUDE.md` section → `docs/README.md`), the parts a skill may assume exist (charter, per-folder index, templates, notes vs records), how the seeded note template is meant to be used (an overview first, then a **menu** of optional sections that is neither required nor closed, ordered for the reader rather than as listed, emoji on every heading, reasoning and edge cases in callouts or inline prose and never in a section) and the rule that no skill assumes the structure or carries a template body; the charter wins over anything a skill sketches. `basics` only points at it. A vault seeded by `zenku:init` (nagara's, for instance) already has this shape and is read as is; the mahou side never names zenku, since the structure is the project's whatever seeded it.
- **The `.mahou/` local layer.** `.mahou/basics.md` for standing rules and for naming the docs folder, `.mahou/<skill>.md` per skill, `.mahou/wiki/` for local entries. Every skill's first lines are "load mahou:basics, then read `.mahou/<skill>.md` if present".

**Skills:**

*Process, in the order work moves:* `explore` (user-steered investigation, one question at a time, facts fetched by scouts so the reading stays out of context, writes nothing) → `shape` (settle behavior-level decisions as a design tree) → `design` (system design one area at a time, type references under `references/types/` for data model, data flow and rules, hands the tree to `write-documentation`) → code written outside mahou → `code-blast-radius` (one `usage-tracer` per changed element, reports only where behavior changes for someone) → `agentic-review` (typed only; five facet reviewers per repo, fixes within the change's scope, up to three rounds; **the one skill that edits without asking**, bounded to changeset files, uncommitted, every fix and skip reported) → `human-review` (typed only; `plannotator` annotations verified and settled before any edit) → `write-documentation` (overview, then the template's sections the subject needs, `superpowers:unslop` pass, a `documentation-reviewer` pass against the charter, shown before written) → `commit-changes` (typed only; conventional commits, grouping confirmed first, never pushes, no co-author trailers rule).

*Entry points and tooling:* `guide` (matches a goal against skill descriptions dynamically, no routing table; hands off without summarizing or chaining), `init` (typed only; seeds the docs charter, per-folder READMEs with a hand-kept index table, `_templates/note.md` carrying the overview-plus-menu shape adapted from filadd-docs's section menu minus Issue, Possible Solutions and Edge Cases, emoji heading prefixes kept, and a `## Docs` CLAUDE.md block; never overwrites, re-run to add a folder; `init/seeds/` is the only place a template body lives), `wiki`, `learn` (typed only; discovery mode reconstructs the session and gives a take, directed mode works the ask; fidelity rule: reproduce the session's patterns exactly).

*Loaded, never typed:* `basics`, `docs`, `design-tree` (frontier rounds, numbered questions across the session, plain-prose questions and never AskUserQuestion, facts only on request), `changeset` (repos by absolute path and `git -C`, never `cd`; base from `@{u}`, then `origin/HEAD`, then `git remote show origin`, then ask, never guess between `main` and `master`; three-dot diff; introduced vs pre-existing).

**Agents** (all write findings and edit nothing, `model: sonnet`): the four generic facet reviewers plus `conventions-reviewer` (loads `mahou:wiki` for the technologies in the diff, cites the entry, flags stale `verified` dates); `usage-tracer`; `code-scout` and `docs-scout` (one question, one repo or the docs folder, report under forty lines); `documentation-reviewer` (a draft against the charter, folder README and template, judged the way `docs` says the template is used; a menu section left out is never a finding).

**Cross-plugin dependencies:** `superpowers:unslop` (the writing pass in `write-documentation`) and `superpowers:mermaid-validation` (diagrams in `design` and `write-documentation`). Both degrade to "say so and continue" when absent. External CLI: `plannotator`.

**Deliberately absent:** `rebase` and `address-pr-review` (both dropped by request), `standards-reviewer` as written (replaced by the wiki-reading conventions reviewer), the Filadd scouts, `create-doc-changelog`, the `design-doc` command, filadd-docs's emoji section menu and phrase lists, and any document-type taxonomy: those are structure, and structure is the project's.

**Plugin-specific:**
- No upstream sync. The Filadd plugin was the source once; the two diverge from here and `learn` grows this one.
- Bring a skill from `filadd-experimental-dev` only by hand, and only after every `filadd-experimental-dev:` reference, dev-standards load and project-knowledge load has a mahou equivalent or is removed.

## Development Patterns

### Creating New Commands
1. Add `.md` file to plugin's `commands/` directory
2. Include frontmatter with `description` and optional `argument-hint`/`args`
3. Write detailed instructions including:
   - Process overview
   - Step-by-step implementation
   - Error handling scenarios
   - Examples of usage
   - Important notes and warnings

### Command Design Principles
- **Comprehensive instructions**: Commands should be fully self-contained with all logic documented
- **Error handling**: Include specific scenarios and recovery actions
- **User confirmation**: For destructive operations (merges, releases), always propose and wait for approval
- **Conventional commits**: Use conventional commit format where applicable
- **GitHub CLI preference**: Use `gh` commands directly rather than delegating to agents
- **Analysis depth**: Always analyze complete context (all commits, all files) not just latest changes

### Testing Plugins Locally
1. Add as local marketplace:
   ```bash
   /plugin marketplace add local ~/workspace/asermax/claude-plugins
   ```

2. Install plugin:
   ```bash
   /plugin install <plugin-name>
   ```

3. Or install directly:
   ```bash
   /plugin install ~/workspace/asermax/claude-plugins/<plugin-name>
   ```

## Important Implementation Details

### AUR Plugin Specifics

**Version bumping:**
- Remove 'v' prefix from versions (48.2.7, not v48.2.7)
- Auto-detection: parse PKGBUILD source URLs, search for latest version
- Always confirm auto-detected versions with user
- Sequence: update pkgver → `updpkgsums` → generate .SRCINFO → commit → push

**NPM packages:**
- Package naming for scoped packages: handle `@scope/package` correctly
- Source URLs differ for scoped vs unscoped packages
- Set `noextract` for package tarballs
- Include permission fixes and metadata cleanup in package() function
- Reference Arch Wiki Node.js packaging guidelines

### Superpowers / Lesserpowers Plugin Specifics

`superpowers` and `lesserpowers` are sibling plugins. `superpowers` keeps the curated, most-used surface (agent-browser, herdr, bro, the three `plannotator-*` skills, mermaid-validation, show-markdown, unslop, the three `using-` skills, plus the situation-state and process-directives commands); `lesserpowers` holds everything else that was split out (systematic-debugging, self-maintaining-claude-md, hunk-review, agent-communication, financial-summary, and the evolve commands). They have no cross-references — the split is clean.

**Custom modifications:**
- **superpowers skills**: Use `superpowers:` namespace prefix for any cross-skill reference
- **lesserpowers skills**: Use `lesserpowers:` namespace prefix for any cross-skill reference
- **systematic-debugging** (in lesserpowers): Removed reference to verification-before-completion skill (supporting techniques are now included as documentation)
- **agent-browser** (in superpowers): Local-only "Visible browser inside herdr" section, not present upstream — preserve it on sync (manual merge, never a straight copy), along with the `Bash(herdr plugin:*)` and `Bash(bun run:*)` additions to `allowed-tools`. It is unconditional static prose: always render the browser in a herdr pane, resolve the `official.browser` plugin root from `herdr plugin list` at run time (the directory name carries a content hash), and stop and tell the user on `protocol_mismatch` rather than restarting the server, which would kill the session's own pane. It previously probed `HERDR_ENV` and the plugin root via `!`-preprocessing at skill load and skipped the section when either was missing; that branch is gone by request
- **bro** and **herdr** (in superpowers): No modifications at all, including the typos in `herdr`'s description ("terminl", "requies") — a local fix would make every future sync a manual merge for no routing benefit
- **unslop** (in superpowers): Two locally added patterns at the end of the `### Plain speech` section, not present upstream — preserve them on sync (manual merge, never a straight copy). **34. Describing the message instead of writing it** covers spans that refer to the text rather than the subject ("Two things to take into account:", "I should mention that...", "which brings us to the next point") at any position in a sentence, plus counting headings, which upstream does not cover at all. **35. Restating what you just said** covers a second pass over an idea at the same level of detail; upstream's 16 covers only the narrow case of a bold lead restating its own line. Both mirror the user's global CLAUDE.md `# Writing style` section, so they should move together. A third local pattern, mannered prose, was dropped in the 2026-09 sync because upstream grew its own **32. Mannered prose** with the same intent (upstream's 33 is **Over-compression**, unrelated). The frontmatter is local as well: upstream's `disable-model-invocation: true` is dropped and the `Must always apply.` description is replaced by one scoped to document writing, because mahou's `write-documentation` invokes the skill by name and cannot if the flag is set. Keep the flag out and the scope in on sync; everything else is upstream's
- **plannotator-review**, **plannotator-annotate**, **plannotator-last** (in superpowers): No modifications. Keep `disable-model-invocation: true` (each one blocks on a browser session), keep `allowed-tools: Bash(plannotator:*)` (the `!` line is inert without it), and keep the `## Your task` branches verbatim — they encode the CLI's `approved`/`dismissed`/`annotated` output contract, so they are upstream's to change. Upstream also installs these into `~/.claude/skills/` via its own `install.sh`; run that installer with `--skip-skills` to avoid two copies competing for the same names
- All skills use simplified plugin metadata format (name + description only)

**Update workflow:**
- Upstream repositories:
  - `~/workspace/random/superpowers` - `systematic-debugging` (synced into **lesserpowers**)
  - `~/workspace/random/agentic-evolve` - evolve commands (synced into **lesserpowers**)
  - `~/workspace/random/agent-browser` - Browser automation CLI (synced into **superpowers**)
  - `~/workspace/random/dmmulroy-skills` - `bro`, `herdr` (synced into **superpowers**, verbatim). The repo ships other skills (Effect, Cloudflare, tech-spec, plus vendored copies of Matt Pocock's) — none are tracked; add one only on explicit request
  - `~/workspace/random/cursor-plugins` - `unslop` from `pstack/skills/` (synced into **superpowers**, plus two locally appended patterns). `cursor/plugins` is a monorepo and `pstack` alone ships ~40 skills (the `principle-*` family, `tdd`, `architect`, `why`, `swarm`); none of the rest are tracked, add one only on explicit request
  - `~/workspace/random/plannotator` - `plannotator-review`, `plannotator-annotate`, `plannotator-last` from `apps/skills/claude/` (synced into **superpowers**, verbatim). Track the `claude/` copies, never `core/`: the core ones are agent-agnostic fallbacks that ask the agent to run the CLI, while the Claude copies use `!` preprocessing and `$ARGUMENTS`. The repo's `apps/skills/extra/` skills (compound, setup-goal, visual-explainer) are not tracked; add one only on explicit request
- Pull latest changes from all repositories' `main` branch
- Tracked skill from superpowers upstream: systematic-debugging → `lesserpowers/skills/`
- hunk-review skill is NOT synced: it's a thin wrapper that uses Claude Code's `!`-preprocessing to inline the installed Hunk binary's SKILL.md at skill-load time (via `hunk skill path`). The upstream hunk binary owns the content, so the plugin file rarely needs touching.
- Tracked commands from agentic-evolve (copied directly to `lesserpowers/commands/`):
  - evolve.md (master dispatcher)
  - evolve-perf.md (runtime speed optimization)
  - evolve-size.md (code size/bytes optimization)
  - evolve-ml.md (ML accuracy optimization)
- Show high-level summary of changes (not detailed line-by-line diffs)
- Intelligently merge updates: adapt conceptual improvements while preserving plugin customizations
- Plugin-specific skills (using-live-documentation, self-maintaining-claude-md, using-antigravity, agent-communication, financial-summary, using-code-directives, mermaid-validation, show-markdown) have no upstream and are never modified during sync
- Confirm before updating skills
- Skills are available immediately after update via Claude Code's skill system

**Skills structure:**
- Each skill directory contains SKILL.md and optional test cases
- Skills use plugin metadata format: name + description (not when_to_use, version, languages)
- Skills are loaded automatically by Claude Code from the `skills/` directory
- No manual activation required - skills are always available

**Agents (superpowers):**
- `agents/documentation-searcher.md`: Internal agent used by the using-live-documentation skill
  - Plugin-specific agent (no upstream source)
  - Searches Context7 for library documentation and provides focused synthesis
  - Uses Context7 MCP tools (resolve-library-id, get-library-docs)
  - Invoked via Task tool with subagent_type: superpowers:documentation-searcher
- Agent definitions include frontmatter with name, description, tools, and model

**Hooks (superpowers):**
- `hooks/hooks.json`: Plugin hooks configuration
- `hooks/auto-approve.sh`: PermissionRequest hook that auto-approves `superpowers:` skill invocations and bash commands referencing superpowers paths

**Hooks (lesserpowers):**
- `hooks/hooks.json`: Plugin hooks configuration
- `hooks/background-daemons.sh`: PreToolUse hook that auto-backgrounds `agent.py` commands for the agent-communication skill
- `hooks/auto-approve.sh`: PermissionRequest hook that auto-approves `lesserpowers:` skill invocations and bash commands referencing lesserpowers paths

## Repository Conventions

- No package.json (this is not a Node.js project)
- No build/test/lint commands (documentation-based plugins)
- Version management via individual `plugin.json` files
- Each plugin is independently versioned
