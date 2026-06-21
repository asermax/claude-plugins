# superpowers

Curated development workflow skills for browser automation, documentation, and code directives.

## Description

This plugin provides a focused collection of Claude Code skills for common development tasks. Secondary skills and the evolutionary-algorithm commands were split into the companion `lesserpowers` plugin.

## Skills

The plugin includes the following skills:

### Core Development Workflow
- **using-code-directives**: Recognize and handle code directives (@implement, @docs, @refactor, @test, @todo) embedded in comments with context-dependent transformations

### Documentation and Research
- **using-live-documentation**: Dispatch subagents to fetch library documentation with massive context savings (10,000-20,000 tokens per search)

### Browser Automation
- **agent-browser**: Browser automation CLI for web testing, form filling, screenshots, and data extraction

### Diagrams and Rendering
- **mermaid-validation**: Validate mermaid diagram syntax after writing mermaid code blocks
- **show-markdown**: Render markdown content in the browser with styling

### Other
- **using-antigravity**: Analyze images, videos, fetch web content, and search Google using Antigravity CLI

## Commands

- `/superpowers:evolve-situation-state <input> [state-file]`: Maintain a living state document that evolves incrementally from transcripts, documents, and external sources
- `/superpowers:generate-summary-from-situation-state <state-file> [output]`: Generate an abridged summary from a situation state file
- `/superpowers:generate-tech-validation-from-situation-state <state-file> [output]`: Generate a technical validation document from a situation state file
- `/superpowers:process-directives <request>`: Scan and process code directives based on natural language request
  - Example: `/superpowers:process-directives "implement all @implement directives in src/"`
  - Example: `/superpowers:process-directives "process @todo comments in auth module"`
  - Supports @implement, @docs, @refactor, @test, @todo directives
  - Applies context-dependent transformations (remove vs. convert to docs)

## Agents

- `agents/documentation-searcher.md`: Internal agent used by the using-live-documentation skill to search Context7 for library docs

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

Skills are synced from their upstream repositories via the marketplace-level `sync-upstream` skill. From inside this marketplace repo, just ask to "sync upstream".
