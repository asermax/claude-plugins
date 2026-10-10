import { useEffect, useId, useState } from 'react'
import { INK, MUTED } from './theme'

// mermaid sizes its boxes by measuring text in this font, so it has to be a loaded family, not tldraw's CSS variable
const FONT = '"tldraw_draw", "Shantell Sans", cursive'

interface Props {
  source: string
}

let ready: Promise<typeof import('mermaid').default> | undefined

// mermaid is loaded on the first diagram only, and initialized once for every shape that uses it
const loadMermaid = () =>
  (ready ??= Promise.all([import('mermaid'), document.fonts.load('16px "tldraw_draw"')]).then(([{ default: mermaid }]) => {
    mermaid.initialize({
      startOnLoad: false,
      look: 'handDrawn',
      theme: 'base',
      fontFamily: FONT,
      securityLevel: 'strict',
      // The same ink, white fill and transparent background as tldraw's own shapes on the canvas
      themeVariables: {
        fontFamily: FONT,
        fontSize: '16px',
        background: 'transparent',
        mainBkg: '#ffffff',
        primaryColor: '#ffffff',
        secondaryColor: '#ffffff',
        tertiaryColor: '#ffffff',
        primaryBorderColor: INK,
        secondaryBorderColor: INK,
        tertiaryBorderColor: INK,
        nodeBorder: INK,
        primaryTextColor: INK,
        secondaryTextColor: INK,
        tertiaryTextColor: INK,
        textColor: INK,
        lineColor: INK,
        edgeLabelBackground: '#f9fafb',
        clusterBkg: 'transparent',
        clusterBorder: MUTED,
        actorBkg: '#ffffff',
        actorBorder: INK,
        actorTextColor: INK,
        actorLineColor: MUTED,
        signalColor: INK,
        signalTextColor: INK,
        labelBoxBkgColor: '#ffffff',
        labelBoxBorderColor: MUTED,
        loopTextColor: INK,
        noteBkgColor: '#fff3bf',
        noteBorderColor: INK,
        noteTextColor: INK,
        activationBkgColor: '#ffffff',
        activationBorderColor: INK,
        classText: INK,
        attributeBackgroundColorOdd: '#ffffff',
        attributeBackgroundColorEven: '#ffffff',
      },
    })
    return mermaid
  }))

export const Mermaid = ({ source }: Props) => {
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let current = true

    loadMermaid()
      .then((mermaid) => mermaid.render(id, source))
      .then(({ svg }) => current && (setSvg(svg), setError(null)))
      .catch((reason) => current && setError(String(reason)))

    return () => {
      current = false
    }
  }, [id, source])

  return (
    <div style={{ position: 'absolute', inset: 0, color: INK, fontFamily: FONT }}>
      {error != null ? <pre style={{ color: 'crimson', whiteSpace: 'pre-wrap' }}>{error}</pre> : null}
      {svg != null ? (
        <div className="canvas-mermaid" style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: svg.replace(/style="max-width:[^"]*"/, 'style="width:100%;height:100%"') }} />
      ) : null}
    </div>
  )
}
