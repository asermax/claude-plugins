# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a personal collection of Claude Code plugins that provide workflow automation for development tasks. The repository is structured as a local marketplace containing multiple plugins, each with their own commands and functionality.

## Repository Structure

- **Root level**: Marketplace configuration (`.claude-plugin/marketplace.json`)
- **Plugin directories**: Each subdirectory (`aur/`, `chores/`, `superpowers/`) is a separate plugin
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

### chores
Repository maintenance automation for GitHub workflows, primarily targeting the "filadd" organization.

**Commands:**
- `/chores:create-pull-request <repo-name> <branch-name>`: Creates PR from feature branch, analyzes all commits, generates description, auto-assigns Copilot reviewer
- `/chores:release-repo <repo-name>`: Finds/creates release PR, analyzes changes, merges and creates GitHub release
- `/chores:get-auth-token <email-or-user-id> [--k8s]`: Generates authentication tokens for users
- `/chores:update-common-db-models [async-commit] [pydantic_v2-commit] [main-commit]`: Bulk updates common-db-models dependency across 12 repositories

**Key workflows:**
- Repository names can be short (e.g., `scheduler-api`) or full (`filadd/scheduler-api`)
- Branch names can be partial matches (e.g., `fix-typo` matches `feat/fix-migratio-typo`)
- PR descriptions are generated from comprehensive commit analysis (all commits, not just latest)
- Release PRs use timestamp format: `Release YYYY-MM-DD HH:MM:SS +0000`
- Releases created via `gh release create` with auto-generated notes
- Semantic versioning: patch for fixes, minor for features

**MCP Integration:**
- Uses GitHub MCP server for all GitHub operations
- Configuration in `.mcp.json` with GitHub Copilot API endpoint

### superpowers
Development workflow skills for systematic debugging, code review, planning, and more.

**Commands:**
- `/update-superpowers-skills`: Sync skills from two upstream repositories (superpowers and anthropic_skills), compare differences, and intelligently merge updates while preserving plugin customizations

**Skills:**
The plugin provides a collection of proven workflow skills organized by category:

*Core Development Workflow:*
- **brainstorming**: Refine rough ideas into fully-formed designs through structured exploration (integrates with beads for issue tracking)
- **executing-plans**: Execute implementation plans in controlled batches with review checkpoints
- **receiving-code-review**: Process code review feedback with technical rigor and verification
- **requesting-code-review**: Request code reviews before merging to verify work meets requirements
- **writing-plans**: Create comprehensive implementation plans using beads issues with dependencies

*Debugging and Testing:*
- **root-cause-tracing**: Trace bugs backward through call stack to identify source of issues
- **systematic-debugging**: Four-phase debugging framework ensuring understanding before solutions
- **test-driven-development**: Write test first, watch it fail, write minimal code to pass
- **testing-skills-with-subagents**: Apply TDD to process documentation by testing with subagents before deployment

*Documentation and Research:*
- **self-maintaining-claude-md**: Keep CLAUDE.md instruction file current with high-level project state
- **skill-creator**: Guide for creating effective skills with specialized knowledge and workflows
- **using-live-documentation**: Dispatch subagents to fetch library documentation with massive context savings (10,000-20,000 tokens per search)
- **writing-skills**: Create and refine process documentation skills using TDD methodology

*Project Management:*
- **using-beads**: Dependency-aware task management with bd - track all work, model dependencies, use bd ready for next tasks

**Key workflows:**
- Skills directory contains full skill definitions from two upstream repositories
- Update command syncs with `~/workspace/random/superpowers` and `~/workspace/random/anthropic_skills`
- Shows high-level summary of changes before updating
- Intelligently merges updates while preserving plugin-specific customizations
- Skills are automatically available via Claude Code's skill system
- All skills use `superpowers:` namespace prefix for skill references

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

### Chores Plugin Specifics

**Release workflow critical rules:**
- ALWAYS create releases using `gh release create` directly, never delegate to GitHub Copilot
- ALWAYS use `merge_method: "merge"` for release PRs (never squash/rebase)
- When no release PR exists, check for unreleased commits and offer to create one
- Version format in release title: `<version-number>: <descriptive-title>`

**PR creation critical rules:**
- Analyze ALL commits on branch, not just the latest
- Generate clean titles without conventional commit prefixes (no "feat:", "fix:", etc.)
- Keep descriptions concise and factual - only what's actually in the commits
- List only most relevant files, omit minor config changes
- Always assign GitHub Copilot as reviewer after creation

**Common-db-models update specifics:**
- 12 repositories across 3 branch groups (async, pydantic_v2, main)
- Poetry-based repos: update pyproject.toml, Dockerfile, run `poetry lock`
- Dockerfile-only repos: modify git clone to checkout specific commit
- All work done locally, then push and create PRs
- Branch naming: `update-common-db-models-{timestamp}`

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
- **brainstorming**: Merges design and planning phases into epic-task bead structure; removed git worktree dependencies
- **writing-plans**: Uses epic-task hierarchy with parent-child beads for design documentation
- **executing-plans**: Simplified completion workflow; aware of epic-task hierarchy pattern
- **systematic-debugging**: Removed references to skills not included in plugin (defense-in-depth, condition-based-waiting, verification-before-completion)
- **requesting-code-review**: Intentionally broadened to "ANY task that modifies code" instead of "major features"
- Three plugin-specific skills added: using-beads, using-live-documentation, self-maintaining-claude-md
- All skills use simplified plugin metadata format (name + description only)

**Update workflow:**
- Two upstream repositories: `~/workspace/random/superpowers` and `~/workspace/random/anthropic_skills`
- Pull latest changes from both repositories' `main` branch
- Compare 10 superpowers skills and 1 anthropic_skills skill
- Show high-level summary of changes (not detailed line-by-line diffs)
- Intelligently merge updates: adapt conceptual improvements while preserving plugin customizations
- Plugin-specific skills (using-beads, using-live-documentation, self-maintaining-claude-md) are never modified
- Confirm before updating skills
- Skills are available immediately after update via Claude Code's skill system

**Skills structure:**
- Each skill directory contains SKILL.md and optional test cases
- Skills use plugin metadata format: name + description (not when_to_use, version, languages)
- Skills are loaded automatically by Claude Code from the `skills/` directory
- No manual activation required - skills are always available

**Beads integration:**
- Epic-task hierarchy pattern: epic beads contain design documentation, child task beads contain implementation steps
- brainstorming merges design and planning into single phase that creates epic and task beads
- writing-plans, executing-plans, and using-beads skills all support epic-task hierarchy
- using-beads skill provides full bd workflow documentation including parent-child relationships

## Repository Conventions

- No package.json (this is not a Node.js project)
- No build/test/lint commands (documentation-based plugins)
- Version management via individual `plugin.json` files
- Each plugin is independently versioned
