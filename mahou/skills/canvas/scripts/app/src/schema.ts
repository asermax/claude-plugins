import { createTLSchema, defaultShapeSchemas } from '@tldraw/tlschema'
import { T } from '@tldraw/validate'

export const MOCK_TYPE = 'mock' as const

// Each kind reads its own props, so the shape only checks that they are JSON
export const mockShapeProps = {
  w: T.number,
  h: T.number,
  kind: T.string,
  data: T.jsonValue,
}

// Shared by the editor and the sync server, which both validate every record against it
export const schema = createTLSchema({
  shapes: { ...defaultShapeSchemas, [MOCK_TYPE]: { props: mockShapeProps } },
})
