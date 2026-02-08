---
name: migrate-to-deltas
description: Migrate existing katachi project to delta-based workflow
disable-model-invocation: true
---

# Migrate to Delta-Based Workflow

Migrate an existing katachi project from feature-centric to delta-centric development.

## Context

**You must load the following skills before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles and task management

## What This Does

Transforms your project structure:
- FEATURES.md → DELTAS.md (converts feature entries to deltas)
- feature-specs/*.md → delta-specs/*.md (working documents)
- feature-designs/*.md → delta-designs/*.md (working documents)
- Generates new nested feature documentation from deltas
- Updates DEPENDENCIES.md to use delta IDs
- Removes BACKLOG.md (items optionally converted to deltas)

## Pre-Check

Verify this is a katachi project:
- Check for `docs/planning/FEATURES.md`
- Check for `docs/planning/DEPENDENCIES.md`
- If not found, this is not a katachi project or already migrated

Warn user:
```
"This will restructure your katachi project files.

Changes:
- Creates: delta-specs/, delta-designs/, delta-plans/
- Transforms: FEATURES.md → DELTAS.md
- Moves: feature-specs/ → delta-specs/
- Moves: feature-designs/ → delta-designs/
- Generates: New nested feature-specs/ and feature-designs/
- Updates: DEPENDENCIES.md (delta IDs)
- Removes: BACKLOG.md

Continue with migration? [Y/N]"
```

If user declines, exit.

## Migration Process

Use parallel task execution for independent operations.

### Phase 1: Create Tasks

Create all migration tasks with dependencies:

```python
# Task 1: Create directory structure (no deps)
TaskCreate(
    subject="Create delta directory structure",
    description="Create delta-specs/, delta-designs/, delta-plans/ directories"
)

# Task 2: Transform FEATURES.md → DELTAS.md (no deps)
TaskCreate(
    subject="Transform FEATURES to DELTAS",
    description="Convert FEATURES.md entries to DELTAS.md with DLT-XXX IDs"
)

# Task 3: Move feature-specs/ → delta-specs/ (depends on 1, 2)
TaskCreate(
    subject="Move feature specs to delta specs",
    description="Rename and move feature-specs/*.md → delta-specs/*.md"
)

# Task 4: Move feature-designs/ → delta-designs/ (depends on 1, 2)
TaskCreate(
    subject="Move feature designs to delta designs",
    description="Rename and move feature-designs/*.md → delta-designs/*.md"
)

# Task 5: Update DEPENDENCIES.md (depends on 2)
TaskCreate(
    subject="Update dependency matrix",
    description="Update DEPENDENCIES.md to use delta IDs (DLT-XXX)"
)

# Task 6: Remove BACKLOG.md (depends on 2)
TaskCreate(
    subject="Remove backlog",
    description="Archive or delete BACKLOG.md"
)

# Task 7: Analyze deltas to identify domains (depends on 3, 4)
TaskCreate(
    subject="Analyze capability domains",
    description="Group deltas into capability domains for feature docs"
)

# Task 8: Generate feature-specs/ structure (depends on 7)
TaskCreate(
    subject="Generate feature specs",
    description="Create nested feature-specs/ with READMEs"
)

# Task 9: Generate feature-designs/ structure (depends on 7)
TaskCreate(
    subject="Generate feature designs",
    description="Create nested feature-designs/ with READMEs"
)
```

### Phase 2: Execute Tasks

Execute tasks respecting dependencies. Tasks without dependencies can run in parallel.

#### Task 1: Create Directory Structure

```bash
mkdir -p docs/delta-specs
mkdir -p docs/delta-designs
mkdir -p docs/delta-plans
```

#### Task 2: Transform FEATURES.md → DELTAS.md

Read FEATURES.md, convert to DELTAS.md format:

**Old format (FEATURES.md):**
```markdown
### CATEGORY-001: Feature name
**Status**: ✓ Defined
**Complexity**: Medium
**Description**: Feature description...
```

**New format (DELTAS.md):**
```markdown
### DLT-001: Feature name
**Status**: ✓ Defined
**Complexity**: Medium
**Description**: Feature description...
```

Mapping:
- Create sequential DLT-NNN IDs
- Preserve status, complexity, description
- Track mapping (DLT-NNN → DLT-NNN) for dependency updates

Write to `docs/planning/DELTAS.md`.

#### Task 3: Move feature-specs/ → delta-specs/

For each file in `docs/feature-specs/`:
- Read content
- Update header (FEATURE-ID → DLT-ID using mapping)
- Add "Detected Impacts" section template at end
- Write to `docs/delta-specs/DLT-NNN.md`

#### Task 4: Move feature-designs/ → delta-designs/

For each file in `docs/feature-designs/`:
- Read content
- Update header (FEATURE-ID → DLT-ID using mapping)
- Add "Detected Impacts" section template at end
- Write to `docs/delta-designs/DLT-NNN.md`

#### Task 5: Update DEPENDENCIES.md

Read DEPENDENCIES.md:
- Update matrix headers (use mapping)
- Update row labels (use mapping)
- Preserve X marks (dependencies)

#### Task 6: Remove BACKLOG.md

Ask user: "What should we do with BACKLOG.md?"
- Option 1: Delete (items are outdated)
- Option 2: Archive to docs/archive/BACKLOG.md
- Option 3: Convert to deltas (prompt for each item)

Execute chosen option.

#### Task 7: Analyze Deltas to Identify Domains

Read all delta-specs/ files:
- Analyze descriptions, user stories
- Group into capability domains
- Suggest domain structure:
  ```
  auth/
    login.md
    oauth.md
  projects-management/
    listing.md
    creation.md
  ```

Present proposed structure to user for approval.

#### Task 8: Generate feature-specs/ Structure

Create nested structure:

```bash
mkdir -p docs/feature-specs
```

For each domain:
1. Create domain folder: `docs/feature-specs/[domain]/`
2. Create README.md (domain overview)
3. For each sub-capability in domain:
   - Create capability.md
   - Synthesize from related delta specs
   - Include "Related Deltas" section
4. Create top-level README.md (domain index)

#### Task 9: Generate feature-designs/ Structure

Mirror feature-specs/ structure:

```bash
mkdir -p docs/feature-designs
```

For each domain:
1. Create domain folder: `docs/feature-designs/[domain]/`
2. Create README.md (domain overview)
3. For each sub-capability:
   - Create capability.md
   - Synthesize from related delta designs
   - Include "Related Deltas" section
4. Create top-level README.md (domain index)

### Phase 3: Cleanup

After all tasks complete:

1. **Backup old structure** (optional):
   ```bash
   mkdir -p docs/archive/pre-migration
   mv docs/planning/FEATURES.md docs/archive/pre-migration/
   mv docs/feature-specs/ docs/archive/pre-migration/
   mv docs/feature-designs/ docs/archive/pre-migration/
   ```

2. **Verify new structure**:
   - Check DELTAS.md exists
   - Check delta-specs/ has all files
   - Check delta-designs/ has all files
   - Check feature-specs/ has nested structure
   - Check feature-designs/ has nested structure
   - Check DEPENDENCIES.md updated

3. **Present summary**:
   ```
   "Migration complete!

   Deltas: N (from N features)
   Delta specs: N files
   Delta designs: N files
   Feature domains: N

   New structure:
   - docs/planning/DELTAS.md
   - docs/delta-specs/ (N files)
   - docs/delta-designs/ (N files)
   - docs/feature-specs/ (N domains)
   - docs/feature-designs/ (N domains)

   Next steps:
   - Use /add-delta to add new work
   - Use /spec-delta, /design-delta, /plan-delta, /implement-delta
   - Use /reconcile-delta to update feature docs after implementation"
   ```

## Error Handling

**Already migrated:**
- If DELTAS.md exists, warn and exit
- Suggest this might already be a delta-based project

**Missing files:**
- If FEATURES.md missing, can't migrate
- Explain what's needed

**Partial failure:**
- If a task fails, report which tasks completed
- Allow user to retry or rollback from backup

## Workflow

**This is an automated migration with user approval:**
- Check pre-conditions
- Warn user about changes
- Create tasks with dependencies
- Execute tasks in parallel where possible
- Generate new feature docs from deltas
- Verify and cleanup
- Present summary
