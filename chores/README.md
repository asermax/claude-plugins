# chores

Repository maintenance commands for releases and pull requests using GitHub.

## Description

This plugin provides commands for common repository maintenance tasks like creating releases and pull requests, with integrated GitHub MCP server support.

## Commands

- `/release-repo` - Create a repository release
- `/create-pull-request` - Create a pull request

## MCP Servers

This plugin includes configuration for the GitHub MCP server, providing access to GitHub operations.

## Installation

### From Local Marketplace

1. Add this directory as a local marketplace:
   ```bash
   /plugin marketplace add local ~/workspace/asermax/claude-plugins
   ```

2. Install the plugin:
   ```bash
   /plugin install chores
   ```

### Direct Installation

```bash
/plugin install ~/workspace/asermax/claude-plugins/chores
```

## Version

1.0.0
