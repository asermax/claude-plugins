# aur

AUR package management commands for building and maintaining Arch User Repository packages.

## Description

This plugin provides commands for working with AUR (Arch User Repository) packages, including version bumping and package creation workflows.

## Commands

- `/bump-version` - Bump the AUR package version, update checksums, and commit
- `/create-aur-package` - Create a new AUR package

## Installation

### From Local Marketplace

1. Add this directory as a local marketplace:
   ```bash
   /plugin marketplace add local ~/workspace/asermax/claude-plugins
   ```

2. Install the plugin:
   ```bash
   /plugin install aur
   ```

### Direct Installation

```bash
/plugin install ~/workspace/asermax/claude-plugins/aur
```

## Version

1.0.0
