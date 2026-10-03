import type { ReactNode } from 'react'
import { HAND, INK, LINE, MUTED, PAPER, sketchBorder } from './theme'

interface Props {
  app: string
  children: ReactNode
}

export const Browser = ({ app, children }: Props) => (
  <div style={{ ...sketchBorder(), width: '100%', height: '100%', background: PAPER, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: HAND, color: INK }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderBottom: `2px solid ${INK}` }}>
      {[0, 1, 2].map((dot) => (
        <span key={dot} style={{ width: 9, height: 9, borderRadius: '50%', border: `1.5px solid ${INK}` }} />
      ))}
      <span style={{ marginLeft: 8, flex: 1, border: `1.5px solid ${LINE}`, borderRadius: 8, padding: '1px 10px', fontSize: 13, color: MUTED }}>example.com/{app}</span>
    </div>
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>{children}</div>
  </div>
)
