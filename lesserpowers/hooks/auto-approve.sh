#!/bin/bash
# Auto-approve hook for lesserpowers plugin
# Auto-approves Skill and Bash tool calls related to lesserpowers

hook_input=$(cat)
tool_name=$(echo "$hook_input" | jq -r '.tool_name')

if [[ "$tool_name" == "Skill" ]]; then
    skill=$(echo "$hook_input" | jq -r '.tool_input.skill // empty')
    if [[ "$skill" == lesserpowers:* ]]; then
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
    # Check if command references lesserpowers scripts path
    if [[ "$command" == *"/lesserpowers/"* ]]; then
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
