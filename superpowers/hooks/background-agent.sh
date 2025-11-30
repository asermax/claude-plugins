#!/bin/bash
# Auto-background hook for agent.py and broker.py
# Ensures agent.py and broker.py always run in background

hook_input=$(cat)
tool_name=$(echo "$hook_input" | jq -r '.tool_name')

if [[ "$tool_name" == "Bash" ]]; then
    command=$(echo "$hook_input" | jq -r '.tool_input.command // empty')
    run_in_background=$(echo "$hook_input" | jq -r '.tool_input.run_in_background // "null"')

    # Check if command is calling agent.py or broker.py
    if [[ "$command" == *"/agent.py"* ]] || [[ "$command" == *"/broker.py"* ]]; then
        # Check if run_in_background is not already set to true
        if [[ "$run_in_background" != "true" ]]; then
            # Build updated input by merging run_in_background with existing tool_input
            updated_input=$(echo "$hook_input" | jq '.tool_input + {"run_in_background": true}')

            echo "{
              \"hookSpecificOutput\": {
                \"hookEventName\": \"PreToolUse\",
                \"permissionDecision\": \"allow\",
                \"permissionDecisionReason\": \"Running agent/broker in background\",
                \"updatedInput\": $updated_input
              }
            }"
            exit 0
        fi
    fi
fi

# Default: don't interfere
exit 0
