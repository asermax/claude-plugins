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
3. **Bounded task** - What to do on the current page

```python
Task(
    description="Extract product info",
    subagent_type="superpowers:browser-agent",
    model="haiku",
    prompt=f"""Scripts path: ${{CLAUDE_PLUGIN_ROOT}}/skills/using-browser/scripts
Browsing context: shopping

Extract the first 3 product titles and prices from this page."""
)
```

### Why Use Browser-Agent?

1. **Context efficiency** - Returns only requested data in natural language
2. **Cost savings** - Haiku model for browser operations
3. **Action history** - All actions recorded with intentions for debugging
4. **Natural communication** - No CSS selectors or technical jargon in responses
5. **Resumability** - Can resume from previous work using context history

### Bounded Exploration Model

**Browser-agent is bounded to the current page:**
- ✅ Can explore current page freely (find elements, answer questions, extract data)
- ✅ Can perform compound actions on current page ("search for X and extract Y")
- ✅ Executes navigation when you explicitly tell it to
- ❌ Does NOT make navigation decisions (you orchestrate multi-page workflows)

## Orchestrating Browser Tasks

You are the brain. Browser-agent is your eyes and hands for ONE PAGE at a time.

### Pattern: Use Agent as Eyes

When you don't know page structure:

```python
Task(prompt="Is there a search box on this page?")
# Returns: "Yes, there's a search box at the top labeled 'Search Amazon'"

Task(prompt="What navigation links are available?")
# Returns: "I see links for: Products, About, Contact, Login"

Task(prompt="Find the login button")
# Returns: "Found login button in the top-right corner"
```

### Pattern: Give Specific Instructions

When you know what to do, give compound instructions that work on current page:

```python
# Navigation (if needed)
Task(prompt="Navigate to amazon.com")

# Compound actions on current page
Task(prompt="Search for 'laptop' and extract the first 5 product titles and prices")

# Or break into logical steps
Task(prompt="Type 'laptop' in the search box and click search")
Task(prompt="Wait for results and extract first 5 products with prices")
```

### Pattern: Repetitive Tasks (Script Generation + Distribution)

For repetitive extraction (same data from multiple pages):

1. **Get list of targets:**
```python
Task(prompt="Extract all category names and links from this page")
# Returns: ["Electronics: /electronics", "Books: /books", "Clothing: /clothing"]
```

2. **Generate reusable script (agent explores examples, YOU navigate between them):**
```python
# Navigate to first example
Task(prompt="Navigate to /electronics")
Task(prompt="Explore the page structure and manually extract product names and prices. Document what you find.")
# Returns: Extracted products using selectors .product-card h3 and .product-card .price

# Navigate to second example
Task(prompt="Navigate to /books")
Task(prompt="Extract products using the same approach. Identify what's constant vs variable.")
# Returns: Same selectors work. Constant: selectors. Variable: data values.

# Get validated script
Task(prompt="Create and validate a reusable eval script for extracting products")
# Returns: Script + validation results
```

3. **Distribute script to remaining pages (you iterate):**
```python
for category in remaining_categories:
    Task(prompt=f"""Navigate to {category['link']}
    Run this eval script: {script}
    Return the extracted data""")
```

This keeps script generation intelligence in the agent while orchestration stays with you.

### Error Handling with Retries

If step fails, retry up to 3 times:

1. **Retry 1:** Same command (transient failure)
2. **Retry 2:** Ask agent to explore: "Find the search input, it might be labeled differently"
3. **Retry 3:** Alternative approach

After 3 failures: Report to user with context and last error.

## Complete Workflow Examples

### Example 1: Simple Search Task

User: "Find laptop prices on Amazon"

