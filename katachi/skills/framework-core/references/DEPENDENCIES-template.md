# Dependency Matrix

Features listed in rows depend on features in columns.
Mark with `X` where row depends on column.

## Full Dependency Matrix

|           | C001 | C002 | F001 | F002 |
|-----------|------|------|------|------|
| CAT1-001  | -    |      |      |      |
| CAT1-002  | X    | -    |      |      |
| CAT2-001  | X    |      | -    |      |
| CAT2-002  |      |      | X    | -    |

**Legend:**
- C001: CAT1-001
- C002: CAT1-002
- F001: CAT2-001
- F002: CAT2-002

---

## Implementation Phases (derived from matrix)

### Phase 1: Foundation (1 feature)

Foundation features with no dependencies:
- **CAT1-001**: [description]

**Test Milestone**: "[what should work after this phase]"

### Phase 2: Core Features (2 features)

Features that depend on Phase 1:
- **CAT1-002**: [description] (depends: CAT1-001)
- **CAT2-001**: [description] (depends: CAT1-001)

**Test Milestone**: "[what should work after this phase]"

### Phase 3: Extended Features (1 feature)

Features that depend on Phase 2:
- **CAT2-002**: [description] (depends: CAT2-001)

**Test Milestone**: "[what should work after this phase]"

---

## Dependency Notes

### Key Decisions

1. **[Decision name]**: [Explanation of why certain dependencies were chosen]

2. **[Decision name]**: [Explanation]

### Implementation Notes

- **Phase 1** is sequential/can be parallelized: [explanation]
- **Phase 2** has some parallelization: [which features]
- **Phase 3** is sequential: [explanation]

---

## How to Use

1. List all features in both rows and columns (use abbreviated IDs in columns)
2. Add a **Legend:** section mapping abbreviations to full IDs
3. For each feature (row), mark which features it depends on (columns)
4. Features with no dependencies can be implemented first
5. Organize remaining features into phases based on dependency depth
6. Add **Test Milestone** for each phase describing what should work
