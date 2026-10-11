#!/usr/bin/env bash
# Validates mermaid diagram syntax with mermaid-ast, which runs mermaid's own grammars.
# Usage: echo "flowchart TD; A-->B" | bash validate-mermaid.sh
#
# Accepts raw mermaid content from stdin (without ```mermaid fences). A leading
# frontmatter block (--- yaml ---) is allowed and stripped before parsing.
# Outputs JSON with validation results.
# Exit code: 0 = valid, 1 = invalid, 2 = setup error

set -euo pipefail

CACHE_DIR="${MERMAID_VALIDATION_CACHE:-${HOME}/.cache/claude-plugins/mermaid-ast}"

if [ ! -d "$CACHE_DIR/node_modules/mermaid-ast" ]; then
  echo "Installing mermaid-ast (one-time setup)..." >&2
  mkdir -p "$CACHE_DIR"
  [ -f "$CACHE_DIR/package.json" ] || echo '{"name":"mermaid-validation-cache","private":true}' > "$CACHE_DIR/package.json"

  if ! npm install --prefix "$CACHE_DIR" mermaid-ast --silent 2>/dev/null; then
    echo '{"error": "Failed to install mermaid-ast. Ensure npm and node are available."}' >&2
    exit 2
  fi
fi

node --input-type=module -e "
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

// mermaid-ast is ESM-only with an exports map, so resolve its entry from package.json.
const pkgDir = process.argv[1] + '/node_modules/mermaid-ast/'
const exportsRoot = JSON.parse(readFileSync(pkgDir + 'package.json', 'utf8')).exports['.']
const entry = typeof exportsRoot === 'string' ? exportsRoot : (exportsRoot.import ?? exportsRoot.default)
const { parseAsync, detectDiagramType } = await import(pathToFileURL(pkgDir + entry))

let data = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk) => { data += chunk })
process.stdin.on('end', async () => {
  const body = data.replace(/^\s*---\n[\s\S]*?\n---\n/, '').trim()

  if (!body) {
    console.log(JSON.stringify({ isValid: false, errors: [{ message: 'Empty input' }] }))
    process.exit(1)
  }

  const diagramType = detectDiagramType(body)

  try {
    await parseAsync(body)
    console.log(JSON.stringify({ isValid: true, diagramType, errors: [] }, null, 2))
    process.exit(0)
  } catch (error) {
    const message = String(error?.message ?? error).split('\n').filter(Boolean).join(' ')
    const line = error?.hash?.loc?.first_line ?? error?.hash?.line ?? (message.match(/line (\d+)/)?.[1] && Number(message.match(/line (\d+)/)[1]))
    console.log(JSON.stringify({ isValid: false, diagramType, errors: [{ ...(line != null && { line }), message }] }, null, 2))
    process.exit(1)
  }
})
" "$CACHE_DIR"
