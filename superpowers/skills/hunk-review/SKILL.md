---
name: hunk-review
description: Interacts with live Hunk diff review sessions via CLI. Inspects review focus, navigates files and hunks, reloads session contents, and adds inline review comments. Use when the user has a Hunk session running or wants to review diffs interactively.
allowed-tools: Bash(hunk:*)
hidden: true
---

# Hunk Review

The workflow guide below is served by the installed Hunk CLI. The path it comes from (use this as an anchor if you ever need sibling templates or references):

!`hunk skill path`

If the command above failed, ask the user to install or update Hunk before continuing -- do not improvise the CLI surface.

---

!`awk '/^---$/{c++; next} c>=2' "$(hunk skill path)"`
