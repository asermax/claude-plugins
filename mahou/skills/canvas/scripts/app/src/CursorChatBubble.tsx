import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { track, useEditor, useTranslation } from 'tldraw'

const SHOWN_AFTER_SEND = 5000

export const CHAT_LINE_CHARS = 80

const bubbleStyle = (color: string): CSSProperties => ({
  backgroundColor: color,
  maxWidth: `${CHAT_LINE_CHARS}ch`,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
  lineHeight: '16px',
})

const textStyle: CSSProperties = { gridArea: '1 / 1', padding: '3px 6px', margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }

const usePositionBubble = (ref: RefObject<HTMLElement | null>) => {
  const editor = useEditor()

  useLayoutEffect(() => {
    const element = ref.current
    if (element == null) return

    const { x, y } = editor.inputs.getCurrentScreenPoint()
    element.style.setProperty('transform', `translate(${x}px, ${y}px)`)

    const follow = (event: PointerEvent) => {
      const { minX, minY } = editor.getViewportScreenBounds()
      ref.current?.style.setProperty('transform', `translate(${event.clientX - minX}px, ${event.clientY - minY}px)`)
    }
    const win = editor.getContainerWindow()

    win.addEventListener('pointermove', follow)
    return () => win.removeEventListener('pointermove', follow)
  }, [ref, editor])
}

const SentMessage = ({ message }: { message: string }) => {
  const editor = useEditor()
  const ref = useRef<HTMLDivElement>(null)

  usePositionBubble(ref)

  return (
    <div ref={ref} className="tl-cursor-chat" style={bubbleStyle(editor.user.getColor())}>
      {message}
    </div>
  )
}

// The textarea and a hidden copy of its text share one grid cell, so the bubble grows with the text, wraps at the
// line width and gets taller line by line
const ChatInput = () => {
  const editor = useEditor()
  const msg = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState('')
  const placeholder = msg('cursor-chat.type-to-chat')

  usePositionBubble(ref)

  // A message still shown from the previous send would otherwise be sent again when this chat closes empty
  useLayoutEffect(() => {
    editor.updateInstanceState({ chatMessage: '' })

    const frame = editor.timers.requestAnimationFrame(() => input.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [editor])

  const stopChatting = () => {
    editor.updateInstanceState({ isChatting: false })
    editor.focus()
  }

  // A native listener on the textarea, because tldraw's keydown listener on its container runs before React's and, on
  // Escape, focuses the container, which blurs the textarea and sends the message before a React handler could cancel it
  useEffect(() => {
    const element = input.current
    if (element == null) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()

        // Clearing the message in the same update as closing the chat is what keeps cursorChatNotify from sending it
        editor.updateInstanceState({ isChatting: false, chatMessage: '' })
        editor.focus()
        return
      }

      if (event.key !== 'Enter' || event.shiftKey) return

      event.preventDefault()
      event.stopPropagation()
      editor.updateInstanceState({ isChatting: false })
      editor.focus()
    }

    element.addEventListener('keydown', onKeyDown)
    return () => element.removeEventListener('keydown', onKeyDown)
  }, [editor])

  return (
    <div ref={ref} className="tl-cursor-chat" style={{ ...bubbleStyle(editor.user.getColor()), display: 'grid', padding: 0 }}>
      <style>{'.canvas-cursor-chat-input::placeholder { color: var(--tl-color-selected-contrast); opacity: 0.7; }'}</style>
      <span aria-hidden style={{ ...textStyle, visibility: 'hidden' }}>{`${value || placeholder} `}</span>
      <textarea
        ref={input}
        className="canvas-cursor-chat-input"
        rows={1}
        style={{ ...textStyle, resize: 'none', overflow: 'hidden', border: 'none', outline: 'none', background: 'transparent', color: 'inherit', font: 'inherit' }}
        value={value}
        placeholder={placeholder}
        spellCheck={false}
        onBlur={stopChatting}
        onPaste={(event) => event.stopPropagation()}
        onChange={(event) => {
          setValue(event.target.value)
          editor.updateInstanceState({ chatMessage: event.target.value })
        }}
      />
    </div>
  )
}

// Replaces tldraw's cursor chat, which cuts the message at 64 characters on one line, closes the chat after 5 seconds
// without typing and keeps it open on Enter. This one has no length limit, wraps at 80 characters, takes line breaks
// with Shift+Enter, stays open until Enter or a click elsewhere sends it or Escape cancels it, and shows the sent
// message for 5 seconds
export const CursorChatBubble = track(() => {
  const editor = useEditor()
  const { isChatting, chatMessage } = editor.getInstanceState()

  useEffect(() => {
    if (isChatting || chatMessage === '') return

    const timeout = editor.timers.setTimeout(() => editor.updateInstanceState({ chatMessage: '' }), SHOWN_AFTER_SEND)
    return () => clearTimeout(timeout)
  }, [editor, isChatting, chatMessage])

  if (isChatting) return <ChatInput />

  return chatMessage.trim() === '' ? null : <SentMessage message={chatMessage} />
})
