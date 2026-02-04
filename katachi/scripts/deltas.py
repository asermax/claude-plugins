#!/usr/bin/env python3
"""
Delta Management Tool

Manage deltas: dependencies, status tracking, priority, and queries.

Usage:
    # Dependency commands
    python scripts/deltas.py deps query DELTA-ID              # Show what DELTA-ID depends on
    python scripts/deltas.py deps reverse DELTA-ID            # Show what depends on DELTA-ID
    python scripts/deltas.py deps tree DELTA-ID               # Show full dependency tree
    python scripts/deltas.py deps validate                      # Check for circular dependencies
    python scripts/deltas.py deps list                          # List all deltas
    python scripts/deltas.py deps add-dep FROM-ID TO-ID         # Add dependency
    python scripts/deltas.py deps remove-dep FROM-ID TO-ID      # Remove dependency
    python scripts/deltas.py deps add-delta DELTA-ID        # Add new delta to matrix
    python scripts/deltas.py deps delete-delta DELTA-ID     # Delete delta from matrix

    # Status commands
    python scripts/deltas.py status list                        # List all deltas with status
    python scripts/deltas.py status list --complexity LEVEL         # Filter by complexity
    python scripts/deltas.py status list --status "STATUS"      # Filter by status text
    python scripts/deltas.py status show DELTA-ID             # Show detailed delta status
    python scripts/deltas.py status set DELTA-ID STATUS       # Update delta status (auto-removes from both files when reconciled)

    # Priority commands
    python scripts/deltas.py priority set DELTA-ID LEVEL      # Set priority (1-5)
    python scripts/deltas.py priority list                    # List deltas grouped by priority
    python scripts/deltas.py priority list --level N          # Filter by priority level

    # Summary commands
    python scripts/deltas.py summary [STATUS]                  # Show summary table of deltas (optional status filter)
    python scripts/deltas.py summary --priority 1              # Filter by priority level (1-5)
    python scripts/deltas.py summary --ready                   # Only show deltas ready to implement
    python scripts/deltas.py summary "Not Started" --priority 2 # Combine status and priority filters

    # Query commands
    python scripts/deltas.py ready                              # List deltas ready to implement
    python scripts/deltas.py next                               # Suggest next delta to implement
    python scripts/deltas.py next --top 5                       # Show top 5 recommended deltas
    python scripts/deltas.py next --group                       # Group recommendations by priority tier
    python scripts/deltas.py next --top 10 --group              # Combine both flags

Priority levels:
    1 = Critical (must do now, blocks release)
    2 = High (important, needed soon)
    3 = Medium (standard priority, default)
    4 = Low (nice to have)
    5 = Backlog (someday/maybe)

Note: When marking a delta as reconciled (✓ Reconciled), it is automatically removed from both
      DELTAS.md and DEPENDENCIES.md since the delta is fully processed and documented.
"""

import sys
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple, Optional


# Priority levels with MoSCoW labels
PRIORITY_LABELS = {
    1: "Critical",
    2: "High",
    3: "Medium",
    4: "Low",
    5: "Backlog",
}

DEFAULT_PRIORITY = 3


