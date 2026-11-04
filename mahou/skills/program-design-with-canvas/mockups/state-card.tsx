import type { MockDefinition } from '@canvas/MockShape'
import { HAND, INK, MONO, MUTED } from '@canvas/kit/theme'

type Kind = 'host' | 'provider' | 'scope' | 'dialog' | 'view' | 'part' | 'button'

const KINDS: Record<Kind, { color: string; fill: string }> = {
  host: { color: '#868e96', fill: '#f8f9fa' },
  provider: { color: '#7048e8', fill: '#f3f0ff' },
  scope: { color: '#0ca678', fill: '#e6fcf5' },
  dialog: { color: '#1c7ed6', fill: '#e7f5ff' },
  view: { color: '#e8590c', fill: '#fff4e6' },
  part: { color: '#f08c00', fill: '#fff9db' },
  button: { color: '#c2255c', fill: '#fff0f6' },
}

// One colour per kind of source, so a value's origin reads at a glance
const SOURCES: Record<string, string> = {
  prop: '#0ca678',
  arg: '#20c997',
  request: '#2b8a3e',
  'query meta': '#5c940d',
  env: '#74b816',
  config: '#66a80f',
  context: '#7048e8',
  cookie: '#c2255c',
  server: '#1c7ed6',
  upstream: '#1971c2',
  database: '#364fc7',
  browser: '#e8590c',
  local: '#495057',
  constant: '#5c677d',
  form: '#f08c00',
  function: '#0b7285',
  method: '#1098ad',
  effect: '#15aabf',
  computed: '#868e96',
  returns: '#212529',
}

type LineChange = 'added' | 'changed' | 'removed'

const LINE_CHANGES: Record<LineChange, { sign: string; color: string; fill: string }> = {
  added: { sign: '+', color: '#2b8a3e', fill: '#ebfbee' },
  changed: { sign: '~', color: '#e67700', fill: '#fff9db' },
  removed: { sign: '−', color: '#c92a2a', fill: '#fff5f5' },
}

const markCell = (change: LineChange | null | undefined) => (
  <span style={{ fontWeight: 700, color: change == null ? 'transparent' : LINE_CHANGES[change].color }}>{change == null ? '·' : LINE_CHANGES[change].sign}</span>
)

const lineStyle = (change: LineChange | null | undefined) =>
  change == null ? {} : { color: LINE_CHANGES[change].color, textDecoration: change === 'removed' ? 'line-through' : undefined }

const CARD_CHANGES: Record<string, { label: string; color: string; dash: string }> = {
  new: { label: '+ NEW', color: '#2b8a3e', dash: 'solid' },
  touched: { label: '~ CHANGED', color: '#e67700', dash: 'dashed' },
  unchanged: { label: '= UNCHANGED', color: '#868e96', dash: 'dotted' },
}

const changeBadge = (change: string | null | undefined) =>
  change == null ? null : (
    <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, padding: '1px 8px', borderRadius: 6, background: CARD_CHANGES[change].color, color: '#fff', whiteSpace: 'nowrap' }}>{CARD_CHANGES[change].label}</span>
  )

type Line = [name: string, expression: string, source?: string, comment?: string | null, change?: LineChange | null]

interface Props {
  title: string
  kind: Kind
  repo: string
  lines: Line[]
  change?: 'new' | 'touched' | 'unchanged' | null
}

export const mockup: MockDefinition<Props> = {
  width: 900,
  defaults: { title: '', kind: 'provider', repo: '', lines: [] },
  render: ({ title, kind, repo, lines, change }) => {
    const { color, fill } = KINDS[kind]

    return (
      <div data-root style={{ position: 'absolute', left: 0, top: 0, right: 0, border: `${change === 'new' ? 3 : 2}px ${change == null ? 'solid' : CARD_CHANGES[change].dash} ${change === 'unchanged' ? '#adb5bd' : color}`, background: fill, borderRadius: 12, padding: '10px 14px', fontFamily: HAND, color: INK, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <b style={{ fontSize: 18 }}>{title}</b>
          <span style={{ fontSize: 12, color: MUTED }}>{repo}</span>
          <span style={{ marginLeft: 'auto' }}>{changeBadge(change)}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'max-content max-content 1fr max-content', columnGap: 12, rowGap: 4, alignItems: 'baseline', fontFamily: MONO, fontSize: 13 }}>
          {lines.map(([name, expression, source, comment, change]) => (
            <div key={name} style={{ display: 'contents' }}>
              {markCell(change)}
              <span style={{ fontWeight: 700, ...lineStyle(change), ...(source === 'returns' ? { borderTop: '1.5px dashed #adb5bd', paddingTop: 4, marginTop: 2 } : {}) }}>{source === 'returns' ? '⇒' : name}</span>
              <span style={{ whiteSpace: 'pre-wrap', ...lineStyle(change), ...(source === 'returns' ? { borderTop: '1.5px dashed #adb5bd', paddingTop: 4, marginTop: 2 } : {}) }}>
                {source === 'returns' ? '' : ':= '}
                {expression}
                {comment == null ? null : <span style={{ display: 'block', fontFamily: HAND, fontSize: 12, color: MUTED }}># {comment}</span>}
              </span>
              {source == null ? <span /> : <span style={{ fontFamily: HAND, fontSize: 12, padding: '0 6px', borderRadius: 6, border: `1.5px solid ${SOURCES[source] ?? MUTED}`, color: SOURCES[source] ?? MUTED, justifySelf: 'end' }}>{source}</span>}
            </div>
          ))}
        </div>
      </div>
    )
  },
}
