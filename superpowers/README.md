# superpowers

Development workflow skills for systematic debugging, code review, planning, and more.

## Description

This plugin provides a collection of Claude Code skills that establish proven workflows for common development tasks. These skills help ensure consistent, high-quality approaches to debugging, code review, planning, and implementation.

## Skills

The plugin includes the following skills:

### Core Development Workflow
- **brainstorming**: Refine rough ideas into fully-formed designs through structured exploration (integrates with beads for issue tracking)
- **executing-plans**: Execute implementation plans in controlled batches with review checkpoints
- **receiving-code-review**: Process code review feedback with technical rigor and verification
- **requesting-code-review**: Request code reviews before merging to verify work meets requirements
- **writing-plans**: Create comprehensive implementation plans using beads issues with dependencies

### Debugging and Testing
- **root-cause-tracing**: Trace bugs backward through call stack to identify source of issues
- **systematic-debugging**: Four-phase debugging framework ensuring understanding before solutions

### Documentation and Research
- **self-maintaining-claude-md**: Keep CLAUDE.md instruction file current with high-level project state
- **using-live-documentation**: Dispatch subagents to fetch library documentation with massive context savings (10,000-20,000 tokens per search)
- **writing-skills**: Apply TDD to process documentation by testing with subagents

### Project Management
- **using-beads**: Dependency-aware task management with bd - track all work, model dependencies, use bd ready for next tasks

## Commands

- `/superpowers:update-skills`: Pull latest changes from the upstream superpowers repository and show differences

## Installation

### From Local Marketplace

1. Add this directory as a local marketplace:
   ```bash
   /plugin marketplace add local ~/workspace/asermax/claude-plugins
   ```

2. Install the plugin:
   ```bash
   /plugin install superpowers
   ```

### Direct Installation

```bash
/plugin install ~/workspace/asermax/claude-plugins/superpowers
```

## Updating Skills

To sync skills with the upstream repository:

```bash
/superpowers:update-skills
```

This command will:
1. Pull latest changes from `~/workspace/random/superpowers`
2. Compare existing skills with updated versions
3. Show differences for each skill
4. Ask for confirmation before updating

## Version

1.0.0
