// A document as read from disk, before it is known to match the current format
export type RawDocument = Record<string, any>

export interface Migration {
  // The version the document has after this migration
  version: number
  description: string
  up: (document: RawDocument, warn: (message: string) => void) => RawDocument
}
