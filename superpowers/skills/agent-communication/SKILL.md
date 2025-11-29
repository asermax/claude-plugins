---
name: agent-communication
description: Use when user explicitly requests to coordinate with other Claude Code agents, join an agent chat, or communicate across multiple repositories/projects
---

# Multi-Agent Communication

## Overview

Enable multiple Claude Code instances to communicate and coordinate work across different repositories using a lightweight ZeroMQ-based chat system.

## When to Use

Use this skill when:
- User explicitly asks to "coordinate with other agents"
- User wants to "join agent chat" or "communicate with other Claude instances"
- User mentions working across multiple repositories that need coordination
- User asks to "broadcast a message to other agents"

## When NOT to Use

Do NOT use this skill for:
- Single-repository work
- Communication with external services/APIs
- User asking about other forms of collaboration (git, PRs, etc.)

## Architecture

Three components work together:

1. **broker.py** - Central message router (single instance, shared)
2. **agent.py** - Your agent daemon (one per Claude instance, background)
3. **chat.py** - CLI for interaction (foreground, synchronous)

## Script Path Construction

**IMPORTANT**: Always use full paths to call scripts. Do NOT use `cd` to change to the scripts directory.

The skill is located at: **Base directory for this skill** (shown at the top when skill loads)

To call scripts, concatenate:
- **Skill base directory** + `/scripts/` + **script name**

Example:
```bash
# If skill base is: /home/agus/workspace/asermax/claude-plugins/superpowers/skills/agent-communication
# Then broker.py is at:
/home/agus/workspace/asermax/claude-plugins/superpowers/skills/agent-communication/scripts/broker.py
```

In the examples below, we use `scripts/broker.py` as shorthand, but you should replace `scripts/` with the full path to the scripts directory based on the skill's base directory.

## Background Execution Requirements

**CRITICAL**: Always run `broker.py` and `agent.py` in the background using the `&` suffix:

- ✅ **Correct**: `scripts/broker.py &`
- ❌ **Wrong**: `scripts/broker.py` (will block your terminal)

- ✅ **Correct**: `scripts/agent.py --name "..." --context "..." --presentation "..." &`
- ❌ **Wrong**: `scripts/agent.py --name "..." --context "..." --presentation "..."` (will block)

The `chat.py` script runs in the foreground (no `&`) since it's a synchronous command-line tool.

## The Process

### Step 1: Generate Agent Identity

Before joining, generate your identity based on context:

**Name**: Derive from your role and working directory
- Examples: "backend-agent", "frontend-agent", "docs-agent", "scheduler-api-agent"
- Pattern: `{role}-agent` or `{project}-agent`

**Context**: Your working directory or project
- Use `pwd` to get current directory
- Or derive from CLAUDE.md or git remote
- Examples: "filadd/scheduler-api", "myproject/docs", "/home/user/repos/backend"

**Presentation**: Brief description of what you manage
- 1-2 sentences
- What code/project you're working on
- Current focus or task
- Example: "I manage the backend API for the scheduler service. Currently implementing the new scheduling endpoint for recurring tasks."

### Step 2: Start Your Agent

Try to start the agent daemon:

```bash
scripts/agent.py --name "your-agent-name" \
                 --context "your/project/path" \
                 --presentation "Your description..." &
```

**The agent will fail if the broker is not running or not responding:**

Exit codes:
- `3`: Broker socket files don't exist (broker never started)
- `4`: Broker not responding (stale sockets, broker crashed)

**If agent fails, start the broker:**

1. Start the broker first:
```bash
scripts/broker.py &
```

2. Wait a moment for broker to initialize

3. Retry starting your agent:
```bash
scripts/agent.py --name "your-agent-name" \
                 --context "your/project/path" \
                 --presentation "Your description..." &
```

**On success:**
- Agent daemon runs in background
- You'll see: "Joined chat. N member(s) present."
- Agent name is displayed
- Socket created at `/run/user/1000/claude-agent-{agent-name}.sock`

### Step 3: Interact via chat.py

Now you can use the foreground CLI to interact:

**Send a message to all agents:**
```bash
scripts/chat.py --agent your-agent-name send "Hello! I'm working on the authentication module."
```

Output:
```json
{"status": "ok", "message": "Message sent"}
```

**Receive messages from other agents:**
```bash
scripts/chat.py --agent your-agent-name receive --timeout 30
```

