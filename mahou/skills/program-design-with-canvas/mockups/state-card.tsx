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
  server: '#1c7ed6',
  local: '#495057',
  prop: '#0ca678',
  context: '#7048e8',
  cookie: '#c2255c',
  browser: '#e8590c',
  form: '#f08c00',
  'query meta': '#5c940d',
  computed: '#868e96',
  returns: '#212529',
}

type Line = [name: string, expression: string, source?: string, comment?: string]

interface Props {
  title: string
  kind: Kind
  repo: string
  lines: Line[]
}

export const mockup: MockDefinition<Props> = {
  width: 900,
  defaults: { title: '', kind: 'provider', repo: '', lines: [] },
  render: ({ title, kind, repo, lines }) => {
    const { color, fill } = KINDS[kind]

    return (
      <div data-root style={{ position: 'absolute', left: 0, top: 0, right: 0, border: `2px solid ${color}`, background: fill, borderRadius: 12, padding: '10px 14px', fontFamily: HAND, color: INK, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <b style={{ fontSize: 18 }}>{title}</b>
          <span style={{ fontSize: 12, color: MUTED }}>{repo}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr max-content', columnGap: 12, rowGap: 4, alignItems: 'baseline', fontFamily: MONO, fontSize: 13 }}>
          {lines.map(([name, expression, source, comment]) => (
            <div key={name} style={{ display: 'contents' }}>
              <span style={{ fontWeight: 700 }}>{source === 'returns' ? '' : name}</span>
              <span>
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
