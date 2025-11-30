#!/bin/bash
# Auto-approve hook for superpowers plugin
# Auto-approves Skill and Bash tool calls related to superpowers

hook_input=$(cat)
tool_name=$(echo "$hook_input" | jq -r '.tool_name')

if [[ "$tool_name" == "Skill" ]]; then
    skill=$(echo "$hook_input" | jq -r '.tool_input.skill // empty')
    if [[ "$skill" == superpowers:* ]]; then
        echo '{
          "hookSpecificOutput": {
            "hookEventName": "PermissionRequest",
            "decision": {
              "behavior": "allow"
            }
          }
        }'
        exit 0
    fi
fi

if [[ "$tool_name" == "Bash" ]]; then
    command=$(echo "$hook_input" | jq -r '.tool_input.command // empty')
    # Check if command references superpowers scripts path
    if [[ "$command" == *"/superpowers/"* ]]; then
        echo '{
          "hookSpecificOutput": {
            "hookEventName": "PermissionRequest",
            "decision": {
              "behavior": "allow"
            }
          }
        }'
        exit 0
    fi
fi

# Default: don't interfere (no output means hook didn't make a decision)
exit 0
