import { HAND, INK, MUTED, PAPER } from './theme'

interface Props {
  title: string
  caption: string
}

export const Cylinder = ({ title, caption }: Props) => (
  <div style={{ position: 'absolute', inset: 0, fontFamily: HAND, color: INK }}>
    <svg viewBox="0 0 260 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
      <path d="M12 40 C 14 150, 11 170, 13 182 C 60 212, 200 214, 247 181 C 249 150, 246 90, 248 40" fill={PAPER} stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="130" cy="40" rx="118" ry="28" fill={PAPER} stroke={INK} strokeWidth="2.5" />
      <path d="M14 70 C 60 100, 200 102, 246 70" fill="none" stroke={MUTED} strokeWidth="1.5" strokeDasharray="5 6" />
    </svg>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 100, textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 14, color: MUTED, padding: '0 26px' }}>{caption}</div>
    </div>
  </div>
)
