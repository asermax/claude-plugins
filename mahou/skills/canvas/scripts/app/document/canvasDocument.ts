import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import type { RoomSnapshot } from '@tldraw/sync-core'
import type { RawDocument } from './migration.ts'
import { CURRENT_VERSION, MIGRATIONS } from './migrations.ts'

export interface CanvasDocument {
  canvasVersion: number
  room: RoomSnapshot
}

export const versionOf = (document: RawDocument) => (typeof document.canvasVersion === 'number' ? document.canvasVersion : 1)

export const readRawDocument = (path: string): RawDocument | null => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null)

// Null when the document is current or missing, which the server creates on the first edit
export const outdatedReason = (path: string) => {
  const document = readRawDocument(path)

  if (document == null) {
    return null
  }

  const version = versionOf(document)

  if (version < CURRENT_VERSION) {
    return `${path} is canvas version ${version} and the app reads version ${CURRENT_VERSION}; run "canvas.sh migrate ${path}" before opening it`
  }

  if (version > CURRENT_VERSION) {
    return `${path} is canvas version ${version}, newer than the app's version ${CURRENT_VERSION}; update the plugin`
  }

  return null
}

export const readDocument = (path: string): CanvasDocument | null => {
  const reason = outdatedReason(path)

  if (reason != null) {
    throw new Error(reason)
  }

  return readRawDocument(path) as CanvasDocument | null
}

export const writeDocument = (path: string, room: RoomSnapshot) => {
  const document: CanvasDocument = { canvasVersion: CURRENT_VERSION, room }

  writeFileSync(path, JSON.stringify(document))
}

export const migrateDocument = (document: RawDocument, warn: (message: string) => void) =>
  MIGRATIONS.filter((migration) => migration.version > versionOf(document)).reduce(
    (migrated, migration) => ({ ...migration.up(migrated, warn), canvasVersion: migration.version }),
    document,
  )
