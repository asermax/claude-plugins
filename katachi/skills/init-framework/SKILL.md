---
name: init-framework
description: Initialize the katachi framework directory structure
disable-model-invocation: true
---

# Initialize Framework

Initialize the katachi development framework directory structure in a project.

## Context

**You must load the following skills before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles and task management

## Process

### 1. Check Current State

Check if framework is already initialized:
- Does `docs/planning/` directory exist?

If yes, inform the user:
```
Framework directory structure already exists.

You can use these commands to create planning documents:
- `/katachi:vision` - Create project vision
- `/katachi:deltas` - Create the delta inventory
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
2. `/katachi:deltas` - Create the delta inventory

For existing projects with code:

Ask the user:
"This looks like an existing project with code. Would you like to run a full
project retrofit? This will discover your modules, create specs, designs,
decisions, and synthesize a vision document."

If yes → invoke the `katachi:retrofit-project` skill (it will take over from here)

If no → show individual commands:
- `/katachi:retrofit-spec <path>` - Document one module
- `/katachi:retrofit-design <ID>` - Create design from spec
- `/katachi:retrofit-decision <topic>` - Document one decision
- `/katachi:vision` - Create/synthesize vision

The deltas.py script is available at:
${CLAUDE_PLUGIN_ROOT}/scripts/deltas.py
```
