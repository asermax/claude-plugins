import type { MockDefinition } from '@canvas/MockShape'
import { HAND, INK, MUTED, PAPER } from '@canvas/kit/theme'

type Kind = 'host' | 'provider' | 'scope' | 'dialog' | 'view' | 'part' | 'button'

const KINDS: Record<Kind, { label: string; color: string; fill: string }> = {
  host: { label: 'host component', color: '#868e96', fill: '#f8f9fa' },
  provider: { label: 'provider · state, renders nothing', color: '#7048e8', fill: '#f3f0ff' },
  scope: { label: 'scope · adds ids', color: '#0ca678', fill: '#e6fcf5' },
  dialog: { label: 'dialog', color: '#1c7ed6', fill: '#e7f5ff' },
  view: { label: 'view · one per status', color: '#e8590c', fill: '#fff4e6' },
  part: { label: 'part of a view', color: '#f08c00', fill: '#fff9db' },
  button: { label: 'button', color: '#c2255c', fill: '#fff0f6' },
}

interface Node {
  name: string
  kind: Kind
  repo: string
  change: 'new' | 'touched'
  row?: boolean
  children?: Node[]
}

interface Props {
  columns: Node[][]
}

const Tag = ({ text, color }: { text: string; color: string }) => (
  <span style={{ fontSize: 11, padding: '0 6px', borderRadius: 6, border: `1.5px solid ${color}`, color, whiteSpace: 'nowrap' }}>{text}</span>
)

// One component: the kind sets the colour, the border says whether the change adds it or touches it.
// data-card lets a pointer arrow be anchored on the card's title
const Card = ({ node, inRow = false }: { node: Node; inRow?: boolean }) => {
  const { color, fill, label } = KINDS[node.kind]

  return (
    <div data-card={node.name} style={{ border: `2px ${node.change === 'new' ? 'solid' : 'dashed'} ${color}`, background: fill, borderRadius: node.kind === 'button' ? 22 : 12, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6, flex: inRow ? 1 : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <b style={{ fontSize: 15 }}>{node.name}</b>
        <Tag text={label} color={color} />
        <Tag text={`${node.repo} · ${node.change}`} color={MUTED} />
      </div>
      {node.children == null || node.children.length === 0 ? null : (
        <div style={{ display: 'flex', flexDirection: node.row ? 'row' : 'column', gap: 8, marginTop: 2 }}>
          {node.children.map((child) => (
            <Card key={child.name} node={child} inRow={node.row} />
          ))}
        </div>
      )}
    </div>
  )
}

// The component tree as nested cards: a card sits inside the component that renders it
export const mockup: MockDefinition<Props> = {
  width: 1500,
  defaults: { columns: [] },
  render: ({ columns }) => (
    <div data-root style={{ position: 'absolute', left: 0, top: 0, right: 0, fontFamily: HAND, color: INK, background: PAPER, display: 'flex', flexDirection: 'column', gap: 16, padding: 4 }}>
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
        {columns.map((column, index) => (
          <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {column.map((node) => (
              <Card key={node.name} node={node} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', fontSize: 12 }}>
        {(Object.keys(KINDS) as Kind[]).map((kind) => (
          <Tag key={kind} text={KINDS[kind].label} color={KINDS[kind].color} />
        ))}
        <span style={{ color: MUTED }}>A card sits inside the component that renders it. Solid border: new. Dashed border: touched.</span>
      </div>
    </div>
  ),
}
