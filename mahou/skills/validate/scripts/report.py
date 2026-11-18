#!/usr/bin/env python3
"""Render a validation run's results.json into <out-dir>/index.html.

Usage: report.py <results.json> <out-dir>

Safe to re-run after every row. Evidence paths are written as given, so they
must be relative to <out-dir>.
"""

import html
import json
import re
import sys
from pathlib import Path
from typing import Any

TEMPLATE = Path(__file__).resolve().parent.parent / "assets" / "report-template.html"
IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}
VIDEO_SUFFIXES = {".mp4", ".webm"}

RESULTS = {
    "passed": "PASS",
    "passed_after_fix": "PASS AFTER FIX",
    "failed": "FAIL",
    "blocked": "BLOCKED",
    "not_run": "NOT RUN",
}

Json = dict[str, Any]


def esc(value: Any) -> str:
    text = "" if value is None else str(value)
    escaped = html.escape(text, quote=True)
    escaped = re.sub(r"`([^`]+)`", r"<code>\1</code>", escaped)

    return escaped.replace("\n", "<br>")


def link(path: str) -> str:
    return html.escape(path, quote=True)


def listing(items: list[Any], tag: str = "ul") -> str:
    if not items:
        return ""

    lis = "".join(f"<li>{esc(item)}</li>" for item in items)

    return f"<{tag}>{lis}</{tag}>"


def evidence_html(items: list[Any]) -> str:
    figures = []

    for item in items:
        entry = {"path": item} if isinstance(item, str) else item
        path = entry["path"]
        caption = esc(entry.get("caption") or Path(path).name)
        suffix = Path(path).suffix.lower()
        href = link(path)

        if suffix in IMAGE_SUFFIXES:
            media = f'<a href="{href}"><img src="{href}" loading="lazy" alt="{caption}"></a>'
        elif suffix in VIDEO_SUFFIXES:
            media = f'<video src="{href}" controls width="420"></video>'
        else:
            media = f'<a href="{href}">{esc(Path(path).name)}</a>'

        has_caption = entry.get("caption") or suffix in IMAGE_SUFFIXES
        figcaption = f"<figcaption>{caption}</figcaption>" if has_caption else ""
        figures.append(f"<figure>{media}{figcaption}</figure>")

    return f'<div class="evidence">{"".join(figures)}</div>' if figures else ""


def key_values(pairs: list[tuple[str, str]]) -> str:
    rows = "".join(
        f"<tr><th>{esc(label)}</th><td>{content}</td></tr>"
        for label, content in pairs
        if content
    )

    return f'<table class="kv">{rows}</table>' if rows else ""


def result_cell(result: str) -> str:
    return f'<span class="result {esc(result)}">{esc(RESULTS.get(result, result))}</span>'


def header_section(data: Json) -> str:
    meta = data.get("header") or []
    rows = "".join(
        f"<tr><th>{esc(entry['label'])}</th><td>{esc(entry['value'])}</td></tr>"
        for entry in meta
    )

    return f"<h2>Header</h2><table class=\"kv\">{rows}</table>" if rows else ""


def setup_section(data: Json) -> str:
    started = listing(data.get("started") or [])
    mutations = data.get("mutations") or []
    parts = []

    if started:
        parts.append(f"<p><b>Started for the run:</b></p>{started}")

    if mutations:
        rows = "".join(
            "<tr>"
            f"<td>{esc(m['what'])}</td>"
            f"<td>{esc(m.get('before'))}</td>"
            f"<td>{esc(m.get('change'))}</td>"
            f"<td>{esc(m.get('restore'))}</td>"
            f"<td>{evidence_html(m.get('evidence') or [])}</td>"
            "</tr>"
            for m in mutations
        )
        parts.append(
            '<div class="scroll"><table>'
            "<tr><th>What</th><th>Before</th><th>Change</th><th>Restore</th><th>Files</th></tr>"
            f"{rows}</table></div>"
        )

    if not parts:
        return ""

    return "<h2>Setup and mutations</h2>" + "".join(parts)


def fix_html(fix: Json) -> str:
    return (
        '<div class="fix">'
        f"<p><b>Failed:</b> {esc(fix.get('failed'))}</p>"
        f"<p><b>Changed:</b> {esc(fix.get('changed'))}</p>"
        f"<p><b>Passing run:</b> {esc(fix.get('rerun'))}</p>"
        "</div>"
    )


