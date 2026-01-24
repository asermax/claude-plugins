#!/usr/bin/env python3
"""
Delta Management Tool

Manage deltas: dependencies, status tracking, and queries.

Usage:
    # Dependency commands
    python scripts/deltas.py deps query DELTA-ID              # Show what DELTA-ID depends on
    python scripts/deltas.py deps reverse DELTA-ID            # Show what depends on DELTA-ID
    python scripts/deltas.py deps phase DELTA-ID              # Show which phase DELTA-ID is in
    python scripts/deltas.py deps tree DELTA-ID               # Show full dependency tree
    python scripts/deltas.py deps validate                      # Check for circular dependencies
    python scripts/deltas.py deps list                          # List all deltas with phases
    python scripts/deltas.py deps add-dep FROM-ID TO-ID         # Add dependency
    python scripts/deltas.py deps remove-dep FROM-ID TO-ID      # Remove dependency
    python scripts/deltas.py deps add-delta DELTA-ID        # Add new delta to matrix
    python scripts/deltas.py deps delete-delta DELTA-ID     # Delete delta from matrix
    python scripts/deltas.py deps recalculate-phases            # Recalculate phases from dependencies

    # Status commands
    python scripts/deltas.py status list                        # List all deltas with status
    python scripts/deltas.py status list --phase N              # Filter by phase
    python scripts/deltas.py status list --complexity LEVEL         # Filter by complexity
    python scripts/deltas.py status list --status "STATUS"      # Filter by status text
    python scripts/deltas.py status show DELTA-ID             # Show detailed delta status
    python scripts/deltas.py status set DELTA-ID STATUS       # Update delta status (auto-removes from matrix when complete)

    # Query commands
    python scripts/deltas.py ready                              # List deltas ready to implement
    python scripts/deltas.py next                               # Suggest next delta to implement

Note: When marking a delta as complete (✓ Implementation), it is automatically removed from the
      dependency matrix since completed deltas no longer block other work.
"""

import sys
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple, Optional


