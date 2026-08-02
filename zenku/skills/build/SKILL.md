---
name: build
description: Build something already designed, together with the user, then verify it and offer to commit. Use when a design is agreed and the work is ready to write, or when another skill needs the shared build discipline.
---

Load `zenku:codex`.

The decision is already made and the design is already agreed — `zenku:design` took it down to the types and signatures and the user signed off. What is left is writing it.

**Build it with the user, not for them.** Work in slices that each leave the thing working, and show each one as it lands. A slice that came out differently from the design is the most useful thing you will say all session: say it when it happens, while it is still cheap to go the other way.

New or changed behaviour gets new or updated automated coverage, and nothing exists only to make a test pass.

**Verify.** Run the project's `**Checks**`, then launch it and drive the path a real caller would. Green checks say the code runs, not that the thing works, and the gap between those two is where the failure that passes every test lives. Anything red: say which, and stop. Stay in the local or development environment throughout.

**Write the lore, if this is a loose quest.** Load `zenku:lore`. A change to how something works that leaves no lore is half done, and the quest's design is most of the draft already.

**Under a raid, do not.** The lore gets written once, at the raid's end, out of every quest's design at once, the venture's and the raid's together. A slice that documents itself as it lands produces one page per slice, each describing a part of a shape nobody has seen whole yet, and reconciling those afterwards costs more than writing the page once. Leave the detail on the quest and go on.

**Close the quest** with `zenku:solve`, if a quest record covers this. Building it is not finishing it: an unclosed quest still shows as in reach and still blocks whatever waited on it.

**Then say it is ready to commit, and stop.** Committing is `zenku:commit` and it is the user's to invoke. Approval of the work is not an instruction to commit it: they may want to keep going, fold this into other work, or handle the commit themselves.
