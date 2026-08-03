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

- **sync-upstream**: Sync this marketplace's skills, commands, and context from their upstream source repos (`~/workspace/random/superpowers`, `~/workspace/random/quint-code`, `~/workspace/random/agentic-evolve`, `~/workspace/random/agent-browser`). Preserves plugin customizations (namespace prefixes, removed cross-skill references) and asks before applying.
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
- **agent-browser**: Browser automation CLI for web testing, form filling, screenshots, and data extraction (synced from `~/workspace/random/agent-browser`)

**Key workflows:**
- Skills directory contains full skill definitions from upstream repositories
- Upstream sources synced via the marketplace-level `sync-upstream` skill (see "Repo-level skills"):
  - `~/workspace/random/agent-browser` - Browser automation CLI
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

**Skills (15-skill catalog, mirrored from `internal/cli/skill/h-*/SKILL.md`):**

*Auto-triggering* — fire when their description matches operator context:
- `h-reason`: Umbrella entry point — full reasoning palette (framing, exploration, comparison, verification, notes, slideument patterns) in one skill. Manual `/h-reason` always works; auto-fires on broad "let's think this through" signals where no specialized skill matches sharply.
- `h-frame`: Frame a problem (B.4.1 stabilize + problem typing + umbrella-word repair) before solutioning
- `h-diagnose`: Diagnose a failure with parallel rival-hypothesis testing (one subagent per hypothesis, prevents anchoring)
- `h-explore`: Generate distinct candidate variants with NQD diversity discipline
- `h-compare`: Fair comparison with dim-wise parallel scoring + Pareto front (not a scalar winner)
- `h-verify`: Baseline → measure → evidence loop with drift detection
- `h-status`: Read-only project FPF state dashboard
- `h-onboard`: First-frame ceremony for projects new to haft
- `h-spec-cover`: Spec-coverage check with blind/stale module triage
- `h-note`: Lightweight micro-decision recording

*Manual-only* (`disable-model-invocation: true`, Transformer Mandate — never auto-fired):
- `h-decide`: Record a binding DecisionRecord with full DRR (problem frame, decision/contract, rationale, consequences)
- `h-commission`: WorkCommission lifecycle — create commissions from active decisions

*Subroutines* (called from other skills or invoked explicitly for a specific FPF sub-discipline):
- `h-abduct`: Pure B.5.2 abductive four-step (frame prompt → ≥3 rivals → filters → prime)
- `h-boundary-unpack`: A.6.B L/A/D/E decomposition of boundary statements
- `h-semio-review`: X-FANOUT-AUDIT — concept-rename / spec-consistency audit

**Recommended workflow:** describe the problem (h-frame fires) → `/h-explore` → `/h-compare` → manual `/h-decide` → `/h-verify`. Routing reliability is testable via `haft check routing`.

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

**Primitives, model-invoked, reached by name:** `parley` (the interview: one question at a time, facts are yours to look up, decisions are the user's, never answer for the witness), `log`, `take` (**the shared session loop** both dispatchers call: load the adventure at low resolution, read the bearings, claim, get onto the branch, solve by type, close with `solve`), `design` (**the step Matt's set lacks** — one descent, not two modes: the whole thing (modules, seams, data flow, data structures, patterns) → this change against it (what is added, modified, deleted) → inside each one (classes, functions, types, signatures). **Go down until you hit something you cannot settle: that is a trial**, which is why shaping a journey stops partway and building goes to the bottom. Signatures yes, file paths no.), `research`, `spike`, `build`, `lore`, `solve` (the closer, and the only thing that moves a quest into reach: write the answer, set the status, **clear it from every `blocked_by` naming it**, gist it into the solved index, graduate what it made visible), `loot` (three routes out of a session: decided work → `log`, a finding → `lore`, a process lesson → the charter's own section), `strike` (**the only thing that deletes a record** — check the effort really ended, close out what is open, `loot`, remove the spike tree, delete every record in the effort, offer one commit named after it).

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

`superpowers` and `lesserpowers` are sibling plugins. `superpowers` keeps the curated, most-used surface (agent-browser, mermaid-validation, show-markdown, the three `using-` skills, plus the situation-state and process-directives commands); `lesserpowers` holds everything else that was split out (systematic-debugging, self-maintaining-claude-md, hunk-review, agent-communication, financial-summary, and the evolve commands). They have no cross-references — the split is clean.

**Custom modifications:**
- **superpowers skills**: Use `superpowers:` namespace prefix for any cross-skill reference
- **lesserpowers skills**: Use `lesserpowers:` namespace prefix for any cross-skill reference
- **systematic-debugging** (in lesserpowers): Removed reference to verification-before-completion skill (supporting techniques are now included as documentation)
- **agent-browser** (in superpowers): Local-only "Visible browser inside herdr" section, not present upstream — preserve it on sync. It probes `HERDR_ENV` + the `official.browser` plugin root via `!`-preprocessing at skill load and echoes the already-resolved pane commands, so the agent doesn't spend turns on discovery (same trick as `hunk-review`)
- All skills use simplified plugin metadata format (name + description only)

**Update workflow:**
- Upstream repositories:
  - `~/workspace/random/superpowers` - `systematic-debugging` (synced into **lesserpowers**)
  - `~/workspace/random/agentic-evolve` - evolve commands (synced into **lesserpowers**)
  - `~/workspace/random/agent-browser` - Browser automation CLI (synced into **superpowers**)
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
