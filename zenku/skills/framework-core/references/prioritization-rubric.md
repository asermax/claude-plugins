# Experiment prioritization rubric

The shared scoring vocabulary for `zenku:prioritize` and `zenku:priority-reviewer`. It orders a backlog of **experiments** — bets that reduce uncertainty — so the most impactful ones run first.

An experiment backlog is not a feature backlog. Feature-prioritization scores (RICE, ICE, PIE, Kano) assume the payoff is already estimable and **penalize uncertainty** — their "confidence" means "confidence this will work," which buries the exact experiments most worth running. This rubric does the opposite: it treats **information value — how much running the experiment resolves — as first-class**, and rewards uncertainty rather than punishing it.

## The four factors

Each is a coarse call, not a precise number. Score beyond three buckets is theatre: don't litigate whether something is a 6 or a 7.

- **Stakes (S)** — 1 Low / 2 Med / 3 High. How much rides on the answer? Does resolving this question gate a roadmap fork, a design decision, or a go/no-go on a whole feature line? A question whose answer changes nothing scores Low.
- **Uncertainty (U)** — 1 Low / 2 Med / 3 High. How *unsettled* is the pre-registered hypothesis **right now**? This is *not* "will it work" — it is "how little do we currently know." An assumption already validated elsewhere, or a question already answered/contradicted by a `LEARNINGS.md` entry, scores Low no matter how important it sounds. This axis is what makes the rubric an experiment ranker rather than a feature ranker.
- **Cost (C)** — 1 small / 2 medium / 3 large. How big is the spike to build and judge? Cheaper-first bias. zenku spikes are meant to be small, so keep this rough.
- **Unlock (X)** — a flag, not a full dimension. Does concluding this experiment unblock downstream work — other backlog items that only make sense once it resolves, **or a whole roadmap milestone / decision that is gated on the answer**? A milestone gate counts as a strong Unlock even if it directly unblocks only one sibling idea; the reach is the decision it frees, not the count of adjacent entries. Used to break ties, and strong enough to lift a bottleneck experiment up a tier (see the sort).

## The sort

```
Priority ≈ (Stakes × Uncertainty) / Cost      — Unlock breaks ties
```

Ordinal. Use it to sort into **top / mid / low tiers**, not to produce a leaderboard number to defend — a small quotient gap (4.0 vs 4.5) is the same tier, not a ranking. Two rules override the raw quotient: (1) rank only *within* a dependency tier — an experiment never outranks one it presupposes, regardless of score; (2) a strong **Unlock** (an experiment that gates a milestone or a pending decision) belongs in the top tier even when a cheap, independent idea edges it on the bare `(S×U)/C` number — freeing the gated decision is worth more than the cheaper idea's marginal score.

## The S≈0 filter

Before ranking, drop any idea where even a *perfect* answer would change no decision (Stakes ≈ 0). That is a framing problem, not a priority problem — the question isn't decision-relevant yet. Bounce it back toward `/experiment-start` (sharpen it) or `/capture` (park it); do not rank it.