Output if messages available:
```json
{
  "status": "ok",
  "messages": [
    {
      "id": "backend-agent-2025-11-29T12:00:00Z",
      "timestamp": "2025-11-29T12:00:00Z",
      "type": "message",
      "sender": {
        "name": "backend-agent",
        "context": "filadd/scheduler-api",
        "presentation": "I manage the backend..."
      },
      "content": "I just updated the API schema, heads up!"
    }
  ]
}
```

Output if no messages (timeout):
```json
{"status": "ok", "messages": []}
```
Exit code: 2

**Send a message and wait for response:**
```bash
scripts/chat.py --agent your-agent-name ask "What's the API format?" --timeout 60
```

Output if responses received:
```json
{
  "status": "ok",
  "messages": [
    {
      "id": "other-agent-2025-11-29T12:00:00Z",
      "timestamp": "2025-11-29T12:00:00Z",
      "type": "message",
      "sender": {
        "name": "other-agent",
        "context": "project/backend"
      },
      "content": "The API format is JSON with these fields..."
    }
  ]
}
```

**Check who's connected:**
```bash
scripts/chat.py --agent your-agent-name status
```

Output:
```json
{
  "status": "ok",
  "data": {
    "agent": {
      "name": "frontend-agent",
      "context": "filadd/web-ui"
    },
    "members": {
      "backend-agent": {
        "name": "backend-agent",
        "context": "filadd/scheduler-api",
        "presentation": "I manage the backend API...",
        "joined_at": "2025-11-29T12:00:00Z"
      },
      ...
    },
    "queue_size": 2
  }
}
```

### Step 4: Communication Pattern

**IMPORTANT**: Use conversational back-and-forth communication. Always use the `ask` command to send a message and wait for response. Continue the conversation until both agents agree it's complete.

**The Pattern:**
1. **Initiate with ask** - Use `scripts/chat.py --agent X ask "message" --timeout 60`
2. **Wait for response** - The ask command automatically waits
3. **Respond with ask** - When you receive a message, respond using ask (not just send)
4. **Continue until done** - Keep the conversation going until both agents agree to end
5. **Explicit completion** - End with something like "Thanks, conversation complete!" or "Got it, all done!"

**Why ask instead of send?**
- Ensures fluid back-and-forth conversation
- You see responses immediately
- Prevents messages getting lost or ignored
- Creates natural request-response flow

**When to use send:**
- Broadcasting announcements to all agents (no response needed)
- Fire-and-forget notifications

**Example conversational workflow:**

```bash
# Agent A initiates
scripts/chat.py --agent backend-agent ask "I've updated the /api/schedule endpoint. Can you review the new schema?" --timeout 60

# Receives response from frontend-agent, then continues conversation
scripts/chat.py --agent backend-agent ask "The date field is ISO8601 format. Does that work for your UI components?" --timeout 60

# Receives confirmation, closes conversation
scripts/chat.py --agent backend-agent ask "Perfect! Integration looks good. All done on my end." --timeout 30

# Other agent confirms completion, conversation ends
```

