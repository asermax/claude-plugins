#!/usr/bin/env bash

set -euo pipefail

# Find the most likely base (parent) branch for the current branch.
#
# Compares the current HEAD against all remote branches using commit distance
# and returns the one with the fewest commits ahead — i.e., the branch this
# one was most likely forked from.
#
# Usage: find-base-branch.sh [repo-path]
#
# Prerequisites:
#   - [repo-path] is a git repository, the current directory by default; every
#     git command runs with -C, so no cd is needed
#   - Remote refs should be up to date (the script runs git fetch)
#
# Output (stdout):
#   JSON object with the detected base branch (without remote prefix) and
#   the commit distance:
#   {
#     "base_branch": "feat/parent-feature",
#     "ahead": 1,
#     "behind": 0
#   }
#
# Exit codes:
#   0 = success
#   1 = error (not a git repo, no remote branches, etc.)

REPO="${1:-.}"

CURRENT_BRANCH=$(git -C "$REPO" branch --show-current 2>/dev/null) || {
  echo '{"error": "Not a git repository or detached HEAD"}' >&2
  exit 1
}

if [[ -z "$CURRENT_BRANCH" ]]; then
  echo '{"error": "Detached HEAD state — cannot determine current branch"}' >&2
  exit 1
fi

# Fetch latest remote refs
git -C "$REPO" fetch origin --quiet 2>/dev/null || {
  echo '{"error": "Failed to fetch from origin"}' >&2
  exit 1
}

best_branch=""
best_ahead=""
best_behind=""

while IFS= read -r branch; do
  # Skip HEAD pointer and the current branch's own remote tracking ref
  [[ "$branch" == *"HEAD"* ]] && continue

  trimmed=$(echo "$branch" | sed 's/^ *//')
  ref_name="${trimmed#origin/}"

  [[ "$ref_name" == "$CURRENT_BRANCH" ]] && continue

  ahead=$(git -C "$REPO" rev-list --count "$trimmed..HEAD" 2>/dev/null) || continue
  behind=$(git -C "$REPO" rev-list --count "HEAD..$trimmed" 2>/dev/null) || continue

  # Rank by fewest commits ahead (closest fork point). On ties, prefer the
  # branch we are least behind: a true parent is a proper ancestor (behind 0),
  # so this avoids picking a diverged sibling that shares the same ahead count.
  if [[ -z "$best_ahead" ]] \
    || (( ahead < best_ahead )) \
    || (( ahead == best_ahead && behind < best_behind )); then
    best_branch="$trimmed"
    best_ahead="$ahead"
    best_behind="$behind"
  fi
done < <(git -C "$REPO" branch -r 2>/dev/null)

if [[ -z "$best_branch" ]]; then
  echo '{"error": "No remote branches found to compare against"}' >&2
  exit 1
fi

# Strip remote prefix (e.g. "origin/develop" -> "develop")
base_name="${best_branch#origin/}"

cat <<EOF
{
  "base_branch": "$base_name",
  "ahead": $best_ahead,
  "behind": $best_behind
}
EOF
