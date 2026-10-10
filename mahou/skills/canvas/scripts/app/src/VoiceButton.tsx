import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { useEditor, type Editor } from 'tldraw'
import { FONT_SANS, INK } from './kit/theme'

interface RecognitionResult {
  isFinal: boolean
  0: { transcript: string }
}

interface RecognitionEvent {
  resultIndex: number
  results: ArrayLike<RecognitionResult>
}

interface Recognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: RecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error: string }) => void) | null
  start: () => void
  stop: () => void
}

type RecognitionConstructor = new () => Recognition

const RecognitionClass = ((window as unknown as Record<string, unknown>).SpeechRecognition ?? (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as RecognitionConstructor | undefined

const LANG = new URLSearchParams(location.search).get('lang') ?? navigator.language

const SNIPPET = 60

// Claude reads the selection to know which shapes "this" or "here" points at, so each shape carries its id and a short label
const selectionOf = (editor: Editor) =>
  editor.getSelectedShapes().map((shape) => {
    const text = editor.getShapeUtil(shape).getText(shape)?.replace(/\s+/g, ' ').trim() ?? ''
    const kind = shape.type === 'mock' ? `mock ${(shape.props as { kind: string }).kind}` : shape.type

    return { id: shape.id, kind, text: text.length > SNIPPET ? `${text.slice(0, SNIPPET)}…` : text }
  })

const send = (message: string, selected: ReturnType<typeof selectionOf>) =>
  void fetch('/api/notify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message, selected }) })

type Status = 'idle' | 'listening' | 'sent' | 'error'

// Hold the button, or Ctrl+, (Cmd+, on a Mac), to talk; releasing it sends what was said to Claude
export const VoiceButton = () => {
  const editor = useEditor()
  const [status, setStatus] = useState<Status>('idle')
  const [heard, setHeard] = useState('')
  const recognition = useRef<Recognition | null>(null)

  const start = () => {
    if (RecognitionClass == null || recognition.current != null) return

    const current = new RecognitionClass()
    const finals: string[] = []
    let interim = ''

    current.lang = LANG
    current.continuous = true
    current.interimResults = true

    current.onresult = (event) => {
      interim = ''

      for (let index = event.resultIndex; index < event.results.length; index++) {
        const result = event.results[index]

        if (result.isFinal) {
          finals.push(result[0].transcript.trim())
        } else {
          interim += result[0].transcript
        }
      }

      setHeard([...finals, interim.trim()].filter(Boolean).join(' '))
    }

    // Results can still arrive after stop(), so the message is sent once recognition has ended
    current.onend = () => {
      recognition.current = null
      const message = [...finals, interim.trim()].filter(Boolean).join(' ')

      if (message === '') {
        setStatus('idle')
        setHeard('')
        return
      }

      send(message, selectionOf(editor))
      setStatus('sent')
      setTimeout(() => {
        setStatus('idle')
        setHeard('')
      }, 1500)
    }

    current.onerror = ({ error }) => {
      if (error === 'no-speech' || error === 'aborted') return

      setStatus('error')
      setHeard(`Speech recognition failed: ${error}`)
    }

    recognition.current = current
    setHeard('')
    setStatus('listening')
    current.start()
  }

  const stop = () => recognition.current?.stop()

  useEffect(() => {
    const isCombo = (event: KeyboardEvent) => event.key === ',' && (event.ctrlKey || event.metaKey)

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isCombo(event)) return

      event.preventDefault()
      event.stopPropagation()

      if (!event.repeat) {
        start()
      }
    }

    // Letting go of either key ends the recording
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key !== ',' && event.key !== 'Control' && event.key !== 'Meta') return

      stop()
    }

    window.addEventListener('keydown', onKeyDown, { capture: true })
    window.addEventListener('keyup', onKeyUp, { capture: true })
    window.addEventListener('blur', stop)

    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true })
      window.removeEventListener('keyup', onKeyUp, { capture: true })
      window.removeEventListener('blur', stop)
    }
  }, [])

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    start()
  }

  if (RecognitionClass == null) {
    return <span style={{ fontSize: 12, color: '#666' }}>Voice needs Chrome or Edge</span>
  }

  const background = status === 'listening' ? '#ffc9c9' : status === 'sent' ? '#d3f9d8' : '#fff'

  return (
    <div style={{ position: 'relative' }}>
      <button
        title="Hold to talk to Claude (Ctrl+,)"
        onPointerDown={onPointerDown}
        onPointerUp={stop}
        onPointerCancel={stop}
        style={{ width: 36, height: 34, borderRadius: 8, border: `2px solid ${INK}`, background, fontFamily: FONT_SANS, fontSize: 16, cursor: 'pointer', touchAction: 'none' }}
      >
        {status === 'sent' ? '✓' : '🎤'}
      </button>
      {heard === '' ? null : (
        <div style={{ position: 'absolute', right: 0, top: 42, width: 320, padding: '6px 10px', borderRadius: 8, border: `1.5px solid ${INK}`, background: '#fff', fontFamily: FONT_SANS, fontSize: 12, color: status === 'error' ? '#c92a2a' : INK }}>
          {heard}
        </div>
      )}
    </div>
  )
}
