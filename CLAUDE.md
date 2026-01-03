# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a personal collection of Claude Code plugins that provide workflow automation for development tasks. The repository is structured as a local marketplace containing multiple plugins, each with their own commands and functionality.

## Repository Structure

- **Root level**: Marketplace configuration (`.claude-plugin/marketplace.json`)
- **Plugin directories**: Each subdirectory (`aur/`, `superpowers/`, `beads/`, `quint/`) is a separate plugin
  - `.claude-plugin/plugin.json`: Plugin metadata
  - `commands/`: Slash command definitions (`.md` files)
  - `.mcp.json`: MCP server configuration (if applicable)
  - `README.md`: Plugin documentation

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
Development workflow skills for systematic debugging, code review, planning, and more.

**Commands:**
- `/sync-upstream`: Sync plugins from upstream repositories (superpowers, claudekit-skills, quint, agentic-evolve), compare differences, and intelligently merge updates while preserving plugin customizations
- `/superpowers:evolve-situation-state <input> [state-file]`: Maintain a living state document that evolves incrementally from various inputs (transcripts, documents, external sources); auto-detects input types and uses available tools to fetch content
- `/superpowers:evolve <problem>`: Master dispatcher for evolutionary algorithm discovery - routes to specialized modes:
  - `/superpowers:evolve-perf`: Optimize runtime speed (ops/sec, latency)
  - `/superpowers:evolve-size`: Optimize code size (bytes, chars) - code golf
  - `/superpowers:evolve-ml`: Optimize ML metrics (F1, loss)
- `/superpowers:process-directives <request>`: Scan and process code directives (@implement, @docs, @refactor, @test, @todo) based on natural language request; applies context-dependent transformations

**Skills:**
The plugin provides a collection of proven workflow skills organized by category:

*Core Development Workflow:*
- **requesting-code-review**: Request code reviews before merging to verify work meets requirements
- **using-code-directives**: Recognize and handle code directives (@implement, @docs, @refactor, @test, @todo) embedded in comments with context-dependent transformations and security validation for external URLs

*Debugging and Testing:*
- **systematic-debugging**: Four-phase debugging framework ensuring understanding before solutions (includes supporting techniques: root-cause-tracing, defense-in-depth, condition-based-waiting)
- **testing-skills-activation**: Systematically test and iterate on skill descriptions to ensure correct activation patterns (15-25 test cases, 90%+ accuracy target)

*Documentation and Research:*
- **self-maintaining-claude-md**: Keep CLAUDE.md instruction file current with high-level project state
- **using-live-documentation**: Dispatch subagents to fetch library documentation with massive context savings (10,000-20,000 tokens per search)

*Multi-Agent Collaboration:*
- **agent-communication**: Enable communication between multiple Claude Code instances across repositories using file-based chat system (agent daemon, chat CLI)

**Key workflows:**
- Skills directory contains full skill definitions from upstream repositories
- Sync command updates from upstream source:
  - `~/workspace/random/superpowers` - Core workflow skills
- Shows high-level summary of changes before updating
- Intelligently merges updates while preserving plugin-specific customizations
- Skills are automatically available via Claude Code's skill system
- All skills use `superpowers:` namespace prefix for skill references

### quint
FPF (First Principles Framework) methodology for structured decision-making.

**Commands:**
- `/q0-init`: Initialize knowledge base and bounded context
- `/q1-hypothesize`: Generate L0 hypotheses (abduction)
- `/q1-add`: Manually add hypothesis
- `/q2-verify`: Verify logic, promote L0→L1 (deduction)
- `/q3-validate`: Validate empirically, promote L1→L2 (induction)
- `/q4-audit`: Calculate trust scores and assurance
- `/q5-decide`: Select winner, create Design Rationale Record
- `/q-status`: Display current cycle state
- `/q-query`: Search knowledge base
- `/q-decay`: Report expired evidence (epistemic debt)
- `/q-actualize`: Reconcile KB with code changes
- `/q-reset`: Discard current cycle

**MCP Server:**
- Binary built on-demand via SessionStart hook (first use)
- Built to `${CLAUDE_PLUGIN_ROOT}/bin/quint-code` (within plugin)
- Source cached in `~/.cache/claude-plugins/quint-code/` for building
- Manages state in SQLite database (`.quint/quint.db`)

