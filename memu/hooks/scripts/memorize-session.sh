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

# Calculate hash of transcript to detect duplicates
transcript_hash=$(sha256sum "$transcript_path" | cut -d' ' -f1)
state_file="/tmp/memu-memorized-hashes-${USER}"

# Check if already memorized
if [ -f "$state_file" ] && grep -q "^${transcript_hash}$" "$state_file"; then
    # Already memorized, skip
    echo '{}'
    exit 0
fi

# Fork background process to memorize conversation
# Using nohup to detach from parent process, doesn't block session end
# After successful memorization, record hash to prevent duplicates
nohup sh -c "
    python3 '${CLAUDE_PLUGIN_ROOT}/skills/recall-memory/scripts/memu.py' memorize < '$transcript_path' > /dev/null 2>&1 && \
    echo '$transcript_hash' >> '$state_file'
" > /dev/null 2>&1 &

# Return empty object (hook completed successfully)
echo '{}'
