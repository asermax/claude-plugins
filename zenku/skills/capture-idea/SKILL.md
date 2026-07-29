---
name: capture-idea
description: Write an idea (an objective and the unknowns standing between us and it) into the lab backlog without breaking flow. Trigger when the user drops something worth keeping that they do not yet know how to get: "idea:", "we should try…", "capture this", "add that to the backlog".
---

# Capture an idea

Cheap by design. This takes seconds, commits to nothing, and gets out of the way. Rigor is paid later, in `zenku:experiment`.

Resolve the vault, the ideas folder and its template per `zenku:framework-core` §1 before writing anything.

## What an idea is

An **objective** (something we want to be able to do) and, once anyone has thought about it, the **unknowns** standing between us and it.

The objective is a goal, not a question. It does not come out true or false and it does not need to be falsifiable; demanding that it be only produces a question nobody actually had. Falsifiability lives one level down, in the unknowns, and going after those is what experiments are for.

Most captures are just the objective. That is what the earliest status means and it is a perfectly good place to stop.

**If what the user described is not that** (if it is work they already know how to do, a defect, a slice everyone has agreed on), say so in one line and offer `zenku:capture-backlog` instead. That check is the whole reason the two skills are separate, and it is worth one sentence: an objective is something we do not know how to reach, and forcing decided work through a shaping lifecycle produces states that mean nothing.

## What to write

A note in the project's ideas folder, created from the project's idea template. The slug is kebab-case, named for the subject, and **must be unique across the whole vault**: wikilinks resolve by name, so check before writing.

**Read the fields off the template's frontmatter rather than off any list here.** Whatever the project carries is what you propose; a project that has added a field of its own gets it proposed like the rest.

The sections are the template's too. Two things are worth knowing about the shape the framework expects to find there:

- The **objective** says what we want to be able to do and what it looks like when we can. Constraints belong there too (a condition attached to one thing we want is not a second idea), and so does anything already settled or already true of the code, so nobody re-tests it or mistakes it for an unknown.
- The **unknowns** are only filled in if there is something real to put there. A freshly captured idea usually has nothing yet.

If the template has no section arguing *for* the idea, that is deliberate and you should not add one. An objective says what we cannot do today, which is already why it matters; a heading asking for the case in favour gets one whether or not there was one to make, and it is where a two-line objective grows into a project.

**Short.** A capture is a few sentences per section. The size of the note is a claim about how much thinking has happened, and a long one on a one-line idea makes an objective look like a project before anybody has decided it is worth one.

Then close it the way the project's house style closes a note, and link it: the lab's own index, plus any note the idea actually touches. **An idea nothing links to does not get read.**

## Filling in the fields

Propose them all rather than asking. Then say in one line what was guessed, so it can be corrected without a round of questions.

The values are the project's, and the template or the charter will state them. Two rules are the framework's rather than the project's:

- The **status** at capture time is one of the early ones: the objective just dropped in, the objective properly stated, or the unknowns already obvious enough to write down on the spot. **`promoted` and `dropped` are not yours to set.** They are decisions, and they belong to `zenku:promote` and `zenku:drop`.
- Where the project carries a priority, an impact and a size, they mean: which of these we would pick up now; how much *reaching the objective* changes, rather than how much anyone wants it; and what reaching it would cost.

## Rules

**Write the user's idea, not your improvement of it.** This is the rule this skill breaks most easily, because elaborating is cheap and looks like diligence. The objective is what the user said they want to be able to do, in about as many words as they said it. No taxonomy of cases, no threshold, no scoring scheme, no constraint they did not state, and no unknowns invented to fill the section out. If something occurs to you that they did not say, offer it in the reply as yours (one line, take it or leave it) and leave it out of the file until they take it.

The failure is not that the extra material is wrong; it is often reasonable. It is that a note nobody can tell apart from what they asked for becomes the thing the next session builds against, and the objective quietly turns into someone else's.

**Check for an idea that already covers it** and extend that note instead of writing a second one. Two notes about the same objective is how a backlog stops being readable. Search the ideas folder by name and by summary before writing.

**One objective per idea.** If it needs an "and", that is two ideas: write both, and say so.

What is *not* a second idea is a **constraint on the same objective**. "A debugger, and it must not ship in production" is one thing to want with a condition attached, not two things. Constraints go with the objective; the ones nobody knows how to satisfy yet are unknowns. Splitting on a constraint produces an orphan note that reads as a preference with no purpose.

**Ground it in what exists.** If the idea touches something already documented, link that note and say what it changes about it. If it contradicts something the project has already recorded (in a note, or in CLAUDE.md), say so in the objective rather than quietly proposing the opposite.

**Do not run the idea.** No code, no research, no design. Write the note, confirm in one line, and return to whatever was happening.

## Confirming

The title, where it landed, the guessed fields, and the **objective text itself, quoted**, because it is two sentences and it is the one part that must be the user's rather than yours.

That is the whole reply. No summary of your reasoning and no offer to expand it: this skill's value is that it costs no attention, and a note whose objective the user has read is the cheapest possible protection against the rule above.
