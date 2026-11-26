import { useState } from 'react'
import { useSync } from '@tldraw/sync'
import { createShapeId, inlineBase64AssetStore, Tldraw, toRichText, type Editor } from 'tldraw'
import 'tldraw/tldraw.css'
import { ChatCursorOverlayUtil } from './ChatCursorOverlayUtil'
import { CursorChatBubble } from './CursorChatBubble'
import { cursorChatNotify } from './cursorChatNotify'
import { cursorChatShortcut } from './cursorChatShortcut'
import { drawOf } from './draw'
import { guardDeletedIds } from './guardDeletedIds'
import { MockShapeUtil } from './MockShape'
import { notesOf } from './notes'
import { schema } from './schema'
import { SendButton } from './SendButton'
import { pauses, stepOf } from './step'

const shapeUtils = [MockShapeUtil]
const overlayUtils = [ChatCursorOverlayUtil]
// The DOM cursor layer draws every collaborator's cursor and chat a second time, unwrapped, over ChatCursorOverlayUtil's
const components = { CursorChatBubble, CollaboratorCursor: null }
const SYNC_URI = `${location.origin.replace(/^http/, 'ws')}/api/sync`

const start = (editor: Editor) => {
  // Exposed so the canvas can be built and edited from scripts run against the open page
  Object.assign(window, {
    editor,
    tldraw: { createShapeId, toRichText },
    canvas: {
      notes: () => notesOf(editor),
      step: stepOf(editor),
      ...drawOf(editor),
      get pause() {
        return pauses.default
      },
      set pause(ms: number) {
        pauses.default = ms
      },
    },
  })

  guardDeletedIds(editor)
  cursorChatShortcut(editor)
  cursorChatNotify(editor)

  editor.zoomToFit({ animation: { duration: 0 } })
}

export const App = () => {
  const store = useSync({ uri: SYNC_URI, assets: inlineBase64AssetStore, schema })
  const [editor, setEditor] = useState<Editor | null>(null)

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw store={store} shapeUtils={shapeUtils} overlayUtils={overlayUtils} components={components} options={{ maxShapesPerPage: 20000 }} onMount={(mounted) => { start(mounted); setEditor(mounted) }} />
      {editor != null ? <SendButton editor={editor} /> : null}
    </div>
  )
}
