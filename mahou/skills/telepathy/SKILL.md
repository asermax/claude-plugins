---
name: telepathy
description: Moves the conversation with the user out of the chat and into markdown files in the change's scratch folder, served as a web page the user reads and edits in the browser. Every edit the user makes reaches the agent as a message, and the agent answers by writing in the files. Use when the user asks for telepathy, asks to talk through files or the browser instead of the chat, or asks to continue a session there.
allowed-tools: Bash, Read, Write, Edit
---

Load mahou:basics first. Then read `.mahou/telepathy.md` if present.

# Telepathy

Telepathy is a mode. While it is on, everything you would have written to the user in the chat goes into a file in the change's scratch folder, and everything the user says arrives as an edit they made to one of those files. A small server renders the folder in the browser, lets the user edit it block by block, and tells you what they changed.

The mode overrides every instruction about "the reply" in any skill you are running or load while it is on. When mahou:design-tree says to write the questions into the reply, or mahou:report says how to hand the user a report, the reply is a file. Never ask through a tool, AskUserQuestion or any other.

## Starting

1. Check that you run inside herdr: `test "${HERDR_ENV:-}" = 1`. The user's messages reach you through herdr, so without it the mode cannot work. Say so and stop.
2. The server serves one folder under `.scratch/`, normally the change's scratch folder, named per mahou:basics. When you do not know the change's slug, ask for it.
3. If `.scratch/<slug>/.meta.json` exists and the `pid` in it is a live process (`kill -0 <pid>`), a server is already running for that folder. Reuse it and its `url`.
4. Otherwise start the server from the project's root as a background process, with the Bash tool's `run_in_background` and its longest `timeout` (7200000 ms). Claude Code kills a background task when its timeout runs out, and the default of 30 minutes is shorter than most sessions:

   ```bash
   bash ${CLAUDE_PLUGIN_ROOT}/skills/telepathy/scripts/telepathy.sh <slug>
   ```

   It installs its dependencies on the first run, opens the page with `xdg-open`, and prints the URL. It inherits `HERDR_PANE_ID` from your shell, which is how it finds your pane.
5. Write what you have for the user into a file (see "Which file" below), then send one line in the chat: the URL, and that the conversation continues there. That is the last chat message until the mode ends.

## Messages from the user

A message that starts with `[telepathy]` is the user talking. It says what they did, in which file and at which lines, followed by the text as a diff:

~~~
[telepathy] The user added line 14 to design.md, under "Q3 - Where is the retry count kept?":
```diff
+ On the job row, next to the status.
```
~~~

`edited` carries the block before and after, `added` the new lines and the block they were written under, `deleted` the lines removed. The diff is the user's own words; read it as you would a chat message. When the context around it matters, read the file around those lines.

Messages arrive in your input queue while you work, one per edit. Handle them in order. After you have answered in the files, end your turn with one short line in the chat that names the file you wrote in, such as "Answered in design.md." Claude Code needs some text to end a turn, so write that line and nothing else: no summary of what you wrote, no "waiting for the next message", and no command run only to have something to end on. The user is not looking at the chat, and whatever else you put there is lost to them.

## Writing in the files

- **Re-read before editing.** The server writes to the files whenever the user commits an edit. If your Edit fails because the file changed since you read it, read it again and redo the edit against what is there now.
- **Answer under what you answer.** A reply goes directly below the block it responds to, as its own block separated by a blank line, not at the end of the file.
- **Never change or delete what the user wrote** unless they asked you to. A block's authors are in `.meta.json`, under `files.<path>.blocks`. Each entry has the block's line range (0-based, end exclusive), an excerpt of its first line, and `authors`. A block whose authors include `user` is theirs, or one they edited. Read `.meta.json` whenever you need to know who wrote something, for instance after a compaction.
- **One thing per block.** The user edits and answers one block at a time. A block is a paragraph, a heading, a list item, a fenced block, a table or a blockquote. Give each question its own paragraph so an answer can go under it. Keep a design tree in one fenced block and rewrite that block in place when the tree changes, rather than appending a new copy.
- Mermaid fences render as diagrams, and Obsidian-style callouts (`> [!note] Title`, `> [!warning]`, `> [!tip]`) render as titled boxes. `.html` files show read-only in a frame. Only `.md` and `.html` files appear in the page, and paths starting with a dot never do.
- The user cannot create files from the page. Create the ones the session needs; they appear in the sidebar on their own.
- Never edit `.meta.json`. The server owns it.

### Which file

Write where the skill you are running already writes: mahou:design's `design.md`, mahou:test-design's `test-design/<repo>.md`, and so on. A skill that normally speaks only in the chat, such as mahou:shape or mahou:explore, writes into `conversation.md` unless the user names another file. Keep what belongs together in one file; open a new one only when the work splits into something the user would want to navigate to separately.

## Work that takes time

When a message asks for work beyond answering from what you already know, such as research, reading through code, a spike, an implementation or a review, give it to a subagent that runs in the background, and end your turn. While your turn runs, the user's edits queue up unanswered and the page stays still; a background subagent lets you keep answering while the work goes on.

1. Write a `working` callout under the block that asked, naming what is running. The page shows it with a spinner:

   ```markdown
   > [!working] Reading the retry code in `jobs/`
   ```

2. Start the subagent with the Agent tool, in the background, and have it report back to you. Give it the work only, with no instruction that involves the telepathy files. You are the one who writes the answer there: the server marks every write the user did not make as the agent's, so a second writer in the same files would pass as you and could edit a block while you do.
3. Keep answering the user's messages as they arrive.
4. When the subagent reports, replace the callout with the answer, in the same place.

When you can answer from what you know, or by looking up a line or two, answer in your own turn.

## What stays in the chat

When the server fails to start or dies, tell the user in the chat, in one line with the error from its output, and the mode ends. You know the server died when its background task exits. When you reused a server someone else started, check it with `kill -0` on the pid in `.meta.json`. Permission prompts still appear in the terminal.

## Ending

The mode ends when the user asks, or when the work it was started for is done. Stop the server: the background task you started, or `kill <pid>` from `.meta.json` when you are reusing one. Then say in the chat, in one line, that telepathy is off. The files stay in the scratch folder, `.meta.json` included, so a later session picks up who wrote what.
