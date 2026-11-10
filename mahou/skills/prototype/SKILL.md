---
name: prototype
description: Loaded by other skills to show the user a screen element, or the options for a piece of the visual direction (palette, icons, logo, fonts), as a working HTML prototype and iterate it with them, round by round, until it matches what they want. Carries how the file is built and opened, and one reference per variant for how its rounds run. The loading skill says what the prototype is of and which decisions it stands for.
user-invocable: false
allowed-tools: Read, Write, Bash
---

Load mahou:basics first. Then read `.mahou/prototype.md` if present.

# Prototype

A prototype is a picture the user can look at and poke, standing in for something that does not exist yet: a screen element, or the palette, icons, logo or fonts a product will use. It answers "what would this look like" faster than prose, and it exposes the questions prose hides. The skill that loads this one says what the prototype is of and what is already decided about it. The prototype shows only that; it decides nothing.

## Variants

Read the reference for the variant the loading skill asks for, and follow it in addition to this file.

| The prototype shows | Reference |
|---|---|
| A screen element: where it sits, its states, its interactions | `references/screen-element.md` |
| The options for one piece of the visual direction, side by side, for the user to pick | `references/visual-direction.md` |

## The file

One HTML file, written to the change's scratch folder at `prototypes/`, per the convention in mahou:basics, with its CSS and script inline and no external dependencies, no build step and no framework. It keeps the same path on every round.

Open the file with Plannotator, backgrounded, every round:

```
plannotator annotate --render-html {absolute-path-to-prototype.html} --title "{element name}"
```

The command returns when the user submits, and its output carries their annotations on the rendered page. Read them as that round's pick or corrections. An annotation can carry an attached image, listed with its path; read it and copy it to `prototypes/refs/` in the change's scratch folder, so later rounds can point at it. Never poll; the result arrives on its own. When the session times out before the user submits, start it again with the same command and tell the user it restarted. The user can also answer in the chat instead of annotating; take whichever arrives first.

Example data is one fixed set, used by every alternative and every state, so the user compares the design and not the data.

The screen shows only what the product would show. Put text that explains the prototype or the design to the reader in the text above the controls or in an alternative's line. Examples are who sees an element and what a control is for.

A new prototype starts from the prototypes already settled for the same product in the change's `prototypes/` folder. It reuses their header, menus, titles, components, badges, palette, icons, logo and fonts as they are, and changes only what the new element needs. When a subagent builds it, the subagent's prompt names those files as the base.

The file is the loading skill's to use once the rounds end; what becomes of it is that skill's concern.
