# Feature Specification Template

Use this template when creating feature specifications.

## Template

```markdown
# [FEATURE-ID]: [Feature Name]

## User Story

As a [user type], I want to [action] so that [benefit].

## Behavior

[2-3 sentences in plain English describing the behavior. Focus on WHAT, not HOW.]

## Acceptance Criteria

### Success Cases
- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]

### Error Cases
- [ ] Given [invalid input/condition], when [action], then [error behavior]
- [ ] Given [edge case], when [action], then [specific handling]

## Requires

Dependencies:
- [FEATURE-ID]: [Why needed]
- Or "None" if no dependencies

---

## Notes

[Optional: Any additional context, constraints, or clarifications]
```

## Guidelines

### User Story

The user story should answer:
- **Who** is the user? (developer, admin, end user, system)
- **What** do they want to do? (specific action)
- **Why** do they want it? (the benefit or value)

Bad: "As a user, I want better performance"
Good: "As a developer, I want hot-reload so that I can see changes without restarting"

### Behavior

Write in plain English, not technical jargon:
- Describe observable behavior
- Focus on what the user experiences
- Avoid implementation details

Bad: "Implements a WebSocket connection to stream updates"
Good: "Shows real-time updates without requiring page refresh"

### Acceptance Criteria

Each criterion should be:
- **Testable**: Can verify pass/fail
- **Specific**: Clear inputs and outputs
- **Independent**: Not dependent on other criteria

Use Given/When/Then format:
- **Given**: Initial context or state
- **When**: The action or trigger
- **Then**: The expected result

Include:
- 2-3 success cases (main scenarios)
- 2-3 error cases (what can go wrong)
- Edge cases if applicable

### Error Cases to Consider

- Invalid input (wrong type, missing required fields)
- Boundary conditions (empty, max length, negative values)
- Resource failures (network, disk, permissions)
- Concurrent access (if relevant)
- Missing dependencies (files, services, data)

### Dependencies

List features that must be complete before this one:
- Only list direct dependencies
- Explain why each is needed
- Framework will validate these exist
