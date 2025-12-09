# Claude Code Plugins

Personal collection of Claude Code plugins for development workflows.

## Available Plugins

### aur

AUR package management commands for building and maintaining Arch User Repository packages.

**Commands:**
- `/aur:bump-version [version]` - Bump the AUR package version, update checksums, and commit
- `/aur:create-aur-package <package-name> <source-type>` - Create a new AUR package

[View Documentation](./aur/README.md)

### superpowers

Development workflow skills for systematic debugging, code review, planning, and more.

**Commands:**
- `/update-superpowers-skills` - Sync skills from upstream repositories and intelligently merge updates

**Skills:**
- Core Development Workflow (brainstorming, executing-plans, receiving-code-review, requesting-code-review, writing-plans)
- Debugging and Testing (root-cause-tracing, systematic-debugging, test-driven-development, testing-skills-activation, testing-skills-with-subagents)
- Documentation and Research (self-maintaining-claude-md, skill-creator, using-live-documentation, writing-skills)
- Project Management (using-beads)
- Multi-Agent Collaboration (agent-communication)

[View Documentation](./superpowers/README.md)

## Installation

### From Local Marketplace

1. Add this directory as a local marketplace:
   ```bash
   /plugin marketplace add local ~/workspace/asermax/claude-plugins
   ```

2. Install a plugin:
   ```bash
   /plugin install <plugin-name>
   ```

### Direct Installation

```bash
/plugin install ~/workspace/asermax/claude-plugins/<plugin-name>
```

## Repository Structure

```
.
├── .claude-plugin/
│   └── marketplace.json      # Marketplace configuration
├── aur/                       # AUR package management plugin
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── commands/
│   └── README.md
├── superpowers/               # Development workflow skills plugin
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── commands/
│   ├── skills/
│   ├── agents/
│   ├── hooks/
│   └── README.md
├── CLAUDE.md                  # Repository documentation for Claude Code
└── README.md
```
