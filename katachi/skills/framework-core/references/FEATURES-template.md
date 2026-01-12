# Feature Inventory

Atomic features extracted from VISION.md for [project name].

## Feature Categories

1. **[CAT1]** - [Category description]
2. **[CAT2]** - [Category description]
3. **[CAT3]** - [Category description]

## Status Tracking

Features track their progress through the development workflow using a status field:

- **✓ Defined** - Feature extracted and documented (initial state)
- **⧗ Spec** - Specification in progress (`/spec-feature` started)
- **✓ Spec** - Specification complete (`/spec-feature` done)
- **⧗ Design** - Design rationale in progress (`/design-feature` started)
- **✓ Design** - Design complete (`/design-feature` done)
- **⧗ Plan** - Implementation plan in progress (`/plan-feature` started)
- **✓ Plan** - Implementation plan complete (`/plan-feature` done)
- **⧗ Implementation** - Feature implementation in progress (`/implement-feature` started)
- **✓ Implementation** - Feature complete and tested (`/implement-feature` done)

Commands automatically update status as they progress. To manually update:
```bash
python scripts/features.py status set FEATURE-ID "STATUS"
```

Query status:
```bash
python scripts/features.py status list                    # All features
python scripts/features.py status list --phase 1          # Filter by phase
python scripts/features.py status list --category CAT1    # Filter by category
python scripts/features.py status show FEATURE-ID         # Detailed view
```

---

## [CAT1] - [Category Name]

### CAT1-001: [Feature name]
**Status**: ✓ Defined
**Complexity**: [Easy/Medium/Hard]
**Description**: [Comprehensive description that explains what the feature does, who uses it, and why it's needed. Should be self-explanatory without reading the spec.]

### CAT1-002: [Feature name]
**Status**: ✓ Defined
**Complexity**: [Easy/Medium/Hard]
**Description**: [Comprehensive description that explains what the feature does, who uses it, and why it's needed. Should be self-explanatory without reading the spec.]

---

## [CAT2] - [Category Name]

### CAT2-001: [Feature name]
**Status**: ✓ Defined
**Complexity**: [Easy/Medium/Hard]
**Description**: [Comprehensive description that explains what the feature does, who uses it, and why it's needed. Should be self-explanatory without reading the spec.]

---

## Feature Count Summary

- **[CAT1]**: N features (X easy, Y medium, Z hard)
- **[CAT2]**: N features (X easy, Y medium, Z hard)

**Total**: N features
- Easy: X
- Medium: Y
- Hard: Z

---

## Atomicity Check

For each feature:
- ✓ Can be implemented in a single focused session
- ✓ Does ONE thing
- ✓ Has clear acceptance criteria
- ✓ Can be tested independently

If any feature fails these checks, split it into smaller features.

---

## Notes

- [Relevant note about feature relationships]
- [Dependencies or interactions to be aware of]
