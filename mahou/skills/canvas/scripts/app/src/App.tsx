import { useSync } from '@tldraw/sync'
import { createShapeId, inlineBase64AssetStore, Tldraw, toRichText, type Editor } from 'tldraw'
import 'tldraw/tldraw.css'
import { guardDeletedIds } from './guardDeletedIds'
import { MockShapeUtil } from './MockShape'
import { notesOf } from './notes'
import { schema } from './schema'
import { SendButton } from './SendButton'
import { stepOf } from './step'

const shapeUtils = [MockShapeUtil]
const components = { SharePanel: SendButton }
const SYNC_URI = `${location.origin.replace(/^http/, 'ws')}/api/sync`

const start = (editor: Editor) => {
  // Exposed so the canvas can be built and edited from scripts run against the open page
  Object.assign(window, { editor, tldraw: { createShapeId, toRichText }, canvas: { notes: () => notesOf(editor), step: stepOf(editor) } })

  guardDeletedIds(editor)

  editor.zoomToFit({ animation: { duration: 0 } })
}

export const App = () => {
  const store = useSync({ uri: SYNC_URI, assets: inlineBase64AssetStore, schema })

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw store={store} shapeUtils={shapeUtils} components={components} onMount={start} />
    </div>
  )
}
