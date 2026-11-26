import type { Editor, TLShape } from 'tldraw'

const SNIPPET = 60

export type ShapeLabel = { id: string; kind: string; text: string }

// The agent reads these labels to know which shapes "this" or "here" points at, so each shape carries its id and a short text
export const labelShapes = (editor: Editor, shapes: TLShape[]): ShapeLabel[] =>
  shapes.map((shape) => {
    const text = editor.getShapeUtil(shape).getText(shape)?.replace(/\s+/g, ' ').trim() ?? ''
    const kind = shape.type === 'mock' ? `mock ${(shape.props as { kind: string }).kind}` : shape.type

    return { id: shape.id, kind, text: text.length > SNIPPET ? `${text.slice(0, SNIPPET)}…` : text }
  })