class DependencyMatrix:
    def __init__(self, filepath: str = "docs/planning/DEPENDENCIES.md"):
        self.filepath = Path(filepath)
        self.deltas: List[str] = []
        self.matrix: Dict[str, Set[str]] = {}
        self.phases: Dict[str, int] = {}
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

        # Parse matrix rows
        matrix_lines = re.findall(r'\| (DLT-\d+) +\|([^\n]+)', content)
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

        # Extract phases
        self._parse_phases(content)

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

    def _parse_phases(self, content: str):
        """Extract phase assignments from the Implementation Phases section"""
        phase_sections = re.findall(
            r'### Phase (\d+):[^\n]+\n\n[^\n]+\n(.+?)(?=\n\*\*Test Milestone|\n###|$)',
            content,
            re.DOTALL
        )

        for phase_num, phase_content in phase_sections:
            # Extract delta IDs from bullet points
            delta_matches = re.findall(r'- \*\*(DLT-\d+)\*\*:', phase_content)
            for delta_id in delta_matches:
                self.phases[delta_id] = int(phase_num)

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

    def get_phase(self, delta_id: str) -> int | None:
        """Get which phase DELTA-ID is in"""
        return self.phases.get(delta_id)

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
        phase = self.get_phase(delta_id)

        print(f"\n{delta_id} (Phase {phase if phase else 'Unknown'}):")
        if deps:
            print("  Depends on:")
            for dep in sorted(deps):
                dep_phase = self.get_phase(dep)
                print(f"    - {dep} (Phase {dep_phase if dep_phase else 'Unknown'})")
        else:
            print("  No dependencies")

    def print_dependents(self, delta_id: str):
        """Print what depends on DELTA-ID"""
        dependents = self.get_dependents(delta_id)
        phase = self.get_phase(delta_id)

        print(f"\n{delta_id} (Phase {phase if phase else 'Unknown'}):")
        if dependents:
            print("  Required by:")
            for dep in sorted(dependents):
                dep_phase = self.get_phase(dep)
                print(f"    - {dep} (Phase {dep_phase if dep_phase else 'Unknown'})")
        else:
            print("  No dependents")

    def print_tree(self, delta_id: str, _visited: Set[str] = None, _prefix: str = ""):
        """Print full dependency tree for DELTA-ID"""
        if _visited is None:
            _visited = set()
            phase = self.get_phase(delta_id)
            print(f"\n{delta_id} (Phase {phase if phase else 'Unknown'})")
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
            child_phase = self.get_phase(child)

            # Check if this is the last item to be printed at this level
            # (last overall item, or last dependency if we have dependents that won't recurse)
            is_last_item = i == len(all_children) - 1

            # Connector for this item
            connector = "└──" if is_last_item else "├──"
            arrow = "⬇" if is_dependency else "⬆"

            print(f"{_prefix}{connector} {arrow} {child} (Phase {child_phase if child_phase else '?'})")

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
        print(f"  Note: Update DELTAS.md manually and add the delta to a phase in DEPENDENCIES.md")

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

        # Remove delta from list
        self.deltas.remove(delta_id)

        # Remove from matrix
        del self.matrix[delta_id]

        # Remove as dependency from other deltas
        for deps in self.matrix.values():
            deps.discard(delta_id)

        # Write updated matrix
        self._write_matrix()
        print(f"✓ Deleted delta: {delta_id}")
        print(f"  Note: Update DELTAS.md manually and remove the delta from phases in DEPENDENCIES.md")

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

    def recalculate_phases(self) -> Dict[str, int]:
        """Recalculate phases using topological sort based on dependencies"""
        # Kahn's algorithm for topological sort with level tracking
        in_degree: Dict[str, int] = {f: 0 for f in self.deltas}
        for delta in self.deltas:
            for dep in self.matrix.get(delta, set()):
                if dep in in_degree:
                    in_degree[delta] += 1

        # Start with deltas that have no dependencies
        current_phase = 1
        new_phases: Dict[str, int] = {}
        remaining = set(self.deltas)

        while remaining:
            # Find all deltas with in_degree == 0 among remaining
            ready = [f for f in remaining if in_degree[f] == 0]

            if not ready:
                # Circular dependency detected
                raise ValueError(f"Circular dependency detected involving: {remaining}")

            # Assign current phase to all ready deltas
            for delta in ready:
                new_phases[delta] = current_phase
                remaining.remove(delta)

                # Decrease in_degree for dependents
                for other in remaining:
                    if delta in self.matrix.get(other, set()):
                        in_degree[other] -= 1

            current_phase += 1

        return new_phases

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
        delta_pattern = re.compile(
            r'^### (DLT-\d+): (.+?)$\n'
            r'(?:\*\*Status\*\*: (.+?)$\n)?'
            r'(?:\*\*Complexity\*\*: (.+?)$\n)?'
            r'(?:\*\*Description\*\*: (.+?)$)?',
            re.MULTILINE
        )

        for match in delta_pattern.finditer(content):
            delta_id = match.group(1)
            name = match.group(2).strip()
            status = match.group(3).strip() if match.group(3) else "✗ Not Started"
            complexity = match.group(4).strip() if match.group(4) else "Unknown"
            description = match.group(5).strip() if match.group(5) else ""

            self.deltas[delta_id] = {
                'name': name,
                'status': status,
                'complexity': complexity,
                'description': description
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
            dm: Optional dependency matrix. If provided and status indicates completion,
                automatically removes the delta from the matrix.
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

        # Auto-remove from dependency matrix on completion
        if dm and self._is_complete_status(status):
            if delta_id in dm.deltas:
                dm.delete_delta(delta_id, allow_completed=True)
                print(f"✓ Removed {delta_id} from dependency matrix")

    def list_deltas(
        self,
        phase: Optional[int] = None,
        category: Optional[str] = None,
        status_filter: Optional[str] = None,
        dm: Optional[DependencyMatrix] = None
    ):
        """List deltas with optional filtering, grouped by phase"""
        print("\nDeltas:")

        # If no dependency matrix, fall back to flat list
        if not dm:
            for delta_id in sorted(self.deltas.keys()):
                delta = self.deltas[delta_id]

                if category and not delta_id.startswith(f"{category}-"):
                    continue
                if status_filter and status_filter.lower() not in delta['status'].lower():
                    continue

                print(f"  {delta_id:12} {delta['status']}")
            return

        # Collect deltas by phase
        phase_groups: Dict[Optional[int], List[str]] = {}

        for delta_id in sorted(self.deltas.keys()):
            delta = self.deltas[delta_id]

            # Apply filters
            if category and not delta_id.startswith(f"{category}-"):
                continue
            if status_filter and status_filter.lower() not in delta['status'].lower():
                continue

            delta_phase = dm.get_phase(delta_id)

            if phase is not None and delta_phase != phase:
                continue

            if delta_phase not in phase_groups:
                phase_groups[delta_phase] = []
            phase_groups[delta_phase].append(delta_id)

        # Print phases in order
        numeric_phases = sorted([p for p in phase_groups.keys() if p is not None])

        for p in numeric_phases:
            print(f"\nPhase {p}:")
            for delta_id in phase_groups[p]:
                delta = self.deltas[delta_id]
                print(f"  {delta_id:12} {delta['status']}")

        # Print unphased at the end
        if None in phase_groups:
            print("\nUnphased:")
            for delta_id in phase_groups[None]:
                delta = self.deltas[delta_id]
                print(f"  {delta_id:12} {delta['status']}")

    def show_delta(self, delta_id: str, dm: Optional[DependencyMatrix] = None):
        """Show detailed status for a delta"""
        if delta_id not in self.deltas:
            raise ValueError(f"Delta not found: {delta_id}")

        delta = self.deltas[delta_id]

        print(f"\n{delta_id}: {delta['name']}")
        print(f"  Status: {delta['status']}")
        print(f"  Complexity: {delta['complexity']}")

        if dm:
            phase = dm.get_phase(delta_id)
            print(f"  Phase: {phase if phase else 'Unknown'}")

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

    def _is_complete_status(self, status: str) -> bool:
        """Check if a status string indicates completion"""
        status_lower = status.lower()
        return '✓ implementation' in status_lower or 'complete' in status_lower

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
        """Suggest the next delta to implement based on dependencies and impact"""
        ready = self.get_ready_deltas(dm)

        if not ready:
            return None

        # Score deltas by how many other deltas depend on them (higher = more impactful)
        def impact_score(fid: str) -> int:
            return len(dm.get_dependents(fid))

        # Sort by impact (descending), then by phase (ascending), then by ID
        ready.sort(key=lambda f: (-impact_score(f), dm.get_phase(f) or 999, f))

        return ready[0] if ready else None


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
            print("\nAvailable commands: query, reverse, phase, tree, validate, list, add-dep, remove-dep, add-delta, delete-delta")
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

        elif command == "phase":
            if len(sys.argv) < 4:
                print("Usage: deltas.py deps phase DELTA-ID")
                sys.exit(1)
            delta_id = sys.argv[3]
            phase = dm.get_phase(delta_id)
            print(f"\n{delta_id}: Phase {phase if phase else 'Unknown'}")

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
                phase = dm.get_phase(delta_id)
                deps_count = len(dm.get_dependencies(delta_id))
                print(f"  {delta_id:12} Phase {phase if phase else '?'} ({deps_count} dependencies)")

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
                print("Usage: deltas.py deps delete-delta DELTA-ID")
                sys.exit(1)
            delta_id = sys.argv[3]
            try:
                dm.delete_delta(delta_id)
            except ValueError as e:
                print(f"Error: {e}")
                sys.exit(1)

        elif command == "recalculate-phases":
            try:
                new_phases = dm.recalculate_phases()
                print("\nRecalculated phases:")
                for phase_num in sorted(set(new_phases.values())):
                    deltas_in_phase = [f for f, p in new_phases.items() if p == phase_num]
                    print(f"\n  Phase {phase_num}:")
                    for fid in sorted(deltas_in_phase):
                        current_phase = dm.get_phase(fid)
                        changed = " (was {})".format(current_phase) if current_phase != phase_num else ""
                        print(f"    - {fid}{changed}")
                print("\nNote: Update DEPENDENCIES.md Implementation Phases section manually")
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
            phase = None
            category = None
            status_filter = None

            i = 3
            while i < len(sys.argv):
                if sys.argv[i] == "--phase" and i + 1 < len(sys.argv):
                    phase = int(sys.argv[i + 1])
                    i += 2
                elif sys.argv[i] == "--category" and i + 1 < len(sys.argv):
                    category = sys.argv[i + 1]
                    i += 2
                elif sys.argv[i] == "--status" and i + 1 < len(sys.argv):
                    status_filter = sys.argv[i + 1]
                    i += 2
                else:
                    i += 1

            sm.list_deltas(phase=phase, category=category, status_filter=status_filter, dm=dm)

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

    elif subcommand == "ready":
        # List deltas ready to implement
        deltas_path = project_root / "docs" / "planning" / "DELTAS.md"
        matrix_path = project_root / "docs" / "planning" / "DEPENDENCIES.md"

        sm = StatusManager(str(deltas_path))
        dm = DependencyMatrix(str(matrix_path))

        ready = sm.get_ready_deltas(dm)

        if ready:
            print("\nDeltas ready to implement (all dependencies complete):\n")
            for fid in sorted(ready, key=lambda f: (dm.get_phase(f) or 999, f)):
                delta = sm.deltas[fid]
                phase = dm.get_phase(fid)
                dependents = len(dm.get_dependents(fid))
                impact = f"({dependents} dependent{'s' if dependents != 1 else ''})" if dependents > 0 else ""
                print(f"  {fid:12} Phase {phase or '?'}  {delta['name']} {impact}")
        else:
            print("\nNo deltas ready to implement.")
            print("Either all deltas are in progress/complete, or dependencies are blocking.")

    elif subcommand == "next":
        # Suggest next delta to implement
        deltas_path = project_root / "docs" / "planning" / "DELTAS.md"
        matrix_path = project_root / "docs" / "planning" / "DEPENDENCIES.md"

        sm = StatusManager(str(deltas_path))
        dm = DependencyMatrix(str(matrix_path))

        suggestion = sm.suggest_next(dm)

        if suggestion:
            delta = sm.deltas[suggestion]
            phase = dm.get_phase(suggestion)
            dependents = dm.get_dependents(suggestion)

            print(f"\nSuggested next delta: {suggestion}")
            print(f"  Name: {delta['name']}")
            print(f"  Phase: {phase or 'Unknown'}")
            print(f"  Status: {delta['status']}")

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
            print("\nNo deltas available to implement.")
            print("Either all deltas are complete, or dependencies are blocking progress.")

    else:
        print(f"Unknown subcommand: {subcommand}")
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
