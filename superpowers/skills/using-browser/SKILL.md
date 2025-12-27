---
name: using-browser
description: Use when user needs browser automation. Start/stop browser daemon and delegate ALL browser operations to the browser subagent (superpowers:browser-agent) for context efficiency.
---

# Browser Automation Skill

## When to use this skill

Use this skill when the user needs to:
- Browse websites
- Extract data from web pages
- Automate web interactions (clicking, typing, form filling)
- Search for information on the web
- Test web applications

## What this skill provides

This skill enables browser automation through a two-layer architecture:

### Responsibility Division

**Main Agent (YOU):**
- Start the browser daemon
- Stop the daemon when done
- Check daemon status

**Browser Subagent (`superpowers:browser-agent`):**
- All browser operations (navigate, click, type, extract, etc.)
- Returns filtered, relevant results only
- Prevents token waste from full page dumps

## Main Agent Responsibilities: Daemon Lifecycle

**YOU are responsible for managing the daemon lifecycle.** The browser subagent does NOT start or stop the daemon.

### Start the daemon

**Default (auto-start browser):**
```bash
uv run scripts/browser-daemon.py
```

The daemon will:
- Auto-start Chrome with remote debugging enabled
- Connect via Chrome DevTools Protocol
- Listen on Unix socket for commands

**Note:** The PreToolUse hook automatically runs this in the background.

**Connect to existing browser:**
```bash
uv run scripts/browser-daemon.py --existing-browser
```

Use this when you already have Chrome running with `--remote-debugging-port=9222`.

To start Chrome manually with debugging:
```bash
google-chrome-stable --remote-debugging-port=9222 --remote-allow-origins=* &
```

### Check status

```bash
uv run scripts/browser-cli.py status
```

### Stop the daemon

**YOU are responsible for stopping the daemon when the user's task is complete:**

```bash
uv run scripts/browser-cli.py quit
```

This will close both the daemon and the browser.

## Subagent Responsibilities: Browser Operations

**DO NOT** use browser commands (navigate, click, type, extract, etc.) directly from the main agent.

**ALWAYS** delegate browser operations to the browser subagent using the Task tool:

```python
Task(
    description="Navigate and search Amazon",
    subagent_type="superpowers:browser-agent",
    model="haiku",  # Use haiku for cost efficiency
    prompt="Navigate to Amazon and search for 'chair'. Return only the first 3 product titles."
)
```

### Why use the subagent?

1. **Context efficiency**: Subagent filters responses, returning only relevant data
2. **Cost savings**: Haiku model for browser operations
3. **Resumability**: Long-running browser tasks can be resumed
4. **Prevents token waste**: No full page dumps in main agent context

## Available Browser Commands (via subagent)

The browser subagent has access to these commands:

- `navigate <url>` - Go to URL
- `click <selector>` - Click element by CSS selector
- `type <selector> <text>` - Type into element
- `extract [--selector <sel>]` - Extract text/HTML
- `eval <javascript>` - Execute JavaScript in page
- `snapshot [--mode tree|dom]` - Get page structure for element discovery
- `wait <selector> [--timeout <sec>]` - Wait for element to appear

## Example Workflows

### Complete workflow with daemon lifecycle

This example shows the full pattern: start daemon → use subagent → stop daemon.

```python
# 1. Main agent starts the daemon
uv run scripts/browser-daemon.py  # Auto-backgrounded by hook

# 2. Main agent delegates browser operations to subagent
Task(
    description="Extract product info",
    subagent_type="superpowers:browser-agent",
    model="haiku",
    prompt="Navigate to https://example.com/products and extract the top 3 product names"
)

# 3. Main agent stops the daemon when done
uv run scripts/browser-cli.py quit
```

### Extract data from a page

```python
Task(
    description="Extract article title",
    subagent_type="superpowers:browser-agent",
    model="haiku",
    prompt='''
Navigate to https://example.com/article
Extract the article title using the h1 selector
Return ONLY the title text
'''
)
```

### Multi-step automation

```python
Task(
    description="Login and extract data",
    subagent_type="superpowers:browser-agent",
    model="haiku",
    prompt='''
1. Navigate to https://example.com/login
2. Type "user@example.com" into #email
3. Type "password123" into #password
4. Click #login-button
5. Wait for #dashboard to appear
6. Extract the username from #user-display
Return ONLY the username
'''
)
```

### Resumable workflows (multi-step with continuation)

**Step 1: Initial task**
```python
Task(
    description="Start Amazon search",
    subagent_type="superpowers:browser-agent",
    model="haiku",
    prompt="Navigate to Amazon and search for 'laptop'. Return the first 3 product titles."
)
# Agent completes and returns agentId: abc123
```

**Step 2: Resume and continue**
```python
Task(
    description="Continue Amazon browsing",
    subagent_type="superpowers:browser-agent",
    model="haiku",
    resume="abc123",  # Continue from previous agent's context
    prompt="Click the first product and extract its price and rating. Return only price and rating."
)
```

**Benefits of resuming:**
- Browser state is preserved (already on Amazon search results)
- Agent has full context of previous actions
- No need to repeat navigation steps
- Useful for complex multi-page workflows

## Notes

### Lifecycle Management
- **Main agent starts and stops the daemon** - this is YOUR responsibility
- **Subagent never touches daemon lifecycle** - only performs browser operations
- Always stop the daemon when the user's task is complete

### Browser State
- Browser state persists across subagent invocations within a session
- The daemon auto-starts Chrome with a dedicated profile
- All browser operations are synchronous via CDP
- Use CSS selectors for element targeting
- The subagent is trained to return minimal, relevant context only
