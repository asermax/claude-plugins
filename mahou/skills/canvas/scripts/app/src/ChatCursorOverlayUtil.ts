import { CollaboratorCursorOverlayUtil, type TLCollaboratorCursorOverlay } from 'tldraw'
import { CHAT_LINE_CHARS } from './CursorChatBubble'

const CURSOR_PATHS = {
  shadowHead: 'M 1 13.4219 V -2.593 L 12.591 9.026 H 5.81 L 5.399 9.15 Z',
  shadowTail: 'M 10.0595 13.9498 L 6.3715 15.4978 L 2.4965 6.2803 L 6.1845 4.7323 Z',
  whiteHead: 'M 0 12.4219 V -3.593 L 11.591 8.026 H 4.81 L 4.399 8.15 Z',
  whiteTail: 'M 9.0595 12.9498 L 5.3715 14.4978 L 1.4965 5.2803 L 5.1845 3.7323 Z',
  fillHead: 'M 1 -1.186 V 10.002 L 3.969 7.136 L 4.397 6.997 H 9.165 Z',
  fillTail: 'M 7.751 12.4155 L 5.907 13.1895 L 2.807 5.8155 L 4.648 5.0405 Z',
}

const LABEL_X = 13
const LABEL_Y = 16
const PADDING_X = 6
const PADDING_Y = 3
const LINE_HEIGHT = 16

let paths: Record<keyof typeof CURSOR_PATHS, Path2D> | null = null

const cursorPaths = () => {
  paths ??= Object.fromEntries(Object.entries(CURSOR_PATHS).map(([name, path]) => [name, new Path2D(path)])) as Record<keyof typeof CURSOR_PATHS, Path2D>

  return paths
}

const splitWord = (ctx: CanvasRenderingContext2D, word: string, maxWidth: number) => {
  const pieces: string[] = []
  let piece = ''

  for (const char of word) {
    if (piece !== '' && ctx.measureText(piece + char).width > maxWidth) {
      pieces.push(piece)
      piece = ''
    }

    piece += char
  }

  return [...pieces, piece]
}

const wrapParagraph = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const lines: string[] = []
  let line = ''

  for (const word of text.split(/[^\S\n]+/).flatMap((word) => splitWord(ctx, word, maxWidth))) {
    const candidate = line === '' ? word : `${line} ${word}`

    if (line !== '' && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }

  return [...lines, line]
}

const wrapLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => text.split('\n').flatMap((paragraph) => wrapParagraph(ctx, paragraph, maxWidth))

const fontFamilyOf = (container: HTMLElement, win: Window) => {
  const family = win.getComputedStyle(container).getPropertyValue('--tl-font-sans').trim()

  return family !== '' && !family.includes('var(') ? family : "'tldraw_sans', sans-serif"
}

// tldraw draws another tab's chat message as one 200px line cut with an ellipsis. This draws the whole message, wrapped
// at the width of 80 characters and at its line breaks, like the chat bubble in the tab that sends it
export class ChatCursorOverlayUtil extends CollaboratorCursorOverlayUtil {
  override render(ctx: CanvasRenderingContext2D, overlays: TLCollaboratorCursorOverlay[]) {
    const zoom = this.editor.getZoomLevel()
    const viewport = this.editor.getViewportPageBounds()
    const { fontSize } = this.options
    const font = `${fontSize}px ${fontFamilyOf(this.editor.getContainer(), this.editor.getContainerWindow())}`

    for (const { props } of overlays) {
      const { x, y, color, name, chatMessage } = props

      if (x < viewport.minX - 12 / zoom || y < viewport.minY - 16 / zoom || x > viewport.maxX - 12 / zoom || y > viewport.maxY - 16 / zoom) continue

      ctx.save()
      ctx.translate(x, y)
      ctx.scale(1 / zoom, 1 / zoom)

      const { shadowHead, shadowTail, whiteHead, whiteTail, fillHead, fillTail } = cursorPaths()

      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.fill(shadowHead)
      ctx.fill(shadowTail)
      ctx.fillStyle = '#ffffff'
      ctx.fill(whiteHead)
      ctx.fill(whiteTail)
      ctx.fillStyle = color
      ctx.fill(fillHead)
      ctx.fill(fillTail)

      ctx.font = font
      ctx.textBaseline = 'top'

      if (chatMessage !== '') {
        if (name != null) {
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 3
          ctx.lineJoin = 'round'
          ctx.strokeText(name, LABEL_X, -2)
          ctx.fillStyle = color
          ctx.fillText(name, LABEL_X, -2)
        }

        const lines = wrapLines(ctx, chatMessage, ctx.measureText('0').width * CHAT_LINE_CHARS)
        const width = Math.max(...lines.map((line) => ctx.measureText(line).width))

        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(LABEL_X, LABEL_Y, width + PADDING_X * 2, lines.length * LINE_HEIGHT + PADDING_Y * 2, 4)
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        lines.forEach((line, index) => ctx.fillText(line, LABEL_X + PADDING_X, LABEL_Y + PADDING_Y + (LINE_HEIGHT - fontSize) / 2 + index * LINE_HEIGHT))
      } else if (name != null) {
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(LABEL_X, LABEL_Y, ctx.measureText(name).width + PADDING_X * 2, fontSize + PADDING_Y * 2, 4)
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.fillText(name, LABEL_X + PADDING_X, LABEL_Y + PADDING_Y)
      }

      ctx.restore()
    }
  }
}
