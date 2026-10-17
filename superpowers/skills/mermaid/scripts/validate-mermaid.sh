#!/usr/bin/env bash
# Validates a mermaid diagram with pele (https://pele.run), the renderer every diagram is drawn with,
# and optionally rasterizes pele's SVG to a PNG so the drawing can be looked at.
# Usage: bash validate-mermaid.sh [output.png] < diagram.mmd
#
# Accepts raw mermaid content from stdin (without ```mermaid fences). Frontmatter and
# %%{init}%% directives are handled by pele itself.
# Outputs JSON with validation results.
# Exit code: 0 = valid, 1 = invalid, 2 = setup error

set -euo pipefail

CACHE_DIR="${MERMAID_VALIDATION_CACHE:-${HOME}/.cache/claude-plugins/pele}"

if [ ! -d "$CACHE_DIR/node_modules/pele" ] || [ ! -d "$CACHE_DIR/node_modules/@resvg/resvg-js" ]; then
  echo "Installing pele and resvg (one-time setup)..." >&2
  mkdir -p "$CACHE_DIR"
  [ -f "$CACHE_DIR/package.json" ] || echo '{"name":"pele-validation-cache","private":true,"type":"module"}' > "$CACHE_DIR/package.json"

  if ! npm install --prefix "$CACHE_DIR" pele @resvg/resvg-js --silent 2>/dev/null; then
    echo '{"error": "Failed to install pele. Ensure npm and node are available."}' >&2
    exit 2
  fi
fi

OUTPUT="${1:+$(realpath -m "$1")}"

# node resolves bare imports from the working directory's node_modules
cd "$CACHE_DIR"

node --input-type=module -e "
import { writeFileSync } from 'node:fs'
import { render, detectType } from 'pele'
import { Resvg } from '@resvg/resvg-js'

const output = process.argv[1]

// resvg does not evaluate CSS custom properties, so every var() is replaced by the default
// value pele declares for it on the root element before rasterizing.
const resolveVariables = (svg) => {
  const values = {}

  for (const [, name, value] of svg.matchAll(/(--_[a-z]+):var\(--pele-[a-z-]+,([^)]+)\)/g)) {
    values[name] = value
  }

  return svg
    .replace(/var\((--_[a-z]+)\)/g, (match, name) => values[name] ?? match)
    .replace(/var\(--pele-[a-z-]+,([^)]+)\)/g, '\$1')
}

let data = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk) => { data += chunk })
process.stdin.on('end', () => {
  const body = data.trim()

  if (!body) {
    console.log(JSON.stringify({ isValid: false, errors: [{ message: 'Empty input' }] }))
    process.exit(1)
  }

  const diagramType = detectType(body)

  try {
    const { svg, width, height } = render(body, { responsive: false })

    if (output) {
      const png = new Resvg(resolveVariables(svg), {
        background: '#ffffff',
        fitTo: { mode: 'zoom', value: 2 },
        font: { loadSystemFonts: true, defaultFontFamily: 'sans-serif' },
      }).render().asPng()
      writeFileSync(output, png)
    }

    console.log(JSON.stringify({ isValid: true, diagramType, width, height, ...(output && { png: output }), errors: [] }, null, 2))
    process.exit(0)
  } catch (error) {
    if (error?.name !== 'PeleError') {
      throw error
    }

    const { code, line, column } = error
    const message = String(error.message).split('\n').filter(Boolean).join(' ')
    console.log(JSON.stringify({ isValid: false, diagramType, errors: [{ code, ...(line > 0 && { line, column }), message }] }, null, 2))
    process.exit(1)
  }
})
" "$OUTPUT"
