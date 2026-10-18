import { useEffect } from 'react'
import { Browser } from '@canvas/kit/Browser'

interface Palette {
  page: string
  window: string
  sidebar: string
  ink: string
  muted: string
  line: string
  active: string
  activeInk: string
  link: string
  cards: string[]
}

interface Props {
  variant: 'page' | 'types'
  mode: 'light' | 'dark'
  palette: Palette
  palette2?: Palette
}

const DISPLAY = "'Display Face', sans-serif"
const BODY = "'Body Face', sans-serif"

const loadFonts = () => {
  const href = 'https://fonts.googleapis.com/css2?family=Display+Face:wght@400;500;700&family=Body+Face:ital,wght@0,400;0,700;1,400&display=swap'

  if (document.querySelector(`link[href="${href}"]`) == null) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }
}

const Dot = ({ bg, active }: { bg: string; active: boolean }) => (
  <span style={{ width: 20, height: 20, borderRadius: '50%', background: active ? bg : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ width: 14, height: 14, borderRadius: '50%', background: active ? 'transparent' : bg }} />
  </span>
)

const Sidebar = ({ p }: { p: Palette }) => (
  <div style={{ width: 34, background: p.sidebar, borderRadius: 14, padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginRight: 10 }}>
    <Dot bg={p.line} active={false} />
    <Dot bg={p.active} active={true} />
    <Dot bg={p.line} active={false} />
    <Dot bg={p.line} active={false} />
  </div>
)

const Card = ({ bg, ink, title, meta, wide }: { bg: string; ink: string; title: string; meta: string; wide?: boolean }) => (
  <div style={{ background: bg, borderRadius: 14, padding: 12, flex: wide ? '1 1 100%' : 1, position: 'relative' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ width: 18, height: 18, borderRadius: 6, background: 'rgba(255,255,255,0.85)' }} />
      <span style={{ fontFamily: DISPLAY, fontSize: 9, fontWeight: 500, background: 'rgba(255,255,255,0.85)', borderRadius: 999, padding: '2px 7px', color: ink }}>★ 4.8</span>
    </div>
    <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 12.5, lineHeight: 1.25, color: ink, marginTop: 8, paddingRight: wide ? 60 : 0 }}>{title}</div>
    <div style={{ fontFamily: BODY, fontSize: 10, color: ink, opacity: 0.7, marginTop: 4 }}>{meta}</div>
    <div style={{ position: 'absolute', right: 12, bottom: 12, display: wide ? 'flex' : 'none', gap: 3 }}>
      {[0, 1, 2].map((n) => (
        <span key={n} style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: `1.5px solid ${ink}` }} />
      ))}
    </div>
  </div>
)

const PageTile = ({ p }: { p: Palette }) => (
  <div style={{ position: 'absolute', inset: 0, background: p.page, padding: 12 }}>
    <div style={{ background: p.window, borderRadius: 18, height: '100%', display: 'flex', overflow: 'hidden', padding: 10 }}>
      <Sidebar p={p} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 21, lineHeight: 1.1, color: p.ink }}>A sample heading</div>
        <div style={{ display: 'flex', gap: 5, margin: '10px 0' }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 10, fontWeight: 500, background: p.active, color: p.activeInk, padding: '4px 11px', borderRadius: 999 }}>all</span>
          <span style={{ fontFamily: DISPLAY, fontSize: 10, background: p.window, border: `1.5px solid ${p.line}`, color: p.ink, padding: '4px 11px', borderRadius: 999 }}>recent</span>
          <span style={{ fontFamily: DISPLAY, fontSize: 10, background: p.window, border: `1.5px solid ${p.line}`, color: p.ink, padding: '4px 11px', borderRadius: 999 }}>mine</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <Card bg={p.cards[0]} ink={p.ink} title="Resource one" meta="meta line · 12 items" />
          <Card bg={p.cards[1]} ink={p.ink} title="Resource two" meta="meta line · 34 items" />
        </div>
        <Card bg={p.cards[2]} ink={p.ink} title="Resource three" meta="meta line · 7 items" wide />
      </div>
    </div>
  </div>
)

const Row = ({ font, weight, size, label, text, ink, muted, italic }: { font: string; weight: number; size: number; label: string; text: string; ink: string; muted: string; italic?: boolean }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontFamily: DISPLAY, fontSize: 9.5, color: muted, marginBottom: 2 }}>{label}</div>
    <div style={{ fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 1.3, fontStyle: italic ? 'italic' : 'normal', color: ink }}>{text}</div>
  </div>
)

const TypesTile = ({ p, p2 }: { p: Palette; p2?: Palette }) => (
  <div style={{ position: 'absolute', inset: 0, background: p.window, padding: 14 }}>
    <Row font={DISPLAY} weight={700} size={24} label="display 700 · 24 — title" text="A heading for the page" ink={p.ink} muted={p.muted} />
    <Row font={DISPLAY} weight={500} size={16} label="display 500 · 16 — subtitle" text="A subtitle in medium weight" ink={p.ink} muted={p.muted} />
    <Row font={DISPLAY} weight={400} size={12.5} label="display 400 · 12.5 — buttons and labels" text="Button · label · badge" ink={p.ink} muted={p.muted} />
    <Row font={BODY} weight={400} size={12.5} label="body 400 · 12.5 — paragraph" text="A paragraph of body copy that has to stay readable at small sizes, long enough to wrap at least once." ink={p.ink} muted={p.muted} />
    <Row font={BODY} weight={700} size={12.5} label="body 700 · 12.5 — emphasis" text="an emphasized phrase in body weight" ink={p.ink} muted={p.muted} />
    <Row font={BODY} weight={400} size={12.5} label="body 400 italic — quotes" text="«a quoted remark»" ink={p.ink} muted={p.muted} italic />
    {p2 != null && (
      <div style={{ background: p2.window, borderRadius: 14, padding: 12 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 9.5, color: p2.muted, marginBottom: 6 }}>the same weights on dark</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: p2.ink, marginBottom: 4 }}>A heading for the page</div>
        <div style={{ fontFamily: BODY, fontSize: 12, color: p2.ink, lineHeight: 1.45 }}>A paragraph of body copy. <span style={{ color: p2.link, fontWeight: 700 }}>Button</span></div>
      </div>
    )}
  </div>
)

export const StyleTile = ({ variant, mode, palette, palette2 }: Props) => {
  useEffect(loadFonts)

  return (
    <Browser app={`product · ${mode}`}>
      {variant === 'types' ? <TypesTile p={palette} p2={palette2} /> : <PageTile p={palette} />}
    </Browser>
  )
}

export const mockup = {
  width: 340,
  defaults: {
    variant: 'page',
    mode: 'light',
    palette: {
      page: '#AEEBC8',
      window: '#FBF3EE',
      sidebar: '#F3E8E1',
      ink: '#1F1B18',
      muted: '#8A7E75',
      line: '#EADFD8',
      active: '#1F1B18',
      activeInk: '#FFFFFF',
      link: '#1F7A55',
      cards: ['#F2B8C0', '#F8D0A0', '#CCC4F0', '#B4E8CC'],
    },
  },
  render: (props: Props) => <StyleTile {...props} />,
}