**Bad pattern (don't do this):**
```bash
# Sends message but doesn't wait - other agent might not see it
scripts/chat.py --agent backend-agent send "Updated the API"

# Meanwhile continues working, misses response
vim other-file.ts
```

## Message Types You'll See

### Join Messages

When a new agent joins:

```json
{
  "id": "docs-agent-2025-11-29T12:00:00Z",
  "timestamp": "2025-11-29T12:00:00Z",
  "type": "join",
  "sender": {
    "name": "docs-agent",
    "context": "project/docs",
    "presentation": "I manage the documentation..."
  },
  "content": "I manage the documentation..."
}
```

**What to do**: Welcome the new agent, share context if relevant

### Leave Messages

When an agent leaves:

```json
{
  "id": "backend-agent-2025-11-29T12:00:00Z",
  "timestamp": "2025-11-29T12:00:00Z",
  "type": "leave",
  "sender": {
    "name": "backend-agent",
    "context": "filadd/scheduler-api",
    "presentation": "I manage the backend API..."
  },
  "content": ""
}
```

**What to do**: Note that agent is no longer available

### Regular Messages

Broadcast messages from other agents:

```json
{
  "id": "backend-agent-2025-11-29T12:05:00Z",
  "timestamp": "2025-11-29T12:05:00Z",
  "type": "message",
  "sender": {
    "name": "backend-agent",
    "context": "filadd/scheduler-api",
    "presentation": "I manage the backend API..."
  },
  "content": "Just pushed changes to the auth module"
}
```

**What to do**: Process content, respond if relevant

## Error Handling

### Broker Not Running

**Error**: Agent fails with "Broker not running"

**Solution**:
```bash
scripts/broker.py &
# Wait a moment
scripts/agent.py --name "..." --context "..." --presentation "..." &
```

### Agent Not Running

**Error**: chat.py fails with "No agent running"

**Solution**: Start your agent first (see Step 2)

### Connection Lost

If broker dies while agents connected:
- Agents detect broken connection
- New messages cannot be sent/received
- Restart broker: `scripts/broker.py &`
- Agents will attempt reconnection

## Practical Example

**Scenario**: Coordinating backend and frontend work

**Backend agent (you)**:
```bash
# Join chat
scripts/agent.py --name "backend-agent" \
                 --context "filadd/scheduler-api" \
                 --presentation "I manage the backend API. Working on new scheduling endpoint." &

# Do work
vim src/routes/schedule.ts

# Initiate conversation with ask
scripts/chat.py --agent backend-agent ask "New /api/schedule endpoint ready. Schema: {date, recurrence, callback_url}. Can you review?" --timeout 60
# Receives frontend's question about recurrence format

# Continue conversation
scripts/chat.py --agent backend-agent ask "Recurrence format: {type: 'daily'|'weekly'|'monthly', interval: number}. Example: {type: 'weekly', interval: 2} for every 2 weeks. Does this work for your UI?" --timeout 60
# Receives confirmation

# Close conversation
scripts/chat.py --agent backend-agent ask "Great! Let me know if you need any changes after testing." --timeout 30
# Receives "All good, thanks!" - conversation complete
```

**Frontend agent (other Claude instance)** - responds to each ask:
```bash
# Join chat
scripts/agent.py --name "frontend-agent" \
                 --context "filadd/web-ui" \
                 --presentation "I manage the web UI. Working on schedule creation form." &

# Wait for backend's message
scripts/chat.py --agent frontend-agent receive --timeout 120
# Sees backend's ask about reviewing endpoint

# Respond with ask
scripts/chat.py --agent frontend-agent ask "What's the format for recurrence? Daily/weekly/monthly?" --timeout 60
# Receives format details

# Continue conversation
scripts/chat.py --agent frontend-agent ask "Perfect! That format works great for my dropdown. Starting implementation now." --timeout 30
# Receives backend's offer to help

# Close conversation
scripts/chat.py --agent frontend-agent ask "All good, thanks!" --timeout 10
# Conversation complete
```

## Tips

1. **Use ask for conversations**: Always use `ask` instead of `send` when you expect a response. This creates natural back-and-forth flow.
2. **Explicit completion**: End conversations clearly with phrases like "All done!", "Thanks, conversation complete!", or "Got it, closing this thread."
3. **Appropriate timeouts**: Use longer timeouts (60s) for initial asks, shorter (10-30s) for final confirmations.
4. **Agent naming**: Use descriptive names that indicate role/project
5. **Presentations**: Be specific about what you manage and current focus
6. **Don't interrupt flow**: When using `ask`, don't do other work while waiting - focus on the conversation
7. **Document decisions**: Important decisions should also go in code/docs, not just chat

## Scripts Location

All scripts are in the skill directory:

```
superpowers/skills/agent-communication/scripts/
├── broker.py   # Central router
├── agent.py    # Agent daemon
└── chat.py     # CLI tool
```

## Quick Reference

| Command | Purpose | Output |
|---------|---------|--------|
| `scripts/broker.py &` | Start central router | Background process |
| `scripts/agent.py --name X --context Y --presentation Z &` | Start your agent | Background process |
| `scripts/chat.py --agent X send "msg"` | Broadcast message | JSON status |
| `scripts/chat.py --agent X receive --timeout 30` | Wait for messages | JSON array |
| `scripts/chat.py --agent X ask "question" --timeout 60` | Send and wait for response | JSON array |
| `scripts/chat.py --agent X status` | Show members and state | JSON status |

Remember: Replace `scripts/` with the full path based on the skill's base directory (see "Script Path Construction" section above).

## Integration with Other Skills

- **superpowers:brainstorming**: Use agent chat to brainstorm across repos
- **superpowers:writing-plans**: Coordinate on multi-repo implementation plans
- **superpowers:using-beads**: Each agent can work on separate beads, coordinate via chat
