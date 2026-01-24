#!/usr/bin/env python3
"""
Display markdown content in a browser using marked.js via CDN.

Usage:
    python display.py <file.md>
    python display.py --content "# Title\\n\\nContent"
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path


def get_script_dir() -> Path:
    """Get the directory where this script is located."""
    return Path(__file__).parent


def read_template() -> str:
    """Read the HTML template file."""
    template_path = get_script_dir() / "template.html"

    if not template_path.exists():
        print(f"Error: Template file not found at {template_path}", file=sys.stderr)
        sys.exit(1)

    return template_path.read_text(encoding="utf-8")


def read_markdown_file(file_path: str) -> str:
    """Read markdown content from a file."""
    path = Path(file_path)

    if not path.exists():
        print(f"Error: File not found: {file_path}", file=sys.stderr)
        sys.exit(1)

    return path.read_text(encoding="utf-8")


def escape_for_js(markdown: str) -> str:
    """Escape markdown content for safe embedding in JavaScript."""
    # First, escape backslashes
    escaped = markdown.replace("\\", "\\\\")

    # Then escape newlines for JavaScript strings
    escaped = escaped.replace("\n", "\\n")

    # Escape quotes
    escaped = escaped.replace('"', '\\"')

    # Return as a JSON string for even safer escaping
    return json.dumps(markdown, ensure_ascii=False)


def generate_html(markdown: str) -> str:
    """Generate HTML from markdown content using the template."""
    template = read_template()
    escaped_markdown = escape_for_js(markdown)
    return template.replace("{{MARKDOWN_CONTENT}}", escaped_markdown)


def open_in_browser(html_path: Path) -> None:
    """Open HTML file in the default browser using xdg-open."""
    try:
        subprocess.run(["xdg-open", str(html_path)], check=True)
    except FileNotFoundError:
        print("Error: xdg-open not found. Please install it to open files in browser.", file=sys.stderr)
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        print(f"Error: Failed to open browser: {e}", file=sys.stderr)
        sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Display markdown content in a browser",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s README.md
  %(prog)s --content "# Title\\n\\nContent"
        """
    )

    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("file", nargs="?", help="Path to markdown file")
    group.add_argument("--content", "-c", help="Raw markdown content")

    args = parser.parse_args()

    # Get markdown content
    if args.file:
        markdown = read_markdown_file(args.file)
        source_desc = f"file: {args.file}"
    else:
        markdown = args.content
        source_desc = "inline content"

    # Generate HTML
    html = generate_html(markdown)

    # Write to temp file
    with tempfile.NamedTemporaryFile(
        mode="w",
        suffix=".html",
        prefix="markdown-preview-",
        encoding="utf-8",
        delete=False,
    ) as f:
        f.write(html)
        temp_path = Path(f.name)

    # Open in browser
    print(f"Opening {source_desc} in browser...")
    print(f"Temp file: {temp_path}")
    open_in_browser(temp_path)


if __name__ == "__main__":
    main()
