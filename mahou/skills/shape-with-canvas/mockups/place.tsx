import type { MockDefinition } from '@canvas/MockShape'
import { HAND, INK, LINE, MUTED, PAPER, RED, sketchBorder } from '@canvas/kit/theme'

type ItemKind = 'button' | 'field' | 'text' | 'list' | 'toggle' | 'tabs' | 'gap'

interface Item {
  kind: ItemKind
  label: string
  id: string | null
}

interface Props {
  title: string
  subtitle: string | null
  items: Item[]
}

const Row = ({ item }: { item: Item }) => {
  if (item.kind === 'button') {
    return (
      <div data-anchor={item.id ?? undefined} style={{ display: 'inline-block', margin: '4px 6px 4px 0', padding: '3px 12px', ...sketchBorder(INK), borderRadius: 8, fontSize: 15 }}>
        {item.label}
      </div>
    )
  }

  if (item.kind === 'field') {
    return (
      <div data-anchor={item.id ?? undefined} style={{ margin: '5px 0' }}>
        <div style={{ fontSize: 12, color: MUTED }}>{item.label}</div>
        <div style={{ height: 18, border: `1.5px solid ${LINE}`, borderRadius: 4, background: '#fff' }} />
      </div>
    )
  }

  if (item.kind === 'toggle') {
    return (
      <div data-anchor={item.id ?? undefined} style={{ margin: '5px 0', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 22, height: 12, borderRadius: 6, border: `1.5px solid ${INK}`, display: 'inline-block' }} />
        {item.label}
      </div>
    )
  }

  if (item.kind === 'tabs') {
    return (
      <div data-anchor={item.id ?? undefined} style={{ margin: '5px 0', display: 'flex', gap: 4 }}>
        {item.label.split('|').map((tab) => (
          <span key={tab} style={{ flex: 1, textAlign: 'center', fontSize: 13, border: `1.5px solid ${INK}`, borderRadius: 4, padding: '1px 0' }}>
            {tab.trim()}
          </span>
        ))}
      </div>
    )
  }

  if (item.kind === 'list') {
    return (
      <div data-anchor={item.id ?? undefined} style={{ margin: '6px 0' }}>
        <div style={{ fontSize: 13, color: INK, marginBottom: 3 }}>{item.label}</div>
        {[0, 1, 2].map((line) => (
          <div key={line} style={{ display: 'flex', gap: 6, alignItems: 'center', margin: '3px 0' }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: LINE }} />
            <span style={{ flex: 1, height: 7, borderRadius: 4, background: LINE }} />
            <span style={{ width: 40, height: 7, borderRadius: 4, background: LINE }} />
          </div>
        ))}
      </div>
    )
  }

  if (item.kind === 'gap') {
    return <div style={{ margin: '6px 0', fontSize: 13, color: RED }}>? {item.label}</div>
  }

  return <div data-anchor={item.id ?? undefined} style={{ margin: '4px 0', fontSize: 13, color: MUTED }}>{item.label}</div>
}

export const mockup: MockDefinition<Props> = {
  width: 320,
  defaults: { title: 'Place', subtitle: null, items: [] },
  render: ({ title, subtitle, items }) => (
    <div data-root style={{ fontFamily: HAND, color: INK, background: PAPER, ...sketchBorder(INK), padding: '10px 14px 12px' }}>
      <div style={{ fontSize: 18, fontWeight: 700, borderBottom: `1.5px solid ${LINE}`, paddingBottom: 4, marginBottom: 6 }}>
        {title}
        {subtitle == null ? null : <div style={{ fontSize: 12, fontWeight: 400, color: MUTED }}>{subtitle}</div>}
      </div>
      {items.map((item, index) => (
        <Row key={index} item={item} />
      ))}
    </div>
  ),
}
