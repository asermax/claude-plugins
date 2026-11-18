#!/usr/bin/env node
// Prints the markdown of a test-design record from the classificationTree specs
// that the canvas is drawn from, so the record and the drawing cannot drift.
//
// Usage: record.mjs <specs.js> [<branch>...] [--title <text>] [--root <text>]
//
// <specs.js> is the file the canvas loads into the tab. It assigns one object to
// a property of `window`, or sets `module.exports`, with the branch name as key and
// the classificationTree spec as value. With no branch names, every branch prints
// in file order. --title adds a `# <title>` heading; --root adds the tree block
// with that text as its first line.

import fs from 'node:fs'
import vm from 'node:vm'

const parseArgs = (argv) => {
  const positional = []
  const options = {}

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--title' || argv[i] === '--root') {
      options[argv[i].slice(2)] = argv[++i]
    } else {
      positional.push(argv[i])
    }
  }

  return { file: positional[0], branches: positional.slice(1), options }
}

const isSpec = (value) => value != null && typeof value === 'object' && Array.isArray(value.classifications)

const loadSpecs = (file) => {
  const sandbox = { window: {}, module: { exports: {} } }

  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file })

  const candidates = [sandbox.module.exports, ...Object.values(sandbox.window)]
  const found = candidates.find((candidate) => candidate != null && Object.values(candidate).some(isSpec))

  if (found == null) {
    throw new Error(`${file} assigns no object of branch specs to window or module.exports`)
  }

  return Object.fromEntries(Object.entries(found).filter(([, value]) => isSpec(value)))
}

const splitLabel = (label) => {
  const match = label.match(/^(.*) · ([^·]+)$/)

  return match == null ? { title: label, status: null } : { title: match[1], status: match[2] }
}

const asList = (value) => (value == null ? [] : Array.isArray(value) ? value : [value])

const cell = (value) => String(value ?? '·').replaceAll('|', '\\|').replaceAll('\n', '<br>')

const treeBlock = (root, specs) => {
  const lines = [root]

  specs.forEach((spec, index) => {
    const last = index === specs.length - 1
    const { title, status } = splitLabel(spec.label)

    lines.push(`${last ? '└─' : '├─'} ${title}${status == null ? '' : `   ${status}`}`)

    for (const classification of spec.classifications) {
      const partitions = classification.partitions.map(([, label]) => label).join(' | ')

      lines.push(`${last ? '   ' : '│  '}   ${classification.name}: ${partitions}`)
    }
  })

  return `\`\`\`\n${lines.join('\n')}\n\`\`\`\n`
}

const branchSection = (spec) => {
  const { title, status } = splitLabel(spec.label)
  const columns = spec.classifications.map((classification) => classification.name)
  const [rootTitle, ...rootRest] = spec.root.split('\n')
  const root = [rootTitle, ...rootRest].join('\n\n')

  let out = `\n## ${title}${status == null ? '' : ` · ${status}`}\n\n${root}\n\n`

  out += `| ★ | Row | What the test does | ${columns.map(cell).join(' | ')} | Expected | Kind | Setup |\n`
  out += `|${'---|'.repeat(columns.length + 6)}\n`

  for (const row of spec.rows) {
    const picks = row.picks.map((key, index) => {
      const partition = spec.classifications[index].partitions.find(([partitionKey]) => partitionKey === key)

      return cell(partition?.[1] ?? null)
    })

    out += `| ${row.isNew ? '★' : ''} | ${row.id} | ${cell(row.summary)} | ${picks.join(' | ')} | ${cell(row.expected)} | ${cell(row.kind)} | ${cell(row.setup)} |\n`
  }

  for (const dropped of asList(spec.dropped)) {
    out += `\nDropped: ${dropped}\n`
  }

  for (const deleted of asList(spec.deleted)) {
    out += `\nDeleted: ${deleted}\n`
  }

  if (spec.note != null) {
    out += `\n${spec.note}\n`
  }

  return out
}

const { file, branches, options } = parseArgs(process.argv.slice(2))

if (file == null) {
  console.error('usage: record.mjs <specs.js> [<branch>...] [--title <text>] [--root <text>]')
  process.exit(2)
}

const all = loadSpecs(file)
const names = branches.length > 0 ? branches : Object.keys(all)
const missing = names.filter((name) => all[name] == null)

if (missing.length > 0) {
  console.error(`unknown branch: ${missing.join(', ')}. Known: ${Object.keys(all).join(', ')}`)
  process.exit(1)
}

const specs = names.map((name) => all[name])
let output = ''

if (options.title != null) {
  output += `# ${options.title}\n\n`
}

if (options.root != null) {
  output += treeBlock(options.root, specs)
}

output += specs.map(branchSection).join('')

process.stdout.write(output)
