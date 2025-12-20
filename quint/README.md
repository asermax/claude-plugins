# Quint Plugin

FPF (First Principles Framework) methodology for structured reasoning and decision-making.

## Overview

This plugin integrates the quint-code framework for systematic hypothesis generation, verification, and validation. It implements a rigorous ADI (Abduction-Deduction-Induction) reasoning cycle to help make auditable architectural and implementation decisions.

## Commands

### Core Reasoning Cycle (Q0-Q5)

| Command | Phase | Description |
|---------|-------|-------------|
| `/q0-init` | Setup | Initialize knowledge base and bounded context |
| `/q1-hypothesize` | Abduction | Generate multiple competing L0 hypotheses |
| `/q1-add` | Abduction | Manually add a custom hypothesis |
| `/q2-verify` | Deduction | Verify logical consistency, promote L0→L1 |
| `/q3-validate` | Induction | Gather empirical evidence, promote L1→L2 |
| `/q4-audit` | Audit | Calculate trust scores and assurance levels |
| `/q5-decide` | Decision | Select winning hypothesis, create Design Rationale Record |

### Utility Commands

| Command | Description |
|---------|-------------|
| `/q-status` | Display current reasoning cycle state |
| `/q-query` | Search the knowledge base |
| `/q-decay` | Report expired evidence (epistemic debt) |
| `/q-actualize` | Reconcile knowledge base with code changes |
| `/q-reset` | Discard current reasoning cycle |

## Key Concepts

### Knowledge Levels

- **L0 (Observation)**: Raw hypotheses, unverified claims
- **L1 (Reasoned)**: Logically verified, constraint-checked
- **L2 (Verified)**: Empirically tested and validated
- **Invalid**: Disproved claims (retained for learning)

### Trust Calculation

- **WLNK (Weakest Link)**: Assurance is capped by the weakest evidence, not averaged
- **Congruence Level (CL0-CL3)**: How well external evidence matches your project context
- **Evidence Decay**: Evidence expires over time, creating "epistemic debt"

### Design Rationale Records (DRR)

Final decisions are documented with:
- Selected hypothesis and supporting evidence
- Alternatives considered and why they were rejected
- Conditions under which the decision should be revisited
- Audit trail of the reasoning process

## MCP Server

The plugin uses the quint-code MCP server for state management:
- **Binary**: Built from `~/workspace/random/quint-code/src/mcp`
- **Installation**: Installed to `~/.local/bin/quint-code`
- **Database**: SQLite database in `.quint/quint.db` (project-local)

## Workflow Example

1. **Initialize** (Q0): Set up knowledge base with bounded context
   ```
   /q0-init
   ```

2. **Generate Hypotheses** (Q1): Create multiple competing approaches
   ```
   /q1-hypothesize
   ```

3. **Verify Logic** (Q2): Check internal consistency
   ```
   /q2-verify
   ```

4. **Validate Empirically** (Q3): Gather evidence through tests/research
   ```
   /q3-validate
   ```

5. **Audit** (Q4): Calculate trust scores
   ```
   /q4-audit
   ```

6. **Decide** (Q5): Select winner and create DRR
   ```
   /q5-decide
   ```

## When to Use

**Use quint for:**
- Architectural decisions with long-term consequences
- Multiple viable approaches requiring systematic evaluation
- Decisions needing an auditable reasoning trail
- Building organizational knowledge over time

**Skip quint for:**
- Quick fixes with obvious solutions
- Easily reversible decisions
- Time-critical situations where overhead isn't justified

## Syncing from Upstream

Commands are synced from the [quint-code](https://github.com/m0n0x41d/quint-code) repository:

```bash
/sync-upstream
```

This will:
1. Pull latest changes from `~/workspace/random/quint-code`
2. Copy command files to the plugin
3. Rebuild and install the MCP binary

## References

- **Upstream**: https://github.com/m0n0x41d/quint-code
- **FPF Methodology**: Anatoly Levenchuk's First Principles Framework
- **Local Clone**: `~/workspace/random/quint-code`
