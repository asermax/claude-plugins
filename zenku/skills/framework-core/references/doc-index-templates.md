# Doc index templates

Each `docs/` subfolder carries a `README.md` that indexes its contents — a flat
catalog a reader (or a skill) scans before drilling into an individual document.
There are four, one per folder. They are **create-if-missing, keep-current**: the
skill that writes a doc into a folder is the skill that adds or updates that doc's
row in the folder's index. Never let the index drift from the folder.

Provenance stays in the dedicated **Grounded in** column (the same rule as a spec's
Evidence column) — the rest of each row is self-sufficient: a link and a one-line
description of what the doc covers.

Rows are ordered by ID (ADR/DES) or by milestone then feature (feature indexes).

---

## `docs/feature-specs/README.md`

```markdown
# Feature Specs

Capability catalog — every durable feature spec, what it covers, and its status.
For feature **ordering and dependencies** within a milestone, see
[`../planning/ROADMAP.md`](../planning/ROADMAP.md).

| Feature | Capability | Status | Milestone |
|---------|-----------|--------|-----------|
| [<feature-slug>](<feature-slug>.md) | <one line: what the feature does> | ✓ current | M1 |
```

## `docs/feature-designs/README.md`

```markdown
# Feature Designs

Design catalog — every durable feature design and the approach it takes.

| Feature | Approach | Status | Milestone |
|---------|----------|--------|-----------|
| [<feature-slug>](<feature-slug>.md) | <one line: the design approach> | ✓ current | M1 |
```

## `docs/architecture/README.md`

```markdown
# Architecture Decisions (ADR index)

One-time, hard-to-reverse, project-wide choices. Repeatable patterns live in the
[DES index](../design/README.md).

| ID | Decision | Status | Grounded in |
|----|----------|--------|-------------|
| [ADR-001](ADR-001-<slug>.md) | <the choice, in one line> | Accepted | [exp NNN](../../experiments/NNN-slug/README.md) |
```

Status mirrors the ADR's own `Status` field: `Proposed` / `Accepted` /
`Superseded by ADR-XXX`.

## `docs/design/README.md`

```markdown
# Design Patterns (DES index)

Repeatable, cross-cutting patterns (used 2+ places). One-time choices live in the
[ADR index](../architecture/README.md).

| ID | Pattern | Status | Applies to | Grounded in |
|----|---------|--------|-----------|-------------|
| [DES-001](DES-001-<slug>.md) | <the pattern, in one line> | Active | <where it applies> | [exp NNN](../../experiments/NNN-slug/README.md) |
```

Status mirrors the DES's own `Status` field: `Active` / `Deprecated`. `Grounded in`
is blank when no experiment shaped the pattern.
```