def row_html(row: Json) -> str:
    result = row.get("result", "not_run")
    blocked = row.get("blocked")
    blocked_html = ""

    if blocked is not None:
        blocked_html = (
            '<div class="blockedbox">'
            f"<p><b>Assumption:</b> {esc(blocked.get('assumption'))}</p>"
            f"<p><b>Observation that contradicts it:</b> {esc(blocked.get('observation'))}</p>"
            f"<p><b>What a fix would change in previous decisions:</b> {esc(blocked.get('would_change'))}</p>"
            f"<p><b>Rows it blocks:</b> {esc(', '.join(blocked.get('blocks') or []))}</p>"
            "</div>"
        )

    fixes = "".join(fix_html(f) for f in row.get("fixes") or [])
    title = f" {esc(row['title'])}" if row.get("title") else ""

    table = key_values(
        [
            ("Setup", esc(row.get("setup"))),
            ("Steps", listing(row.get("steps") or [], "ol")),
            ("Expected", esc(row.get("expected"))),
            ("Observed", esc(row.get("observed"))),
            ("Note", esc(row.get("note"))),
            ("Evidence", evidence_html(row.get("evidence") or [])),
        ]
    )

    return (
        f'<h3 id="{esc(row["id"])}">{esc(row["id"])}{title} {result_cell(result)}</h3>'
        f"{table}{blocked_html}{fixes}"
    )


def bug_html(bug: Json) -> str:
    return (
        f"<h3>{esc(bug['title'])}</h3>"
        + key_values(
            [
                ("Found in", esc(bug.get("found_in"))),
                ("Description", esc(bug.get("description"))),
                ("Evidence", evidence_html(bug.get("evidence") or [])),
            ]
        )
    )


def summary_section(rows: list[Json]) -> str:
    counts: dict[str, int] = {}

    for row in rows:
        result = row.get("result", "not_run")
        counts[result] = counts.get(result, 0) + 1

    totals = ", ".join(
        f"{counts[key]} {RESULTS[key].lower()}" for key in RESULTS if key in counts
    )

    body = "".join(
        "<tr>"
        f'<td><a href="#{esc(row["id"])}">{esc(row["id"])}</a></td>'
        f"<td>{esc(row.get('title'))}</td>"
        f"<td>{result_cell(row.get('result', 'not_run'))}</td>"
        f"<td>{esc(row.get('summary') or row.get('note'))}</td>"
        "</tr>"
        for row in rows
    )

    return (
        f"<h2>Summary</h2><p>{esc(totals) if totals else 'No row has run yet.'}</p>"
        '<table><tr><th>Row</th><th>Title</th><th>Result</th><th>Note</th></tr>'
        f"{body}</table>"
    )


def render(data: Json) -> tuple[str, str]:
    rows = data.get("rows") or []
    bugs = data.get("bugs") or []
    gaps = data.get("gaps") or []
    title = data.get("title") or "Validation report"

    body = [f"<h1>{esc(title)}</h1>"]

    if data.get("subtitle"):
        body.append(f'<p class="muted">{esc(data["subtitle"])}</p>')

    body.append(summary_section(rows))
    body.append(header_section(data))
    body.append(setup_section(data))

    if rows:
        body.append("<h2>Rows</h2>" + "".join(row_html(row) for row in rows))

    if bugs:
        body.append("<h2>Bugs not fixed</h2>" + "".join(bug_html(bug) for bug in bugs))

    if gaps:
        body.append("<h2>Not run and gaps</h2>" + listing(gaps))

    return title, "".join(body)


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print("usage: report.py <results.json> <out-dir>", file=sys.stderr)

        return 2

    data = json.loads(Path(argv[1]).read_text(encoding="utf-8"))
    out_dir = Path(argv[2])
    title, body = render(data)

    out_dir.mkdir(parents=True, exist_ok=True)
    page = (
        TEMPLATE.read_text(encoding="utf-8")
        .replace("{{TITLE}}", html.escape(title))
        .replace("{{BODY}}", body)
    )
    (out_dir / "index.html").write_text(page, encoding="utf-8")
    print(out_dir / "index.html")

    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
