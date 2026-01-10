#!/bin/bash
# SessionEnd hook: Auto-memorize conversations to memU in background

# Read hook input from stdin
hook_input=$(cat)

# Extract transcript_path from hook input
transcript_path=$(echo "$hook_input" | jq -r '.transcript_path // empty')

if [ -z "$transcript_path" ] || [ ! -f "$transcript_path" ]; then
    # Return empty object if transcript path is missing (no error needed)
    echo '{}'
    exit 0
fi

# Fork background process to memorize conversation
# Using nohup to detach from parent process, doesn't block session end
nohup python3 "${CLAUDE_PLUGIN_ROOT}/skills/recall-memory/scripts/memu.py" memorize < "$transcript_path" > /dev/null 2>&1 &

# Return empty object (hook completed successfully)
echo '{}'
