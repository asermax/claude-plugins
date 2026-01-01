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

### Planning
- `/katachi:vision` - Create/update project vision
- `/katachi:features` - Extract features from vision
- `/katachi:dependencies` - Build dependency matrix

### Per-Feature
- `/katachi:spec-feature <ID>` - Write feature specification
- `/katachi:design-feature <ID>` - Write design rationale
- `/katachi:plan-feature <ID>` - Create implementation plan
- `/katachi:implement-feature <ID>` - Implement following plan

### Iterative Development
- `/katachi:add-feature` - Add new feature on-the-go
- `/katachi:analyze-impact` - Analyze change impact

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
├── planning/
│   ├── VISION.md        # Project vision and scope
│   ├── FEATURES.md      # Feature inventory
│   └── DEPENDENCIES.md  # Dependency matrix
├── specs/               # Feature specifications (WHAT)
├── designs/             # Design rationale (WHY/HOW)
├── plans/               # Implementation plans (STEPS)
└── docs/
    ├── architecture/    # Architecture Decision Records (ADRs)
    └── design/          # Design patterns (DES)
```

## Workflow

### For New Projects

1. `/katachi:init-framework` - Choose quick-start or full
2. `/katachi:vision` - Define problem and scope
3. `/katachi:features` - Extract features
4. `/katachi:dependencies` - Build matrix, derive phases
5. For each feature: spec → design → plan → implement

### For Existing Projects

1. `/katachi:init-framework` - Choose retrofit
2. `/katachi:retrofit-spec` - Document existing modules
3. `/katachi:retrofit-decision` - Document existing choices
4. Continue with normal workflow

### Adding Features Mid-Project

1. `/katachi:add-feature` - Describe the new feature
2. Framework assigns ID, analyzes dependencies, integrates into matrix
3. Continue with spec → design → plan → implement
