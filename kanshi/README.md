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

## Backlog

Future visualization ideas to experiment with:

1. **Code heat map** - Which files/directories the agent touches most, color-coded by frequency
2. **Real-time diffs** - Show Edit/Write changes as they happen with syntax highlighting
3. **Session timeline** - Horizontal timeline showing tool call sequence and duration, with parallel subagent tracks
4. **File exploration graph** - Graph of which files led to which other files being explored, surfacing implicit relationships
5. **Tool usage stats** - Aggregate dashboard: call frequency, success/failure rates, most-read files
6. **Decision trail** - From user prompt through tool chain to Stop, showing how the agent decomposed the request
7. **Error pattern detection** - Track recurring failures to identify agent confusion about the codebase
8. **Subagent tree** - Visualize parallel agent work with task descriptions and outcomes
9. **Search replay** - Grep/Glob patterns and results showing the agent's exploration path
10. **Session comparison** - Side-by-side comparison of how the agent approaches similar tasks
11. **Review mode** - Pause, inspect, annotate agent decisions post-hoc
12. **Session replay** - Replay a completed session at adjustable speed
