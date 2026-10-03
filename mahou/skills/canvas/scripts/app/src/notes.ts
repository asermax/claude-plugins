import type { Editor, TLShape } from 'tldraw'

const describe = (editor: Editor, shape: TLShape) => ({
  id: shape.id,
  type: shape.type,
  kind: shape.type === 'mock' ? shape.props.kind : undefined,
  text: editor.getShapeUtil(shape).getText(shape),
})

const arrowIdsOf = (editor: Editor, note: TLShape) => editor.getBindingsToShape(note, 'arrow').map((binding) => binding.fromId)

// The shapes joined to the note by an arrow, in either direction
const arrowTargetsOf = (editor: Editor, note: TLShape) =>
  arrowIdsOf(editor, note)
    .flatMap((arrowId) => editor.getBindingsFromShape(arrowId, 'arrow'))
    .filter((binding) => binding.toId !== note.id)
    .map((binding) => editor.getShape(binding.toId))
    .filter((shape) => shape != null)

// The shapes the note sits on, smallest first, since a note on a button inside a screen means the button
const coveredShapesOf = (editor: Editor, note: TLShape) => {
  const noteBounds = editor.getShapePageBounds(note)

  if (noteBounds == null) {
    return []
  }

  return editor
    .getCurrentPageShapes()
    .filter((shape) => shape.type !== 'note' && shape.type !== 'arrow' && editor.getShapePageBounds(shape)?.collides(noteBounds))
    .sort((a, b) => editor.getShapePageBounds(a)!.area - editor.getShapePageBounds(b)!.area)
}

// The user's sticky notes, each with the shapes it is about: those an arrow joins it to, else those it sits on
export const notesOf = (editor: Editor) =>
  editor
    .getCurrentPageShapes()
    .filter((shape) => shape.type === 'note')
    .map((note) => {
      const arrowTargets = arrowTargetsOf(editor, note)

      return {
        id: note.id,
        text: editor.getShapeUtil(note).getText(note),
        targets: (arrowTargets.length > 0 ? arrowTargets : coveredShapesOf(editor, note)).map((shape) => describe(editor, shape)),
        // Deleted along with a handled note, since they would stay on the canvas pointing at nothing
        arrows: arrowIdsOf(editor, note),
      }
    })
