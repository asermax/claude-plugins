---
description: Analyze docs for optimization opportunities (split, simplify, remove)
argument-hint: "[scope]"
---

# Optimize Documentation

Analyze documentation for optimization opportunities, including splitting long documents, reducing verbosity, and identifying obsolete or redundant content.

## Input

Scope: $ARGUMENTS (optional - flexible scope for analysis)

**Scope interpretation:**
- No argument = analyze all documentation
- Specific topic (e.g., "auth", "user authentication") = find and analyze related docs
- File path = analyze specific document
- Directory name = analyze all docs in that directory

## Context

**You must load the following skills and read the following files before proceeding.**

### Skills
- `katachi:framework-core` - Workflow principles and project structure

### Documentation indexes (read to discover documents)
- `docs/feature-specs/README.md` - Feature capability index
- `docs/feature-designs/README.md` - Feature design index
- `docs/architecture/README.md` - Architecture decisions (ADRs)
- `docs/design/README.md` - Design patterns (DES)

### Template references (for structure compliance checks)
- `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/feature-spec.md`
- `${CLAUDE_PLUGIN_ROOT}/skills/working-on-delta/references/feature-design.md`
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/ADR-template.md`
- `${CLAUDE_PLUGIN_ROOT}/skills/framework-core/references/DES-template.md`

## Pre-Check

Verify framework is initialized:
- If `docs/planning/` doesn't exist, explain this command requires an initialized katachi framework
- If minimal documentation exists, note the analysis may be limited

## Process

### 1. Discover Documents Within Scope

**If no scope provided:**
- Scan all directories: feature-specs/, feature-designs/, architecture/, design/
- Collect all .md files

**If topic scope provided** (e.g., "auth"):
- Scan all documentation directories
- Find files where:
  - File name contains topic keywords (auth, authentication, login, etc.)
  - Title/headings mention the topic
  - Content discusses the topic
- Present discovered files for confirmation

**If file path provided:**
- Analyze that specific document

**If directory provided:**
- Analyze all .md files in that directory

Group discovered documents for parallel processing.

### 2. Dispatch Doc-Optimizer Agents (Silent)

Always dispatch doc-optimizer agents to analyze discovered documents:
- If multiple documents, dispatch multiple agents in parallel (single message with multiple Task calls)
- If single document, dispatch one agent
- Each agent receives a subset of documents and the relevant template references

For each agent, provide:

```
Analyze these documents for optimization opportunities.

## Documents to Analyze
[list of file paths with brief descriptions]

## Document Type
[feature-specs / feature-designs / architecture / design]

## Template Reference
[relevant template content for structure compliance]

## Analysis Focus
Provide actionable guidance on:
1. Document Length: Files that should split (>400 lines features, >150 decisions)
2. Verbosity: Repetitive phrasing, over-explanation, redundancy
3. Obsolescence: Orphaned docs, superseded content, obsolete documents
4. Structure: Missing required sections, incorrect format

For each issue found, provide:
- Specific file and location (line numbers when relevant)
- Clear explanation of the problem
- Actionable recommendation for improvement
```

### 3. Aggregate Results (Silent)

Wait for all agent responses and synthesize findings into a single report organized by action type:
- Candidates for Splitting
- Verbosity Reduction Opportunities
- Candidates for Removal
- Orphaned Documents
- Structure Issues

### 4. Present Optimization Report

Show the aggregated report with clear categorization:

```
## Document Optimization Report

### Candidates for Splitting
- docs/feature-specs/auth.md (523 lines)
  - Contains 3 distinct authentication methods that should be separate
  - Suggested: auth/login.md, auth/oauth.md, auth/mfa.md
  - Each method has independent user stories, flows, and acceptance criteria

### Verbosity Reduction Opportunities
- docs/feature-designs/api.md (312 lines → est. 180 lines)
  - Lines 45-60, 89-104, 145-160, 201-216: "API first" explanation repeated 4 times
  - Consider extracting to DES-XXX or consolidating into single reference section

### Candidates for Removal
- docs/feature-designs/old-workflow.md
  - Not referenced in feature-designs/README.md
  - Content describes deprecated workflow

### Orphaned Documents
- docs/architecture/old-db-choice.md (superseded by ADR-003)
  - Marked as superseded, no active references in other docs

### Structure Issues
- docs/feature-specs/projects.md missing User Flows section
  - This is a UI capability - should include breadboards or add exclusion note
```

### 5. Discuss Next Steps

After presenting the report, ask:

```
"Which optimization would you like to address?

1. Split long documents
2. Reduce verbosity / consolidate content
3. Remove obsolete documents
4. Fix orphaned documents
5. Fix structure issues
6. All of the above

Or provide specific items to address."
```

### 6. Execute Optimizations

**For splits:**
- Show proposed split structure with new file names
- Get explicit confirmation
- Create new files with appropriate content
- Update index README files if needed
- Delete or replace original file

**For verbosity reduction:**
- Show before/after preview for the specific change
- Get confirmation
- Apply the change

**For removals:**
- Always require explicit confirmation before deleting
- Show file path and reason for deletion
- After confirmation, delete the file

**For orphaned documents:**
- Offer choices: add to index, delete, or leave as-is
- If adding to index, show proposed index addition
- Get confirmation before applying

**For structure fixes:**
- Show what needs to be added/changed
- Get confirmation
- Apply the fix

Apply changes incrementally with user approval for each action or category.

### 7. Post-Optimization Summary

After completing optimizations:

```
"Optimization complete!

Changes made:
- [summary of splits, deletions, consolidations, fixes]

Next steps:
- Index files may need updating if structure changed
- Consider running /katachi:analyze to verify no gaps introduced
- Related deltas may need documentation updates"
```

## Integration with Other Commands

This command integrates with:
- `/katachi:analyze` - Complementary: analyze finds gaps, optimize finds improvement opportunities
- `/katachi:decision` - For extracting discovered patterns into DES documents
- `/katachi:spec-delta` / `/katachi:design-delta` - For updating delta working documents

## Workflow

This is an optimization command:
- Discover documents within scope
- Dispatch agents in parallel for analysis
- Aggregate and present findings
- Guide user through applying optimizations with confirmation
- Apply changes incrementally
