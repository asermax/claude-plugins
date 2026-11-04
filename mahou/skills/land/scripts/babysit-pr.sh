#!/usr/bin/env bash
# usage: babysit-pr.sh <owner>/<repo> <number> [since]
#
# Polls a PR every 60s and exits with one line naming the first event:
#   MERGED | CLOSED | REVIEW <reason> | BEHIND | DIRTY | FAILED_CHECK <names> | ERROR <message>
# DIRTY is a merge conflict with the base, handled like BEHIND.
# ERROR means three polls in a row failed, such as a repository or PR that does
# not exist; one failed poll followed by a good one is retried silently.
#
# `since` is an ISO 8601 timestamp, defaulting to now. Review bodies and PR
# comments created after it count as new findings. Pass the PR's creation time
# on the first watch, and leave it out when restarting after handling a review,
# so the findings already handled do not fire again. Comments by the PR author
# are skipped: they are the user's own rulings, not findings.

owner=${1%%/*}
repo=${1#*/}
number=$2
since=${3:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}

query='query($o:String!,$r:String!,$n:Int!){repository(owner:$o,name:$r){pullRequest(number:$n){
  author{login}
  reviewThreads(first:100){nodes{isResolved}}
  reviews(last:50){nodes{author{login} body submittedAt}}
  comments(last:100){nodes{author{login} body createdAt}}
}}}'

err=$(mktemp)
trap 'rm -f "$err"' EXIT
failures=0

fail() {
  failures=$((failures + 1))

  if [ "$failures" -ge 3 ]; then
    echo "ERROR $(tr '\n' ' ' <"$err")"
    exit 1
  fi

  sleep 60
}

while true; do
  status=$(gh pr view "$number" --repo "$owner/$repo" --json state,mergeStateStatus,statusCheckRollup 2>"$err") || { fail; continue; }
  review=$(gh api graphql -f query="$query" -f o="$owner" -f r="$repo" -F n="$number" 2>"$err") || { fail; continue; }
  failures=0

  state=$(jq -r .state <<<"$status")

  if [ "$state" = MERGED ] || [ "$state" = CLOSED ]; then
    echo "$state"
    exit 0
  fi

  # A bot sometimes posts a finding as a PR comment when it cannot attach the
  # inline thread, so comments are findings as much as threads and bodies are.
  findings=$(jq -r --arg since "$since" '
    .data.repository.pullRequest as $pr
    | ($pr.reviewThreads.nodes | map(select(.isResolved | not)) | length) as $threads
    | ($pr.reviews.nodes | map(select(.body != "" and .submittedAt > $since and .author.login != $pr.author.login)) | length) as $bodies
    | ($pr.comments.nodes | map(select(.createdAt > $since and .author.login != $pr.author.login)) | length) as $comments
    | if $threads > 0 then "unresolved_threads=\($threads)"
      elif $bodies > 0 then "new_review_bodies=\($bodies)"
      elif $comments > 0 then "new_comments=\($comments)"
      else "" end' <<<"$review")

  if [ -n "$findings" ]; then
    echo "REVIEW $findings"
    exit 0
  fi

  merge=$(jq -r .mergeStateStatus <<<"$status")

  if [ "$merge" = BEHIND ] || [ "$merge" = DIRTY ]; then
    echo "$merge"
    exit 0
  fi

  failed=$(jq -r '[.statusCheckRollup[]? | select((.conclusion // .state) | test("FAILURE|ERROR|TIMED_OUT|CANCELLED|ACTION_REQUIRED"))] | map(.name // .context) | join(",")' <<<"$status")

  if [ -n "$failed" ]; then
    echo "FAILED_CHECK $failed"
    exit 0
  fi

  sleep 60
done
