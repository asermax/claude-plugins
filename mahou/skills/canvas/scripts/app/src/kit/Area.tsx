import { HAND, INK, MUTED } from './theme'

interface Props {
  label: string
}

export const Area = ({ label }: Props) => (
  <div style={{ position: 'absolute', inset: 0, border: `2px dashed ${MUTED}`, borderRadius: 24, fontFamily: HAND, color: INK }}>
    <div style={{ position: 'absolute', top: 10, left: 18, fontSize: 18, fontWeight: 700 }}>{label}</div>
  </div>
)
