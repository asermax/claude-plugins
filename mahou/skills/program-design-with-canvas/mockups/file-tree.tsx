import type { MockDefinition } from '@canvas/MockShape'
import { HAND, INK, MONO, MUTED } from '@canvas/kit/theme'

type Change = 'new' | 'touched' | 'deleted'

// Same colours as interface-card, so a file and the part it holds match
const CHANGES: Record<Change, { fill: string; border: string }> = {
  new: { fill: '#d3f9d8', border: '1.5px solid #2b8a3e' },
  touched: { fill: '#fff3bf', border: '1.5px dashed #e67700' },
  deleted: { fill: '#ffe3e3', border: '1.5px solid #c92a2a' },
}

type Line = [prefix: string, name: string, change?: Change | null, note?: string | null]

interface Props {
  lines: Line[]
}

// A file tree of the folders a change lands in, as they look after it; changed files are coloured, the rest give context
export const mockup: MockDefinition<Props> = {
  width: 1100,
  defaults: { lines: [] },
  render: ({ lines }) => (
    <div data-root style={{ position: 'absolute', left: 0, top: 0, right: 0, padding: '8px 12px', fontFamily: MONO, fontSize: 14, color: INK, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {lines.map(([prefix, name, change, note], index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'baseline', whiteSpace: 'pre' }}>
          <span style={{ color: MUTED }}>{prefix}</span>
          <span style={change == null ? undefined : { background: CHANGES[change].fill, border: CHANGES[change].border, borderRadius: 4, padding: '0 4px', textDecoration: change === 'deleted' ? 'line-through' : undefined }}>{name}</span>
          {note == null ? null : <span style={{ fontFamily: HAND, fontSize: 13, color: MUTED, marginLeft: 12, whiteSpace: 'normal' }}>{note}</span>}
        </div>
      ))}
    </div>
  ),
}
