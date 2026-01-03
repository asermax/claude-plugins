# Beads Plugin

Dependency-aware issue tracking for AI-supervised workflows using the bd CLI.

## Overview

Beads (bd) is a dependency-aware issue tracker designed for AI-supervised workflows. Track all discovered work immediately, model dependencies explicitly, and use `bd ready` to find unblocked work.

**Core principle:** Every piece of work gets tracked as an issue with proper dependencies. No work is too small to track.

## How It Works

This plugin injects comprehensive beads documentation into every Claude Code session via a SessionStart hook. The documentation is automatically available on:
- Session startup
- Session resume
- After context compaction

No need to invoke a skill - the guidance is always present.

## Core Workflows

- **Database initialization**: Check for local database before using bd (`ls .beads/*.db || bd init`)
- **Issue creation**: Track all discovered work immediately with `bd create`
- **Finding next work**: Use `bd ready` to find unblocked work (not `bd list`)
- **Dependency modeling**: Use `blocks`, `related`, `parent-child`, `discovered-from` types
- **Epic-task hierarchy**: Parent-child relationships for complex features
- **Cycle prevention**: DAG enforcement with cycle detection

## Installation

### From Local Marketplace

1. Add this directory as a local marketplace:
   ```bash
   /plugin marketplace add local ~/workspace/asermax/claude-plugins
   ```

2. Install the plugin:
   ```bash
   /plugin install beads
   ```

### Direct Installation

```bash
/plugin install ~/workspace/asermax/claude-plugins/beads
```

## Prerequisites

The bd CLI must be installed separately. This plugin provides workflow guidance, not the bd binary itself.

## Version

1.0.0
