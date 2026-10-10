import type { ReactNode } from 'react'
import type { MockDefinition } from '@canvas/MockShape'
import { BLUE, HAND, INK, LINE, MUTED, PAPER, sketchBorder } from '@canvas/kit/theme'

interface Box {
  label: string
  button?: boolean
  primary?: boolean
  grow?: boolean
  width?: number
  height?: number
}

interface Row {
  boxes: Box[]
  align?: 'start' | 'center' | 'end'
  group?: boolean
  note?: string
}

interface Props {
  layout: 'page' | 'dialog' | 'panel'
  regions: string[]
  rows: Row[]
}

const SCREEN = 470
const NOTE_GAP = 14

// The distance from a row's right edge to the screen's right edge, per layout, so a row's note lines up outside the screen
const ROW_INSET: Record<Props['layout'], number> = { page: 14, dialog: 50 + 14, panel: 14 + 10 }

// Buttons get a solid border; every other element is dashed, since it stands for content still to be defined
const BoxView = ({ label, button = false, primary = false, grow = false, width, height = 26 }: Box) => (
  <div style={{ height, width, flex: grow ? 1 : 'none', border: `1.5px ${button ? 'solid' : 'dashed'} ${primary ? BLUE : LINE}`, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: MUTED, padding: '0 8px' }}>{label}</div>
)

const RowView = ({ row, inset }: { row: Row; inset: number }) => (
  <div style={{ position: 'relative', display: 'flex', flexDirection: row.group ? 'column' : 'row', justifyContent: row.align ?? 'start', gap: row.group ? 4 : 8, border: row.group ? `1.5px dashed ${BLUE}` : 'none', borderRadius: 8, padding: row.group ? 6 : 0 }}>
    {row.boxes.map((box, index) => (
      <BoxView key={index} {...box} grow={box.grow ?? (row.group === true && box.width == null)} />
    ))}
    {row.note == null ? null : <div style={{ position: 'absolute', left: `calc(100% + ${inset + NOTE_GAP}px)`, top: 0, width: 300, fontSize: 14, lineHeight: 1.25, color: INK }}>← {row.note}</div>}
  </div>
)

const Rows = ({ rows, inset }: { rows: Row[]; inset: number }) => (
  <>
    {rows.map((row, index) => (
      <RowView key={index} row={row} inset={inset} />
    ))}
  </>
)

const Regions = ({ regions }: { regions: string[] }) => (
  <>
    {regions.map((region) => (
      <div key={region} style={{ fontSize: 13, color: MUTED }}>[ {region} ]</div>
    ))}
  </>
)

const LAYOUTS: Record<Props['layout'], (props: Props) => ReactNode> = {
  page: ({ regions, rows }) => (
    <div style={{ position: 'absolute', inset: 0, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Regions regions={regions} />
      <Rows rows={rows} inset={ROW_INSET.page} />
    </div>
  ),
  dialog: ({ regions, rows }) => (
    <div style={{ position: 'absolute', inset: 0, padding: 14 }}>
      <Regions regions={regions} />
      <div style={{ ...sketchBorder(), position: 'absolute', left: 50, right: 50, top: 44, bottom: 18, background: PAPER, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'space-between' }}>
        <Rows rows={rows} inset={ROW_INSET.dialog} />
      </div>
    </div>
  ),
  panel: ({ regions, rows }) => (
    <div style={{ position: 'absolute', inset: 0, padding: 14, display: 'flex', gap: 14 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Regions regions={regions} />
      </div>
      <div style={{ width: 250, border: `1.5px solid ${INK}`, borderRadius: 10, padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8 }}>
        <Rows rows={rows} inset={ROW_INSET.panel} />
      </div>
    </div>
  ),
}

// A low-resolution sketch of one view: bracketed lines for the regions that stay as they are, boxes for what the branch adds,
// and the component that renders each row named outside the screen
export const mockup: MockDefinition<Props> = {
  width: 800,
  defaults: { layout: 'page', regions: [], rows: [] },
  render: (props) => (
    <div style={{ position: 'absolute', inset: 0, fontFamily: HAND, color: INK }}>
      <div style={{ ...sketchBorder(), position: 'absolute', left: 0, top: 0, bottom: 0, width: SCREEN, background: PAPER, overflow: 'visible' }}>{LAYOUTS[props.layout](props)}</div>
    </div>
  ),
}
