# Haft Plugin

FPF (First Principles Framework) methodology for artifact-centric decision engineering.

Successor to the previous `quint` plugin — the upstream project (`m0n0x41d/quint-code`) was renamed to **haft**, with all commands rebranded `q-*` → `h-*` and the MCP server binary renamed `quint-code` → `haft`.

As of the **v8 governance-substrate pivot**, haft's surface is a catalog of host-AI **skills** plus the MCP server — the standalone interactive agent and the old slash-`command` files are gone. The reasoning kernel, artifact graph, FPF spec retrieval, and WorkCommission lifecycle are unchanged; only the surface changed.

## Skills

Fifteen skills make up the FPF reasoning palette. Most auto-fire when their description matches your context; two are manual-only and three are subroutines called by other skills.

### Auto-triggering

| Skill | What it does |
|-------|--------------|
| **h-reason** | Umbrella entry point — the full reasoning palette (framing, exploration, comparison, verification, notes, slideument patterns) in one skill. Manual `/h-reason` always works; auto-fires on broad "let's think this through" signals where no specialized skill matches sharply |
| **h-frame** | Frame a problem (B.4.1 stabilize + problem typing + umbrella-word repair) before any solution is explored |
| **h-diagnose** | Diagnose a failure with parallel rival-hypothesis testing (one subagent per hypothesis, prevents anchoring) |
| **h-explore** | Generate distinct candidate variants with NQD diversity discipline |
| **h-compare** | Fair comparison with dim-wise parallel scoring + Pareto front (not a scalar winner) |
| **h-verify** | Baseline → measure → evidence loop with drift detection |
| **h-status** | Read-only project FPF state dashboard |
| **h-onboard** | First-frame ceremony for projects new to haft |
| **h-spec-cover** | Spec-coverage check with blind/stale module triage |
| **h-note** | Lightweight micro-decision recording |

### Manual-only (Transformer Mandate)

These carry `disable-model-invocation: true` — binding artifacts come from the human principal, never auto-fired by the agent. Type them explicitly.

| Skill | What it does |
|-------|--------------|
| **h-decide** | Record a binding DecisionRecord with full DRR (problem frame, decision/contract, rationale, consequences) |
| **h-commission** | WorkCommission lifecycle — create commissions from active decisions |

### Subroutines

Called from other skills or invoked explicitly when working a specific FPF sub-discipline.

| Skill | What it does |
|-------|--------------|
| **h-abduct** | Pure B.5.2 abductive four-step (frame prompt → ≥3 rivals → filters → prime) |
| **h-boundary-unpack** | A.6.B L/A/D/E decomposition of boundary statements |
| **h-semio-review** | X-FANOUT-AUDIT — concept-rename / spec-consistency audit |

**Recommended workflow:** describe the problem (h-frame fires) → `/h-explore` → `/h-compare` → manual `/h-decide` → `/h-verify`. Routing reliability is testable via `haft check routing`.

## MCP Server

- Binary built on-demand via SessionStart hook (first use)
- Built to `${CLAUDE_PLUGIN_ROOT}/bin/haft` (within plugin)
- Source cached in `~/.cache/claude-plugins/haft/` for building
- Manages state in `~/.haft/projects/<project-id>/` (unified storage)

## Context Injection

- SessionStart hook injects PRINCIPLES.md (upstream's CLAUDE.md)
- Prepares the agent with FPF methodology and decision frameworks
- Context synced from `~/workspace/random/quint-code/CLAUDE.md`

## Key Concepts

- **R_eff (Effective Reliability)**: Trust score (0-1) = min(evidence_scores) — weakest-link, never average
- **WLNK**: Weakest link principle — system reliability ≤ min(component reliabilities)
- **Congruence Level**: CL3 (same context, no penalty) → CL0 (opposed context, -0.9 penalty)
- **Evidence Decay**: Evidence has `valid_until`; expired scores 0.1 (weak, not absent)
- **DRR (DecisionRecord)**: Problem Frame + Decision/Contract + Rationale + Consequences
- **Module Coverage**: Tracks which codebase areas have decisions vs blind spots
- **Transformer Mandate**: Agents generate options, humans decide — no autonomous architectural decisions
- **Artifact Lifecycle**: active → refresh_due → superseded/deprecated

## CLI surface (outside the slash commands)

The `haft` binary the plugin builds also exposes operator/runtime commands not surfaced as slash commands:

- `haft check` — local governance verification (exit 0 = clean, exit 1 = findings)
- `haft spec check [--json]` — deterministic L0/L1/L1.5 spec carrier validation
- `haft run <decision-id>` — implement a decision by spawning an agent with full reasoning context
- `haft harness run [--prepare-only|--drain --concurrency N]` — batch WorkCommission execution under Open-Sleigh
- `haft harness {status,result,apply,requeue,cancel}` — operator surface for in-flight runs
- `haft commission {create-from-decision,list,show,...}` — lower-level commission management

State lives under `~/.haft/projects/<project-id>/` (auto-migrated from the legacy `.quint/` directory on `haft init`).

## When to Use

**Use haft for:**
- Architectural decisions with long-term consequences
- Multiple viable approaches requiring systematic evaluation
- Decisions needing an auditable reasoning trail

**Skip haft for:**
- Quick fixes with obvious solutions
- Easily reversible decisions
- Time-critical situations where overhead isn't justified

Tactical mode is available for simple reversible decisions — frame → decide, skipping explore/compare. Record it via `/h-decide` with `mode="tactical"` (plus `_skips`/`_skip_reason` to bypass non-load-bearing fields).

## Syncing from Upstream

```
/sync-upstream
```

This will:
1. Pull latest changes from `~/workspace/random/quint-code`
2. Mirror the skill catalog (`internal/cli/skill/h-*/SKILL.md` → `haft/skills/h-*/SKILL.md`)
3. Refresh PRINCIPLES.md from upstream `CLAUDE.md`
4. Delete the cached MCP binary so it rebuilds on next session start

## References

- **Upstream**: https://github.com/m0n0x41d/quint-code (Go module: `github.com/m0n0x41d/haft`)
- **FPF Methodology**: Anatoly Levenchuk's First Principles Framework
- **Local clone**: `~/workspace/random/quint-code`
