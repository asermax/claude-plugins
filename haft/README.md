# Haft Plugin

FPF (First Principles Framework) methodology for artifact-centric decision engineering.

Successor to the previous `quint` plugin — the upstream project (`m0n0x41d/quint-code`) was renamed to **haft**, with all commands rebranded `q-*` → `h-*` and the MCP server binary renamed `quint-code` → `haft`.

As of the **v8 governance-substrate pivot**, haft's surface is a catalog of host-AI **skills** plus the MCP server — the standalone interactive agent and the old slash-`command` files are gone. The reasoning kernel, artifact graph, FPF spec retrieval, and WorkCommission lifecycle are unchanged; only the surface changed.

## Skills

Twelve skills make up the FPF reasoning palette (upstream **v9**). All but one auto-fire when their description matches your context; `h-commission` is manual-only. The v8 subroutines (`h-abduct`, `h-boundary-unpack`, `h-semio-review`) were folded back inside the public skills, and `h-spec-cover` became `h-spec`.

### Auto-triggering

| Skill | What it does |
|-------|--------------|
| **h-reason** | Source-first umbrella for FPF-aware reasoning. Manual `/h-reason` always works; auto-fires on broad "let's think this through" signals where no specialized skill matches sharply |
| **h-frame** | Shape an under-articulated problem without assuming a solution or forcing a project phase |
| **h-diagnose** | Diagnose a concrete failure with parallel rival-hypothesis testing (one subagent per hypothesis, prevents anchoring) |
| **h-explore** | Generate 3-5 genuinely distinct candidate approaches, each with its weakest link kept visible |
| **h-compare** | Fair comparison under an explicit characteristic space and parity basis, returning a non-dominated set rather than a scalar winner |
| **h-decide** | Route one direct, unambiguous operator request to bind a bounded choice as a DecisionRecord. Binds without a round trip when effect, subject, option and scope are unambiguous; otherwise presents a Human Gate Brief and binds nothing |
| **h-verify** | Baseline → measure → evidence loop with drift detection |
| **h-status** | Read-only project cockpit: problems, decisions, notes, evidence freshness, drift, commissions, spec lifecycle, module coverage |
| **h-spec** | Typed specification lifecycle and source-currentness repair |
| **h-onboard** | Bootstrap haft for a repository, or review a project-profile declaration or relation change |
| **h-note** | Persist a non-binding fact, observation or caveat when asked |

### Manual-only (Transformer Mandate)

Carries `disable-model-invocation: true` — execution authority comes from the human principal, never auto-fired by the agent. Type it explicitly.

| Skill | What it does |
|-------|--------------|
| **h-commission** | WorkCommission lifecycle — grant bounded execution authority from an active DecisionRecord |

**Recommended workflow:** describe the problem (h-frame fires) → `/h-explore` → `/h-compare` → `/h-decide` → `/h-verify`. These are independent entries, not phases: completing one does not imply another must follow. Routing reliability is testable via `haft check routing`.

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
