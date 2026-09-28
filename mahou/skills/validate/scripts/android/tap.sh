#!/usr/bin/env bash
# tap.sh "<text>" [index] — taps the Nth visible node whose text or content
# description contains <text>. Dumps the UI on every call, so a layout shifted
# by the keyboard is read fresh.
set -euo pipefail
needle="$1"
index="${2:-0}"
adb shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1
target=$(adb exec-out cat /sdcard/ui.xml | python3 -c "
import sys, re, html
needle, index = sys.argv[1], int(sys.argv[2])
xml = sys.stdin.read()
hits = []
for match in re.finditer(r'<node [^>]*>', xml):
    node = match.group(0)
    text = html.unescape((re.search(r'text=\"([^\"]*)\"', node) or [None, ''])[1])
    desc = html.unescape((re.search(r'content-desc=\"([^\"]*)\"', node) or [None, ''])[1])
    bounds = re.search(r'bounds=\"\[(\d+),(\d+)\]\[(\d+),(\d+)\]\"', node)
    if bounds and (needle in text or needle in desc):
        x1, y1, x2, y2 = map(int, bounds.groups())
        hits.append(((x1 + x2) // 2, (y1 + y2) // 2))
if len(hits) <= index:
    sys.exit(f'not found: {needle!r} (matches: {len(hits)})')
print(*hits[index])
" "$needle" "$index")
read -r cx cy <<< "$target"
echo "tap $cx $cy $needle"
adb shell input tap "$cx" "$cy"
