# Question Mode

The user asked a specific question about the delta. Answer only that question using the gathered delta information. Keep the response focused and concise - a short paragraph or list, not the full details view.

## How to Answer

1. Interpret the user's question against the gathered data (status show output, dependency info, existing documents)
2. Provide a direct, focused answer
3. Include supporting context only when it directly helps answer the question

## Common Questions

| Question Pattern | What to Answer |
|-----------------|----------------|
| "what's the priority?" | Priority level, label, and where it ranks among other deltas |
| "what's the status?" | Current status and which documents exist |
| "what blocks this?" / "what are the blockers?" | List incomplete dependencies with their statuses |
| "what does this block?" / "what depends on this?" | List dependents with their statuses |
| "is this ready?" / "can I start this?" | Whether all dependencies are complete; if not, what's still blocking |
| "what's the next step?" | The appropriate next command based on current status |
| "what documents exist?" | List of existing spec/design/plan with a one-line summary each |
| "summarize the spec/design/plan" | Read the requested document and provide a concise summary |
| "what's the complexity?" | Complexity level with brief rationale from description |
| "what's this about?" / "describe this" | The delta's description and a brief summary of any existing spec |

For questions not covered above, use the gathered information to answer as directly as possible. If the question cannot be answered from available data, explain what information is available and suggest how the user might find what they need.
