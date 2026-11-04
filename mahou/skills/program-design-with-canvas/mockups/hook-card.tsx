import type { MockDefinition } from '@canvas/MockShape'
import { HAND, INK, MONO, MUTED } from '@canvas/kit/theme'

type Kind = 'hook' | 'query' | 'mutation' | 'function'

const KINDS: Record<Kind, { label: string; color: string; fill: string }> = {
  hook: { label: 'context hook', color: '#1098ad', fill: '#e3fafc' },
  query: { label: 'query hook', color: '#1c7ed6', fill: '#e7f5ff' },
  mutation: { label: 'mutation hook', color: '#1c7ed6', fill: '#e7f5ff' },
  function: { label: 'function', color: '#495057', fill: '#f1f3f5' },
}

// Same colours as the component cards, plus the hook's own arguments and what it returns
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

type Line = [name: string, expression: string, source: string, comment?: string | null, change?: LineChange | null]

interface Props {
  name: string
  kind: Kind
  repo: string
  does: string
  lines: Line[]
  change?: 'new' | 'touched' | 'unchanged' | null
}

// A hook or function the branch adds: rounder than a component card, listed the same way from arguments to return value
export const mockup: MockDefinition<Props> = {
  width: 760,
  defaults: { name: '', kind: 'hook', repo: '', does: '', lines: [] },
  render: ({ name, kind, repo, does, lines, change }) => {
    const { label, color, fill } = KINDS[kind]

    return (
      <div data-root style={{ position: 'absolute', left: 0, top: 0, right: 0, border: `${(change ?? 'new') === 'new' ? 3 : 2}px ${CARD_CHANGES[change ?? 'new'].dash} ${color}`, background: fill, borderRadius: 30, padding: '10px 18px', fontFamily: HAND, color: INK, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <b style={{ fontFamily: MONO, fontSize: 15 }}>{name}</b>
          <span style={{ fontSize: 12, padding: '0 6px', borderRadius: 6, border: `1.5px solid ${color}`, color }}>{label}</span>
          <span style={{ fontSize: 12, color: MUTED }}>{repo}</span>
          <span style={{ marginLeft: 'auto' }}>{changeBadge(change ?? 'new')}</span>
        </div>
        <span style={{ fontSize: 13, lineHeight: 1.3, color: MUTED }}>{does}</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'max-content max-content 1fr max-content', columnGap: 10, rowGap: 3, alignItems: 'baseline', fontFamily: MONO, fontSize: 12 }}>
          {lines.map(([lineName, expression, source, comment, change]) => (
            <div key={lineName} style={{ display: 'contents' }}>
              {markCell(change)}
              <span style={{ fontWeight: 700, ...lineStyle(change), ...(source === 'returns' ? { borderTop: '1.5px dashed #adb5bd', paddingTop: 4, marginTop: 2 } : {}) }}>{source === 'returns' ? '⇒' : lineName}</span>
              <span style={{ whiteSpace: 'pre-wrap', ...lineStyle(change), ...(source === 'returns' ? { borderTop: '1.5px dashed #adb5bd', paddingTop: 4, marginTop: 2 } : {}) }}>
                {source === 'returns' ? '' : ':= '}
                {expression}
                {comment == null ? null : <span style={{ display: 'block', fontFamily: HAND, fontSize: 11, color: MUTED }}># {comment}</span>}
              </span>
              <span style={{ fontFamily: HAND, fontSize: 11, padding: '0 6px', borderRadius: 6, border: `1.5px solid ${SOURCES[source] ?? MUTED}`, color: SOURCES[source] ?? MUTED, justifySelf: 'end' }}>{source}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
}
