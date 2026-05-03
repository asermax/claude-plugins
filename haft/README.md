# Haft Plugin

FPF (First Principles Framework) methodology for artifact-centric decision engineering.

Successor to the previous `quint` plugin — the upstream project (`m0n0x41d/quint-code`) was renamed to **haft**, with all commands rebranded `q-*` → `h-*` and the MCP server binary renamed `quint-code` → `haft`.

## Skill

- **h-reason** (`/h-reason "<problem>"`): Marquee entry point. Auto-routes through frame → explore → compare → decide in one pass, picking the right depth. Use this when you don't want to drive each step manually.

## Commands

### Core decision workflow

| Command | Description |
|---------|-------------|
| `/h-frame` | Frame an engineering problem (signal, constraints, targets, blast radius, mode) |
| `/h-char` | Define comparison dimensions for a framed problem |
| `/h-explore` | Generate distinct solution variants with weakest links |
| `/h-compare` | Compare variants fairly on the Pareto front |
| `/h-decide` | Finalize decision with full rationale (DecisionRecord) |
| `/h-verify` | Verify mode — check what's stale, drifted, or ready for measurement |

### Lightweight operations

| Command | Description |
|---------|-------------|
| `/h-note` | Record a micro-decision with rationale |
| `/h-onboard` | Onboard a project into Haft v7 specs and readiness |
| `/h-commission` | Create WorkCommissions from active DecisionRecords |

### Discovery & dashboards

| Command | Description |
|---------|-------------|
| `/h-problems` | List active engineering problems |
| `/h-search` | Search past decisions, problems, and notes |
| `/h-status` | Dashboard of active decisions, stale items, and notes |
| `/h-view` | Render canonical brief / rationale / audit / compare views |

**Recommended workflow:** `/h-frame` → `/h-char` → `/h-explore` → `/h-compare` → `/h-decide` → `/h-verify`

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

Tactical mode is available via `/h-frame` (mode=tactical) for simple decisions — frame → decide, skipping char/explore/compare.

## Syncing from Upstream

```
/sync-upstream
```

This will:
1. Pull latest changes from `~/workspace/random/quint-code`
2. Copy `h-*.md` command files to the plugin
3. Copy the `h-reason` skill (`internal/cli/skill/h-reason/SKILL.md` → `haft/skills/h-reason/SKILL.md`)
4. Refresh PRINCIPLES.md from upstream `CLAUDE.md`
5. Delete the cached MCP binary so it rebuilds on next session start

## References

- **Upstream**: https://github.com/m0n0x41d/quint-code (Go module: `github.com/m0n0x41d/haft`)
- **FPF Methodology**: Anatoly Levenchuk's First Principles Framework
- **Local clone**: `~/workspace/random/quint-code`
