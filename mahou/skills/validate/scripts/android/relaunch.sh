#!/usr/bin/env bash
# relaunch.sh <package> "<text>" [timeout-seconds] — force-stops the app,
# launches it again and waits until <text> is visible.
set -euo pipefail
package="$1"
needle="$2"
timeout="${3:-90}"
adb shell am force-stop "$package"
adb shell monkey -p "$package" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
"$(dirname "$0")/wait-for.sh" "$needle" "$timeout"
