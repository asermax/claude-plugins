# memU Plugin for Claude Code

Agentic memory framework integration that enables Claude to remember information across sessions.

## Overview

The memU plugin provides persistent memory for Claude Code using memU's three-layer hierarchy:

- **Resources**: Raw conversation data from sessions
- **Items**: Extracted memory units (preferences, skills, opinions, habits)
- **Categories**: Aggregated summaries with full traceability

### How It Works

1. **Auto-memorization**: When a Claude Code session ends, conversations are automatically memorized (via SessionEnd hook)
2. **On-demand retrieval**: When you ask questions that could benefit from past context, Claude retrieves relevant memories (via recall-memory skill)

## Prerequisites

- Python 3.7+ (no external libraries required - uses only built-in modules)
- memU API key from [memu.so](https://memu.so)

## Installation

### 1. Install the Plugin

```bash
cd /path/to/claude-code-session
/plugin install ~/workspace/asermax/claude-plugins/memu
```

Or add to your project's Claude Code configuration.

### 2. Set API Key

Get your API key from [memu.so](https://memu.so) and set it as an environment variable:

```bash
export MEMU_API_KEY=your_api_key_here
```

To make this permanent, add to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):

```bash
echo 'export MEMU_API_KEY=your_api_key_here' >> ~/.bashrc
source ~/.bashrc
```

### 3. Verify Installation

Start a Claude Code session and ask:

```
What are my coding preferences?
```

If no memories exist yet, Claude will indicate it doesn't have stored information. After a few sessions, memories will accumulate.

## Features

### Automatic Memorization

Every time you end a Claude Code session, the conversation is automatically sent to memU for processing. This happens in the background and doesn't block session exit.

**What gets memorized**:
- All conversations from the session
- Preferences you express
- Coding patterns and workflows
- Decisions and opinions
- Technical choices

**Memory scope**: Memories are isolated per project (based on git remote URL or folder path).

### Smart Retrieval

The `recall-memory` skill activates when you ask questions that could benefit from historical context:

**Triggers on**:
- "What do I prefer?"
- "How do I usually handle X?"
- "What did we discuss about Y?"
- "What's my approach to Z?"

**Doesn't trigger on**:
- General knowledge questions ("What is TypeScript?")
- Current session facts
- File operations
- Code generation tasks

### Two Retrieval Methods

**RAG (Recommended)**:
- Fast vector-based retrieval (<2 seconds)
- Good for specific factual queries
- Default method

**LLM**:
- Deep semantic understanding (5-10 seconds)
- Good for complex or ambiguous questions
- Used automatically when needed

## Usage Examples

### Example 1: Learning Preferences

**Session 1**:
```
You: I prefer using TypeScript with strict mode enabled
```

(Session ends → auto-memorized)

**Session 2**:
```
You: What languages do I prefer?
Claude: Based on our previous discussions, you prefer TypeScript with strict mode enabled.
```

### Example 2: Workflow Patterns

**Session 1**:
```
You: When I refactor code, I always write tests first, then make small incremental changes
```

(Session ends → auto-memorized)

**Session 2**:
```
You: How do I usually approach refactoring?
Claude: You follow a test-first approach: write tests before refactoring, then make small incremental changes to minimize risk.
```

### Example 3: No Prior Knowledge

```
You: What do you know about my deployment process?
Claude: I don't have any stored information about your deployment process yet. We haven't discussed this in previous sessions.
```

## Troubleshooting

### Error: MEMU_API_KEY not set

**Problem**: The script can't find your API key.

**Solution**:
```bash
export MEMU_API_KEY=your_api_key_here
```

Verify it's set:
```bash
echo $MEMU_API_KEY
```

### Error: API request failed

**Problem**: Network issue or memU API is down.

**Solutions**:
1. Check internet connection
2. Verify API key is valid at [memu.so](https://memu.so)
3. Check memU service status
4. Try again later

### Skill not activating

**Problem**: recall-memory skill doesn't trigger on your question.

**Cause**: The question might be too general or not history-related.

**Examples**:
- ✅ "What are my coding preferences?" (triggers)
- ❌ "What is Python?" (doesn't trigger - general knowledge)
- ✅ "How do I usually structure React components?" (triggers)
- ❌ "Create a React component" (doesn't trigger - generation task)

### No memories found

**Problem**: Claude says it doesn't have information.

**Causes**:
1. Topic hasn't been discussed yet
2. Different project scope (memories are per-project)
3. API key changed (different memU account)

**Solution**: Have a conversation about the topic, end the session, then ask in a new session.

## Privacy & Data

- **Scope**: Memories are isolated per project using a hash of the git remote URL (or folder path)
- **Storage**: Data is stored in memU's cloud service (memu.so)
- **API Key**: Your API key controls access to your memories
- **Deletion**: Manage data through memU's web interface at [memu.so](https://memu.so)

## Technical Details

### Project Identification

The plugin derives a unique project ID from:
1. Git remote URL (if available) - hashed to 16 characters
2. Current directory path (fallback) - hashed to 16 characters

This ensures memories stay isolated per project.

### Hook Execution

The SessionEnd hook:
1. Receives conversation transcript
2. Forks background process
3. Returns immediately (no blocking)
4. Background process memorizes via memU API

### Script Dependencies

The Python script uses only built-in Python libraries:
- `urllib.request` and `urllib.error` for HTTP calls
- `hashlib` for project ID hashing
- `subprocess` for git commands
- `json` for data handling
- `argparse` for CLI argument parsing

No external dependencies required - works with standard Python installation.

## License

Apache License 2.0

## Support

For issues or questions:
- memU service: [memu.so](https://memu.so)
- Plugin issues: File an issue in the plugin repository