**Context Injection:**
- SessionStart hook injects PRINCIPLES.md (upstream's CLAUDE.md)
- Prepares agent with FPF methodology and decision frameworks
- Context synced from `~/workspace/random/quint-code/CLAUDE.md`

**Key concepts:**
- **Knowledge levels**: L0 (raw) → L1 (verified) → L2 (validated) → Invalid
- **WLNK**: Weakest link principle for trust calculation
- **Congruence Level**: CL0-CL3 rating for evidence applicability to project context
- **Epistemic debt**: Evidence that expires over time, requires conscious re-evaluation
- **Design Rationale Records**: Auditable decision documentation with alternatives considered

**Key workflows:**
- Commands synced from `~/workspace/random/quint-code`
- PRINCIPLES.md updated from upstream CLAUDE.md during sync
- MCP binary builds automatically on first session start (slow), then cached (fast)
- Commands use MCP tools directly (no customization)
- Use for architectural decisions with long-term consequences
- Skip for quick fixes or easily reversible decisions

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

### Superpowers Plugin Specifics

**Custom modifications:**
- **All skills**: Use `superpowers:` namespace prefix for all skill references
- **systematic-debugging**: Removed reference to verification-before-completion skill (supporting techniques are now included as documentation)
- **requesting-code-review**: Intentionally broadened to "ANY task that modifies code" instead of "major features"; simplified SHA commands to run directly without variable assignment
- Multiple plugin-specific skills added: using-live-documentation, self-maintaining-claude-md, testing-skills-activation, using-gemini, agent-communication, financial-summary, using-code-directives
- All skills use simplified plugin metadata format (name + description only)

**Update workflow:**
- Upstream repositories:
  - `~/workspace/random/superpowers` - Core workflow skills
  - `~/workspace/random/agentic-evolve` - Evolutionary algorithm discovery
- Pull latest changes from all repositories' `main` branch
- Tracked skills from superpowers: requesting-code-review, systematic-debugging
- Tracked commands from agentic-evolve (copied directly to superpowers/commands/):
  - evolve.md (master dispatcher)
  - evolve-perf.md (runtime speed optimization)
  - evolve-size.md (code size/bytes optimization)
  - evolve-ml.md (ML accuracy optimization)
- Show high-level summary of changes (not detailed line-by-line diffs)
- Intelligently merge updates: adapt conceptual improvements while preserving plugin customizations
- Plugin-specific skills (using-live-documentation, self-maintaining-claude-md, testing-skills-activation, using-gemini, agent-communication, financial-summary, using-code-directives) are never modified
- Confirm before updating skills
- Skills are available immediately after update via Claude Code's skill system


**Skills structure:**
- Each skill directory contains SKILL.md and optional test cases
- Skills use plugin metadata format: name + description (not when_to_use, version, languages)
- Skills are loaded automatically by Claude Code from the `skills/` directory
- No manual activation required - skills are always available

**Agents:**
- `agents/code-reviewer.md`: Internal agent used by the requesting-code-review skill
  - Copied directly from upstream `~/workspace/random/superpowers/agents/code-reviewer.md`
  - NOT customized - we use upstream version as-is
  - Invoked via Task tool with subagent_type: superpowers:code-reviewer
- `agents/documentation-searcher.md`: Internal agent used by the using-live-documentation skill
  - Plugin-specific agent (no upstream source)
  - Searches Context7 for library documentation and provides focused synthesis
  - Uses Context7 MCP tools (resolve-library-id, get-library-docs)
  - Invoked via Task tool with subagent_type: superpowers:documentation-searcher
- `skills/requesting-code-review/code-reviewer.md`: Agent template
  - Copied directly from upstream `~/workspace/random/superpowers/skills/requesting-code-review/code-reviewer.md`
  - NOT customized - we use upstream version as-is
- Agent definitions include frontmatter with name, description, tools, and model

**Hooks:**
- `hooks/hooks.json`: Plugin hooks configuration
- `hooks/background-agent.sh`: PreToolUse hook that auto-backgrounds `agent.py` and `broker.py` commands
- `hooks/auto-approve.sh`: PermissionRequest hook that auto-approves superpowers skill invocations and bash commands referencing superpowers paths

## Repository Conventions

- No package.json (this is not a Node.js project)
- No build/test/lint commands (documentation-based plugins)
- Version management via individual `plugin.json` files
- Each plugin is independently versioned
