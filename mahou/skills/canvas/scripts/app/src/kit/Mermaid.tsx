import { useEffect, useState } from 'react'
import { INK, MUTED } from './theme'

// pele sizes its boxes by measuring text in this font, so it has to be a loaded family, not tldraw's CSS variable
const FONT = '"tldraw_draw", "Shantell Sans", cursive'

// The same ink, white fill and transparent background as tldraw's own shapes on the canvas
const COLOURS = {
  '--pele-bg': '#f9fafb',
  '--pele-fg': INK,
  '--pele-muted': MUTED,
  '--pele-line': INK,
  '--pele-surface': '#ffffff',
  '--pele-surface-alt': 'transparent',
  '--pele-border': INK,
  '--pele-font': FONT,
}

interface Props {
  source: string
}

let ready: Promise<typeof import('pele')> | undefined

// pele is loaded on the first diagram only, once the hand font it measures with has loaded
const loadPele = () => (ready ??= Promise.all([import('pele'), document.fonts.load('16px "tldraw_draw"')]).then(([pele]) => pele))

export const Mermaid = ({ source }: Props) => {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let current = true

    loadPele()
      .then(({ render }) => render(source, { fontFamily: FONT }).svg)
      .then((svg) => current && (setSvg(svg), setError(null)))
      .catch((reason) => current && setError(String(reason?.message ?? reason)))

    return () => {
      current = false
    }
  }, [source])

  return (
    <div style={{ position: 'absolute', inset: 0, color: INK, fontFamily: FONT, ...COLOURS }}>
      {error != null ? <pre style={{ color: 'crimson', whiteSpace: 'pre-wrap' }}>{error}</pre> : null}
      {svg != null ? (
        <div className="canvas-mermaid" style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: svg.replace('max-width:100%;height:auto;', 'width:100%;height:100%;') }} />
      ) : null}
    </div>
  )
}
