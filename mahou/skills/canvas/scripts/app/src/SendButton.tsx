import { useEffect, useState } from 'react'
import { FONT_SANS, INK } from './kit/theme'
import { VoiceButton } from './VoiceButton'

const notify = () => void fetch('/api/notify', { method: 'POST' })

// The document is saved on every edit, so the click only tells Claude that a batch of edits is ready
export const SendButton = () => {
  const [sent, setSent] = useState(false)

  const send = () => {
    notify()
    setSent(true)
    setTimeout(() => setSent(false), 1200)
  }

  // Ctrl+. (Cmd+. on a Mac) sends without leaving the keyboard, also while a sticky note is being edited
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '.' || !(event.ctrlKey || event.metaKey)) return

      event.preventDefault()
      event.stopPropagation()
      send()
    }

    window.addEventListener('keydown', onKeyDown, { capture: true })

    return () => window.removeEventListener('keydown', onKeyDown, { capture: true })
  }, [])

  return (
    <div style={{ pointerEvents: 'all', margin: 8, display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT_SANS }}>
      <span style={{ fontSize: 12, color: '#666', maxWidth: 260, textAlign: 'right' }}>Put a sticky note on what to change, or draw an arrow from it, then send (Ctrl+.). Hold the mic (Ctrl+,) to talk.</span>
      <VoiceButton />
      <button onClick={send} style={{ padding: '6px 12px', borderRadius: 8, border: `2px solid ${INK}`, background: sent ? '#d3f9d8' : '#fff3bf', fontFamily: FONT_SANS, cursor: 'pointer' }}>
        {sent ? 'Sent' : 'Send to Claude'}
      </button>
    </div>
  )
}
