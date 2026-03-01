#!/usr/bin/env python3
"""
Delta Management Tool

Manage deltas: dependencies, status tracking, priority, and queries.
Dependencies are stored inline in DELTAS.md as **Depends on**: fields.

Usage:
    # Dependency commands
    python scripts/deltas.py deps query DELTA-ID              # Show what DELTA-ID depends on
    python scripts/deltas.py deps reverse DELTA-ID            # Show what depends on DELTA-ID
    python scripts/deltas.py deps tree DELTA-ID               # Show full dependency tree
    python scripts/deltas.py deps validate                    # Check for circular dependencies
    python scripts/deltas.py deps list                        # List all deltas
    python scripts/deltas.py deps add-dep FROM-ID TO-ID       # Add dependency
    python scripts/deltas.py deps remove-dep FROM-ID TO-ID    # Remove dependency

    # Status commands
    python scripts/deltas.py status list                        # List all deltas with status
    python scripts/deltas.py status list --complexity LEVEL     # Filter by complexity
    python scripts/deltas.py status list --status "STATUS"      # Filter by status text
    python scripts/deltas.py status show DELTA-ID               # Show detailed delta status
    python scripts/deltas.py status set DELTA-ID STATUS         # Update delta status

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

Note: When marking a delta as reconciled (✓ Reconciled), it is automatically removed from
      DELTAS.md since the delta is fully processed and documented.
"""

import sys
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple


# Priority levels with MoSCoW labels
PRIORITY_LABELS = {
    1: "Critical",
    2: "High",
    3: "Medium",
    4: "Low",
    5: "Backlog",
}

DEFAULT_PRIORITY = 3