class DependencyMatrix:
    def __init__(self, filepath: str = "docs/planning/DEPENDENCIES.md"):
        self.filepath = Path(filepath)
        self.deltas: List[str] = []
        self.matrix: Dict[str, Set[str]] = {}
        self._load()

    def _load(self):
        """Load the dependency matrix from DEPENDENCIES.md"""
        if not self.filepath.exists():
            raise FileNotFoundError(f"Dependency matrix not found: {self.filepath}")

        content = self.filepath.read_text()

        # Extract delta list from matrix header
        header_match = re.search(r'\| *\| ([^\n]+)\n', content)
        if header_match:
            header = header_match.group(1)
            # Parse column headers (abbreviated delta IDs)
            self.column_abbrevs = [col.strip() for col in header.split('|') if col.strip()]

        # Extract legend to map abbreviations to full IDs
        # Default to empty map - column headers will be used as-is if no legend
        self.abbrev_map: Dict[str, str] = {}
        legend_section = re.search(r'\*\*Legend:\*\*(.+?)---', content, re.DOTALL)
        if legend_section:
            self.abbrev_map = self._parse_legend(legend_section.group(1))

        # Parse matrix rows (anchor to line start to avoid matching header)
        matrix_lines = re.findall(r'^\| (DLT-\d+) +\|([^\n]+)', content, re.MULTILINE)
        for delta_id, row in matrix_lines:
            self.deltas.append(delta_id)
            deps = set()
            # Keep ALL cells including empty ones to maintain column alignment
            cells = [c.strip() for c in row.split('|')]

            # Match cells with column abbreviations
            for idx, cell in enumerate(cells):
                if idx < len(self.column_abbrevs) and cell == 'X':
                    abbrev = self.column_abbrevs[idx]
                    dep_id = self.abbrev_map.get(abbrev, abbrev)
                    if dep_id != delta_id:  # Don't include self-dependencies
                        deps.add(dep_id)

            self.matrix[delta_id] = deps

    def _parse_legend(self, legend_text: str) -> Dict[str, str]:
        """Parse legend to map abbreviations to full delta IDs"""
        mapping = {}
        for line in legend_text.strip().split('\n'):
            if ':' in line:
                abbrev_part, full_part = line.split(':', 1)
                abbrev = abbrev_part.strip().replace('-', '').strip()

                # Handle ranges like "C001-C005: CORE-001 through CORE-005"
                if 'through' in full_part:
                    match = re.search(r'(DLT-\d+) through (DLT-\d+)', full_part)
                    if match:
                        start, end = match.groups()
                        # This is a range - we'll handle individual items separately
                        continue
                else:
                    # Single item like "CLI1: CLI-001"
                    full_id = full_part.strip()
                    mapping[abbrev] = full_id

        # Add common abbreviations
        for i in range(1, 6):
            mapping[f'C00{i}'] = f'CORE-00{i}'
        mapping['CLI1'] = 'CLI-001'
        for i in range(1, 4):
            mapping[f'D00{i}'] = f'DICT-00{i}'
        mapping['CTX1'] = 'CTX-001'
        for i in range(1, 6):
            mapping[f'E00{i}'] = f'EDIT-00{i}'
        for i in range(1, 9):
            mapping[f'S00{i}'] = f'SETUP-00{i}'
        for i in range(1, 5):
            mapping[f'U00{i}'] = f'UI-00{i}'
        for i in range(1, 4):
            mapping[f'ER0{i}'] = f'ERROR-00{i}'
        mapping['L001'] = 'LOG-001'
        for i in range(1, 3):
            mapping[f'DP0{i}'] = f'DEPLOY-00{i}'
        mapping['DOC1'] = 'DOCS-001'

        return mapping

    def get_dependencies(self, delta_id: str) -> Set[str]:
        """Get what DELTA-ID depends on"""
        return self.matrix.get(delta_id, set())

    def get_dependents(self, delta_id: str) -> Set[str]:
        """Get what depends on DELTA-ID"""
        dependents = set()
        for fid, deps in self.matrix.items():
            if delta_id in deps:
                dependents.add(fid)
        return dependents

    def validate(self) -> Tuple[bool, List[str]]:
        """Check for circular dependencies"""
        errors = []

        def has_cycle(delta: str, visited: Set[str], rec_stack: Set[str]) -> bool:
            visited.add(delta)
            rec_stack.add(delta)

            for dep in self.matrix.get(delta, set()):
                if dep not in visited:
                    if has_cycle(dep, visited, rec_stack):
                        return True
                elif dep in rec_stack:
                    errors.append(f"Circular dependency detected: {delta} -> {dep}")
                    return True

            rec_stack.remove(delta)
            return False

        visited = set()
        for delta in self.deltas:
            if delta not in visited:
                has_cycle(delta, visited, set())

        return len(errors) == 0, errors

    def print_dependencies(self, delta_id: str):
        """Print what DELTA-ID depends on"""
        deps = self.get_dependencies(delta_id)

        print(f"\n{delta_id}:")
        if deps:
            print("  Depends on:")
            for dep in sorted(deps):
                print(f"    - {dep}")
        else:
            print("  No dependencies")

    def print_dependents(self, delta_id: str):
        """Print what depends on DELTA-ID"""
        dependents = self.get_dependents(delta_id)

        print(f"\n{delta_id}:")
        if dependents:
            print("  Required by:")
            for dep in sorted(dependents):
                print(f"    - {dep}")
        else:
            print("  No dependents")

    def print_tree(self, delta_id: str, _visited: Set[str] = None, _prefix: str = ""):
        """Print full dependency tree for DELTA-ID"""
        if _visited is None:
            _visited = set()
            print(f"\n{delta_id}")
            _prefix = ""

        if delta_id in _visited:
            return
        _visited.add(delta_id)

        # Show dependencies (what this delta needs)
        deps = sorted(self.get_dependencies(delta_id))

        # Show dependents (what needs this delta)
        dependents = sorted(self.get_dependents(delta_id))

        all_children = [(dep, True) for dep in deps] + [(dep, False) for dep in dependents]

        for i, (child, is_dependency) in enumerate(all_children):
            # Check if this is the last item to be printed at this level
            # (last overall item, or last dependency if we have dependents that won't recurse)
            is_last_item = i == len(all_children) - 1

            # Connector for this item
            connector = "└──" if is_last_item else "├──"
            arrow = "⬇" if is_dependency else "⬆"

            print(f"{_prefix}{connector} {arrow} {child}")

            # Prepare prefix for children - use spaces for last item, vertical line otherwise
            extension = "    " if is_last_item else "│   "
            child_prefix = _prefix + extension

            # Recursively show this child's tree (only dependencies)
            if is_dependency and child not in _visited:
                self.print_tree(child, _visited, child_prefix)

    def add_dependency(self, from_delta: str, to_delta: str):
        """Add dependency: from_delta depends on to_delta"""
        if from_delta not in self.deltas:
            raise ValueError(f"Delta not found: {from_delta}")
        if to_delta not in self.deltas:
            raise ValueError(f"Delta not found: {to_delta}")
        if from_delta == to_delta:
            raise ValueError("Cannot add self-dependency")

        self.matrix[from_delta].add(to_delta)
        self._write_matrix()
        print(f"✓ Added dependency: {from_delta} → {to_delta}")

    def remove_dependency(self, from_delta: str, to_delta: str):
        """Remove dependency: from_delta no longer depends on to_delta"""
        if from_delta not in self.deltas:
            raise ValueError(f"Delta not found: {from_delta}")
        if to_delta not in self.matrix.get(from_delta, set()):
            raise ValueError(f"Dependency does not exist: {from_delta} → {to_delta}")

        self.matrix[from_delta].remove(to_delta)
        self._write_matrix()
        print(f"✓ Removed dependency: {from_delta} ⤫ {to_delta}")

    def add_delta(self, delta_id: str):
        """Add a new delta to the matrix"""
        # Validate delta ID format
        if not re.match(r'^DLT-\d+$', delta_id):
            raise ValueError(f"Invalid delta ID format: {delta_id} (expected: DLT-NNN)")

        if delta_id in self.deltas:
            raise ValueError(f"Delta already exists: {delta_id}")

        # Add delta to list (will be sorted when matrix is built)
        self.deltas.append(delta_id)
        self.deltas.sort()  # Keep deltas sorted

        # Initialize empty dependency set
        self.matrix[delta_id] = set()

        # Write updated matrix
        self._write_matrix()
        print(f"✓ Added delta: {delta_id}")

    def delete_delta(self, delta_id: str, allow_completed: bool = False):
        """Delete a delta from the matrix

        Args:
            delta_id: The delta to delete
            allow_completed: If True, allow deletion of completed deltas even if they have dependents
        """
        if delta_id not in self.deltas:
            raise ValueError(f"Delta not found: {delta_id}")

        # Check if other deltas depend on this one (skip if allowing completed removal)
        if not allow_completed:
            dependents = self.get_dependents(delta_id)
            if dependents:
                raise ValueError(
                    f"Cannot delete {delta_id}: other deltas depend on it:\n" +
                    "\n".join(f"  - {dep}" for dep in sorted(dependents))
                )

        # Remove delta from list (remove all occurrences in case of duplicates)
        while delta_id in self.deltas:
            self.deltas.remove(delta_id)

        # Remove from matrix
        del self.matrix[delta_id]

        # Remove as dependency from other deltas
        for deps in self.matrix.values():
            deps.discard(delta_id)

        # Write updated matrix
        self._write_matrix()
        print(f"✓ Deleted delta: {delta_id}")

    def _write_matrix(self):
        """Write the matrix back to the file"""
        content = self.filepath.read_text()

        # Find matrix section
        matrix_start = content.find('## Full Dependency Matrix')
        matrix_end = content.find('\n---', matrix_start)

        if matrix_start == -1 or matrix_end == -1:
            raise ValueError("Could not find matrix section in file")

        # Build new matrix content
        new_matrix = self._build_matrix_table()

        # Replace matrix section
        new_content = (
            content[:matrix_start] +
            '## Full Dependency Matrix\n\n' +
            new_matrix +
            '\n' +
            content[matrix_end:]
        )

        self.filepath.write_text(new_content)

    def _build_matrix_table(self) -> str:
        """Build the matrix table as markdown"""
        # Build header with full delta IDs
        header = '|           | ' + ' | '.join(f'{feat:8}' for feat in self.deltas) + ' |'
        separator = '|-----------|' + '----------|' * len(self.deltas)

        lines = [header, separator]

        # Build rows
        for row_delta in self.deltas:
            cells = [f'| {row_delta:9} |']
            for col_delta in self.deltas:
                if row_delta == col_delta:
                    cells.append(' -        |')
                elif col_delta in self.matrix.get(row_delta, set()):
                    cells.append(' X        |')
                else:
                    cells.append('          |')
            lines.append(''.join(cells))

        return '\n'.join(lines)


