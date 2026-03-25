---
name: retrofit-project
description: |
  Full project retrofit - discover modules, create specs, designs, decisions, and vision from existing code.
  Use when initializing the katachi framework on an existing project with code, or when the user wants to retrofit documentation for the entire project at once.
---

# Retrofit Project

Orchestrate a complete documentation retrofit for an existing project with code. Discovers modules, builds a retrofit plan, then autonomously creates feature specs, feature designs, architectural decisions, and a synthesized vision document.

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles, templates, and task management
- `katachi:retrofit-existing` - Retrofit philosophy and migration strategies

### Existing docs (read if present)
- `docs/planning/VISION.md`
- `docs/feature-specs/README.md`
- `docs/feature-designs/README.md`
- `docs/architecture/README.md`
- `docs/design/README.md`

### Reference Templates
- `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/feature-spec.md` - Feature spec format
- `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/feature-design.md` - Feature design format
- `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/feature-domain-readme.md` - Domain README format
- `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/feature-specs-readme.md` - Top-level feature index format
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/ADR-template.md` - ADR format
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/DES-template.md` - DES format
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/VISION-template.md` - Vision format
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/decision-types.md` - ADR vs DES guidance
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/code-examples.md` - Code snippet guidance
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/technical-diagrams.md` - Diagram guidance

## Pre-Check

Verify before starting:

1. **Framework initialized**: `docs/planning/` directory exists. If not → suggest `/katachi:init-framework` first.
2. **Project has code**: Source files exist (check for `src/`, `lib/`, `app/`, language-specific files, etc.). If no code → redirect to greenfield workflow (`/katachi:vision`).

## Process

### 0. Check for Existing Scratchpad

Derive the project name from the basename of the current working directory (e.g. `/home/user/workspace/myapp` → `myapp`).

Check if `/tmp/retrofit-project-<project-name>-state.md` exists.

If yes:
- Read the scratchpad
- Summarize progress: current phase, what's completed, what remains
- Ask: "Would you like to continue from where we left off, or start fresh?"
- If continuing → skip to the appropriate phase based on scratchpad state
- If starting fresh → delete the scratchpad and proceed from Phase 1

If no → proceed to Phase 1.

---

### Phase 1: Project Inventory

Dispatch a `katachi:codebase-analyzer` subagent to inventory the entire project:

```python
Task(
    subagent_type="katachi:codebase-analyzer",
    prompt=f"""
Analyze this project structure to create a complete inventory.

## Analysis Type
spec

## Target
[project root directory - read the top-level structure, then explore each major module/package]

## Instructions
Perform a project-wide inventory (not a single-module analysis):

1. **Modules**: Identify each key module/package/directory. For each:
   - Path
   - Purpose (1-2 sentences)
   - Estimated scope (Small / Medium / Large)

2. **Capability Domains**: Group related modules into logical domains
   (e.g., "auth" domain containing login, registration, session modules)

3. **Cross-Cutting Decisions**: Identify architectural choices and patterns:
   - Framework/library choices → ADR candidates
   - Database/storage choices → ADR candidates
   - Repeatable patterns (error handling, logging, testing) → DES candidates
   - For each, note the relevant code locations

4. **Dependencies**: Which modules depend on which (foundational modules first)

## Project Context
{vision_content if exists else "No VISION.md - infer project context from code"}
"""
)
```

Present the inventory to the user as structured tables:

```
## Project Inventory

### Modules
| # | Module | Purpose | Scope | Domain |
|---|--------|---------|-------|--------|
| 1 | src/auth/ | User authentication and sessions | Medium | auth |
| 2 | src/api/ | REST API endpoints | Large | api |
| ... | ... | ... | ... | ... |

### Capability Domains
| Domain | Modules | Description |
|--------|---------|-------------|
| auth | auth/, sessions/ | Authentication and authorization |
| ... | ... | ... |

### Detected Decisions
| # | Topic | Type | Relevant Code |
|---|-------|------|---------------|
| 1 | PostgreSQL for storage | ADR | src/db/, config/database.* |
| 2 | Repository pattern | DES | src/*/repository.* |
| ... | ... | ... | ... |

### Module Dependencies
[foundational modules listed first]

Does this inventory look right? Any modules missing, misidentified, or domains to adjust?
```

Wait for user confirmation/adjustments before proceeding.

Initialize scratchpad at `/tmp/retrofit-project-<project-name>-state.md`:

