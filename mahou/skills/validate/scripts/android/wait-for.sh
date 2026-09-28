#!/usr/bin/env bash
# wait-for.sh "<text>" [timeout-seconds] — waits until a visible node's text or
# content description contains <text>. Exits non-zero on timeout.
set -euo pipefail
needle="$1"
timeout="${2:-60}"
start=$(date +%s)
until adb shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1 && adb exec-out cat /sdcard/ui.xml | grep -qF -- "$needle"; do
  if [ $(( $(date +%s) - start )) -ge "$timeout" ]; then
    echo "timed out waiting for: $needle" >&2
    exit 1
  fi
  sleep 2
done
