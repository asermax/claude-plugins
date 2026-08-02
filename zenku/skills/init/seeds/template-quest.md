---
title: "{{title}}"
tags:
  - quest
summary: "One line: what this quest settles or builds. Shows up in the quest log index."
status: open
kind: build
adventure:
blocked_by: []
priority: 2-soon
created: "{{date:YYYY-MM-DD}}"
---

# {{title}}

## What

The question this settles, or the slice this builds. One session's worth.

Leave `adventure` empty for a loose quest, or link the adventure it belongs to, as a bare kebab-case filename. `blocked_by` lists the quests that must be solved before this one can start, in the same form, and it empties as they are.

## Design

The technical detail this quest settles or builds: which modules it touches, what is added, changed or removed, and the types and signatures.

**This is the only place that detail lives.** Nothing copies it up into the adventure, which keeps one shape in one file and lets the adventure stay short enough to read. The adventure's solved index points here instead, and the whole shape gets reconciled once, into a durable note, when the adventure runs out of trials.

A quest with no technical detail, most research, deletes this section.

## Answer

**Delete this whole section, heading included, when creating a quest.** It gets written when the quest is solved: what was found or built, how far it reaches, and what would make it stop being true.

---

Related: [[<<QUESTLOG>>/README|the quest log]]