```markdown
# Retrofit Project State

## Phase
inventory-confirmed

## Inventory

### Modules
| Module | Domain | Scope | Spec Status | Design Status |
|--------|--------|-------|-------------|---------------|
| src/auth/ | auth | Medium | Pending | Pending |
| src/api/ | api | Large | Pending | Pending |

### Decisions
| # | Topic | Type | Status |
|---|-------|------|--------|
| 1 | PostgreSQL | ADR | Pending |
| 2 | Repository pattern | DES | Pending |

## Plan
(not yet built)
```

---

### Phase 2: Retrofit Plan

Build a prioritized plan from the confirmed inventory. Order modules by dependency (foundational first), then by importance.

Present the plan:

```
## Retrofit Plan

### Step 1: Feature Specs (one per module)
1. [ ] [module-a] — [purpose] → docs/feature-specs/[domain]/[name].md
2. [ ] [module-b] — [purpose] → docs/feature-specs/[domain]/[name].md
...

### Step 2: Feature Designs (one per module)
1. [ ] [module-a] design → docs/feature-designs/[domain]/[name].md
2. [ ] [module-b] design → docs/feature-designs/[domain]/[name].md
...

### Step 3: Decisions
1. [ ] [ADR] [framework choice] → docs/architecture/ADR-001-...md
2. [ ] [DES] [error handling pattern] → docs/design/DES-001-...md
...
(Additional decisions may be discovered during design analysis)

### Step 4: Project Structure
- [ ] Domain READMEs for feature-specs/ and feature-designs/
- [ ] Top-level README indexes
- [ ] Architecture and design indexes

### Step 5: Vision
- [ ] Synthesize VISION.md from all documented features

This plan will execute autonomously. Ready to proceed?
```

Wait for user confirmation. This is the last approval before autonomous execution.

Update scratchpad with the full plan.

---

### Phase 3: Execution

Execute the plan autonomously using subagents. Write all output files directly.

#### Step 1 — Retrofit Specs (parallel)

For each module in the plan, dispatch a `katachi:codebase-analyzer` subagent **in parallel** (spec mode):

```python
Task(
    subagent_type="katachi:codebase-analyzer",
    prompt=f"""
Analyze this code to create a feature specification.

## Analysis Type
spec

## Target
{module_path}

## Project Context
{vision_content if exists else "Infer project context from code"}
"""
)
```

