import { HAND, INK, MUTED, sketchBorder } from '@canvas/kit/theme'

interface Props {
  name: string
  source: string
  colors: string[]
}

export const Palette = ({ name, source, colors }: Props) => (
  <div style={{ position: 'absolute', inset: 0, fontFamily: HAND, color: INK, padding: 12 }}>
    <div style={{ fontSize: 20, fontWeight: 700 }}>{name}</div>
    <div style={{ fontSize: 12, color: MUTED }}>{source}</div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
      {colors.map((hex) => (
        <div key={hex} style={{ width: 44, textAlign: 'center' }}>
          <div style={{ height: 44, background: hex, ...sketchBorder(INK) }} />
          <div style={{ fontSize: 9, fontFamily: 'var(--tl-font-mono), ui-monospace, monospace', color: MUTED, marginTop: 3 }}>{hex}</div>
        </div>
      ))}
    </div>
  </div>
)

export const mockup = {
  width: 300,
  defaults: { name: '', source: '', colors: [] },
  render: ({ name, source, colors }: Props) => <Palette name={name} source={source} colors={colors} />,
}
