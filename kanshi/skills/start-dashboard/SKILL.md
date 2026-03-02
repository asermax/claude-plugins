---
name: start-dashboard
description: Start the Kanshi observability dashboard and open it in the browser
allowed-tools: Bash(curl:*), Bash(pnpm install:*), Bash(npx tsx:*), Bash(xdg-open:*), TaskStop
---

# Start Kanshi Dashboard

Start the Kanshi observability dashboard server and open it in the browser.

## Steps

1. Check if the server is already running by testing `curl -sf http://localhost:3838/ > /dev/null 2>&1`

2. If the server is NOT running:
   - `cd` to the kanshi server directory: `${CLAUDE_PLUGIN_ROOT}/server`
   - Check if `node_modules` exists; if not, run `pnpm install`
   - Start the server as a background task using `run_in_background: true`: `npx tsx src/index.ts`
   - Note the task ID returned by the background task
   - Wait 2 seconds for the server to start

3. Open the dashboard in the browser: `xdg-open http://localhost:3838`

4. Tell the user:
   - Dashboard is running at http://localhost:3838
   - All tool events from this session will appear in real-time
   - The dashboard is running as a background task

## Stopping the dashboard

If the user asks to stop the dashboard, use the TaskStop tool with the task ID from the background task to terminate it.
