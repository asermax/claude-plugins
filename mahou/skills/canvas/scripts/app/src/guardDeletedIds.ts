import type { Editor, TLShapeId } from 'tldraw'

// Sync sends a shape deleted and recreated under its id as an update to the old record, so a shape of another type
// under that id reaches every other tab with the old shape's props merged in, and fails validation there
export const guardDeletedIds = (editor: Editor) => {
  const deletedTypes = new Map<TLShapeId, string>()

  editor.sideEffects.registerAfterDeleteHandler('shape', (shape) => {
    deletedTypes.set(shape.id, shape.type)
  })

  editor.sideEffects.registerBeforeCreateHandler('shape', (shape) => {
    const deletedType = deletedTypes.get(shape.id)

    if (deletedType != null && deletedType !== shape.type) {
      throw new Error(`${shape.id} belonged to a deleted ${deletedType}; create the ${shape.type} under a new id`)
    }

    return shape
  })
}
