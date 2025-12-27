---
name: using-browser
description: Use when the user asks to browse websites, navigate web pages, extract data from sites, interact with web forms, search for online information, test web applications, or automate any web-based task. Trigger on requests like "go to website X", "search for Y on the web", "find Z online", "fill out this form", "get data from this page", or any task requiring a web browser.
---

# Browser Automation Skill

> **⚠️ MANDATORY WORKFLOW:**
> 1. Start daemon with initial context: `scripts/browser-daemon --initial-context-name <name> [--initial-context-url <url>]`
> 2. Delegate to browser-agent with context assignment
> 3. Create additional contexts if needed: `scripts/browser-cli create-browsing-context <name>`
> 4. Close extra contexts when done (optional)
> 5. Stop daemon ONLY when user explicitly requests: `scripts/browser-cli quit`

## What are Browsing Contexts?

**Browsing contexts** are named browser tabs with full action history. Each context:
- Has a unique name (e.g., "shopping", "research", "testing")
- Maintains complete history of all actions with intentions
- Persists across browser-agent invocations
- Enables parallel multi-tab automation

## Your Responsibilities (Main Agent)

### 1. Daemon Lifecycle
- ✅ Start the daemon with initial browsing context name (required)
- ✅ Optionally provide initial URL (defaults to about:blank)
- ✅ Stop the daemon ONLY when user explicitly requests to close the browser

### 2. Browsing Context Management
- ✅ Initial context is created automatically when daemon starts
- ✅ **Create** additional browsing contexts if needed for parallel work
- ✅ **Assign** contexts to browser-agents in prompts
- ✅ **Monitor** contexts via status command
- ✅ **Close** extra contexts when no longer needed (daemon quit closes all)

### 3. Task Delegation
- ✅ Spawn browser-agents with clear assignments
- ✅ Provide scripts path and browsing context name
- ✅ Delegate operations, not lifecycle management

## Daemon Lifecycle

### Start Daemon (Step 1)

**ALWAYS start the daemon with an initial browsing context:**

```bash
scripts/browser-daemon --initial-context-name <name> [--initial-context-url <url>]
```

**Parameters:**
- `--initial-context-name` (required) - Name for the initial browsing context
- `--initial-context-url` (optional) - URL to navigate to (defaults to about:blank)

**Examples:**
```bash
# Start with blank context
scripts/browser-daemon --initial-context-name main

# Start and navigate to URL
scripts/browser-daemon --initial-context-name shopping --initial-context-url https://amazon.com
```

This:
- Launches Chrome with remote debugging
- Connects via Chrome DevTools Protocol
- Creates the initial browsing context
- Navigates to URL if provided
- Listens on Unix socket for commands

**Note:** The PreToolUse hook automatically runs this in the background.

### Check Status

```bash
scripts/browser-cli status
```

Returns:
- Daemon status (running/stopped)
- All browsing contexts with:
  - Name, URL, title
  - Age (time since creation)
  - Recent history (last 5 actions with intentions)

### Stop Daemon

**IMPORTANT:** Only stop the daemon when the user explicitly requests to close the browser.

**DO NOT automatically stop the daemon after completing tasks.** The browser should remain open for potential follow-up work unless the user specifically asks to close it.

**To stop the daemon (only when explicitly requested):**

```bash
scripts/browser-cli quit
```

This:
- Closes all browsing contexts
- Shuts down Chrome
- Cleans up resources

## Browsing Context Lifecycle

### Initial Context

The initial browsing context is created automatically when you start the daemon with `--initial-context-name`.

You can use this context immediately for delegating work to browser-agents.

### Create Additional Browsing Contexts (Optional)

**Only needed for parallel multi-tab automation:**

```bash
scripts/browser-cli create-browsing-context <name> [--url <initial-url>]
```

**Examples:**
```bash
# Create blank context
scripts/browser-cli create-browsing-context research

# Create and navigate to URL
scripts/browser-cli create-browsing-context comparison --url https://ebay.com
```

**Naming guidelines:**
- Use descriptive names: "shopping", "research", "admin-panel"
- Avoid generic names: "tab1", "context2"
- Names help you and browser-agents understand purpose

### Monitor Contexts

Check what's happening across all contexts:

```bash
scripts/browser-cli status
```

