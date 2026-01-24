---
description: Initialize the katachi framework directory structure
---

# Initialize Framework

Initialize the katachi development framework directory structure in a project.

## Process

### 1. Check Current State

Check if framework is already initialized:
- Does `docs/planning/` directory exist?

If yes, inform the user:
```
Framework directory structure already exists.

You can use these commands to create planning documents:
- `/katachi:vision` - Create project vision
- `/katachi:features` - Extract and organize features
- `/katachi:dependencies` - Create dependency matrix and phases
```

### 2. Create Directory Structure

Create the framework directories:

```bash
mkdir -p docs/planning docs/feature-specs docs/feature-designs docs/feature-plans docs/architecture docs/design
```

### 3. Create CLAUDE.md

If CLAUDE.md doesn't exist, create it with this template:

```markdown
# Project: [Project Name]

## Quick Context

[TODO: Add 1-2 sentence description]

## Key Files

- `docs/planning/VISION.md` - Project vision
- `docs/planning/DELTAS.md` - Feature inventory
- `docs/planning/DEPENDENCIES.md` - Implementation phases

## Available Commands

Use `/katachi:` commands to work with the framework.

## Current Focus

[TODO: Update when starting a feature]
```

### 4. Next Steps

Inform the user about next steps:

```
Framework initialized! Here are the typical next steps:

For new projects:
1. `/katachi:vision` - Define what you're building
2. `/katachi:features` - Break down into features
3. `/katachi:dependencies` - Plan implementation phases

For existing projects:
1. `/katachi:retrofit-spec <path>` - Document existing code
2. `/katachi:retrofit-design <ID>` - Create designs from specs
3. `/katachi:features` - Organize retrofitted features
4. `/katachi:vision` - Synthesize vision from features

The deltas.py script is available at:
${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py
```