class StatusManager:
    def __init__(self, filepath: str = "docs/planning/DELTAS.md"):
        self.filepath = Path(filepath)
        self.deltas: Dict[str, Dict] = {}
        self._load()

    def _load(self):
        """Load delta statuses and dependencies from DELTAS.md"""
        if not self.filepath.exists():
            raise FileNotFoundError(f"Deltas file not found: {self.filepath}")

        content = self.filepath.read_text()

        # Parse deltas from markdown
        # Format: ### DELTA-ID: Delta name
        # followed by: **Status**: symbol Phase
        #              **Depends on**: DLT-XXX, DLT-YYY (or None)
        #              **Priority**: N (Label)
        #              **Complexity**: Level
        #              **Description**: text
        delta_pattern = re.compile(
            r'^### (DLT-\d+): (.+?)$\n'
            r'(?:\*\*Status\*\*: (.+?)$\n)?'
            r'(?:\*\*Depends on\*\*: (.+?)$\n)?'
            r'(?:\*\*Priority\*\*: (\d)(?: \(.+?\))?$\n)?'
            r'(?:\*\*Complexity\*\*: (.+?)$\n)?'
            r'(?:\*\*Description\*\*: (.+?)$)?',
            re.MULTILINE
        )

        for match in delta_pattern.finditer(content):
            delta_id = match.group(1)
            name = match.group(2).strip()
            status = match.group(3).strip() if match.group(3) else "✗ Not Started"
            depends_on_str = match.group(4).strip() if match.group(4) else ""
            priority = int(match.group(5)) if match.group(5) else DEFAULT_PRIORITY
            complexity = match.group(6).strip() if match.group(6) else "Unknown"
            description = match.group(7).strip() if match.group(7) else ""

            # Parse dependency list
            deps: Set[str] = set()
            if depends_on_str and depends_on_str.lower() != 'none':
                for dep_str in depends_on_str.split(','):
                    dep = dep_str.strip()
                    if re.match(r'^DLT-\d+$', dep):
                        deps.add(dep)

            self.deltas[delta_id] = {
                'name': name,
                'status': status,
                'dependencies': deps,
                'priority': priority,
                'complexity': complexity,
                'description': description,
            }

    # ── Dependency query methods ──────────────────────────────────────

    def get_dependencies(self, delta_id: str) -> Set[str]:
        """Get what DELTA-ID depends on"""
        delta = self.deltas.get(delta_id)
        return delta['dependencies'] if delta else set()

    def get_dependents(self, delta_id: str) -> Set[str]:
        """Get what depends on DELTA-ID"""
        dependents = set()
        for did, data in self.deltas.items():
            if delta_id in data.get('dependencies', set()):
                dependents.add(did)
        return dependents

    def validate(self) -> Tuple[bool, List[str]]:
        """Check for circular dependencies"""
        errors = []

        def has_cycle(delta: str, visited: Set[str], rec_stack: Set[str]) -> bool:
            visited.add(delta)
            rec_stack.add(delta)

            for dep in self.get_dependencies(delta):
                if dep not in visited:
                    if has_cycle(dep, visited, rec_stack):
                        return True
                elif dep in rec_stack:
                    errors.append(f"Circular dependency detected: {delta} -> {dep}")
                    return True

            rec_stack.remove(delta)
            return False

        visited: Set[str] = set()
        for delta_id in self.deltas:
            if delta_id not in visited:
                has_cycle(delta_id, visited, set())

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

    def print_tree(self, delta_id: str, _visited: Set[str] | None = None, _prefix: str = ""):
        """Print full dependency tree for DELTA-ID"""
        if _visited is None:
            _visited = set()
            print(f"\n{delta_id}")
            _prefix = ""

        if delta_id in _visited:
            return
        _visited.add(delta_id)

        deps = sorted(self.get_dependencies(delta_id))
        dependents = sorted(self.get_dependents(delta_id))

        all_children = [(dep, True) for dep in deps] + [(dep, False) for dep in dependents]

        for i, (child, is_dependency) in enumerate(all_children):
            is_last_item = i == len(all_children) - 1

            connector = "└──" if is_last_item else "├──"
            arrow = "⬇" if is_dependency else "⬆"

            print(f"{_prefix}{connector} {arrow} {child}")

            extension = "    " if is_last_item else "│   "
            child_prefix = _prefix + extension

            if is_dependency and child not in _visited:
                self.print_tree(child, _visited, child_prefix)

    # ── Dependency mutation methods ───────────────────────────────────

    def add_dependency(self, from_delta: str, to_delta: str):
        """Add dependency: from_delta depends on to_delta"""
        if from_delta not in self.deltas:
            raise ValueError(f"Delta not found: {from_delta}")
        if to_delta not in self.deltas:
            raise ValueError(f"Delta not found: {to_delta}")
        if from_delta == to_delta:
            raise ValueError("Cannot add self-dependency")

        self.deltas[from_delta]['dependencies'].add(to_delta)
        new_deps_str = ', '.join(sorted(self.deltas[from_delta]['dependencies']))

        content = self.filepath.read_text()

        pattern = re.compile(
            rf'^(### {re.escape(from_delta)}: .+?$\n'
            rf'(?:\*\*Status\*\*: .+?$\n)?)'
            rf'(\*\*Depends on\*\*: .+?$\n)?',
            re.MULTILINE
        )

        def replacer(match):
            prefix = match.group(1)
            return f"{prefix}**Depends on**: {new_deps_str}\n"

        new_content = pattern.sub(replacer, content)
        self.filepath.write_text(new_content)
        print(f"✓ Added dependency: {from_delta} → {to_delta}")

    def remove_dependency(self, from_delta: str, to_delta: str):
        """Remove dependency: from_delta no longer depends on to_delta"""
        if from_delta not in self.deltas:
            raise ValueError(f"Delta not found: {from_delta}")
        if to_delta not in self.deltas[from_delta].get('dependencies', set()):
            raise ValueError(f"Dependency does not exist: {from_delta} → {to_delta}")

        self.deltas[from_delta]['dependencies'].discard(to_delta)
        remaining = self.deltas[from_delta]['dependencies']
        new_deps_str = ', '.join(sorted(remaining)) if remaining else 'None'

        content = self.filepath.read_text()

        pattern = re.compile(
            rf'^(### {re.escape(from_delta)}: .+?$\n'
            rf'(?:\*\*Status\*\*: .+?$\n)?)'
            rf'(\*\*Depends on\*\*: .+?$\n)?',
            re.MULTILINE
        )

        def replacer(match):
            prefix = match.group(1)
            return f"{prefix}**Depends on**: {new_deps_str}\n"

        new_content = pattern.sub(replacer, content)
        self.filepath.write_text(new_content)
        print(f"✓ Removed dependency: {from_delta} ⤫ {to_delta}")

    def _remove_delta_from_all_dependencies(self, delta_id: str):
        """Remove delta_id from all other deltas' Depends on lines (used during reconciliation)"""
        dependents = [
            did for did, data in self.deltas.items()
            if delta_id in data.get('dependencies', set()) and did != delta_id
        ]

        if not dependents:
            return

        content = self.filepath.read_text()

        for dependent_id in dependents:
            self.deltas[dependent_id]['dependencies'].discard(delta_id)
            remaining = self.deltas[dependent_id]['dependencies']
            new_deps_str = ', '.join(sorted(remaining)) if remaining else 'None'

            pattern = re.compile(
                rf'^(### {re.escape(dependent_id)}: .+?$\n'
                rf'(?:\*\*Status\*\*: .+?$\n)?)'
                rf'\*\*Depends on\*\*: .+?$',
                re.MULTILINE
            )

            content = pattern.sub(rf'\g<1>**Depends on**: {new_deps_str}', content)

        self.filepath.write_text(content)

        for dependent_id in dependents:
            print(f"  Removed {delta_id} from {dependent_id}'s dependencies")

    # ── Status methods ────────────────────────────────────────────────

    def get_status(self, delta_id: str) -> str | None:
        """Get status of a delta"""
        delta = self.deltas.get(delta_id)
        return delta['status'] if delta else None

    def set_status(self, delta_id: str, status: str):
        """Update status of a delta in DELTAS.md

        When status indicates reconciliation, automatically removes the delta
        from DELTAS.md and cleans up dependency references.
        """
        if delta_id not in self.deltas:
            raise ValueError(f"Delta not found: {delta_id}")

        content = self.filepath.read_text()

        pattern = re.compile(
            rf'^(### {re.escape(delta_id)}: .+?$)\n'
            rf'(\*\*Status\*\*: .+?$)?',
            re.MULTILINE
        )

        def replacer(match):
            header = match.group(1)
            return f"{header}\n**Status**: {status}"

        new_content = pattern.sub(replacer, content)

        self.filepath.write_text(new_content)
        self.deltas[delta_id]['status'] = status
        print(f"✓ Updated {delta_id} status to: {status}")

        # Auto-cleanup on reconciliation
        if self._is_reconciled_status(status):
            self._remove_delta_from_all_dependencies(delta_id)
            self.delete_delta(delta_id)
            self._delete_work_files(delta_id)

    def set_priority(self, delta_id: str, priority: int):
        """Update priority of a delta in DELTAS.md"""
        if delta_id not in self.deltas:
            raise ValueError(f"Delta not found: {delta_id}")

        if priority < 1 or priority > 5:
            raise ValueError(f"Invalid priority: {priority} (must be 1-5)")

        content = self.filepath.read_text()
        label = PRIORITY_LABELS[priority]

        priority_pattern = re.compile(
            rf'^(### {re.escape(delta_id)}: .+?$\n'
            rf'(?:\*\*Status\*\*: .+?$\n)?'
            rf'(?:\*\*Depends on\*\*: .+?$\n)?)'
            rf'(\*\*Priority\*\*: \d(?: \(.+?\))?$\n)?',
            re.MULTILINE
        )

        def replacer(match):
            prefix = match.group(1)
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
        category: str | None = None,
        status_filter: str | None = None,
    ):
        """List deltas with optional filtering"""
        print("\nDeltas:")

        for delta_id in sorted(self.deltas.keys()):
            delta = self.deltas[delta_id]

            if category and not delta_id.startswith(f"{category}-"):
                continue
            if status_filter and status_filter.lower() not in delta['status'].lower():
                continue

            print(f"  {delta_id:12} {delta['status']}")

    def show_delta(self, delta_id: str):
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

        deps = self.get_dependencies(delta_id)
        if deps:
            print(f"  Dependencies ({len(deps)}):")
            for dep in sorted(deps):
                print(f"    - {dep}")

        dependents = self.get_dependents(delta_id)
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
        return '✓ reconciled' in status.lower()

    def delete_delta(self, delta_id: str):
        """Delete a delta entry from DELTAS.md"""
        if delta_id not in self.deltas:
            raise ValueError(f"Delta not found: {delta_id}")

        content = self.filepath.read_text()

        pattern = re.compile(
            rf'^### {re.escape(delta_id)}: .+?(?=^### DLT-|\Z)',
            re.MULTILINE | re.DOTALL
        )
        new_content = pattern.sub('', content)

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

        spikes_dir = base_dir / 'spikes'

        if spikes_dir.exists():
            for spike_file in spikes_dir.glob(f"SPIKE-{delta_id}-*.md"):
                spike_file.unlink()
                print(f"✓ Removed {spike_file.relative_to(base_dir.parent)}")

    # ── Readiness / suggestion methods ────────────────────────────────

    def get_ready_deltas(self) -> List[str]:
        """Get deltas that are ready to implement (all deps complete, not started yet)"""
        ready = []

        for delta_id in self.deltas:
            delta = self.deltas[delta_id]

            # Skip if already in progress or complete
            if '⧗' in delta['status'] or self.is_complete(delta_id):
                continue

            # Check if all dependencies are complete
            deps = self.get_dependencies(delta_id)
            all_deps_complete = all(self.is_complete(dep) for dep in deps)

            if all_deps_complete:
                ready.append(delta_id)

        return ready

    def get_transitive_blocked(self, delta_id: str) -> list[tuple[str, int]]:
        """Get all non-complete deltas transitively blocked by delta_id, with their priorities."""
        result = []
        visited = set()

        def walk(fid: str):
            for dep_id in self.get_dependents(fid):
                if dep_id in visited or dep_id not in self.deltas or self.is_complete(dep_id):
                    continue

                visited.add(dep_id)
                result.append((dep_id, self.deltas[dep_id].get('priority', DEFAULT_PRIORITY)))
                walk(dep_id)

        walk(delta_id)
        return result

    def compute_score(self, fid: str) -> int:
        """Compute priority score for a delta.

        Higher score = higher priority to work on.
        Formula:
        - Priority contribution: (6 - priority) * 10  (Critical=50, Medium=30, Backlog=10)
        - Blocker boost: sum of (6 - blocked_priority) * 3 for each transitively blocked non-complete delta
        - Complexity penalty: Easy=0, Medium=1, Hard=2 (prefer quick wins)
        """
        delta = self.deltas[fid]
        priority = delta.get('priority', DEFAULT_PRIORITY)
        complexity_map = {'Easy': 0, 'Medium': 1, 'Hard': 2}
        complexity_penalty = complexity_map.get(delta.get('complexity', 'Medium'), 1)

        blocked = self.get_transitive_blocked(fid)
        blocker_boost = sum((6 - bp) * 3 for _, bp in blocked)

        return (6 - priority) * 10 + blocker_boost - complexity_penalty

    def suggest_next(self) -> str | None:
        """Suggest the next delta to implement based on priority, dependencies, and complexity"""
        ready = self.get_ready_deltas()

        if not ready:
            return None

        ready.sort(key=lambda f: (-self.compute_score(f), f))

        return ready[0] if ready else None

    # ── Display methods ───────────────────────────────────────────────

    def print_summary_table(
        self,
        status_filter: str | None = None,
        priority_filter: int | None = None,
        ready_only: bool = False,
    ):
        """Print a summary table of deltas"""
        filtered_deltas = []

        for delta_id in self.deltas.keys():
            delta = self.deltas[delta_id]

            if status_filter and status_filter.lower() not in delta['status'].lower():
                continue

            if priority_filter is not None:
                delta_priority = delta.get('priority', DEFAULT_PRIORITY)
                if delta_priority != priority_filter:
                    continue

            if ready_only:
                if '⧗' in delta['status'] or self.is_complete(delta_id):
                    continue
                deps = self.get_dependencies(delta_id)
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

        filtered_deltas.sort(key=lambda x: (x[1].get('priority', DEFAULT_PRIORITY), x[0]))

        header = "| ID          | Name                    | Status               | Priority | Complexity | Impact |"
        separator = "|-------------|-------------------------|----------------------|----------|------------|--------|"

        print("\n" + header)
        print(separator)

        for delta_id, delta in filtered_deltas:
            name = delta['name'][:24] + '...' if len(delta['name']) > 24 else delta['name'].ljust(24)
            status = delta['status'][:22].ljust(22)
            priority = delta.get('priority', DEFAULT_PRIORITY)
            priority_label = PRIORITY_LABELS.get(priority, "Unknown")
            priority_str = f"{priority}-{priority_label[:4]}".ljust(8)
            complexity = delta['complexity'][:10].ljust(10)

            blocked_count = len(self.get_dependents(delta_id))
            impact_str = f"blocks {blocked_count}" if blocked_count > 0 else "-"

            row = f"| {delta_id:11} | {name} | {status} | {priority_str} | {complexity} | {impact_str:6} |"
            print(row)

        total_count = len(filtered_deltas)
        print(f"\nTotal: {total_count} delta(s)")

        from collections import Counter
        priority_counts = Counter(delta.get('priority', DEFAULT_PRIORITY) for _, delta in filtered_deltas)

        if len(priority_counts) > 1:
            print("\nBy Priority:")
            for level in range(1, 6):
                if level in priority_counts:
                    label = PRIORITY_LABELS[level]
                    emoji = {1: "🔴", 2: "🟠", 3: "🟡", 4: "⚪", 5: "⚫"}.get(level, "")
                    print(f"  {emoji} {label}: {priority_counts[level]}")

    def print_priority_list(self, level_filter: int | None = None):
        """Print deltas grouped by priority level"""
        by_priority: Dict[int, List[Tuple[str, Dict]]] = {i: [] for i in range(1, 6)}

        for delta_id in sorted(self.deltas.keys()):
            delta = self.deltas[delta_id]
            priority = delta.get('priority', DEFAULT_PRIORITY)

            if level_filter is None or priority == level_filter:
                by_priority[priority].append((delta_id, delta))

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
                deps_count = len(self.get_dependents(delta_id))
                impact_str = f" (blocks {deps_count})" if deps_count > 0 else ""

                print(f"  {status_symbol} {delta_id}: {delta['name']}{impact_str}")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    subcommand = sys.argv[1]

    # Find project root (where docs/planning/ directory exists with DELTAS.md)
    cwd = Path.cwd()
    project_root = cwd

    while project_root != project_root.parent:
        if (project_root / "docs" / "planning" / "DELTAS.md").exists():
            break
        project_root = project_root.parent
    else:
        print("Error: Could not find docs/planning/DELTAS.md")
        sys.exit(1)

    deltas_path = project_root / "docs" / "planning" / "DELTAS.md"

    if subcommand == "deps":
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
            sys.exit(1)

        command = sys.argv[2]
        sm = StatusManager(str(deltas_path))

        if command == "query":
            if len(sys.argv) < 4:
                print("Usage: deltas.py deps query DELTA-ID")
                sys.exit(1)
            delta_id = sys.argv[3]
            sm.print_dependencies(delta_id)

        elif command == "reverse":
            if len(sys.argv) < 4:
                print("Usage: deltas.py deps reverse DELTA-ID")
                sys.exit(1)
            delta_id = sys.argv[3]
            sm.print_dependents(delta_id)

        elif command == "validate":
            valid, errors = sm.validate()
            if valid:
                print("\n✓ No circular dependencies found")
            else:
                print("\n✗ Validation errors:")
                for error in errors:
                    print(f"  - {error}")
                sys.exit(1)

        elif command == "list":
            print("\nAll deltas:")
            for delta_id in sorted(sm.deltas):
                deps_count = len(sm.get_dependencies(delta_id))
                print(f"  {delta_id:12} ({deps_count} dependencies)")

        elif command == "tree":
            if len(sys.argv) < 4:
                print("Usage: deltas.py deps tree DELTA-ID")
                sys.exit(1)
            delta_id = sys.argv[3]
            if delta_id not in sm.deltas:
                print(f"Error: Delta not found: {delta_id}")
                sys.exit(1)
            sm.print_tree(delta_id)

        elif command == "add-dep":
            if len(sys.argv) < 5:
                print("Usage: deltas.py deps add-dep FROM-ID TO-ID")
                sys.exit(1)
            from_id = sys.argv[3]
            to_id = sys.argv[4]
            try:
                sm.add_dependency(from_id, to_id)
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
                sm.remove_dependency(from_id, to_id)
            except ValueError as e:
                print(f"Error: {e}")
                sys.exit(1)

        else:
            print(f"Unknown deps command: {command}")
            sys.exit(1)

    elif subcommand == "status":
        if len(sys.argv) < 3:
            print("Usage: deltas.py status <command> [args]")
            print("\nAvailable commands: list, show, set")
            sys.exit(1)

        command = sys.argv[2]
        sm = StatusManager(str(deltas_path))

        if command == "list":
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

            sm.list_deltas(category=category, status_filter=status_filter)

        elif command == "show":
            if len(sys.argv) < 4:
                print("Usage: deltas.py status show DELTA-ID")
                sys.exit(1)
            delta_id = sys.argv[3]
            try:
                sm.show_delta(delta_id)
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
            status = ' '.join(sys.argv[4:])
            try:
                sm.set_status(delta_id, status)
            except ValueError as e:
                print(f"Error: {e}")
                sys.exit(1)

        else:
            print(f"Unknown status command: {command}")
            sys.exit(1)

    elif subcommand == "priority":
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
        sm = StatusManager(str(deltas_path))

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

            sm.print_priority_list(level_filter=level_filter)

        else:
            print(f"Unknown priority command: {command}")
            sys.exit(1)

    elif subcommand == "summary":
        sm = StatusManager(str(deltas_path))

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
                status_filter = sys.argv[i]
                i += 1
            else:
                i += 1

        sm.print_summary_table(status_filter=status_filter, priority_filter=priority_filter, ready_only=ready_only)

    elif subcommand == "ready":
        sm = StatusManager(str(deltas_path))

        ready = sm.get_ready_deltas()

        if ready:
            print("\nDeltas ready to implement (all dependencies complete):\n")
            for fid in sorted(ready):
                delta = sm.deltas[fid]
                dependents = len(sm.get_dependents(fid))
                impact = f"({dependents} dependent{'s' if dependents != 1 else ''})" if dependents > 0 else ""
                print(f"  {fid:12} {delta['name']} {impact}")
        else:
            print("\nNo deltas ready to implement.")
            print("Either all deltas are in progress/complete, or dependencies are blocking.")

    elif subcommand == "next":
        sm = StatusManager(str(deltas_path))

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

        ready = sm.get_ready_deltas()

        if not ready:
            print("\nNo deltas available to implement.")
            print("Either all deltas are complete, or dependencies are blocking progress.")
            sys.exit(0)

        ready.sort(key=lambda f: (-sm.compute_score(f), f))

        if group_by_priority:
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
                    dependents = sm.get_dependents(fid)
                    deps = sm.get_dependencies(fid)
                    complexity = delta.get('complexity', 'Unknown')
                    score = sm.compute_score(fid)

                    impact_str = f" | blocks {len(dependents)}" if dependents else ""
                    print(f"  {fid}: {delta['name']}")
                    print(f"    Complexity: {complexity}{impact_str} | Score: {score}")

                    if deps:
                        print(f"    Depends on: {', '.join(sorted(deps))}")
        else:
            if top_n == 1:
                suggestion = ready[0]
                delta = sm.deltas[suggestion]
                dependents = sm.get_dependents(suggestion)
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

                deps = sm.get_dependencies(suggestion)
                if deps:
                    print(f"  Depends on ({len(deps)} complete):")
                    for dep in sorted(deps):
                        print(f"    - {dep} ✓")
            else:
                print(f"\n🎯 Top {min(top_n, len(ready))} Recommended Deltas:\n")

                for i, fid in enumerate(ready[:top_n], 1):
                    delta = sm.deltas[fid]
                    dependents = sm.get_dependents(fid)
                    deps = sm.get_dependencies(fid)
                    priority = delta.get('priority', DEFAULT_PRIORITY)
                    priority_label = PRIORITY_LABELS.get(priority, "Unknown")
                    complexity = delta.get('complexity', 'Unknown')
                    score = sm.compute_score(fid)

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
