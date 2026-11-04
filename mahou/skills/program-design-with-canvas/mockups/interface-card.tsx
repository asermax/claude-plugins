import type { MockDefinition } from '@canvas/MockShape'
import { HAND, INK, MONO, MUTED } from '@canvas/kit/theme'

type Kind = 'component' | 'hook' | 'function' | 'endpoint' | 'type'
type Change = 'new' | 'touched' | 'unchanged' | 'pending' | 'shared'

const CHANGES: Record<Change, { fill: string; color: string; dash: string }> = {
  new: { fill: '#d3f9d8', color: '#2b8a3e', dash: 'solid' },
  touched: { fill: '#fff3bf', color: '#e67700', dash: 'dashed' },
  unchanged: { fill: '#f8f9fa', color: '#adb5bd', dash: 'dotted' },
  pending: { fill: '#e7f5ff', color: '#1971c2', dash: 'dotted' },
  shared: { fill: '#f3f0ff', color: '#7048e8', dash: 'solid' },
}

// Each kind of part gets its own corner radius; endpoints are clipped to a hexagon instead
const RADIUS: Record<Kind, number> = { component: 4, hook: 40, function: 4, endpoint: 4, type: 16 }

const BADGES: Record<Change, string | null> = { new: '+ NEW', touched: '~ CHANGED', unchanged: '= UNCHANGED', pending: null, shared: null }
const BADGE_COLORS: Record<Change, string> = { new: '#2b8a3e', touched: '#e67700', unchanged: '#868e96', pending: '#1971c2', shared: '#7048e8' }

type MemberChange = 'added' | 'changed' | 'removed'

const MEMBER_CHANGES: Record<MemberChange, { sign: string; color: string; fill: string }> = {
  added: { sign: '+', color: '#2b8a3e', fill: '#ebfbee' },
  changed: { sign: '~', color: '#e67700', fill: '#fff9db' },
  removed: { sign: '−', color: '#c92a2a', fill: '#fff5f5' },
}

type Member = [name: string, type: string, change?: MemberChange | null]

interface Props {
  name: string
  kind: Kind
  change: Change
  repo: string
  inputs: Member[]
  output?: string | null
}

// One part's interface: what it receives, one per line, and what it hands back
export const mockup: MockDefinition<Props> = {
  width: 520,
  defaults: { name: '', kind: 'component', change: 'new', repo: '', inputs: [], output: null },
  render: ({ name, kind, change, repo, inputs, output }) => {
    const { fill, color, dash } = CHANGES[change]
    const border = kind === 'function' ? `5px double ${color}` : `${change === 'new' ? 3 : 2}px ${dash} ${color}`
    const clip = kind === 'endpoint' ? 'polygon(18px 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 18px 100%, 0 50%)' : undefined

    return (
      <div data-root style={{ position: 'absolute', left: 0, top: 0, right: 0, background: kind === 'endpoint' ? color : 'transparent', clipPath: clip, padding: kind === 'endpoint' ? 2 : 0 }}>
        <div style={{ background: fill, border: kind === 'endpoint' ? 'none' : border, borderRadius: RADIUS[kind], clipPath: clip, padding: kind === 'endpoint' ? '8px 30px' : kind === 'hook' ? '8px 26px' : '8px 14px', fontFamily: MONO, fontSize: 13, color: INK, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <b style={{ fontSize: 15 }}>{name}</b>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><span style={{ fontFamily: HAND, fontSize: 11, color: MUTED }}>{kind} · {repo}</span>{BADGES[change] == null ? null : <span style={{ fontSize: 12, fontWeight: 700, padding: '1px 8px', borderRadius: 6, background: BADGE_COLORS[change], color: '#fff', whiteSpace: 'nowrap' }}>{BADGES[change]}</span>}</span>
          </div>
          {inputs.length === 0 ? <span style={{ color: MUTED }}>{kind === 'component' ? 'props unchanged' : 'no arguments'}</span> : inputs.map(([member, type, memberChange]) => (
            <div key={member} style={memberChange == null ? undefined : { color: MEMBER_CHANGES[memberChange].color, textDecoration: memberChange === 'removed' ? 'line-through' : undefined }}>
              <span style={{ fontWeight: 700, marginRight: 6, color: memberChange == null ? 'transparent' : MEMBER_CHANGES[memberChange].color }}>{memberChange == null ? '·' : MEMBER_CHANGES[memberChange].sign}</span>
              <span style={{ fontWeight: 700 }}>{member}</span>
              {type === '' ? null : <span style={{ color: MUTED }}>: {type}</span>}
            </div>
          ))}
          {output == null ? null : <div style={{ borderTop: `1px solid ${color}`, paddingTop: 3 }}>→ {output}</div>}
        </div>
      </div>
    )
  },
}