```python
# 1. Start daemon
scripts/browser-daemon --initial-context-name amazon --initial-context-url https://amazon.com

# 2. Search for laptops
Task(prompt="""Scripts path: ${CLAUDE_PLUGIN_ROOT}/skills/using-browser/scripts
Browsing context: amazon

Type 'laptop' in the search box and click search""")

# 3. Extract results
Task(prompt="""Scripts path: ${CLAUDE_PLUGIN_ROOT}/skills/using-browser/scripts
Browsing context: amazon

Wait for results to load, then extract first 5 products with prices""")
# Returns: ["Dell Laptop - $599", "HP Pavilion - $649", ...]

# 4. Present to user
"Found 5 laptops on Amazon: Dell - $599, HP - $649, ..."

# Browser stays open for follow-up work
# Only quit if user explicitly asks: scripts/browser-cli quit
```

### Example 2: Unknown Page Structure

User: "Check if this page has a login form"

```python
# Already on some page in browsing context "research"

# Ask agent to explore current page
Task(prompt="""Scripts path: ${CLAUDE_PLUGIN_ROOT}/skills/using-browser/scripts
Browsing context: research

Is this a login page? Look for username/password fields""")
# Returns: "Yes, this is a login page. I see email and password inputs, plus a 'Sign In' button"

# Now you know what to do - fill and submit in one action
Task(prompt="""Scripts path: ${CLAUDE_PLUGIN_ROOT}/skills/using-browser/scripts
Browsing context: research

Fill in email 'user@example.com' and password 'password123', then click Sign In""")

# Browser stays open for follow-up work
```

### Example 3: Parallel Multi-Tab Automation

User: "Compare laptop prices on Amazon, eBay, and Walmart"

```python
# 1. Start daemon with initial context
scripts/browser-daemon --initial-context-name amazon --initial-context-url https://amazon.com

# 2. Create additional contexts for parallel work
scripts/browser-cli create-browsing-context ebay --url https://ebay.com
scripts/browser-cli create-browsing-context walmart --url https://walmart.com

# 3. Execute search on each site and extract prices
# (Can run in parallel by making multiple Task calls in single message)

Task(prompt="""Scripts path: ${CLAUDE_PLUGIN_ROOT}/skills/using-browser/scripts
Browsing context: amazon
Search for 'laptop' and extract top 3 prices""")
# Returns: ["$599", "$649", "$549"]

Task(prompt="""Scripts path: ${CLAUDE_PLUGIN_ROOT}/skills/using-browser/scripts
Browsing context: ebay
Search for 'laptop' and extract top 3 prices""")
# Returns: ["$550", "$620", "$510"]

Task(prompt="""Scripts path: ${CLAUDE_PLUGIN_ROOT}/skills/using-browser/scripts
Browsing context: walmart
Search for 'laptop' and extract top 3 prices""")
# Returns: ["$579", "$639", "$529"]

# 4. Compare and present
"Price comparison:
Amazon: $599, $649, $549 (avg: $599)
eBay: $550, $620, $510 (avg: $560)
Walmart: $579, $639, $529 (avg: $582)
eBay has the lowest average price."

# Browser stays open for follow-up work
```

## Browsing Context History

Browser-agents can check what happened in the same context:

```python
# You navigate to Wikipedia
Task(prompt="""Scripts path: ${CLAUDE_PLUGIN_ROOT}/skills/using-browser/scripts
Browsing context: research
Navigate to wikipedia.org""")

# You tell agent to search
Task(prompt="""Scripts path: ${CLAUDE_PLUGIN_ROOT}/skills/using-browser/scripts
Browsing context: research
Type 'Artificial Intelligence' in the search box and click search""")

# Later, you ask agent to continue
Task(prompt="""Scripts path: ${CLAUDE_PLUGIN_ROOT}/skills/using-browser/scripts
Browsing context: research
Click on the 'History of AI' section and extract the first paragraph""")
# Agent checks browsing-context-history, sees previous actions, knows it's already on AI article
```

The agent uses context history to understand:
- What page it's currently on
- What actions have been performed
- What the current state is

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
