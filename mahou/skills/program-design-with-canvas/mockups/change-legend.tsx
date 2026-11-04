import type { MockDefinition } from '@canvas/MockShape'
import { HAND, INK, MONO, MUTED, PAPER } from '@canvas/kit/theme'

interface Props {
  title: string
}

const BADGES = [
  { label: '+ NEW', color: '#2b8a3e', border: '3px solid #2b8a3e', text: 'the change adds it' },
  { label: '~ CHANGED', color: '#e67700', border: '2px dashed #e67700', text: 'exists today, the change alters it' },
  { label: '= UNCHANGED', color: '#868e96', border: '2px dotted #adb5bd', text: 'exists today, takes part in the change' },
]

const MARKS = [
  { sign: '+', color: '#2b8a3e', text: 'added', strike: false },
  { sign: '~', color: '#e67700', text: 'changed', strike: false },
  { sign: '−', color: '#c92a2a', text: 'removed', strike: true },
]

// The shared legend of the change marks, drawn once under every part
export const mockup: MockDefinition<Props> = {
  width: 1100,
  defaults: { title: 'Legend' },
  render: ({ title }) => (
    <div data-root style={{ position: 'absolute', left: 0, top: 0, right: 0, fontFamily: HAND, color: INK, background: PAPER, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', padding: 6, fontSize: 13 }}>
      <b>{title}</b>
      {BADGES.map((badge) => (
        <span key={badge.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: badge.border, borderRadius: 8, padding: '3px 8px' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 6, background: badge.color, color: '#fff' }}>{badge.label}</span>
          <span style={{ color: MUTED }}>{badge.text}</span>
        </span>
      ))}
      {MARKS.map((mark) => (
        <span key={mark.text} style={{ fontFamily: MONO, color: mark.color, textDecoration: mark.strike ? 'line-through' : undefined }}>
          {mark.sign} {mark.text} line
        </span>
      ))}
      <span style={{ fontFamily: MONO }}>  unmarked line: exists today and stays</span>
    </div>
  ),
}
