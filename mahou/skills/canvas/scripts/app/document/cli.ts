// Document commands that run without the server: node document/cli.ts <check|migrate|texts> <document>
import { copyFileSync, writeFileSync } from 'node:fs'
import { migrateDocument, outdatedReason, readDocument, readRawDocument, versionOf } from './canvasDocument.ts'
import { CURRENT_VERSION } from './migrations.ts'

const [command, path] = process.argv.slice(2)

const check = () => {
  const reason = outdatedReason(path)

  if (reason != null) {
    console.error(reason)
    process.exit(2)
  }
}

const migrate = () => {
  const document = readRawDocument(path)

  if (document == null || versionOf(document) === CURRENT_VERSION) {
    console.log(`${path} is already canvas version ${CURRENT_VERSION}`)
    return
  }

  if (versionOf(document) > CURRENT_VERSION) {
    check()
  }

  copyFileSync(path, `${path}.bak`)
  writeFileSync(path, JSON.stringify(migrateDocument(document, (message) => console.warn(`warning: ${message}`))))

  console.log(`${path}: canvas version ${versionOf(document)} → ${CURRENT_VERSION}, the original is ${path}.bak`)
}

const textOf = (node: Record<string, any> | undefined): string =>
  node == null ? '' : (node.text ?? '') + (node.content ?? []).map(textOf).join(' ')

const texts = () => {
  const document = readDocument(path)

  document?.room.documents
    .map(({ state }) => state as Record<string, any>)
    .filter((record) => record.typeName === 'shape' && record.props.richText != null)
    .forEach((record) => {
      const value = textOf(record.props.richText).replace(/\s+/g, ' ').trim()

      if (value !== '') {
        console.log(`${record.id.slice(6)} (${record.type}) | ${value}`)
      }
    })
}

const COMMANDS: Record<string, () => void> = { check, migrate, texts }

if (path == null || COMMANDS[command] == null) {
  console.error('usage: node document/cli.ts <check|migrate|texts> <document>')
  process.exit(1)
}

COMMANDS[command]()
