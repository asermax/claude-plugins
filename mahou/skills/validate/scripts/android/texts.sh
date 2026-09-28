#!/usr/bin/env bash
# texts.sh — prints every visible text or content description on the device screen,
# top to bottom, with its center and whether the node is enabled and checked.
set -euo pipefail
adb shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1
adb exec-out cat /sdcard/ui.xml | python3 -c "
import sys, re, html
xml = sys.stdin.read()
rows = []
for match in re.finditer(r'<node [^>]*>', xml):
    node = match.group(0)
    text = html.unescape((re.search(r'text=\"([^\"]*)\"', node) or [None, ''])[1])
    desc = html.unescape((re.search(r'content-desc=\"([^\"]*)\"', node) or [None, ''])[1])
    enabled = re.search(r'enabled=\"(\w+)\"', node).group(1)
    checked = re.search(r'checked=\"(\w+)\"', node).group(1)
    bounds = re.search(r'bounds=\"\[(\d+),(\d+)\]\[(\d+),(\d+)\]\"', node)
    if bounds and (text or desc):
        x1, y1, x2, y2 = map(int, bounds.groups())
        rows.append((y1, (x1 + x2) // 2, (y1 + y2) // 2, (text or desc)[:90], enabled, checked))
for _, cx, cy, label, enabled, checked in sorted(rows):
    print(f'y={cy:>5} x={cx:>4} enabled={enabled:<5} checked={checked:<5} {label}')
"
