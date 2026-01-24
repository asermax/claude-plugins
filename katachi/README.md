# katachi (形)

A spec-driven development framework plugin for Claude Code.

**katachi** means "form" or "shape" in Japanese - the structure you give to your projects.

## Philosophy

- **Spec-driven development** - Define what to build before coding
- **Iterative growth** - Start with MVP, add features progressively
- **Progressive adoption** - Use as much or as little as you need
- **Retrofit support** - Document existing code, not just new projects

## Quick Start

```
/katachi:init-framework    # Initialize framework in your project
```

The framework will detect your project state and offer appropriate options:
- **New project**: Quick-start (MVP) or full framework setup
- **Existing project**: Retrofit options to document existing code
- **Partial setup**: Complete missing pieces

## Commands

### Initialization
- `/katachi:init-framework` - Initialize framework in a project
- `/katachi:eject` - Eject plugin into self-contained project structure

### Planning
- `/katachi:vision` - Create/update project vision
- `/katachi:deltas` - Extract deltas from vision
- `/katachi:dependencies` - Build dependency matrix

### Per-Delta Workflow
- `/katachi:add-delta [description]` - Add new delta on-the-go
- `/katachi:spec-delta <ID>` - Write delta specification
- `/katachi:design-delta <ID>` - Write design rationale
- `/katachi:plan-delta <ID>` - Create implementation plan
- `/katachi:implement-delta <ID>` - Implement following plan
- `/katachi:reconcile-delta <ID>` - Update feature documentation

### Migration
- `/katachi:migrate-to-deltas` - Migrate existing katachi project to delta-based workflow

### Retrofit
- `/katachi:retrofit-spec <path>` - Create spec from existing code
- `/katachi:retrofit-decision <topic>` - Document existing decisions

### Documentation
- `/katachi:decision` - Document architecture/design decision
- `/katachi:analyze` - Gap analysis
- `/katachi:record-learnings` - Extract session learnings

### Development
- `/katachi:review-code` - Review code with decision compliance
- `/katachi:commit` - Create conventional commits

## Agents

The framework uses specialized agents for validation:

| Agent | Purpose |
|-------|---------|
| `spec-reviewer` | Review specs for completeness and testability |
| `design-reviewer` | Review designs for coherence and pattern alignment |
| `plan-reviewer` | Review plans for step completeness |
| `code-reviewer` | Review code against specs, designs, and decisions |
| `impact-analyzer` | Analyze change impact on dependencies |
| `codebase-analyzer` | Infer requirements/decisions from existing code |

## Project Structure

After initialization, your project will have:

```
your-project/
└── docs/
    ├── planning/
    │   ├── VISION.md        # Project vision and scope
    │   ├── DELTAS.md        # Delta inventory (work items)
    │   └── DEPENDENCIES.md  # Dependency matrix
    ├── delta-specs/         # Working delta specifications
    ├── delta-designs/       # Working delta designs
    ├── delta-plans/         # Implementation plans
    ├── feature-specs/       # Long-lived feature documentation
    ├── feature-designs/     # Long-lived design documentation
    ├── architecture/        # Architecture Decision Records (ADRs)
    └── design/              # Design patterns (DES)
```

## Workflow

### For New Projects

1. `/katachi:init-framework` - Choose quick-start or full
2. `/katachi:vision` - Define problem and scope
3. `/katachi:deltas` - Extract deltas (work items)
4. `/katachi:dependencies` - Build dependency matrix
5. For each delta: spec → design → plan → implement → reconcile

### For Existing Projects

1. `/katachi:init-framework` - Choose retrofit
2. `/katachi:retrofit-spec` - Document existing modules
3. `/katachi:retrofit-decision` - Document existing choices
4. Continue with normal workflow

### Adding Deltas Mid-Project

1. `/katachi:add-delta` - Describe the new work item
2. Framework assigns ID, analyzes dependencies, integrates into matrix
3. Continue with spec → design → plan → implement → reconcile

## Ejecting the Plugin

If you want to make your project self-contained and independent of the katachi plugin:

```
/katachi:eject
```

This will:
- Copy all commands to `.claude/commands/`
- Copy reviewer agents to `.claude/agents/`
- Copy deltas.py script to `scripts/`
- Generate framework documentation in `docs/`
- Copy all templates to `docs/templates/`
- Transform all plugin references to local paths

After ejecting, you can uninstall the plugin and continue using all katachi commands as local commands.
