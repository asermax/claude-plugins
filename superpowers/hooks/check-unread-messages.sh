#!/bin/bash
# Stop hook: Block stopping if unread agent messages exist

LOG_FILE="/tmp/stop-hook-debug.log"

echo "=== Stop hook called at $(date) ===" >> "$LOG_FILE"

hook_input=$(cat)
stop_hook_active=$(echo "$hook_input" | jq -r '.stop_hook_active // false')

echo "stop_hook_active: $stop_hook_active" >> "$LOG_FILE"
echo "Current directory: $(pwd)" >> "$LOG_FILE"

# Prevent infinite loops - if already continuing from stop hook, allow stop
if [[ "$stop_hook_active" == "true" ]]; then
    echo "Decision: allow (stop_hook_active=true)" >> "$LOG_FILE"
    exit 0
fi

# Check for .unread-messages file in current working directory
if [[ -f ".unread-messages" ]]; then
    count=$(cat .unread-messages 2>/dev/null || echo "some")
    echo "Found .unread-messages file with count: $count" >> "$LOG_FILE"
    echo "Decision: block" >> "$LOG_FILE"
    echo "{
      \"decision\": \"block\",
      \"reason\": \"You have $count unread agent chat message(s). Use chat.py receive to read them before stopping.\"
    }"
    exit 0
fi

# No unread messages - allow stop
echo "No .unread-messages file found" >> "$LOG_FILE"
echo "Decision: allow (no unread messages)" >> "$LOG_FILE"
exit 0