Example output:
```json
{
  "status": "running",
  "connected_to_chrome": true,
  "browsing_contexts": [
    {
      "name": "shopping",
      "url": "https://amazon.com/cart",
      "title": "Shopping Cart",
      "age_minutes": 5.2,
      "recent_history": [
        {"action": "create", "intention": "Starting shopping session", "result": "OK"},
        {"action": "navigate", "intention": "Going to Amazon", "result": "OK"},
        {"action": "type", "intention": "Searching for laptop", "result": "OK"},
        {"action": "click", "intention": "Opening first result", "result": "OK"}
      ]
    }
  ]
}
```

### Close Browsing Context

When a context is no longer needed:

```bash
scripts/browser-cli close-browsing-context <name>
```

**When to close:**
- ✅ Task is complete and context won't be reused
- ✅ Cleaning up after multi-step workflow
- ✅ Before stopping daemon (optional - daemon quit closes all)

## Delegating to Browser-Agent

### Basic Pattern

**CRITICAL:** Always provide:
1. **Scripts path** - Where browser-cli lives
2. **Browsing context** - Which tab to work in

```python
Task(
    description="Search Amazon",
    subagent_type="superpowers:browser-agent",
    model="haiku",
    prompt=f"""Scripts path: ${{CLAUDE_PLUGIN_ROOT}}/skills/using-browser/scripts
Browsing context: shopping

Navigate to Amazon and search for 'laptop'. Return the first 3 product titles."""
)
```

### Why Use Browser-Agent?

1. **Context efficiency** - Returns only requested data in natural language
2. **Cost savings** - Haiku model for browser operations
3. **Action history** - All actions recorded with intentions for debugging
4. **Natural communication** - No CSS selectors or technical jargon in responses
5. **Resumability** - Can resume from previous work using context history

## Complete Workflow Examples

### Example 1: Simple Search Task

```python
# 1. Start daemon with initial context
scripts/browser-daemon --initial-context-name shopping --initial-context-url https://amazon.com
# Auto-backgrounded by hook

# 2. Delegate to browser-agent (context already exists)
Task(
    description="Amazon product search",
    subagent_type="superpowers:browser-agent",
    model="haiku",
    prompt=f"""Scripts path: ${{CLAUDE_PLUGIN_ROOT}}/skills/using-browser/scripts
Browsing context: shopping

Search for 'mechanical keyboard' and return the top 3 product names with prices."""
)

# Browser stays open for potential follow-up work
# Only quit if user explicitly asks to close: scripts/browser-cli quit
```

### Example 2: Multi-Step Workflow with Context Reuse

```python
# Start daemon with initial context
scripts/browser-daemon --initial-context-name shopping --initial-context-url https://amazon.com

# Step 1: Search
Task(
    description="Search for products",
    subagent_type="superpowers:browser-agent",
    model="haiku",
    prompt=f"""Scripts path: ${{CLAUDE_PLUGIN_ROOT}}/skills/using-browser/scripts
Browsing context: shopping

Search for 'laptop' and return the first 3 product titles."""
)
# Returns: "Found 3 products: Dell Inspiron..., HP Pavilion..., Lenovo..."

# Step 2: Click first result (context preserved)
Task(
    description="Get product details",
    subagent_type="superpowers:browser-agent",
    model="haiku",
    prompt=f"""Scripts path: ${{CLAUDE_PLUGIN_ROOT}}/skills/using-browser/scripts
Browsing context: shopping

Click the first product and extract its price and rating."""
)
# Agent checks history, sees search already done, continues from there

# Browser stays open for potential follow-up work
# Only quit if user explicitly asks to close: scripts/browser-cli quit
```

### Example 3: Parallel Multi-Tab Automation

```python
# Start daemon with initial context
scripts/browser-daemon --initial-context-name amazon --initial-context-url https://amazon.com

# Create additional contexts for parallel work
scripts/browser-cli create-browsing-context ebay --url https://ebay.com
scripts/browser-cli create-browsing-context walmart --url https://walmart.com

# Launch parallel browser-agents (single message, multiple tool calls)
# IMPORTANT: Use a single message for true parallelism

# Agent 1: Search Amazon (in parallel)
Task(
    description="Search Amazon for laptops",
    subagent_type="superpowers:browser-agent",
    model="haiku",
    prompt=f"""Scripts path: ${{CLAUDE_PLUGIN_ROOT}}/skills/using-browser/scripts
Browsing context: amazon

Search for 'laptop', return top 3 prices."""
)

# Agent 2: Search eBay (in parallel)
Task(
    description="Search eBay for laptops",
    subagent_type="superpowers:browser-agent",
    model="haiku",
    prompt=f"""Scripts path: ${{CLAUDE_PLUGIN_ROOT}}/skills/using-browser/scripts
Browsing context: ebay

Search for 'laptop', return top 3 prices."""
)

# Agent 3: Search Walmart (in parallel)
Task(
    description="Search Walmart for laptops",
    subagent_type="superpowers:browser-agent",
    model="haiku",
    prompt=f"""Scripts path: ${{CLAUDE_PLUGIN_ROOT}}/skills/using-browser/scripts
Browsing context: walmart

Search for 'laptop', return top 3 prices."""
)

# All three agents work concurrently in their own tabs!

# Browser stays open for potential follow-up work
# Only quit if user explicitly asks to close: scripts/browser-cli quit
```

