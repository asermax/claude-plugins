import type { Migration } from './migration.ts'
import { roomSnapshot } from './migrations/002-room-snapshot.ts'
import { mockData } from './migrations/003-mock-data.ts'

// In version order. A new format adds a migration at the end; documents without a version are version 1
export const MIGRATIONS: Migration[] = [roomSnapshot, mockData]

export const CURRENT_VERSION = MIGRATIONS.at(-1)?.version ?? 1
