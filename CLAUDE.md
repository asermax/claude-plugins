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
Experiment-driven development framework. A generalization of the experimentation framework proven in the `zukai` project (`~/workspace/asermax/zukai`), plus a katachi-inspired product-development track. Sibling to `katachi`: where katachi bakes validation into its design phase via review loops, zenku's validation comes from **experiments**, and its product-dev docs are **fed from** those experiments rather than re-validated.

**Two halves, joined at `PRODUCT.md`:**

*Experimentation* (generalized from zukai, domain/stack-agnostic):
- `capture`: append an immature idea to `BACKLOG.md` (free, no interview)
- `experiment-start`: promote an idea into a numbered one-pager with a pre-registered single question, falsifiable hypothesis, and two-lens (task + insight) judging criteria; scaffold a spike
- `experiment-run`: collaboratively shape the minimal spike, build it with spike discipline against real data, assist the user through judging sessions while scribing the insight log (includes the fresh-subagent-driver harness discipline for agent-as-judged-actor experiments)
- `experiment-conclude`: force a verdict against the pre-registered criteria, append a `LEARNINGS.md` entry, promote proven pieces into `PRODUCT.md` under a milestone

*Product development* (new, experiment-fed; lighter than katachi — no ephemeral delta tier):
- `roadmap`: break a `PRODUCT.md` milestone into features with ordering, a parallelizable set, and a cycle-checked dependency graph → `docs/planning/ROADMAP.md`
- `spec`: durable feature spec grounded in the source experiments → `docs/feature-specs/<feature>.md`
- `design`: durable feature design from spec + experiment evidence (spike is reference, not code to copy); creates ADR/DES inline → `docs/feature-designs/<feature>.md`, `docs/architecture/`, `docs/design/`
- `implement`: build against the design + a code-review loop
- `reconcile`: fold what was built back into the durable docs (surgical change, document-the-present), promote decisions to ADR/DES
- `patch`: compressed single-session alternative to the full chain — fuses spec + design into one plan-mode doc (no intermediate files), then implement + reconcile with a single collaborative checkpoint; grounded in a free-text change, a roadmap feature, or an experiment; drives ROADMAP markers to `✓ Reconciled` only when the target is roadmapped, and steers genuinely-new unvalidated capabilities to the experiment track

*Supporting:*
- `framework-core` (`user-invocable: false`): shared collaborative principles, the experiment-sandbox definition (properties, not a stack), the artifact/doc map, project-convention lookup, reviewer-dispatch table, and template pointers
- `init`: scaffold the artifacts + docs tree and record project conventions in the project's CLAUDE.md

**Agents:** `experiment-researcher`, `onepager-reviewer`, `shape-reviewer`, `conclusion-reviewer` (experimentation); `spec-reviewer`, `design-reviewer`, `code-reviewer`, `reconciliation-reviewer` (product). Reviewers run the silent draft→validate→present loop; criteria check doc quality **and experiment-grounding**, not idea validation.

**Key conventions:**
- No config file — project-specific bits (purpose, spike location, build/test/lint commands) live in a `## zenku` section of the project's own CLAUDE.md, following katachi's convention-based approach
- All skills/agents use the `zenku:` namespace prefix; templates live under `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/`
- Per-folder doc indexes (katachi convention): each `docs/` content folder carries a `README.md` catalog — `feature-specs/`, `feature-designs/`, `architecture/` (ADR), `design/` (DES). Create-if-missing, keep-current: `spec`/`design`/`reconcile`/`patch` upsert rows as they write docs; `init` seeds the empty stubs; `doc-index-templates.md` defines the shapes. The ROADMAP owns feature ordering/dependencies; the feature indexes are a flat capability catalog
- Experiment sandboxes are stack-agnostic — defined by properties (isolated, throwaway, minimal, real-data, easy to run/discard); the zukai Vite/React layout survives only as an optional worked example
- Generalized from zukai (stripped: "visual code comprehension" mission, hardcoded shin-sekai note sync, Vite/React `src/experiments/registry.ts` layout, `pnpm lint && build`, "real change = a PR")

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
