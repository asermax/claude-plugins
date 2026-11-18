import { useEffect, useRef, useState } from 'react'
import { useSvgExportContext } from 'tldraw'
import { HAND, LINE, MUTED, PAPER, RED } from './theme'

export interface HtmlProps {
  file: string
  state: string | string[] | null
  width: number
}

// The server serves the folder that holds the canvas folder under /files/, so a prototype's relative links resolve too
export const htmlSource = (file: string) => `/files/${file.split('/').map(encodeURIComponent).join('/')}`

// canvas.sh export screenshots each html mock first and lists the images here, since an iframe draws nothing in an SVG
export const exportShots = () => ((window as unknown as { __htmlShots?: Record<string, string> }).__htmlShots ??= {})

const isControl = (element: Element) => ['BUTTON', 'A', 'LABEL', 'OPTION', 'SUMMARY'].includes(element.tagName) || element.getAttribute('role') === 'tab'

// A prototype's control strip switches its state by a click on the control that names the state; an option in a
// select sets the select's value instead
const selectState = (page: Document, label: string) => {
  const control = [...page.querySelectorAll('button, a, label, option, summary, [role="tab"], [onclick]')].find(
    (element) => element.textContent?.trim() === label && (isControl(element) || element.hasAttribute('onclick')),
  )

  if (control == null) {
    return false
  }

  if (control instanceof HTMLOptionElement) {
    const select = control.closest('select')!

    select.value = control.value
    select.dispatchEvent(new Event('change', { bubbles: true }))
  } else {
    ;(control as HTMLElement).click()
  }

  return true
}

// canvas.sh export lays each prototype out in an overlay of the canvas page to screenshot it, with the same state clicks
Object.assign(window, { __htmlState: (page: Document, states: string[]) => states.filter((label) => !selectState(page, label)) })

export const Html = ({ file, state, width, shapeId }: HtmlProps & { shapeId: string }) => {
  const exporting = useSvgExportContext() != null
  const frame = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(600)
  const [missing, setMissing] = useState<string[]>([])
  const states = state == null ? [] : Array.isArray(state) ? state : [state]

  useEffect(() => {
    const iframe = frame.current

    if (iframe == null) {
      return
    }

    let observer: ResizeObserver | undefined

    const ready = () => {
      const page = iframe.contentDocument

      if (page == null) {
        return
      }

      setMissing(states.filter((label) => !selectState(page, label)))

      // The html element's own box, since scrollHeight never drops below the iframe's current height
      const measure = () => setHeight(Math.ceil(page.documentElement.getBoundingClientRect().height))

      observer = new ResizeObserver(measure)
      observer.observe(page.documentElement)
      measure()
    }

    iframe.addEventListener('load', ready)

    if (iframe.contentDocument?.readyState === 'complete' && iframe.contentWindow?.location.href !== 'about:blank') {
      ready()
    }

    return () => {
      iframe.removeEventListener('load', ready)
      observer?.disconnect()
    }
  }, [file, states.join('\u0000')])

  const shot = exportShots()[shapeId]

  return (
    <div data-root style={{ width, background: PAPER, outline: `1.5px solid ${LINE}` }}>
      {exporting ? (
        shot != null ? (
          <img src={shot} style={{ display: 'block', width }} />
        ) : (
          <div style={{ padding: 24, fontFamily: HAND, color: MUTED }}>{file}</div>
        )
      ) : (
        <iframe
          key={`${file}\u0000${states.join('\u0000')}`}
          ref={frame}
          src={htmlSource(file)}
          style={{ display: 'block', width, height, border: 0, pointerEvents: 'none' }}
        />
      )}
      {missing.length > 0 && !exporting ? (
        <div style={{ padding: 8, fontFamily: HAND, color: RED }}>no control named {missing.map((label) => `"${label}"`).join(', ')}</div>
      ) : null}
    </div>
  )
}
