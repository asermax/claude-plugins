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

### Your Responsibilities

**You manage the daemon lifecycle:**
- Start the browser daemon
- Stop the daemon when done
- Check daemon status

**The browser subagent handles operations:**
- Navigation and page interaction (clicking, typing, waiting for elements)
- Content extraction (text, data, page structure)
- JavaScript execution in the page context
- Returns filtered, relevant results only in natural language
- Prevents token waste from full page dumps

**Important limitations:**
- No screenshot or visual capture capabilities
- No file download/upload handling
- No multi-tab or window management

## Daemon Lifecycle Management

**CRITICAL: You MUST start the daemon before any browser operations and stop it when done.**

The browser subagent does NOT start or stop the daemon - that's YOUR responsibility.

### Starting the Daemon

**ALWAYS start the daemon as your first action when the user requests browser automation.**

**Default approach (auto-start Chrome):**
```bash
scripts/browser-daemon
```

This will:
- Automatically launch a new Chrome instance with remote debugging enabled
- Connect via Chrome DevTools Protocol
- Listen on Unix socket for commands

**Note:** The PreToolUse hook automatically runs this in the background.

**Use existing Chrome (ONLY when user explicitly requests it):**
```bash
scripts/browser-daemon --existing-browser
```

Use this ONLY if the user explicitly says:
- "use my existing browser"
- "connect to my current Chrome session"
- "use the browser I already have open"

For this to work, the user must have Chrome running with:
```bash
google-chrome-stable --remote-debugging-port=9222 --remote-allow-origins=* &
```

### Check status

```bash
scripts/browser-cli status
```

### Stopping the Daemon

**CRITICAL: You MUST stop the daemon when the user's task is complete.**

```bash
scripts/browser-cli quit
```

This will:
- Close the daemon connection
- Shut down the Chrome browser instance
- Clean up resources

**ALWAYS run this when:**
- The user's browser task is complete
- You've finished all data extraction
- Before ending your response to the user

## Browser Operations via Subagent

**DO NOT** use browser commands (navigate, click, type, extract, etc.) directly.

**ALWAYS** delegate browser operations to the browser subagent using the Task tool:

```python
Task(
    description="Navigate and search Amazon",
    subagent_type="superpowers:browser-agent",
    model="haiku",  # Use haiku for cost efficiency
    prompt="Navigate to Amazon and search for 'chair'. Return only the first 3 product titles."
)
```

### Task instruction flexibility

You can provide instructions at different levels of detail:

**High-level (recommended):**
```python
prompt="Login to the page with username 'user@example.com' and password 'pass123'"
# The subagent figures out: find login form, fill fields, click submit button
```

**Detailed (when needed):**
```python
prompt='''
1. Navigate to https://example.com/login
2. Type "user@example.com" into the email field
3. Type "pass123" into the password field
4. Click the login button
5. Wait for dashboard to appear
'''
# Use this when you need precise control over each step
```

**Best practice:** Start with high-level instructions. Add detail only if the subagent needs guidance.

### Why use the subagent?

1. **Context efficiency**: Subagent filters responses, returning only relevant data in natural language
2. **Cost savings**: Haiku model for browser operations
3. **Resumability**: Long-running browser tasks can be resumed
4. **Prevents token waste**: No full page dumps or technical jargon in responses
5. **Natural communication**: Responses use plain language, not CSS selectors or HTML IDs
6. **Adaptive execution**: Can work with vague or detailed instructions

## Example Workflows

### Complete workflow with daemon lifecycle

**MANDATORY PATTERN: Always follow this sequence**

```python
# 1. FIRST: Start the daemon (REQUIRED)
scripts/browser-daemon  # Auto-backgrounded by hook

# 2. THEN: Delegate browser operations to subagent
Task(
    description="Extract product info",
    subagent_type="superpowers:browser-agent",
    model="haiku",
    prompt="Navigate to https://example.com/products and extract the top 3 product names"
)

# 3. FINALLY: Stop the daemon (REQUIRED)
scripts/browser-cli quit
```

**Never skip steps 1 or 3.** The subagent cannot function without a running daemon, and leaving the daemon running wastes resources.

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

**High-level approach:**
```python
Task(
    description="Login and extract username",
    subagent_type="superpowers:browser-agent",
    model="haiku",
    prompt='''
Go to https://example.com/login and login with:
- Email: user@example.com
- Password: password123

Once logged in, extract and return the displayed username.
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

### Lifecycle Management - CRITICAL RULES
1. **ALWAYS start the daemon first** - before any browser subagent calls
2. **ALWAYS stop the daemon last** - after all browser operations complete
3. **The subagent never manages daemon lifecycle** - it only performs browser operations
4. **Use `--existing-browser` ONLY when user explicitly requests it** - default is to auto-start Chrome
5. **Stopping the daemon closes the browser** - don't forget this step

### Browser State
- Browser state persists across subagent invocations within a session
- The daemon auto-starts Chrome with a dedicated profile
- All browser operations are synchronous via CDP
- Use CSS selectors for element targeting
- The subagent is trained to return minimal, relevant context only
