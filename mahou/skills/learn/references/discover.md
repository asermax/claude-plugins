# Discovery mode

Used when `learn` is invoked without arguments.

1. **Scan the conversation for friction.** Read it end to end before judging any part of it. Then collect only the points where the flow's behavior changed. Most of these are the user's own interventions: a request to change the format of an output, a request for something outside the flow, a correction of something the agent had put together or researched, a reversal of an earlier decision, anything the user had to ask for more than once. Where the agent itself redid an output or retracted a reading, that counts too. The stretches where the flow ran without the user steering it are evidence the skills worked, not findings. Where the conversation has been compacted, work from what remains and say so: friction a compaction dropped is gone, and a plausible reconstruction of it is a guess.

2. **Report each friction point, and stop there.** This is a deliverable, not a preamble. One short block of plain prose per point, in the order the points happened: what the flow was doing, what the user asked for instead, and what that says when compared with the plugin's existing skills and wiki. Read the skills and entries each point touches before writing this. What it says is an observation, not a proposal: a format a skill prescribes that the user overrides, a step that exists only in session memory, a need the flow had no answer for and the user improvised around, a guardrail nothing enforced, a fact about a tool the agent had to rediscover. Where the same correction shows up more than once, say so; that is the strongest signal in the session.

   Ask whether the points match what the user remembers. They were there. You are reading their interventions back to them. Iterate until the points match.

3. **The user proposes what to keep.** Do not present a candidate list, and do not turn the points into proposals. Answer questions about the points, then wait.

Continue with **Drafting** in `SKILL.md`.