## Browsing Context History

Browser-agents can check what happened before them:

```python
# First agent does initial work
Task(
    description="Start research",
    subagent_type="superpowers:browser-agent",
    model="haiku",
    prompt=f"""Scripts path: ${{CLAUDE_PLUGIN_ROOT}}/skills/using-browser/scripts
Browsing context: research

Navigate to Wikipedia and search for 'Artificial Intelligence'"""
)

# Later agent continues (different invocation)
Task(
    description="Continue research",
    subagent_type="superpowers:browser-agent",
    model="haiku",
    prompt=f"""Scripts path: ${{CLAUDE_PLUGIN_ROOT}}/skills/using-browser/scripts
Browsing context: research

Click on the 'History of AI' section and extract the first paragraph."""
)
# Agent checks history, sees it's already on Wikipedia AI article, continues from there
```

The second agent uses `browsing-context-history research` to see:
- Previous agent navigated to Wikipedia
- Searched for "Artificial Intelligence"
- Currently on the AI article page

## When to Create Multiple Contexts

### ✅ Create Multiple Contexts When:
- Comparing data across different websites (price comparison)
- Parallel data extraction from independent sources
- Multi-account workflows (admin panel + user view)
- Keeping reference pages open while working elsewhere

### ❌ Use Single Context When:
- Linear workflow on one website
- Simple search-and-extract tasks
- Related pages on the same site
- No need for parallelism

## Critical Rules

### ⚠️ Daemon Lifecycle
1. **START daemon with initial context name** (required parameter)
2. **PROVIDE initial URL** (optional, defaults to about:blank)
3. **STOP daemon ONLY when user explicitly requests** - Do NOT auto-stop after tasks
4. **AUTO-SHUTDOWN when user closes browser** - Daemon detects Chrome exit and stops automatically
5. One daemon serves all browsing contexts

### ⚠️ Browsing Context Management
1. **INITIAL context created automatically** when daemon starts
2. **CREATE additional contexts** only for parallel multi-tab work
3. **ASSIGN context to each browser-agent** in their prompt
4. **CLOSE extra contexts** when no longer needed (optional - quit closes all)
5. **DON'T reuse context names** - each should be unique

### ⚠️ Browser-Agent Delegation
1. **ALWAYS provide scripts path**
2. **ALWAYS assign a browsing context**
3. **Browser-agent works WITHIN assigned context**
4. **Browser-agent does NOT create/close contexts**

## Troubleshooting

### "Required argument --initial-context-name" error
- Forgot to provide initial context name when starting daemon
- Fix: Always use `scripts/browser-daemon --initial-context-name <name>`

### "Browsing context not found" error
- Using a context name that doesn't exist
- Fix: Check `scripts/browser-cli status` to see available contexts
- Or create the context with `scripts/browser-cli create-browsing-context <name>`

### "Browsing context already exists" error
- Trying to create duplicate context
- Fix: Use a different name or close the existing one first

### Browser-agent can't connect
- Daemon not running
- Fix: Start daemon with `scripts/browser-daemon --initial-context-name <name>`

### Contexts accumulating
- Not closing extra contexts after parallel tasks
- Fix: Either close contexts individually or just quit daemon (closes all)

## Notes

- Browsing contexts persist until explicitly closed or daemon stops
- Each context has independent browser state (cookies, localStorage, etc.)
- Actions are logged with timestamps and intentions for full traceability
- Status command shows real-time view of all contexts
- Browser-agent can check context history to understand previous work
- Daemon automatically shuts down if user closes the browser window
- Browser stays open after tasks complete to allow follow-up work
