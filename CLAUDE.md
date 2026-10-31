# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a personal collection of Claude Code plugins that provide workflow automation for development tasks. The repository is structured as a local marketplace containing multiple plugins, each with their own commands and functionality.

## Repository Structure

- **Root level**: Marketplace configuration (`.claude-plugin/marketplace.json`)
- **`.claude/skills/`**: Marketplace-level skills available when working inside this repo (currently `sync-upstream`, `sync-with-filadd`, `commit`). These are scoped to maintaining the marketplace itself, not shipped to plugin consumers.
- **Plugin directories**: Each subdirectory (`aur/`, `superpowers/`, `lesserpowers/`, `beads/`, `haft/`) is a separate plugin
  - `.claude-plugin/plugin.json`: Plugin metadata
  - `commands/`: Slash command definitions (`.md` files)
  - `.mcp.json`: MCP server configuration (if applicable)
  - `README.md`: Plugin documentation

## Repo-level skills

These live at `.claude/skills/<name>/SKILL.md` and trigger contextually based on natural-language requests when this is the working directory.

- **sync-upstream**: Sync this marketplace's skills, commands, and context from their upstream source repos (`~/workspace/random/superpowers`, `~/workspace/random/quint-code`, `~/workspace/random/agentic-evolve`, `~/workspace/random/agent-browser`, `~/workspace/random/dmmulroy-skills`, `~/workspace/random/cursor-plugins`). Preserves plugin customizations (namespace prefixes, removed cross-skill references) and asks before applying.
- **sync-with-filadd**: Sync mahou with the Filadd marketplace's `experimental-dev` plugin in both directions (plus the `dev` and `docs` skills that pair with mahou or superpowers ones). Lists the candidates by direction, waits for the user to pick, and ports each item rewritten for the side it lands on through a substitution table. Renamed from `sync-experimental-dev` 2026-10-04 and from `sync-to-filadd` 2026-10-11, since it syncs both ways. Commits nothing on either side.
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
- **mermaid**: Choose, write, style and validate mermaid diagrams: a chart-selection table, one reference per chart type with a default shape and colour palette, a `diff` reference (added 2026-10-30) for drawing today and a change in one diagram (removed elements outlined red and dashed, added ones thick green, changed ones amber, over the palette fill; red and green `rect` blocks in a sequence diagram), and a bundled validator that installs itself on first run. Diagrams are drawn with [pele](https://pele.run) (Obsidian's mermaid renderer, own layout engine, colours through CSS variables): the validator calls pele's `render()` and, given an output path, rasterizes the SVG to a PNG with resvg, so no headless browser is needed. `show-markdown`, mahou's `telepathy` and the canvas `mermaid` shape render with pele as well, each mapping its own page palette onto the `--pele-*` variables. The palette's `classDef`s carry a dark `color` because a fixed light fill would otherwise get the dark theme's light text
- **show-markdown**: Render markdown content in the browser with styling

*Browser Automation:*
- **agent-browser**: Browser automation CLI for web testing, form filling, screenshots, and data extraction (synced from `~/workspace/random/agent-browser`). The plugin file is a **discovery stub** — the workflow content ships inside the installed CLI and loads on demand via `agent-browser skills get <name>`, which is why it cannot go stale against the binary and why syncing it is nearly always a one-line catalog change. The specialized skills it points at are the CLI's to change, not ours: `core`, `electron`, `slack`, `dogfood`, `derive-client`, `vercel-sandbox`, `agentcore`. **derive-client** (added upstream 2026-08) records a site's network traffic to a HAR once, mines it for the internal JSON API, and generates a standalone typed client that calls those endpoints directly — no browser after the first recording. Two things to know before reaching for it: a HAR holds live cookies, tokens and POST bodies, so it is a secret and must stay out of version control; and per-session CSRF tokens or signed/expiring request params do not reduce to a plain HTTP client, so those flows stay browser-driven while the rest is derived

*Terminal Orchestration:*
- **herdr**: Control the Herdr terminal multiplexer via its CLI — inspect and create workspaces/tabs/panes, start and prompt sibling coding agents, run background processes, read pane output, wait on state changes. Guards on `HERDR_ENV=1` and stops when unset. Synced verbatim from `~/workspace/random/dmmulroy-skills`

*Writing:*
- **unslop** (`/superpowers:unslop`): Strip AI tells from any writing. Named patterns across content, language, style, chatbot artifacts, filler, jargon and plain speech (em dashes, "not just X but Y", inline-header lists, abstract metaphor nouns, mannered prose, over-compression, passive voice), each with the concrete fix. Rule numbers are stable ids that other skills cite, so upstream leaves gaps where it removed a rule (1, 2, 4, 6, 21 are gone) rather than renumbering. Synced from `~/workspace/random/cursor-plugins` (`pstack/skills/unslop/`) with six locally added patterns appended (34 to 39, see "Custom modifications"). Upstream dropped the "add soul" pass in its density pass of 2026-08 and also set `disable-model-invocation: true`; the plugin follows the first and not the second. Instead of upstream's `Must always apply.` description the plugin copy is scoped to document writing (documentation, READMEs, design notes, specs, PR descriptions, and when another skill asks for a writing pass), so it fires there and stays off code and chat replies. It has to stay model-invocable because mahou's `write-documentation` calls it by name

*Other:*
- **bro** (`/superpowers:bro`): Restate the last message in plain language, no jargon. Manual-only (`disable-model-invocation: true`). Synced verbatim from `~/workspace/random/dmmulroy-skills`

**Key workflows:**
- Skills directory contains full skill definitions from upstream repositories
- Upstream sources synced via the marketplace-level `sync-upstream` skill (see "Repo-level skills"):
  - `~/workspace/random/agent-browser` - Browser automation CLI
  - `~/workspace/random/dmmulroy-skills` - `bro` and `herdr` (clone of `github.com/dmmulroy/skills`; only those two are tracked)
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
- **The `.mahou/` local layer.** `.mahou/basics.md` for standing rules and for naming the docs folder, `.mahou/<skill>.md` per skill, `.mahou/wiki/` for local entries. Every skill's first lines are "load mahou:basics, then read `.mahou/<skill>.md` if present". `basics` in turn loads `mahou:wiki` and reads its root indexes, so every skill knows which topics have entries; the entries themselves are read only where a skill says so (the two review skills, and since 2026-10-22 `prototype`) or when the user asks for a conventions check, never brought unasked into a question. Since 2026-10-21 `basics` also says to start every subagent from the folder the session started in rather than the current working directory, since a subagent started inside the scratch folder finds none of the plugin's skills and agents. Artifacts a skill produces for the user and keeps between rounds go to `.scratch/<change-slug>/` at the project's root, gitignored; throwaways stay in `/tmp`. Since 2026-10-10 the folder keeps a `status.md` that every skill working on the change reads at the start and updates at the end: pointers only, under Stage, Links, Local artifacts and Tracking.

**Skills:**

*Process, in the order work moves:* `explore` (user-steered investigation, one question at a time, facts fetched through `lookup` so the reading stays out of context, a question about a system's parts goes to `architecture-exploration` and one only running code can answer to `spike`; since 2026-10-23 a final check on request reports what is still open and where settled decisions contradict each other or a found fact, and the ending writes `decisions.md` and `findings.md` to the change's scratch folder) → `shape` (settle behavior-level decisions as a design tree; opens by placing the decisions the user brings as ✓ leaves under pending areas, then works one area at a time) → `design` (system design one area at a time, type references under `references/types/` for data model, schema (a structured value a schema validates rather than a table: JSON column contents, cross-system payloads, tool arguments), data flow, rules, lifecycle, scheduled process (added 2026-10-10: a job on a schedule or a wait that ends with the system acting), component architecture, contract and UI, hands the tree to `write-documentation`; since 2026-10-26 the ending's existing-notes step reads every note in the docs folder through a `docs-scout` before proposing the list, includes every note describing what the change alters even when the session did not open it, and says which notes were read and found untouched; the branch list is shown as the tree itself, the first branch opens with its approval and each later one with the approval of the previous branch's rendering; a branch opens by stating what is already settled as ✓ leaves and waiting for corrections before the frontier is asked; the reference's representation is rendered directly, asked only when no reference matches; sub-branches describing one thing may render as one representation once settled, and a behaviour another note or branch already settles is referenced in one sentence rather than redrawn) → `program-design` (since 2026-10-30 a part that changes something that exists shows what the change adds, alters and removes, marked the way its reference says: the callstack in a `+`/`-` column with no `unchanged` annotations, control flows and class diagrams as mermaid diffs, and code is cited in the reference form `basics` defines; since 2026-10-27 the prototype settles how the screen looks and behaves, never how it is coded, and the component tree names every component's source, the component a wiki entry defines for that screen or an app component when none does, proposed from the wiki's frontend entries first so a screen an entry already covers never becomes custom code; since 2026-10-23 a screen branch's layout is worked on a prototype through `prototype`, opened or created and iterated with the user until it shows the final screen, and the module list gives every file and folder its own line; since 2026-10-20 the standards branch is derived after every other branch of the root and settles without the user's confirmation, and the derivation ledger tags each line from a fixed table (`prop`, `arg`, `request`, `query meta`, `env`, `config`, `context`, `cookie`, `server`, `browser`, `upstream`, `database`, `local`, `form`, `constant`, `function`, `method`, `effect`, `computed`, `returns`), a new tag defined where it first appears; since 2026-10-17 every proposal cites the code or convention behind it, complex or already-solved logic is first looked for in the project, its libraries and maintained libraries with facts per candidate for the user to pick, the conventions are read per root as it opens, and a branch names the parts it skips; renamed from `program-architecture` 2026-10: turns a settled design, or a change proposed in the conversation and confirmed as the source, into a program design, one repository at a time, a branch per package, screen or entry point; since 2026-10-10 a host app and the library a surface is built from may be one root, with the module list marking each file's repository and the record named after the surface; the one skill that proposes rather than asks, named as the exception in `basics`' rule against recommending, because the design already made the decisions and the proposals only work out the details; every part is a representation grounded in the code and the conventions and never code: package layout, screen layout, component tree, derivation ledger, callstack, control flow, interfaces as JSON Schema, class diagram, module list, plus a standards list closing each root; each reference under `references/representations/` has What it covers, What to check before proposing, Representation and When it fits; the record is `program-design/<repo>.md` in the scratch folder, and departures from the design notes go through `write-documentation` at the end) → `spike` (answer a design question that reading and asking cannot settle, by building the smallest working version of the real thing and running it against reality; throwaway code that never merges, one question per spike, rounds under a strategy from `references/strategies/`, code and findings in the change's scratch folder at `spikes/<question-slug>/`) → `test-design` (since 2026-10-25 the root's existing suite is read before the classifications and its covered cases stay in the matrix as unstarred rows, a ★ marks a row the change adds, and `Deleted:` lines list suite tests the change removes; since 2026-10-17 a data migration gets one manual row for upgrade and downgrade instead of its own root, each placement of a user-facing flow is its own root, and the two-roots rule applies to services only; Classification Tree Method on the settled design, before any code: one tree per repository, entry points or flows as roots, classifications, partitions, then a combination matrix per branch with rows marked `test`, `manual` or both; candidates derive only from settled leaves and facts read from the code, the user settles every level; test level and naming come from the wiki's testing entries and the repository's own conventions, whether a surface has a runner is a fact read from it; settled trees and matrices written to the scratch folder at `test-design/<repo>.md` so implement reads them across sessions; ported from `filadd-experimental-dev` 2026-09, the Filadd stack ordering replaced by "from the repository others depend on outward") → `implement` (since 2026-10-27 its repository rules tell the subagent to use the component or library a wiki entry defines instead of writing a custom equivalent, starting frontend screens from the wiki's frontend entries, the prototype settling how the change looks and behaves, not how it is coded; since 2026-10-25 the matrix rows carry their ★ marks and any `Deleted:` lines, and on `test` rows a ★ is a new test the subagent writes while an unstarred one is kept or updated to the row's expected outcome; since 2026-10-30 every decision it relays carries enough context to decide without asking back, starting with why the subagent raised it, and a skipped review finding comes back with the problem the reviewer saw, why it proposed the change and why the review skipped it; since 2026-10-21 the subagent that ran the agentic review commits its fixes on the branch through `commit-changes` without asking; since 2026-10-17 subagents commit through `commit-changes` without asking, apply a decided fix exactly as decided, and every later batch of fixes gets the same agentic review, and since 2026-10-19 every finding a review skipped comes back to the user with its reason, to apply as a task or leave recorded in the scratch folder; one subagent per repository with a full brief: design notes and summary, tasks, its matrix rows verbatim (read from the scratch folder at `test-design/<repo>.md` when test-design wrote them there), repository rules, the `report` shape; relays results and flags as decisions, then a subagent runs `agentic-review` per repository as it lands and `validate` one repository at a time, then design reconciliation collects the drift and a `consistency-checker` per repository before one `write-documentation` pass (order changed 2026-10-11: validation before reconciliation); the final message holds the whole report, and a subagent kept for more work is compacted between tasks when its context nears half; task tracker generalized, the tracker, its tool and its states come from `.mahou/implement.md` or the user, and the brief names them concretely; ported 2026-09 with the Notion Board states and the `local-services` load removed) or `implement-with-tdd` (added 2026-10: `implement` as written, except each repository gets a tester and an implementer subagent that never talk directly; the tester writes the failing tests for the ★ `test` rows, updates the unstarred ones whose expected outcome changed, removes the tests listed under `Deleted:`, and checks the reason each fails, the implementer makes them pass without touching test files, the tester validates against the design's rules and contracts, and the session relays every exchange and commits through `commit-changes` once the tester approves) or code written by hand or another tool → `validate` (since 2026-10-17 its browser reference captures a pending state lasting milliseconds by emulating network latency through CDP; the manual rows from `test-design`, or user-named scenarios, driven through a browser via `agent-browser`, over HTTP via `curl`, or on an Android device via `adb` and the `scripts/android/` helpers, references under `references/`; how the system runs comes from `.mahou/validate.md` or the project's own setup; capture-mutate-revert discipline for local data, an HTML report artifact in the change's scratch folder at `reports/` built as rows run, **fixes nothing**, every failure a decision; renamed from filadd-dev's `validate-feature` 2026-09 with the rubric dropped because `test-design` already covers it, the three Filadd surface references collapsed to two generic ones (plus `android.md`, generalized from filadd-dev's mobile reference 2026-09), and the "fix and re-run until clean" rule inverted) → `code-blast-radius` (one `usage-tracer` per changed element, reports only where behavior changes for someone) → `agentic-review` (since 2026-10-30 each skipped finding is recorded with the problem the reviewer saw, why it proposed the change and why the review skipped it; since 2026-10-17 the main agent checks every comment the diff adds against the project's comments rule, from a wiki entry, `CLAUDE.md` or a rule file, and the reviewers do not flag comments; typed or invoked by `implement`, `disable-model-invocation` dropped 2026-09 for that; four facet reviewers per repo plus one `conventions-reviewer` per wiki entry or project rule file, the list passed by the caller or picked from the wiki indexes, fixes within the change's scope, up to three rounds; **the one skill that edits without asking**, bounded since 2026-10-23 by how the change looks and behaves and by every mechanism a settled design, a user decision or a listed source chose rather than by the changeset's files, so a fix that reduces complexity or duplication may edit or add a file outside it (a prototype settles the look and behaviour, not the code), uncommitted, every fix and skip reported) → `human-review` (typed only; `plannotator` annotations verified and settled before any edit, and since 2026-10-26 the approved fixes commit through `commit-changes` without asking, the approval of a fix being the consent to commit it) → `address-pr-review` (the review on an open PR: one GraphQL query for reviews and threads, each finding verified with a verdict and its premise checked, settled with the user, applied, then committed through `commit-changes`, pushed and the ruled threads resolved; never posts to the PR; typed or run by `land` on a review; ported from `filadd-experimental-dev` 2026-09 with `dev-standards` replaced by the wiki and the project's rule files) → `write-documentation` (overview, then the template's sections the subject needs, `superpowers:unslop` pass, a `documentation-reviewer` pass against the charter, shown before written; a stripping rule set — name roles not products, link dependencies, no library names, no current-implementation description, no ownership, no prototype controls, no comparison with today — keeps session artifacts out of the shared note) → `commit-changes` (model-invocable since 2026-10 so `address-pr-review` and `implement-with-tdd` can invoke it; conventional commits, grouping confirmed first, never pushes, no co-author trailers rule) → `release-check` (since 2026-10-17 a repository others install as a package has its consumers as boundaries: modified exports, peer ranges against published versions, new peers declared, one `usage-tracer` per export; what breaks when the change's repositories are released in a given order, and the order that breaks nothing; boundaries come from the diff plus the user since mahou has no dependency map to read, one `compat-checker` per boundary and `code-blast-radius` alongside, findings verified against their cited lines before reporting; ported 2026-09 with project-knowledge's dependency script, `prepare-repo` and the filadd org replaced by diff-derived boundaries, inline repo prep and the remote's owner) → `land` (from branches to merged pull requests in the safe order: runs `release-check`, opens every PR through `create-pull-request`, babysits them in parallel with one poll loop each — `address-pr-review` on a review, `rebase` when behind, stop on a failed check, record on merge — then walks the confirmed order, watching each merge's CI run and stopping for the user's production confirmation before the next, the release following each project's own process; never merges a PR itself; proposes skipping `release-check` for a one-repository change that crosses no service boundary, and ends by switching each checkout to its base, pulling and deleting the merged branch with `branch -d`, never forced; ported 2026-09 with `release-repo` dropped because generic projects release from their own CI).

*Entry points and tooling:* `guide` (matches a goal against skill descriptions dynamically, no routing table; hands off without summarizing or chaining), `init` (typed only; seeds the docs charter, per-folder READMEs with a hand-kept index table, `_templates/note.md` carrying the overview-plus-menu shape adapted from filadd-docs's section menu minus Issue, Possible Solutions and Edge Cases, emoji heading prefixes kept, and a `## Docs` CLAUDE.md block; never overwrites, re-run to add a folder; `init/seeds/` is the only place a template body lives), `wiki`, `learn` (typed only; discovery mode collects the session's friction points and gives a take on each, directed mode works the ask; drafts every item in one reply, each under its heading, written to the scratch folder and passed through `superpowers:unslop` before being shown, approved per item; fidelity rule: reproduce the session's patterns exactly; since 2026-10-10 a code example in a wiki entry is named after a generic resource, never the session's feature). Asked for by name: `canvas` (added 2026-10: a tldraw app under `scripts/app/` run by `scripts/canvas.sh` over one `<name>.tldr.json` document, installed with npm into `~/.cache/mahou-canvas`; the agent draws through `agent-browser` in its own tab, one awaited `canvas.step` per element so the user sees the drawing grow, every tab edits live, mockups are `mockups/<kind>.tsx` files rendered by a custom `mock` shape, a sticky note is the user's message to the agent, "Send to Agent" is read through `canvas.sh watch`, documents carry a `canvasVersion` that `canvas.sh migrate` upgrades, each cohesive element is one tldraw group made with `editor.groupShapes` and an `area` boxes only the parts of one thing (2026-10-04), and the texts go through `superpowers:unslop` before `canvas.sh export` writes the SVG; since 2026-10-04 the skill carries drawing rules (one shape per kind of part, arrows labelled with their payload, flows left to right, nothing overlapping), an `area` has no natural width so its border and label keep their size, and `canvas.sh watch` runs under a monitor so each click arrives; since 2026-10-10 a built-in `mermaid` kind holds a finished diagram drawn in the canvas's ink and hand font (rendered with pele since 2026-10-17, its source written and validated with `superpowers:mermaid` since 2026-10-19), Ctrl+, sends like the button, holding the mic button or Ctrl+. sends a voice message that `watch` prints as `voice: <message> | selected: …`, mockups redraw through hot reload instead of reloading the page, and the skill carries rules for sizing a mock to its content, `null` over `undefined` in `data`, pointing an arrow inside a mock, placing notes so no arrow crosses the diagram, resizing areas, restarting after app edits, and talking in the chat or on the canvas as the loading skill says; since 2026-10-17 `window.canvas` carries drawing helpers (`id`, `bounds`, `area`, `text`, `card`, `note`, `plain`, `fit`, `grow`, `followUp`, from `src/draw.ts`), areas grow with `canvas.grow` so what sits below moves with them, and a mock is zoomed to before its height is measured, because a shape off screen has no root element and its `h` collapses; since 2026-10-20 areas nest: a shape belongs to the innermost area holding its top edge, an area strictly inside another's left and right edges belongs to it, and a nested area that grows moves only what sits under it inside the outer area, which then grows; since 2026-10-21 the helpers add `box`, `arrow` (bound to both shapes), `mermaid` (sized to the diagram's `viewBox`), `move` (carries a card's follow-up or an area's contents and refits the areas it leaves and enters) and `flow` (stacks shapes inside an area after growing it), `area` with an existing name relabels it, `resize` widens only the column's top-level areas and shifts each neighbour by the growth of the area beside it, and two shapes joined by a labelled arrow sit 250 to 300 units apart; later on 2026-10-21 the helpers add `mock` (fits its height to the content) and `classificationTree` (one whole test branch, root, classifications, partitions and matrix, in one batch, redrawn in place under the same name), and `text`, `card`, `box` and `mock` take `into: '<area>'`, which grows a nested area to hold the new shape before creating it; since 2026-10-22 the column rule lives in `canvas` rather than in each `-with-canvas` skill: related parts share a column, an unrelated part starts a new column to the right, and the top-level areas in a column share a width, and a voice message that reads as cut off is read whole from the watch monitor's output file; since 2026-10-23 a built-in `code-snippet` mock shows a change to a file (lines marked same, add, remove or gap, notes beside their lines collapsed past two lines, highlighting from pattern rules, a unified/split toggle, and since later on 2026-10-23 a `code` view for a file shown as it is, without marks or toggle, which `draw.ts`'s `fit` now measures for a mockup whose width is a function of its props), and mockups can take clicks: elements marked `data-interactive`, `render` receives `update(patch)` that saves into the shape's `data`, a natural width may be a function of the props, and the shape's height follows its `data-root`; since 2026-10-24 an area carries an `isFocus` state drawn as a solid red border with no other mark, only one area is focused at a time (`focus` clears the rest), an area is created focused with `focus: true` on `area`, the focus moves to an existing area with `focus(name)` and clears with `focus(null)`, a relabel keeps the focus, and the agent focuses the area it is about to fill and moves the focus only when the work moves, not for a small adjustment; since 2026-10-25 `classificationTree` draws a ★ column marking new tests and `Deleted:` lines below the matrix, its spec taking `isNew` on rows and a `deleted` list), `explore-with-canvas`, `shape-with-canvas`, `design-with-canvas`, `program-design-with-canvas` (added 2026-10-10: each runs the skill it names on a `canvas` in the scratch folder's `canvas/`; explore lays answers out freely beside a `Decisions` log; shape and design draw the tree as one area per branch, leaves on the left and prose and representations on the right, questions as violet cards with follow-ups inside them, two kept open, Agent notes in place of chat text; design swaps a settled branch's diagrams for `mermaid` shapes and records in the chat; program design draws each part in its own area from bundled mockups and canvas references while `program-design/<root>.md` keeps the text form; since 2026-10-17 design-with-canvas widens a whole column for a settled `mermaid` shape wider than it, keeps a folded branch's area and draws a merged question as one card whose body can hold a diagram, table or mockup, and program-design-with-canvas gives each branch its own column, draws interfaces as `interface-card` mocks and the module list as a `file-tree` mock, writes a component's `returns` as an element tree, and draws an unchanged parent as a dotted grey card; since 2026-10-23 a screen layout is one mock per state copied from the prototype and the `screen-wireframe` mockup is gone, a file's contents are a `code-snippet` in its `code` view, the component tree is centred with notes on the side of the card they explain, the ledger's `returns` line is marked with `⇒` and a dashed rule, and the ledger's cards are joined by `renders`, `context` and hook arrows before the part is shown), `test-design-with-canvas` (added 2026-10-11: runs test-design on a canvas; the candidate roots as ☐ cards on a map of the system, one area per tree, grey dashed cards for what is not a root; each branch a classification tree, root blue, classifications violet, partitions green, with the matrix under it as dots under the partitions, a ★ column marking new tests, and orange rows for those run by hand; since 2026-10-20 every branch of a tree is drawn at once, whole and labelled `proposed` until approved, and the next tree opens once every branch of the one before is approved; since 2026-10-21 each branch is drawn with `canvas`'s `classificationTree` from a spec kept as data in a script in the canvas folder; `test-design/<repo>.md` keeps the record), `fast-track` (added 2026-10-23: runs one of the four canvas stage skills above with every branch or part laid out at once and no approval between them; decisions a file in the scratch folder already shows become ✓ leaves with their source, a decision with one plausible answer settles as "follows from <leaf or fact>" without the confirmation `basics` rule 2 asks for, since turning the mode on is the user's consent, every open question goes on the canvas in one round past the two-open limit, and a branch settles when its last question closes; anything outside the scratch folder, a branch switch, the docs folder or the recording step, still waits for the user; typed once for the session, or loaded by a stage skill whose arguments ask for it, each of the four carrying the load line), `architecture-exploration` (added 2026-10-04: a system's architecture drawn on a `canvas` in the scratch folder's `canvas/`, parts named as the code and docs name them, one area per platform or deployable; when options are asked for, `references/exploration.md` lays them out as a grid with one square per combination of independent dimensions, draws a shared part once step by step, and redraws the chosen option whole beside the earlier one after each decision; picks nothing, removes no drawing unasked; also loaded by `explore`), `one-page-design` (added 2026-10: a settled design as one page on a `canvas` in the scratch folder's `one-page/`, one element largest in the centre, small supporting views, a legend card for the arrow colours; since 2026-10-04 the page is a journey or an anatomy, each a reference under `references/types/` with its centre, layout, patterns and what it leaves out, read from the context or asked when more than one fits, and `references/patterns/` holds one file per visual pattern, routed from a table in the skill), `create-pull-request` (opens one PR, base found by commit distance, title and body from every commit on the branch, waits for confirmation before creating), `rebase` (brings a branch up to date with its base, verifies against the suite, never pushes; ported 2026-09 for `land`), `telepathy` (a mode, added 2026-09: the conversation moves out of the chat into markdown files in the change's scratch folder, served by a Bun server under `scripts/` that the agent starts as a Claude Code background process with the folder's slug; the user edits block by block in the browser (click to edit, `+` to write under, Enter or blur sends, Shift+Enter a new line) and each commit reaches the agent's pane through `herdr agent prompt` as a `[telepathy]` message carrying the file, the lines and a diff, never a block id; the server is the only writer on the user's behalf, so authorship is known, and it is kept per block in `<root>/.meta.json` together with each file's last snapshot; agent writes are picked up by a line diff against that snapshot, which carries block ids and authors forward, plus a positional pass so a block rewritten in place keeps its id; a user edit to a block the agent also changed is three-way merged, and the merge editor opens only when the same lines changed; a prompt to an agent blocked on a dialog waits and retries, everything else goes straight into its input queue; the mode overrides every loaded skill's "reply", and the agent ends each turn without chat text).

*Loaded, never typed:* `basics` (since 2026-10-30 a Referencing code section gives the one form for pointing at code, `[[path#symbol]]`, `[[path]]`, `[[path#L12-L30]]` and `[[sha:path#L12-L30]]`, used by `program-design` and `report`), `docs`, `design-tree` (since 2026-10-17 a question's context can carry a concrete case, reference points from outside the tree (context, never candidates), a comparison with settled leaves and a diagram, table or worked example, a question the user did not follow is restated with the same tools (`references/explaining.md` is gone), and a Merging section merges two questions one answer settles under the lower number and folds a branch another already settled into a "merged into <n>" line; frontier rounds, numbered questions across the session, questions written straight into the reply and never through a tool, a section on what a question carries: the context the user needs (earlier answers that bear on it, what the answer changes) and never the ways to answer it, with what counts as a proposed answer and a reread before every round, settled decisions stated as ✓ leaves and never re-asked, a Scope section that gates hypotheticals (a missing value, a failing step, a later feature) behind one "do we consider X?" question per branch with deferred ones recorded where the loading skill says, and since 2026-10-10 raised only when a noticed situation would change what the branch defines, the whole tree shown when a branch opens or settles and the worked branch alone between rounds, facts only on request), `changeset` (repos by absolute path and `git -C`, never `cd`; since 2026-10-17 the base comes from `scripts/find-base-branch.sh`, a commit-distance script returning JSON that `create-pull-request` calls too, then ask, never guess between `main` and `master`; three-dot diff; introduced vs pre-existing), `prototype` (since 2026-10-22 reads the wiki's frontend entries and the project's rule files that match the element before building, unasked; one self-contained HTML file in the change's scratch folder at `prototypes/`, reopened in place each round; a control strip switches states, alternatives lettered on one page in the first round, corrections applied as given afterwards, reconciled against the settled leaves before a UI branch renders; loaded by `explore` when a screen question comes up and by the `ui` design type, brought over from `filadd-experimental-dev` 2026-09 with no Filadd dependency to strip), `lookup` (where a fact comes from: routing between `code-scout` per repository, `docs-scout` against the project's docs folder, `researcher` for anything outside the project, or a direct trial; verified vs asserted kept apart in the reporting; loaded by `explore` and `design-tree`, ported 2026-09), `report` (the shape of what a skill hands the user when the work is done: findings, an investigation's answer, a change summary; loads the unslop rules and holds them while writing rather than running the pass, leads with the answer, diagrams what reads clearer as a picture, separates the verified from the claimed, cuts what does not bear on the ask, structures by reader need rather than by source; ported from `filadd-experimental-dev` 2026-10 with the unslop and mermaid loads re-pointed at superpowers).

**Agents** (all write findings and edit nothing, `model: sonnet` except `consistency-checker`, which runs on opus): the four generic facet reviewers (`simplification-reviewer` also flags defensive code for a case the code cannot reach, since 2026-10-17; `reuse-reviewer` also flags re-implementations of components and libraries wiki entries define, since 2026-10-27) plus `conventions-reviewer` (one per source: a wiki entry or a project rule file, cites it, flags stale `verified` dates on entries; split per source 2026-09 after the Filadd standards reviewer went one per guide); `usage-tracer`; `code-scout` and `docs-scout` (one question, one repo or the docs folder, report under forty lines); `compat-checker` (one service boundary, new side against deployed other side in both directions, migrations against instances on the old code, a client still running an old build; dispatched by `release-check`, ported near-verbatim 2026-09); `documentation-reviewer` (a draft against the charter, folder README and template, judged the way `docs` says the template is used; a menu section left out is never a finding); `consistency-checker` (added 2026-10-11: one repository after a change lands, read only, findings grouped as Leftovers, Docs vs code, Code vs code and Vocabulary with file, line, both sides quoted and a proposed fix; dispatched by `implement` during design reconciliation).

**Cross-plugin dependencies:** `superpowers:unslop` (the writing pass in `write-documentation`, the rules held while writing in `report`) and `superpowers:mermaid` (diagrams in `design`, `write-documentation` and `report`). Both degrade to "say so and continue" when absent. External CLIs: `plannotator` (`human-review`) and `agent-browser` (`validate`'s browser reference loads its skill content via `agent-browser skills get core --full`; `canvas` drives its tab with it), plus Node and npm for `canvas`.

**Deliberately absent:** `scope-tasks` and `update-pitch-context` (Notion Board and Recorder Context writers with nothing in mahou to map onto), `standards-reviewer` as written (replaced by the wiki-reading conventions reviewer), the Filadd scouts, `create-doc-changelog`, the `design-doc` command, filadd-docs's emoji section menu and phrase lists, and any document-type taxonomy: those are structure, and structure is the project's.

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

`superpowers` and `lesserpowers` are sibling plugins. `superpowers` keeps the curated, most-used surface (agent-browser, herdr, bro, mermaid, show-markdown, unslop, the three `using-` skills, plus the situation-state and process-directives commands); `lesserpowers` holds everything else that was split out (systematic-debugging, self-maintaining-claude-md, hunk-review, agent-communication, financial-summary, and the evolve commands). They have no cross-references — the split is clean.

**Custom modifications:**
- **superpowers skills**: Use `superpowers:` namespace prefix for any cross-skill reference
- **lesserpowers skills**: Use `lesserpowers:` namespace prefix for any cross-skill reference
- **systematic-debugging** (in lesserpowers): Removed reference to verification-before-completion skill (supporting techniques are now included as documentation)
- **agent-browser** (in superpowers): Local-only "Visible browser inside herdr" section, not present upstream — preserve it on sync (manual merge, never a straight copy), along with the `Bash(herdr plugin:*)` and `Bash(bun run:*)` additions to `allowed-tools`. It is unconditional static prose: always render the browser in a herdr pane, resolve the `official.browser` plugin root from `herdr plugin list` at run time (the directory name carries a content hash), and stop and tell the user on `protocol_mismatch` rather than restarting the server, which would kill the session's own pane. It previously probed `HERDR_ENV` and the plugin root via `!`-preprocessing at skill load and skipped the section when either was missing; that branch is gone by request
- **bro** and **herdr** (in superpowers): No modifications at all, including the typos in `herdr`'s description ("terminl", "requies") — a local fix would make every future sync a manual merge for no routing benefit
- **unslop** (in superpowers): Six locally added patterns at the end of the `### Plain speech` section, not present upstream — preserve them on sync (manual merge, never a straight copy). **34. Describing the message instead of writing it** covers spans that refer to the text rather than the subject ("Two things to take into account:", "I should mention that...", "which brings us to the next point") at any position in a sentence, plus counting headings, which upstream does not cover at all. **35. Restating what you just said** covers a second pass over an idea at the same level of detail; upstream's 16 covers only the narrow case of a bold lead restating its own line. **36. Pronoun referent overload** covers the same pronoun standing for two different things in one sentence, or a dropped relative pronoun whose wrong attachment is the easier parse; the fix names the referent or restores the "that". Upstream's 28 has the backtrack test that finds these sentences, but its split-the-sentence fix cannot repair them. **37. Negation where a positive fits** covers double negatives ("not uncommon", "nothing prevents") and "not about" framing that say what something is not while leaving what it is unstated; the fix states the positive fact, and a single honest negative stays. **38. Actions turned into nouns** covers an event written as a noun phrase and hung on a weak verb ("the server failing to start goes in the chat"); the fix writes the clause with its actor and verb ("when the server fails to start, tell the user"). It was added 2026-09 after such a sentence in `mahou:telepathy` got through a full two-round pass, since no upstream rule covers nominalizations. **39. "What" clauses that withhold the content** covers a clause such as "what a thing is" or "what flows" that points at information without giving it; the fix writes the content or an example. It was added 2026-10-04. Two upstream rules carry a local sentence: 16 excludes slogan lead-ins ("**Shapes say what a thing is.**") from its bold lead-in exemption, and 32 adds artifacts that talk (a shape, label or test that "says" or "shows" something to state a rule). 34, 35, 36, 38 and 39 mirror the user's global CLAUDE.md `# Writing style` section, so they should move together. The Filadd copy was never given 37, so there 38 is 33 and 39 is 34, and the local sentences in 16 and 32 sit in its 15 and 29. An earlier local pattern, mannered prose, was dropped in the 2026-09 sync because upstream grew its own **32. Mannered prose** with the same intent (upstream's 33 is **Over-compression**, unrelated). The frontmatter is local as well: upstream's `disable-model-invocation: true` is dropped and the `Must always apply.` description is replaced by one scoped to document writing, because mahou's `write-documentation` invokes the skill by name and cannot if the flag is set. Keep the flag out and the scope in on sync. The whole method is local too, replacing upstream's `## Process`: a two-round pass where the first round is one opus agent with every rule scanning the pass documents, the main agent verifies and applies, and the second round is a fresh agent holding the first round's applied report, flagging only findings whose fix is gone or undone. `## How to scan` carries the fresh-agent rationale, `### Prompts` carries both templates (the scan prompt and the verification prompt), and `## Between rounds` carries the claim-verification steps for both rounds. A renumbered copy of the rules lives in the Filadd marketplace's `filadd-docs:unslop` skill (`plugins/docs/skills/unslop/SKILL.md`), and the two rule sets move together. A copy of the method lives in `filadd-docs:unslop-pass` (`plugins/docs/skills/unslop-pass/SKILL.md`), with the same two rounds. Everything else is upstream's
- All skills use simplified plugin metadata format (name + description only)

**Update workflow:**
- Upstream repositories:
  - `~/workspace/random/superpowers` - `systematic-debugging` (synced into **lesserpowers**)
  - `~/workspace/random/agentic-evolve` - evolve commands (synced into **lesserpowers**)
  - `~/workspace/random/agent-browser` - Browser automation CLI (synced into **superpowers**)
  - `~/workspace/random/dmmulroy-skills` - `bro`, `herdr` (synced into **superpowers**, verbatim). The repo ships other skills (Effect, Cloudflare, tech-spec, plus vendored copies of Matt Pocock's) — none are tracked; add one only on explicit request
  - `~/workspace/random/cursor-plugins` - `unslop` from `pstack/skills/` (synced into **superpowers**, plus six locally appended patterns). `cursor/plugins` is a monorepo and `pstack` alone ships ~40 skills (the `principle-*` family, `tdd`, `architect`, `why`, `swarm`); none of the rest are tracked, add one only on explicit request
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
- Plugin-specific skills (using-live-documentation, self-maintaining-claude-md, using-antigravity, agent-communication, financial-summary, using-code-directives, mermaid, show-markdown) have no upstream and are never modified during sync
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