For each result:
- Adapt the output to match the **feature-spec template** (not the codebase-analyzer's raw spec format)
- Add a Retrofit Note at the top:
  ```markdown
  ## Retrofit Note

  This spec was created from existing code at `[path]`.
  Retrofit date: [today's date]

  ---
  ```
- Write to `docs/feature-specs/[domain]/[name].md`

After all specs are written:
- Create domain README files using the `feature-domain-readme.md` template
- Create/update `docs/feature-specs/README.md` using the `feature-specs-readme.md` template
- Update scratchpad marking all specs as done

Update scratchpad with a summary of specs created, then proceed immediately to designs.

#### Step 2 — Retrofit Designs (parallel)

For each module, dispatch `katachi:codebase-analyzer` **in parallel** (design mode), providing the corresponding spec as context:

```python
Task(
    subagent_type="katachi:codebase-analyzer",
    prompt=f"""
Analyze this code to create a design document.

## Analysis Type
design

## Retrofitted Spec
{spec_content}

## Implementation Code
{code_content}

## Project Context
{vision_content if exists else "Infer from code"}

## Existing ADR Index
{adr_readme_content if exists else "No ADRs yet"}

## Existing DES Index
{des_readme_content if exists else "No DES yet"}
"""
)
```

For each result:
- Adapt the output to match the **feature-design template**
- Add a Retrofit Note:
  ```markdown
  ## Retrofit Note

  This design was created from existing code at `[path from spec]`.
  Retrofit date: [today's date]
  Decisions discovered: [list any ADR/DES candidates flagged]

  ---
  ```
- Write to `docs/feature-designs/[domain]/[name].md`
- **Collect all ADR/DES candidates** from the Key Decisions sections
- Merge newly discovered decisions with the plan's existing decision list (deduplicate)

After all designs are written:
- Create domain README files for `docs/feature-designs/`
- Create/update `docs/feature-designs/README.md`
- Update scratchpad marking all designs as done

If new decisions were discovered, merge them into the plan's decision list and note the additions in the scratchpad. Proceed immediately to decisions.

#### Step 3 — Retrofit Decisions (parallel)

For each decision (original plan + newly discovered), dispatch `katachi:codebase-analyzer` **in parallel** (decision mode):

```python
Task(
    subagent_type="katachi:codebase-analyzer",
    prompt=f"""
Analyze the codebase to document this decision.

## Analysis Type
decision

## Topic
{decision_description}

## Relevant Code
{code_demonstrating_the_decision}

## Project Context
{vision_content if exists else "Infer from code"}
"""
)
```

For each result:
- Determine ADR vs DES from the agent's recommendation
- Assign sequential IDs: ADR-001, ADR-002... / DES-001, DES-002...
- Adapt output to match **ADR-template.md** or **DES-template.md**
- Add Retrofit Note header
- Write to `docs/architecture/ADR-NNN-title.md` or `docs/design/DES-NNN-title.md`

After all decisions are written:
- Create/update `docs/architecture/README.md` with ADR index table
- Create/update `docs/design/README.md` with DES index table
- Update feature design documents to cross-reference the newly created ADR/DES documents in their Key Decisions sections
- Update scratchpad marking all decisions as done

#### Step 4 — Synthesize Vision

Using all the documented specs, designs, and decisions as input, compile a VISION.md following the **VISION-template.md** structure:

- **Problem**: Infer from the collective feature specs — what problem space does this project address?
- **Core Workflows**: Extract from the most central/foundational features
- **Scope**: v1 requirements = what's already implemented (from specs); "Not Now" = gaps or future possibilities spotted during analysis
- **Technical Context**: Pull from ADRs (platform, language, framework, database choices)
- **Success Criteria**: Infer from what the project actually delivers

Present the draft VISION.md to the user:

```
## Draft Vision

[Full VISION.md content]

---

This vision was synthesized from the N feature specs, N designs,
and N decisions we just documented.

What needs adjustment?
```

Iterate based on feedback until the user accepts. Write to `docs/planning/VISION.md`.

---

### Phase 4: Summary

Present the final summary:

```
## Retrofit Complete!

### Documents Created
- Feature Specs: N documents across M domains
- Feature Designs: N documents
- ADRs: N architectural decisions
- DES: N design patterns
- VISION.md: Project vision synthesized

### Project Structure
docs/
├── planning/
│   └── VISION.md
├── feature-specs/
│   ├── README.md
│   ├── [domain]/
│   │   ├── README.md
│   │   └── [capability].md
│   └── ...
├── feature-designs/
│   ├── README.md
│   ├── [domain]/
│   │   ├── README.md
│   │   └── [capability].md
│   └── ...
├── architecture/
│   ├── README.md
│   └── ADR-NNN-*.md
└── design/
    ├── README.md
    └── DES-NNN-*.md

### Next Steps
The project is now documented in the katachi framework. For future work:
- `/katachi:add-delta` - Add new work items
- `/katachi:spec-delta <ID>` - Spec a new delta
- `/katachi:decision <topic>` - Record new decisions
```

Clean up scratchpad (delete `/tmp/retrofit-project-<project-name>-state.md`).

---

## Scratchpad Format

File: `/tmp/retrofit-project-<project-name>-state.md`

```markdown
# Retrofit Project State

## Phase
[inventory / inventory-confirmed / plan-confirmed / specs / designs / decisions / vision / complete]

## Inventory

### Modules
| Module | Domain | Scope | Spec Status | Design Status |
|--------|--------|-------|-------------|---------------|
| src/auth/ | auth | Medium | Done | Pending |
| src/api/ | api | Large | Pending | Pending |

### Decisions
| # | Topic | Type | Status | Document |
|---|-------|------|--------|----------|
| 1 | PostgreSQL | ADR | Done | ADR-001 |
| 2 | Repository pattern | DES | Pending | - |

### Decisions Discovered During Design
| # | Topic | Type | Source Module | Status |
|---|-------|------|--------------|--------|
| 3 | JWT tokens | ADR | auth/ | Pending |

## Plan
[Full plan checklist with progress markers]
```

## Error Handling

- **Framework not initialized**: Suggest `/katachi:init-framework` first
- **No code in project**: Redirect to greenfield workflow (`/katachi:vision`)
- **Scratchpad lost between sessions**: Check what docs already exist in `docs/`, reconstruct progress, ask user to confirm before continuing
- **Subagent failure**: Report which module/decision failed, offer to retry or skip
- **User wants to skip a module**: Mark as "Skipped" in scratchpad, proceed to next

## Workflow

This is a phased autonomous process with two user touchpoints:
1. **Inventory** — Discover and confirm project structure (interactive)
2. **Plan** — Build and confirm retrofit plan (interactive — last approval before autonomous execution)
3. **Execute** — Specs → Designs → Decisions, all run autonomously via subagents with no user stops
4. **Vision** — Synthesize and iterate with user (interactive)
5. **Summary** — Present results and next steps
