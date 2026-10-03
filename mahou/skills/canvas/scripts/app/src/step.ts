import { Vec, type Editor, type TLShapeId, type VecLike } from 'tldraw'

const GLIDE_FRAMES = 12
const FRAME_MS = 25
const DEFAULT_PAUSE_MS = 500

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms))

// The cursor other tabs see follows this tab's pointer, which edits made through the API never move
const glideTo = async (editor: Editor, target: VecLike) => {
  const from = editor.inputs.getCurrentPagePoint().clone()

  for (let frame = 1; frame <= GLIDE_FRAMES; frame++) {
    editor.updatePointer({ point: editor.pageToScreen(Vec.Lrp(from, target, frame / GLIDE_FRAMES)), immediate: true })
    await sleep(FRAME_MS)
  }
}

// One visible step of a drawing: the cursor moves to where the change happens, the change lands, and the next step
// waits, so the user sees each one arrive instead of the whole drawing at once
export const stepOf =
  (editor: Editor) =>
  async (at: TLShapeId | VecLike | null, change: () => unknown, pause = DEFAULT_PAUSE_MS) => {
    const target = typeof at === 'string' ? editor.getShapePageBounds(at)?.center : at

    if (target != null) {
      await glideTo(editor, target)
    }

    const result = change()

    await sleep(pause)

    return result
  }
