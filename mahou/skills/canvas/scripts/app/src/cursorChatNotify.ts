import type { Editor } from 'tldraw'
import { labelShapes } from './shapeLabels'

// A cursor chat message reaches the agent once, when the chat closes, instead of on every keystroke. CursorChatBubble
// keeps the message in the record when the chat closes, so the text is read from the record after the change
export const cursorChatNotify = (editor: Editor) => {
  editor.sideEffects.registerAfterChangeHandler('instance', (previous, next) => {
    if (!previous.isChatting || next.isChatting) return

    const message = next.chatMessage.trim()
    if (message === '') return

    const point = editor.inputs.currentPagePoint
    const under = editor.getShapesAtPoint(point, { hitInside: true })

    void fetch('/api/notify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat: message, at: labelShapes(editor, under), point: { x: Math.round(point.x), y: Math.round(point.y) } }),
    })
  })
}
