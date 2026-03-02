# Kanshi (監視) - Claude Code Observability Dashboard

Real-time observability dashboard for Claude Code agent activity. See what the agent is doing as it works - which files it reads, what commands it runs, how it explores your codebase.

## Why

When AI agents explore and modify codebases, developers lose the learning that comes from doing that exploration themselves. Kanshi provides a live activity feed that shows the agent's actions in real-time, helping developers follow along and build mental models of their codebase.

## Usage

Start the dashboard from any Claude Code session:

```
/kanshi:start-dashboard
```

This starts a local server on port 3838 and opens the dashboard in your browser. All tool events (file reads, edits, bash commands, searches, subagent activity) appear in real-time.

### Manual start

```bash
cd server
pnpm install
npx tsx src/index.ts
```

Then open http://localhost:3838.

## How it works

1. Claude Code's hook system fires HTTP hooks on every tool call
2. The hooks POST event data to the local Kanshi server (port 3838)
3. The server normalizes events and broadcasts them via WebSocket
4. The browser dashboard renders a live activity feed

When the dashboard server isn't running, hooks fail silently - no impact on Claude Code's performance.

## Configuration

Set `KANSHI_PORT` environment variable to use a different port (default: 3838).
