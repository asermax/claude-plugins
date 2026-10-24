import { HAND, INK, MUTED, RED } from './theme'

interface Props {
  label: string
  isFocus?: boolean
}

export const Area = ({ label, isFocus }: Props) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      border: isFocus ? `3px solid ${RED}` : `2px dashed ${MUTED}`,
      borderRadius: 24,
      fontFamily: HAND,
      color: INK,
      transition: 'border 0.15s ease',
    }}
  >
    <div style={{ position: 'absolute', top: 10, left: 18, fontSize: 18, fontWeight: 700 }}>{label}</div>
  </div>
)
