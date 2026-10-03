import { FONT_SANS, INK } from './kit/theme'

// The document is saved on every edit, so the click only tells Claude that a batch of edits is ready
export const SendButton = () => (
  <div style={{ pointerEvents: 'all', margin: 8, display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT_SANS }}>
    <span style={{ fontSize: 12, color: '#666', maxWidth: 260, textAlign: 'right' }}>Put a sticky note on what to change, or draw an arrow from it, then send.</span>
    <button onClick={() => void fetch('/api/notify', { method: 'POST' })} style={{ padding: '6px 12px', borderRadius: 8, border: `2px solid ${INK}`, background: '#fff3bf', fontFamily: FONT_SANS, cursor: 'pointer' }}>
      Send to Claude
    </button>
  </div>
)
