import { useEffect } from 'react'
import { INK, MUTED } from '@canvas/kit/theme'

interface Props {
  display: string
  body: string
  note: string
}

const loadFonts = (display: string, body: string) => {
  const href = `https://fonts.googleapis.com/css2?family=${display.replace(/ /g, '+')}:wght@400;700&family=${body.replace(/ /g, '+')}:wght@400;700&display=swap`

  if (document.querySelector(`link[href="${href}"]`) == null) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }
}

export const FontPair = ({ display, body, note }: Props) => {
  useEffect(() => loadFonts(display, body))

  return (
    <div style={{ position: 'absolute', inset: 0, color: INK, padding: 12 }}>
      <div style={{ fontFamily: `'${display}', sans-serif`, fontSize: 36, fontWeight: 700, lineHeight: 1.15 }}>Aa</div>
      <div style={{ fontFamily: `'${body}', sans-serif`, fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
        A line of body copy that has to stay readable at small sizes, long enough to wrap once.
      </div>
      <div style={{ fontSize: 10, color: MUTED, marginTop: 8, fontFamily: 'var(--tl-font-mono), ui-monospace, monospace' }}>{display} + {body} · {note}</div>
    </div>
  )
}

export const mockup = {
  width: 300,
  defaults: { display: '', body: '', note: '' },
  render: ({ display, body, note }: Props) => <FontPair display={display} body={body} note={note} />,
}
