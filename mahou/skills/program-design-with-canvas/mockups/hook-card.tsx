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
  arg: '#0ca678',
  context: '#7048e8',
  cookie: '#c2255c',
  server: '#1c7ed6',
  browser: '#e8590c',
  'query meta': '#5c940d',
  env: '#5c940d',
  computed: '#868e96',
  returns: '#212529',
}

type Line = [name: string, expression: string, source: string, comment?: string | null]

interface Props {
  name: string
  kind: Kind
  repo: string
  does: string
  lines: Line[]
}

// A hook or function the branch adds: rounder than a component card, listed the same way from arguments to return value
export const mockup: MockDefinition<Props> = {
  width: 760,
  defaults: { name: '', kind: 'hook', repo: '', does: '', lines: [] },
  render: ({ name, kind, repo, does, lines }) => {
    const { label, color, fill } = KINDS[kind]

    return (
      <div data-root style={{ position: 'absolute', left: 0, top: 0, right: 0, border: `2px solid ${color}`, background: fill, borderRadius: 30, padding: '10px 18px', fontFamily: HAND, color: INK, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <b style={{ fontFamily: MONO, fontSize: 15 }}>{name}</b>
          <span style={{ fontSize: 12, padding: '0 6px', borderRadius: 6, border: `1.5px solid ${color}`, color }}>{label}</span>
          <span style={{ fontSize: 12, color: MUTED }}>{repo} · new</span>
        </div>
        <span style={{ fontSize: 13, lineHeight: 1.3, color: MUTED }}>{does}</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr max-content', columnGap: 10, rowGap: 3, alignItems: 'baseline', fontFamily: MONO, fontSize: 12 }}>
          {lines.map(([lineName, expression, source, comment]) => (
            <div key={lineName} style={{ display: 'contents' }}>
              <span style={{ fontWeight: 700 }}>{source === 'returns' ? '' : lineName}</span>
              <span>
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