class StatusManager:
    def __init__(self, filepath: str = "docs/planning/DELTAS.md"):
        self.filepath = Path(filepath)
        self.deltas: Dict[str, Dict[str, str]] = {}
        self._load()

    def _load(self):
        """Load delta statuses from DELTAS.md"""
        if not self.filepath.exists():
            raise FileNotFoundError(f"Deltas file not found: {self.filepath}")

        content = self.filepath.read_text()

        # Parse deltas from markdown
        # Format: ### DELTA-ID: Delta name
        # followed by: **Status**: symbol Phase
        #              **Priority**: N (Label)
        #              **Complexity**: Level
        #              **Description**: text
        delta_pattern = re.compile(
            r'^### (DLT-\d+): (.+?)$\n'
            r'(?:\*\*Status\*\*: (.+?)$\n)?'
            r'(?:\*\*Priority\*\*: (\d)(?: \(.+?\))?$\n)?'
            r'(?:\*\*Complexity\*\*: (.+?)$\n)?'
            r'(?:\*\*Description\*\*: (.+?)$)?',
            re.MULTILINE
        )

        for match in delta_pattern.finditer(content):
            delta_id = match.group(1)
            name = match.group(2).strip()
            status = match.group(3).strip() if match.group(3) else "✗ Not Started"
            priority = int(match.group(4)) if match.group(4) else DEFAULT_PRIORITY
            complexity = match.group(5).strip() if match.group(5) else "Unknown"
            description = match.group(6).strip() if match.group(6) else ""

            self.deltas[delta_id] = {
                'name': name,
                'status': status,
                'priority': priority,
                'complexity': complexity,
                'description': description,
            }

    def get_status(self, delta_id: str) -> Optional[str]:
        """Get status of a delta"""
        delta = self.deltas.get(delta_id)
        return delta['status'] if delta else None

    def set_status(self, delta_id: str, status: str, dm: 'DependencyMatrix | None' = None):
        """Update status of a delta in DELTAS.md

        Args:
            delta_id: The delta to update
            status: The new status value
            dm: Optional dependency matrix. If provided and status indicates reconciliation,
                automatically removes the delta from both the matrix and DELTAS.md.
        """
        if delta_id not in self.deltas:
            raise ValueError(f"Delta not found: {delta_id}")

        content = self.filepath.read_text()

        # Find the delta section and update status
        # Look for the delta header and the status line
        pattern = re.compile(
            rf'^(### {re.escape(delta_id)}: .+?$)\n'
            rf'(\*\*Status\*\*: .+?$)?',
            re.MULTILINE
        )

        def replacer(match):
            header = match.group(1)
            if match.group(2):
                # Status line exists, replace it
                return f"{header}\n**Status**: {status}"
            else:
                # No status line, add it
                return f"{header}\n**Status**: {status}"

        new_content = pattern.sub(replacer, content)

        self.filepath.write_text(new_content)
        self.deltas[delta_id]['status'] = status
        print(f"✓ Updated {delta_id} status to: {status}")

        # Auto-remove from both files on reconciliation
        if self._is_reconciled_status(status):
            if dm and delta_id in dm.deltas:
                dm.delete_delta(delta_id, allow_completed=True)
                print(f"✓ Removed {delta_id} from dependency matrix")

            self.delete_delta(delta_id)
            self._delete_work_files(delta_id)

    def set_priority(self, delta_id: str, priority: int):
        """Update priority of a delta in DELTAS.md

        Args:
            delta_id: The delta to update
            priority: Priority level (1-5)
        """
        if delta_id not in self.deltas:
            raise ValueError(f"Delta not found: {delta_id}")

        if priority < 1 or priority > 5:
            raise ValueError(f"Invalid priority: {priority} (must be 1-5)")

        content = self.filepath.read_text()
        label = PRIORITY_LABELS[priority]

        # Check if priority line exists
        priority_pattern = re.compile(
            rf'^(### {re.escape(delta_id)}: .+?$\n'
            rf'(?:\*\*Status\*\*: .+?$\n)?)'
            rf'(\*\*Priority\*\*: \d(?: \(.+?\))?$\n)?',
            re.MULTILINE
        )

        def replacer(match):
            prefix = match.group(1)
            if match.group(2):
                # Priority line exists, replace it
                return f"{prefix}**Priority**: {priority} ({label})\n"
            else:
                # No priority line, add it after status
                return f"{prefix}**Priority**: {priority} ({label})\n"

        new_content = priority_pattern.sub(replacer, content)

        self.filepath.write_text(new_content)
        self.deltas[delta_id]['priority'] = priority
        print(f"✓ Updated {delta_id} priority to: {priority} ({label})")

    def get_priority(self, delta_id: str) -> int:
        """Get priority of a delta (defaults to 3 if not set)"""
        delta = self.deltas.get(delta_id)
        return delta.get('priority', DEFAULT_PRIORITY) if delta else DEFAULT_PRIORITY

    def list_deltas(
        self,
        category: Optional[str] = None,
        status_filter: Optional[str] = None,
        dm: Optional[DependencyMatrix] = None
    ):
        """List deltas with optional filtering"""
        print("\nDeltas:")

        for delta_id in sorted(self.deltas.keys()):
            delta = self.deltas[delta_id]

            # Apply filters
            if category and not delta_id.startswith(f"{category}-"):
                continue
            if status_filter and status_filter.lower() not in delta['status'].lower():
                continue

            print(f"  {delta_id:12} {delta['status']}")

    def show_delta(self, delta_id: str, dm: Optional[DependencyMatrix] = None):
        """Show detailed status for a delta"""
        if delta_id not in self.deltas:
            raise ValueError(f"Delta not found: {delta_id}")

        delta = self.deltas[delta_id]
        priority = delta.get('priority', DEFAULT_PRIORITY)
        priority_label = PRIORITY_LABELS.get(priority, "Unknown")

        print(f"\n{delta_id}: {delta['name']}")
        print(f"  Status: {delta['status']}")
        print(f"  Priority: {priority} ({priority_label})")
        print(f"  Complexity: {delta['complexity']}")

        if dm:
            deps = dm.get_dependencies(delta_id)
            if deps:
                print(f"  Dependencies ({len(deps)}):")
                for dep in sorted(deps):
                    print(f"    - {dep}")

            dependents = dm.get_dependents(delta_id)
            if dependents:
                print(f"  Required by ({len(dependents)}):")
                for dep in sorted(dependents):
                    print(f"    - {dep}")

    def is_complete(self, delta_id: str) -> bool:
        """Check if a delta is complete (implementation done)"""
        delta = self.deltas.get(delta_id)
        if not delta:
            return False
        status = delta['status'].lower()
        return '✓ implementation' in status or 'complete' in status

    def _is_reconciled_status(self, status: str) -> bool:
        """Check if a status string indicates reconciliation complete"""
        status_lower = status.lower()
        return '✓ reconciled' in status_lower

    def delete_delta(self, delta_id: str):
        """Delete a delta entry from DELTAS.md"""
        if delta_id not in self.deltas:
            raise ValueError(f"Delta not found: {delta_id}")

        content = self.filepath.read_text()

        # Remove the delta section (### DLT-XXX through next ### or EOF)
        pattern = re.compile(
            rf'^### {re.escape(delta_id)}: .+?(?=^### DLT-|\Z)',
            re.MULTILINE | re.DOTALL
        )
        new_content = pattern.sub('', content)

        # Clean up any resulting double blank lines
        new_content = re.sub(r'\n{3,}', '\n\n', new_content)

        self.filepath.write_text(new_content)
        del self.deltas[delta_id]
        print(f"✓ Removed {delta_id} from deltas inventory")

    def _delete_work_files(self, delta_id: str):
        """Delete work files for a delta (specs, designs, plans)"""
        base_dir = self.filepath.parent.parent  # docs/planning -> docs

        work_dirs = ['delta-specs', 'delta-designs', 'delta-plans']

        for dir_name in work_dirs:
            work_file = base_dir / dir_name / f"{delta_id}.md"

            if work_file.exists():
                work_file.unlink()
                print(f"✓ Removed {work_file.relative_to(base_dir.parent)}")

    def get_ready_deltas(self, dm: DependencyMatrix) -> List[str]:
        """Get deltas that are ready to implement (all deps complete, not started yet)"""
        ready = []

        for delta_id in self.deltas:
            delta = self.deltas[delta_id]
            status = delta['status'].lower()

            # Skip if already in progress or complete
            if '⧗' in delta['status'] or self.is_complete(delta_id):
                continue

            # Check if all dependencies are complete
            deps = dm.get_dependencies(delta_id)
            all_deps_complete = all(self.is_complete(dep) for dep in deps)

            if all_deps_complete:
                ready.append(delta_id)

        return ready

    def suggest_next(self, dm: DependencyMatrix) -> Optional[str]:
        """Suggest the next delta to implement based on priority, dependencies, and complexity"""
        ready = self.get_ready_deltas(dm)

        if not ready:
            return None

        def compute_score(fid: str) -> int:
            """Compute priority score for a delta.

            Higher score = higher priority to work on.
            Formula:
            - Priority contribution: (6 - priority) * 10  (Critical=50, Medium=30, Backlog=10)
            - Impact bonus: dependents * 2 (more dependents = more impactful)
            - Complexity penalty: Easy=0, Medium=1, Hard=2 (prefer quick wins)
            """
            delta = self.deltas[fid]
            priority = delta.get('priority', DEFAULT_PRIORITY)
            dependents = len(dm.get_dependents(fid))
            complexity_map = {'Easy': 0, 'Medium': 1, 'Hard': 2}
            complexity_penalty = complexity_map.get(delta.get('complexity', 'Medium'), 1)

            score = (6 - priority) * 10 + (dependents * 2) - complexity_penalty
            return score

        # Sort by score (descending), then by ID for stability
        ready.sort(key=lambda f: (-compute_score(f), f))

        return ready[0] if ready else None

    def print_summary_table(
        self,
        status_filter: Optional[str] = None,
        priority_filter: Optional[int] = None,
        ready_only: bool = False,
        dm: Optional[DependencyMatrix] = None
    ):
        """Print a summary table of deltas

        Args:
            status_filter: Optional partial phase name to filter by (case-insensitive)
            priority_filter: Optional priority level to filter by (1-5)
            ready_only: Only show deltas ready to implement (all deps complete)
            dm: Optional dependency matrix for showing dependency counts and impact
        """
        # Filter deltas based on status, priority, and ready status
        filtered_deltas = []
        for delta_id in self.deltas.keys():
            delta = self.deltas[delta_id]

            # Apply status filter (partial match on phase name, case-insensitive)
            if status_filter and status_filter.lower() not in delta['status'].lower():
                continue

            # Apply priority filter
            if priority_filter is not None:
                delta_priority = delta.get('priority', DEFAULT_PRIORITY)
                if delta_priority != priority_filter:
                    continue

            # Apply ready filter
            if ready_only and dm:
                # Skip if already in progress or complete
                if '⧗' in delta['status'] or self.is_complete(delta_id):
                    continue
                # Check if all dependencies are complete
                deps = dm.get_dependencies(delta_id)
                if not all(self.is_complete(dep) for dep in deps):
                    continue

            filtered_deltas.append((delta_id, delta))

        if not filtered_deltas:
            filters = []
            if status_filter:
                filters.append(f"status: {status_filter}")
            if priority_filter is not None:
                filters.append(f"priority: {priority_filter} ({PRIORITY_LABELS[priority_filter]})")
            if ready_only:
                filters.append("ready to implement")
            if filters:
                print(f"\nNo deltas found matching {' + '.join(filters)}")
            else:
                print("\nNo deltas found.")
            return

        # Sort by priority (ascending, so Critical=1 first), then by ID
        filtered_deltas.sort(key=lambda x: (x[1].get('priority', DEFAULT_PRIORITY), x[0]))

        # Build the table header with Impact column
        header = "| ID          | Name                    | Status               | Priority | Complexity | Impact |"
        separator = "|-------------|-------------------------|----------------------|----------|------------|--------|"

        print("\n" + header)
        print(separator)

        # Build table rows
        for delta_id, delta in filtered_deltas:
            name = delta['name'][:24] + '...' if len(delta['name']) > 24 else delta['name'].ljust(24)
            status = delta['status'][:22].ljust(22)
            priority = delta.get('priority', DEFAULT_PRIORITY)
            priority_label = PRIORITY_LABELS.get(priority, "Unknown")
            priority_str = f"{priority}-{priority_label[:4]}".ljust(8)
            complexity = delta['complexity'][:10].ljust(10)

            # Get impact (how many deltas are blocked by this one)
            impact_str = "-"
            if dm:
                blocked_count = len(dm.get_dependents(delta_id))
                if blocked_count > 0:
                    impact_str = f"blocks {blocked_count}"
                else:
                    impact_str = "-"

            row = f"| {delta_id:11} | {name} | {status} | {priority_str} | {complexity} | {impact_str:6} |"
            print(row)

        # Print summary
        total_count = len(filtered_deltas)
        print(f"\nTotal: {total_count} delta(s)")

        # Print priority distribution
        from collections import Counter
        priority_counts = Counter(delta.get('priority', DEFAULT_PRIORITY) for _, delta in filtered_deltas)

        if len(priority_counts) > 1:
            print("\nBy Priority:")
            for level in range(1, 6):
                if level in priority_counts:
                    label = PRIORITY_LABELS[level]
                    emoji = {1: "🔴", 2: "🟠", 3: "🟡", 4: "⚪", 5: "⚫"}.get(level, "")
                    print(f"  {emoji} {label}: {priority_counts[level]}")

    def print_priority_list(
        self,
        level_filter: Optional[int] = None,
        dm: Optional[DependencyMatrix] = None
    ):
        """Print deltas grouped by priority level

        Args:
            level_filter: Optional priority level to filter by (1-5)
            dm: Optional dependency matrix for showing dependency counts
        """
        # Group deltas by priority
        by_priority: Dict[int, List[Tuple[str, Dict]]] = {i: [] for i in range(1, 6)}

        for delta_id in sorted(self.deltas.keys()):
            delta = self.deltas[delta_id]
            priority = delta.get('priority', DEFAULT_PRIORITY)

            if level_filter is None or priority == level_filter:
                by_priority[priority].append((delta_id, delta))

        # Print grouped output
        for level in range(1, 6):
            if level_filter is not None and level != level_filter:
                continue

            deltas_at_level = by_priority[level]
            label = PRIORITY_LABELS[level]
            count = len(deltas_at_level)

            print(f"\n## {level} - {label} ({count})")

            if not deltas_at_level:
                print("  (none)")
                continue

            for delta_id, delta in deltas_at_level:
                status_symbol = "⧗" if "⧗" in delta['status'] else ("✓" if "✓" in delta['status'] else "✗")
                deps_count = 0
                if dm:
                    deps_count = len(dm.get_dependents(delta_id))
                impact_str = f" (blocks {deps_count})" if deps_count > 0 else ""

                print(f"  {status_symbol} {delta_id}: {delta['name']}{impact_str}")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    subcommand = sys.argv[1]

    # Find project root (where docs/planning/ directory exists)
    cwd = Path.cwd()
    project_root = cwd
    while project_root != project_root.parent:
        if (project_root / "docs" / "planning" / "DEPENDENCIES.md").exists():
            break
        project_root = project_root.parent
    else:
        print("Error: Could not find docs/planning/DEPENDENCIES.md")
        sys.exit(1)

    if subcommand == "deps":
        # Dependency management commands
        if len(sys.argv) < 3:
            print("Usage: deltas.py deps <command> [args]")
            print("\nAvailable commands:")
            print("  query DELTA-ID           - Show what a delta depends on")
            print("  reverse DELTA-ID         - Show what depends on a delta")
            print("  tree DELTA-ID            - Show dependency tree")
            print("  validate                 - Check for circular dependencies")
            print("  list                     - List all deltas")
            print("  add-dep FROM-ID TO-ID    - Add dependency (FROM depends on TO)")
            print("  remove-dep FROM-ID TO-ID - Remove dependency")
            print("  add-delta DELTA-ID       - Add a new delta to matrix")
            print("  delete-delta DELTA-ID [--force] - Delete delta from matrix")
            print("                             --force: Allow deletion even if other deltas depend on it")
            sys.exit(1)

        command = sys.argv[2]
        matrix_path = project_root / "docs" / "planning" / "DEPENDENCIES.md"
        dm = DependencyMatrix(str(matrix_path))

        if command == "query":
            if len(sys.argv) < 4:
                print("Usage: deltas.py deps query DELTA-ID")
                sys.exit(1)
            delta_id = sys.argv[3]
            dm.print_dependencies(delta_id)

        elif command == "reverse":
            if len(sys.argv) < 4:
                print("Usage: deltas.py deps reverse DELTA-ID")
                sys.exit(1)
            delta_id = sys.argv[3]
            dm.print_dependents(delta_id)

        elif command == "validate":
            valid, errors = dm.validate()
            if valid:
                print("\n✓ No circular dependencies found")
            else:
                print("\n✗ Validation errors:")
                for error in errors:
                    print(f"  - {error}")
                sys.exit(1)

        elif command == "list":
            print("\nAll deltas:")
            for delta_id in sorted(dm.deltas):
                deps_count = len(dm.get_dependencies(delta_id))
                print(f"  {delta_id:12} ({deps_count} dependencies)")

        elif command == "tree":
            if len(sys.argv) < 4:
                print("Usage: deltas.py deps tree DELTA-ID")
                sys.exit(1)
            delta_id = sys.argv[3]
            if delta_id not in dm.deltas:
                print(f"Error: Delta not found: {delta_id}")
                sys.exit(1)
            dm.print_tree(delta_id)

        elif command == "add-dep":
            if len(sys.argv) < 5:
                print("Usage: deltas.py deps add-dep FROM-ID TO-ID")
                sys.exit(1)
            from_id = sys.argv[3]
            to_id = sys.argv[4]
            try:
                dm.add_dependency(from_id, to_id)
            except ValueError as e:
                print(f"Error: {e}")
                sys.exit(1)

        elif command == "remove-dep":
            if len(sys.argv) < 5:
                print("Usage: deltas.py deps remove-dep FROM-ID TO-ID")
                sys.exit(1)
            from_id = sys.argv[3]
            to_id = sys.argv[4]
            try:
                dm.remove_dependency(from_id, to_id)
            except ValueError as e:
                print(f"Error: {e}")
                sys.exit(1)

        elif command == "add-delta":
            if len(sys.argv) < 4:
                print("Usage: deltas.py deps add-delta DELTA-ID")
                sys.exit(1)
            delta_id = sys.argv[3]
            try:
                dm.add_delta(delta_id)
            except ValueError as e:
                print(f"Error: {e}")
                sys.exit(1)

        elif command == "delete-delta":
            if len(sys.argv) < 4:
                print("Usage: deltas.py deps delete-delta DELTA-ID [--force]")
                print("       --force: Allow deletion even if other deltas depend on it")
                sys.exit(1)

            # Parse arguments (support --force before or after DELTA-ID)
            args = sys.argv[3:]
            force = "--force" in args
            delta_args = [arg for arg in args if arg != "--force"]

            if not delta_args:
                print("Usage: deltas.py deps delete-delta DELTA-ID [--force]")
                print("       --force: Allow deletion even if other deltas depend on it")
                sys.exit(1)

            delta_id = delta_args[0]

            # Show warning if using force and delta has dependents
            if force:
                dependents = dm.get_dependents(delta_id)
                if dependents:
                    print(f"⚠ Warning: {delta_id} has {len(dependents)} dependent(s):")
                    for dep in sorted(dependents):
                        print(f"  - {dep}")
                    print(f"  These dependencies will be automatically removed.")

            try:
                dm.delete_delta(delta_id, allow_completed=force)
            except ValueError as e:
                print(f"Error: {e}")
                sys.exit(1)

        else:
            print(f"Unknown deps command: {command}")
            sys.exit(1)

    elif subcommand == "status":
        # Status tracking commands
        if len(sys.argv) < 3:
            print("Usage: deltas.py status <command> [args]")
            print("\nAvailable commands: list, show, set")
            sys.exit(1)

        command = sys.argv[2]
        deltas_path = project_root / "docs" / "planning" / "DELTAS.md"
        sm = StatusManager(str(deltas_path))

        # Also load dependency matrix for richer status display
        matrix_path = project_root / "docs" / "planning" / "DEPENDENCIES.md"
        dm = DependencyMatrix(str(matrix_path))

        if command == "list":
            # Parse optional filters
            category = None
            status_filter = None

            i = 3
            while i < len(sys.argv):
                if sys.argv[i] == "--category" and i + 1 < len(sys.argv):
                    category = sys.argv[i + 1]
                    i += 2
                elif sys.argv[i] == "--status" and i + 1 < len(sys.argv):
                    status_filter = sys.argv[i + 1]
                    i += 2
                else:
                    i += 1

            sm.list_deltas(category=category, status_filter=status_filter, dm=dm)

        elif command == "show":
            if len(sys.argv) < 4:
                print("Usage: deltas.py status show DELTA-ID")
                sys.exit(1)
            delta_id = sys.argv[3]
            try:
                sm.show_delta(delta_id, dm=dm)
            except ValueError as e:
                print(f"Error: {e}")
                sys.exit(1)

        elif command == "set":
            if len(sys.argv) < 5:
                print("Usage: deltas.py status set DELTA-ID STATUS")
                print("\nExample statuses:")
                print("  ✓ Defined")
                print("  ⧗ Spec")
                print("  ✓ Spec")
                print("  ⧗ Design")
                print("  ✓ Design")
                print("  ⧗ Plan")
                print("  ✓ Plan")
                print("  ⧗ Implementation")
                print("  ✓ Implementation")
                sys.exit(1)
            delta_id = sys.argv[3]
            status = ' '.join(sys.argv[4:])  # Allow multi-word status
            try:
                sm.set_status(delta_id, status, dm=dm)
            except ValueError as e:
                print(f"Error: {e}")
                sys.exit(1)

        else:
            print(f"Unknown status command: {command}")
            sys.exit(1)

    elif subcommand == "priority":
        # Priority management commands
        if len(sys.argv) < 3:
            print("Usage: deltas.py priority <command> [args]")
            print("\nAvailable commands:")
            print("  set DELTA-ID LEVEL    - Set priority (1-5)")
            print("  list                  - List deltas grouped by priority")
            print("  list --level N        - Filter by priority level")
            print("\nPriority levels:")
            for level, label in PRIORITY_LABELS.items():
                print(f"  {level} = {label}")
            sys.exit(1)

        command = sys.argv[2]
        deltas_path = project_root / "docs" / "planning" / "DELTAS.md"
        matrix_path = project_root / "docs" / "planning" / "DEPENDENCIES.md"

        sm = StatusManager(str(deltas_path))
        dm = DependencyMatrix(str(matrix_path))

        if command == "set":
            if len(sys.argv) < 5:
                print("Usage: deltas.py priority set DELTA-ID LEVEL")
                print("\nPriority levels:")
                for level, label in PRIORITY_LABELS.items():
                    print(f"  {level} = {label}")
                sys.exit(1)

            delta_id = sys.argv[3]
            try:
                priority = int(sys.argv[4])
            except ValueError:
                print(f"Error: Priority must be a number (1-5), got: {sys.argv[4]}")
                sys.exit(1)

            try:
                sm.set_priority(delta_id, priority)
            except ValueError as e:
                print(f"Error: {e}")
                sys.exit(1)

        elif command == "list":
            # Parse optional level filter
            level_filter = None
            i = 3
            while i < len(sys.argv):
                if sys.argv[i] == "--level" and i + 1 < len(sys.argv):
                    try:
                        level_filter = int(sys.argv[i + 1])
                        if level_filter < 1 or level_filter > 5:
                            print(f"Error: Level must be 1-5, got: {level_filter}")
                            sys.exit(1)
                    except ValueError:
                        print(f"Error: Level must be a number, got: {sys.argv[i + 1]}")
                        sys.exit(1)
                    i += 2
                else:
                    i += 1

            sm.print_priority_list(level_filter=level_filter, dm=dm)

        else:
            print(f"Unknown priority command: {command}")
            sys.exit(1)

    elif subcommand == "summary":
        # Summary table command
        deltas_path = project_root / "docs" / "planning" / "DELTAS.md"
        matrix_path = project_root / "docs" / "planning" / "DEPENDENCIES.md"

        sm = StatusManager(str(deltas_path))
        dm = DependencyMatrix(str(matrix_path))

        # Parse optional filters
        status_filter = None
        priority_filter = None
        ready_only = False

        i = 2
        while i < len(sys.argv):
            if sys.argv[i] == "--priority" and i + 1 < len(sys.argv):
                try:
                    priority_filter = int(sys.argv[i + 1])
                    if priority_filter < 1 or priority_filter > 5:
                        print(f"Error: Priority must be 1-5, got: {priority_filter}")
                        sys.exit(1)
                except ValueError:
                    print(f"Error: Priority must be a number, got: {sys.argv[i + 1]}")
                    sys.exit(1)
                i += 2
            elif sys.argv[i] == "--ready":
                ready_only = True
                i += 1
            elif not sys.argv[i].startswith("--"):
                # Positional argument = status filter
                status_filter = sys.argv[i]
                i += 1
            else:
                i += 1

        sm.print_summary_table(status_filter=status_filter, priority_filter=priority_filter, ready_only=ready_only, dm=dm)

    elif subcommand == "ready":
        # List deltas ready to implement
        deltas_path = project_root / "docs" / "planning" / "DELTAS.md"
        matrix_path = project_root / "docs" / "planning" / "DEPENDENCIES.md"

        sm = StatusManager(str(deltas_path))
        dm = DependencyMatrix(str(matrix_path))

        ready = sm.get_ready_deltas(dm)

        if ready:
            print("\nDeltas ready to implement (all dependencies complete):\n")
            for fid in sorted(ready):
                delta = sm.deltas[fid]
                dependents = len(dm.get_dependents(fid))
                impact = f"({dependents} dependent{'s' if dependents != 1 else ''})" if dependents > 0 else ""
                print(f"  {fid:12} {delta['name']} {impact}")
        else:
            print("\nNo deltas ready to implement.")
            print("Either all deltas are in progress/complete, or dependencies are blocking.")

    elif subcommand == "next":
        # Suggest next delta(s) to implement
        deltas_path = project_root / "docs" / "planning" / "DELTAS.md"
        matrix_path = project_root / "docs" / "planning" / "DEPENDENCIES.md"

        sm = StatusManager(str(deltas_path))
        dm = DependencyMatrix(str(matrix_path))

        # Parse flags
        top_n = 1
        group_by_priority = False

        i = 2
        while i < len(sys.argv):
            if sys.argv[i] == "--top" and i + 1 < len(sys.argv):
                try:
                    top_n = int(sys.argv[i + 1])
                    if top_n < 1:
                        print("Error: --top must be at least 1")
                        sys.exit(1)
                except ValueError:
                    print(f"Error: --top requires a number, got: {sys.argv[i + 1]}")
                    sys.exit(1)
                i += 2
            elif sys.argv[i] == "--group":
                group_by_priority = True
                i += 1
            else:
                i += 1

        ready = sm.get_ready_deltas(dm)

        if not ready:
            print("\nNo deltas available to implement.")
            print("Either all deltas are complete, or dependencies are blocking progress.")
            sys.exit(0)

        # Score and sort ready deltas
        def compute_score(fid: str) -> int:
            delta = sm.deltas[fid]
            priority = delta.get('priority', DEFAULT_PRIORITY)
            dependents = len(dm.get_dependents(fid))
            complexity_map = {'Easy': 0, 'Medium': 1, 'Hard': 2}
            complexity_penalty = complexity_map.get(delta.get('complexity', 'Medium'), 1)
            return (6 - priority) * 10 + (dependents * 2) - complexity_penalty

        # Sort by score (descending), then by ID for stability
        ready.sort(key=lambda f: (-compute_score(f), f))

        if group_by_priority:
            # Group by priority tier
            from collections import defaultdict
            by_priority = defaultdict(list)

            for fid in ready[:top_n] if top_n > 0 else ready:
                priority = sm.deltas[fid].get('priority', DEFAULT_PRIORITY)
                by_priority[priority].append(fid)

            print(f"\n🎯 Top {min(top_n, len(ready))} Recommended Deltas (by Priority):\n")

            for level in range(1, 6):
                if level not in by_priority:
                    continue

                label = PRIORITY_LABELS[level]
                emoji = {1: "🔴", 2: "🟠", 3: "🟡", 4: "⚪", 5: "⚫"}.get(level, "")
                print(f"\n{emoji} {label} ({len(by_priority[level])})\n")

                for fid in by_priority[level]:
                    delta = sm.deltas[fid]
                    dependents = dm.get_dependents(fid)
                    deps = dm.get_dependencies(fid)
                    complexity = delta.get('complexity', 'Unknown')
                    score = compute_score(fid)

                    impact_str = f" | blocks {len(dependents)}" if dependents else ""
                    print(f"  {fid}: {delta['name']}")
                    print(f"    Complexity: {complexity}{impact_str} | Score: {score}")

                    if deps:
                        print(f"    Depends on: {', '.join(sorted(deps))}")
        else:
            # List format (top N)
            if top_n == 1:
                # Original single-suggestion format for backward compatibility
                suggestion = ready[0]
                delta = sm.deltas[suggestion]
                dependents = dm.get_dependents(suggestion)
                priority = delta.get('priority', DEFAULT_PRIORITY)
                priority_label = PRIORITY_LABELS.get(priority, "Unknown")

                print(f"\nSuggested next delta: {suggestion}")
                print(f"  Name: {delta['name']}")
                print(f"  Status: {delta['status']}")
                print(f"  Priority: {priority} ({priority_label})")
                print(f"  Complexity: {delta.get('complexity', 'Unknown')}")

                if dependents:
                    print(f"  Unlocks {len(dependents)} delta(s):")
                    for dep in sorted(dependents):
                        print(f"    - {dep}")
                else:
                    print("  Unlocks: No other deltas directly depend on this")

                deps = dm.get_dependencies(suggestion)
                if deps:
                    print(f"  Depends on ({len(deps)} complete):")
                    for dep in sorted(deps):
                        print(f"    - {dep} ✓")
            else:
                print(f"\n🎯 Top {min(top_n, len(ready))} Recommended Deltas:\n")

                for i, fid in enumerate(ready[:top_n], 1):
                    delta = sm.deltas[fid]
                    dependents = dm.get_dependents(fid)
                    deps = dm.get_dependencies(fid)
                    priority = delta.get('priority', DEFAULT_PRIORITY)
                    priority_label = PRIORITY_LABELS.get(priority, "Unknown")
                    complexity = delta.get('complexity', 'Unknown')
                    score = compute_score(fid)

                    impact_str = f" | blocks {len(dependents)}" if dependents else ""
                    print(f"{i}. {fid}: {delta['name']}")
                    print(f"   Priority: {priority} ({priority_label}) | Complexity: {complexity}{impact_str}")
                    print(f"   Score: {score} | Status: {delta['status']}")

                    if deps:
                        print(f"   Depends on ({len(deps)}): {', '.join(sorted(deps))}")
                    print()

    else:
        print(f"Unknown subcommand: {subcommand}")
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
