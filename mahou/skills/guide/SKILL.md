---
name: guide
description: Entrypoint to the mahou plugin when unsure which skill fits. Give it your goal in plain words and it identifies the matching skill and activates it with your request as context.
---

Load mahou:basics first. Then read `.mahou/guide.md` if present.

## Procedure

1. Restate the user's goal in one line.
2. Look at every skill whose name starts with `mahou:` and match the goal against their descriptions.
   - Exactly one fits. Say which one and why in one line, then run it with the original request as context.
   - Several could fit. List them with one line each and ask the user to choose. Never pick for them.
   - None fits. Say so plainly. If the gap is worth filling, mention mahou:learn.
3. Guide performs no work; it routes to the corresponding skill.
