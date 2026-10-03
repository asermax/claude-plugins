import type { Migration } from '../migration.ts'

// Version 1 is the editor's getSnapshot(), saved whole by the tab; version 2 is the sync server's room snapshot
export const roomSnapshot: Migration = {
  version: 2,
  description: 'store the document as the sync room snapshot',
  up: ({ document }) => ({
    room: {
      clock: 0,
      documentClock: 0,
      tombstoneHistoryStartsAtClock: 0,
      schema: document.schema,
      documents: Object.values(document.store).map((state) => ({ state, lastChangedClock: 0 })),
    },
  }),
}
