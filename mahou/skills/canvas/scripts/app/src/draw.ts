import { createShapeId, toRichText, type Editor, type TLCreateShapePartial, type TLDefaultColorStyle, type TLShape, type TLShapeId, type VecLike } from 'tldraw'
import { definitionOf } from './MockShape'
import { stepOf } from './step'

type Place = { x: number; y: number; w: number }

type Into = { into?: string }

type Range = { x: number; maxX: number }

// Places a new shape under a named one: its y is the named shape's bottom edge plus `gap`, and its x the named shape's x
type Below = { below?: string; gap?: number }

type TextOptions = Partial<Place> & Into & Below & { text: string; mono?: boolean; size?: 's' | 'm' | 'l' }

type CardOptions = Partial<Place> & Into & Below & {
  text: string
  color?: TLDefaultColorStyle
  dash?: 'solid' | 'dashed'
  fill?: 'none' | 'semi' | 'solid'
  mono?: boolean
}

type FollowUpOptions = { summary: string; note: string; question?: string }

type BoxOptions = Partial<Place> & Into & Below & {
  h: number
  text: string
  geo?: 'rectangle' | 'ellipse' | 'cloud'
  color?: TLDefaultColorStyle
  fill?: 'none' | 'semi' | 'solid'
  dash?: 'draw' | 'solid' | 'dashed'
}

type MockOptions = Partial<Place> & Into & Below & { kind: string; data: Record<string, unknown> }

type TableOptions = Partial<Place> & Into & Below & { columns: string[]; rows: string[][] }

type BranchOptions = Partial<Place> & Into & {
  title: string
  status: string
  leaves: string
  prose: string
  note?: string | null
}

type TextPair = { shape?: string; from: string; to: string }

type TreeRow = {
  id: string
  summary: string
  picks: (string | null)[]
  expected: string
  kind: string
  setup?: string | null
  manual?: boolean
  isNew?: boolean
}

type TreeSpec = {
  label: string
  root: string
  classifications: { name: string; partitions: [key: string, label: string][] }[]
  rows: TreeRow[]
  dropped?: string[]
  deleted?: string[]
  note?: string | null
}

type ArrowOptions = {
  text?: string
  bend?: number
  labelPosition?: number
  color?: TLDefaultColorStyle
  dash?: 'draw' | 'solid' | 'dashed' | 'dotted'
}

type PartCard = { name: string; category: 'INPUT' | 'STATE' | 'RESPONSE' | 'OUTPUT'; text: string; tone: 'varied' | 'fixed' | 'output' | 'refused' }

type Part = { name: string; kind: 'code' | 'store' | 'external' | 'actor'; title: string; caption?: string; color?: TLDefaultColorStyle; cards?: PartCard[] }

type PartsSpec = Partial<Place> & Into & { label: string; parts: Part[]; arrows: [from: string, to: string, text: string, options?: ArrowOptions][] }

const PART_WIDTH = 380
const PART_GAP = 260
const TONES: Record<PartCard['tone'], TLDefaultColorStyle> = { varied: 'orange', fixed: 'grey', output: 'green', refused: 'red' }

const CARD_PADDING = 20
const GAP = 20
const AREA_PADDING = 40
const AREA_GAP = 60
const EDGE_TOLERANCE = 1
const NOTE_LABEL = 'Agent\n\n'
const LABEL_SPACE = 60
const FLOW_GAP = 30
const MOCK_WIDTH = 520
const BELOW_GAP = 30
const BRANCH_LEAVES_WIDTH = 760
const BRANCH_PROSE_WIDTH = 1160
const BRANCH_TOP = 70
// tldraw's monospace text at size s: the width of one character and the padding around a line, in canvas units
const MONO_CHAR_WIDTH = 10.9
const MONO_PADDING = 32
const PARTITION_WIDTH = 170
const STAR_WIDTH = 38
const ROW_TEXT_WIDTH = 620
const OUTCOME_WIDTH = 760

const nextFrame = () => new Promise((done) => requestAnimationFrame(() => done(null)))

export const drawOf = (editor: Editor) => {
  const step = stepOf(editor)

  // A name, or a shape id such as a sticky note's from notes(), which has no name of its own
  const id = (name: string) => (name.startsWith('shape:') ? (name as TLShapeId) : createShapeId(name))

  const bounds = (name: string) => editor.getShapePageBounds(id(name))!

  const exists = (name: string) => editor.getShape(id(name)) != null

  const centreOf = ({ x, y, w }: Place, h: number): VecLike => ({ x: x + w / 2, y: y + h / 2 })

  const placed = <T extends Partial<Place> & Below>(options: T): T => {
    const { below, gap = BELOW_GAP } = options

    if (below == null || options.y != null) {
      return options
    }

    const anchor = bounds(below)

    return { ...options, x: options.x ?? anchor.x, y: anchor.maxY + gap }
  }

  const isArea = (shape: TLShape) => shape.type === 'mock' && (shape.props as { kind?: string }).kind === 'area'

  const nameOf = (shape: TLShape) => shape.id.replace(/^shape:/, '')

  // A follow-up's parts sit inside their card and move with it, so the layout treats them as part of the card
  const PARTS = ['summary', 'note', 'question']

  const partsOf = (name: string) => PARTS.map((part) => `${name}-${part}`).filter((part) => editor.getShape(id(part)) != null)

  // Only a card has follow-up parts, and they sit within its left and right edges: an area named `b1` and a note
  // named `b1-note` under it are two shapes of the layout, not a card and its part
  const isPart = (shape: TLShape) => {
    const match = nameOf(shape).match(/^(.*)-(summary|note|question)$/)
    const base = match == null ? undefined : editor.getShape(id(match[1]))

    if (base == null || base.type !== 'geo') {
      return false
    }

    const card = editor.getShapePageBounds(base)!
    const part = editor.getShapePageBounds(shape)!

    return card.x <= part.x && card.maxX >= part.maxX
  }

  const moveBy = (shape: TLShape, dx: number, dy: number) => {
    for (const each of [shape, ...partsOf(nameOf(shape)).map((part) => editor.getShape(id(part))!)]) {
      editor.updateShape({ id: each.id, type: each.type, x: each.x + dx, y: each.y + dy })
    }
  }

  const topLevel = () =>
    editor.getCurrentPageShapes().filter((shape) => shape.parentId === editor.getCurrentPageId() && !isPart(shape))

  const areas = () => topLevel().filter(isArea)

  const overlapsX = (a: TLShape, b: TLShape) => {
    const one = editor.getShapePageBounds(a)!
    const other = editor.getShapePageBounds(b)!

    return one.x < other.maxX && one.maxX > other.x
  }

  const within = (inner: Range, outer: Range) => outer.x <= inner.x + EDGE_TOLERANCE && outer.maxX >= inner.maxX - EDGE_TOLERANCE

  // The one definition of a column, for pushing and for resize: one area's left and right edges sit inside the other's
  const sameColumn = (a: Range, b: Range) => within(a, b) || within(b, a)

  // The innermost area whose bounds hold the whole shape. An area counts as inside another only strictly between its
  // left and right edges: the areas of one column share their width and are never nested
  const containerOf = (shape: TLShape) => {
    const inner = editor.getShapePageBounds(shape)!

    return areas()
      .filter((area) => area.id !== shape.id)
      .filter((area) => {
        const outer = editor.getShapePageBounds(area)!
        const holdsWidth = isArea(shape) ? outer.x < inner.x - 0.5 && outer.maxX > inner.maxX + 0.5 : within(inner, outer)

        return holdsWidth && outer.y <= inner.y + EDGE_TOLERANCE && outer.maxY >= inner.maxY - EDGE_TOLERANCE
      })
      .sort((a, b) => {
        const one = editor.getShapePageBounds(a)!
        const other = editor.getShapePageBounds(b)!

        return one.w - other.w || other.y - one.y
      })[0]
  }

  // `meta.area` records the area a shape belongs to: the area's name, or null for none
  const record = (shape: TLShape, area: TLShape | undefined) =>
    editor.updateShape({ id: shape.id, type: shape.type, meta: { area: area == null ? null : nameOf(area) } })

  // A new shape joins the area named with `into` at once. Without `into` it joins the area that holds it whole, which
  // `settle` reads once the helper has given the shape its height, and belongs to none until then
  const adopt = (name: string, into?: string) => record(editor.getShape(id(name))!, into == null ? undefined : editor.getShape(id(into)))

  const settle = (name: string, into?: string) => {
    const shape = editor.getShape(id(name))!

    if (into == null) {
      record(shape, containerOf(shape))
    }

    fitAreaOf(name)
  }

  // The area a shape, or a nested area, belongs to. The record wins. A shape without one, drawn by hand or before
  // shapes carried a record, belongs to the area that holds it now; so does a shape whose recorded area was deleted
  const areaOf = (shape: TLShape) => {
    const recorded = shape.meta.area as string | null | undefined

    if (recorded === null) {
      return undefined
    }

    const area = recorded == null ? undefined : editor.getShape(id(recorded))

    return area != null && isArea(area) && area.id !== shape.id ? area : containerOf(shape)
  }

  // `seen` stops at a loop, which a record and a hand-made resize can form between two areas
  const isInside = (area: TLShape, outer: TLShape, seen: Set<string> = new Set()): boolean => {
    const parent = areaOf(area)

    if (parent == null || seen.has(parent.id)) {
      return false
    }

    return parent.id === outer.id || isInside(parent, outer, seen.add(parent.id))
  }

  const nestedOf = (area: TLShape) => areas().filter((other) => other.id !== area.id && areaOf(other)?.id === area.id)

  // What moves with an area: its shapes, and each area nested in it with that area's own shapes
  const withContents = (area: TLShape, seen: Set<string> = new Set()): TLShape[] =>
    seen.has(area.id) ? [] : [area, ...contentsOf(area), ...nestedOf(area).flatMap((nested) => withContents(nested, seen.add(area.id)))]

  // An arrow bound to shapes follows them on its own, so it belongs to no area. Counted as content, an arrow that spans
  // rows would grow the area to the arrow's far end, which moves the rows below, which stretches the arrow, without end
  const isBoundArrow = (shape: TLShape) => shape.type === 'arrow' && editor.getBindingsFromShape(shape, 'arrow').length > 0

  const contentsOf = (area: TLShape) =>
    topLevel().filter((shape) => !isArea(shape) && !isBoundArrow(shape) && areaOf(shape)?.id === area.id)

  // The shapes that sit under a shape inside the same area and move when its height changes
  const under = (shape: TLShape, bottom: number) => {
    const owner = areaOf(shape)

    return topLevel()
      .filter((other) => other.id !== shape.id && !isArea(other) && !isBoundArrow(other) && overlapsX(other, shape))
      .filter((other) => editor.getShapePageBounds(other)!.y >= bottom - 1)
      .filter((other) => areaOf(other)?.id === owner?.id)
  }

  // The areas an area can push: those inside the same parent area, each with what moves with it, read before anything
  // moves. The areas past the parent move when the parent refits. `own` holds the grown area's contents, which can
  // already sit lower than the next area's top
  const pushable = (area: TLShape, own: Set<string>) => {
    const parent = areaOf(area)

    return areas()
      .filter((other) => other.id !== area.id && !own.has(other.id) && areaOf(other)?.id === parent?.id)
      .map((other) => ({ box: editor.getShapePageBounds(other)!, members: withContents(other).filter((inner) => !own.has(inner.id)) }))
      .sort((a, b) => a.box.y - b.box.y)
  }

  // An area that shrank by `dy` pulls up the area right under it in its column, by as much, when that area sits within
  // two gaps of it, and each pulled area pulls the next one the same way. A farther area stays: pulling it by the whole
  // shrink while a growth only pushes it by what its gap does not absorb would creep it up on every grow and shrink.
  // Moving an area moves its shapes and changes no area's height, so a pull never makes another area grow
  const pullAreas = (before: Range & { y: number; maxY: number }, dy: number, others: ReturnType<typeof pushable>) => {
    const settled = [{ box: before, shift: dy }]

    for (const { box, members } of others) {
      const above = settled.filter((each) => sameColumn(each.box, box) && box.y >= each.box.maxY - 1)
      const nearest = above.reduce<(typeof settled)[number] | undefined>((last, each) => (last == null || each.box.maxY > last.box.maxY ? each : last), undefined)
      const shift = nearest != null && nearest.shift < 0 && box.y - nearest.box.maxY <= 2 * AREA_GAP ? nearest.shift : 0

      settled.push({ box, shift })

      if (shift < 0) {
        for (const member of members) {
          moveBy(editor.getShape(member.id)!, 0, shift)
        }
      }
    }
  }

  // An area that grew by `dy` moves only the areas under it in its column, and each of those moves the areas under
  // itself the same way. An area moves by the part of the growth that the space above it, down to the gap between
  // areas, does not absorb. An area that shrank pulls the areas under it instead
  const pushAreas = (before: Range & { y: number; maxY: number }, dy: number, others: ReturnType<typeof pushable>) => {
    if (dy < 0) {
      pullAreas(before, dy, others)

      return
    }

    const settled = [{ box: before, shift: dy }]

    for (const { box, members } of others) {
      const above = settled.filter((each) => sameColumn(each.box, box) && box.y >= each.box.maxY - 1)
      const shift = Math.max(0, ...above.map((each) => Math.min(each.shift, each.box.maxY + each.shift + AREA_GAP - box.y)))

      settled.push({ box, shift })

      if (shift > 0) {
        for (const member of members) {
          moveBy(editor.getShape(member.id)!, 0, shift)
        }
      }
    }
  }

  // Every height change goes through here: what sits under the shape moves, and the area holding the shape grows or
  // shrinks to keep its margin. `before` is the shape's bounds from before the change, for a caller whose change
  // already made tldraw resize the shape, such as a card's new text
  const setHeight = (name: string, h: number, own: Set<string> = new Set(), before = bounds(name)) => {
    const shape = editor.getShape(id(name))!
    const owner = areaOf(shape)
    const siblings = owner == null || isArea(shape) ? undefined : [...contentsOf(owner), ...nestedOf(owner)]
    const moving = isArea(shape) ? [] : under(shape, before.maxY)
    const pushed = isArea(shape) ? pushable(shape, own) : []

    editor.updateShape({ id: shape.id, type: shape.type, props: { h, ...(shape.type === 'geo' ? { growY: 0 } : {}) } })

    const dy = bounds(name).maxY - before.maxY

    for (const other of moving) {
      moveBy(editor.getShape(other.id)!, 0, dy)
    }

    pushAreas(before, dy, pushed)

    if (owner != null) {
      fitAreaShape(owner, siblings)
    }

    return h
  }

  // `held` is the area's contents, collected before anything moved
  const fitAreaShape = (area: TLShape, held = [...contentsOf(area), ...nestedOf(area)]) => {
    const outer = editor.getShapePageBounds(area)!
    const bottoms = held.map((shape) => editor.getShapePageBounds(shape.id)!.maxY)

    if (bottoms.length > 0) {
      setHeight(nameOf(area), Math.max(...bottoms) - outer.y + AREA_PADDING, new Set(held.map((shape) => shape.id)))
    }
  }

  const fitAreaOf = (name: string) => {
    const owner = areaOf(editor.getShape(id(name))!)

    if (owner != null) {
      fitAreaShape(owner)
    }
  }

  const measure = async (name: string, selector: string) => {
    editor.zoomToBounds(bounds(name), { immediate: true, inset: 80 })
    await nextFrame()
    await nextFrame()

    return document.querySelector<HTMLElement>(`[data-shape-id="${id(name)}"] ${selector}`)
  }

  // tldraw measures a text, and a mockup draws its root, only once the shape is on screen, so fit zooms to it first
  const fitShape = async (name: string, before?: ReturnType<typeof bounds>) => {
    const shape = editor.getShape(id(name))!

    if (isArea(shape)) {
      fitAreaShape(shape)

      return bounds(name).h
    }

    // A mermaid shape draws its diagram at the shape's own size, so it takes the diagram's own size, one canvas unit per
    // diagram unit, read from the viewBox once the diagram has rendered
    if (shape.type === 'mock' && (shape.props as { kind: string }).kind === 'mermaid') {
      editor.zoomToBounds(bounds(name), { immediate: true, inset: 80 })

      for (let attempt = 0; attempt < 40; attempt++) {
        await nextFrame()

        const viewBox = document
          .querySelector(`[data-shape-id="${id(name)}"] svg[viewBox]`)
          ?.getAttribute('viewBox')
          ?.split(/[ ,]+/)
          .map(Number)

        if (viewBox != null && viewBox[2] > 0) {
          editor.updateShape({ id: shape.id, type: 'mock', props: { w: viewBox[2] } })

          return setHeight(name, viewBox[3])
        }
      }

      return null
    }

    if (shape.type === 'mock') {
      const { kind, w, data } = shape.props as { kind: string; w: number; data: Record<string, unknown> }
      const definition = definitionOf(kind)
      // A mockup whose views differ in width, such as the code snippet's split view, gives its width as a function of its props
      const width = typeof definition?.width === 'function' ? definition.width({ ...definition.defaults, ...data }) : definition?.width
      const root = await measure(name, '[data-root]')

      return root == null || width == null ? null : setHeight(name, (root.offsetHeight * w) / width)
    }

    if (shape.type === 'geo') {
      const label = await measure(name, '.tl-rich-text')

      if (label == null) {
        return null
      }

      const parts = partsOf(name).map((part) => bounds(part).maxY)
      const textHeight = label.getBoundingClientRect().height / editor.getZoomLevel() + 2 * CARD_PADDING
      const partsHeight = parts.length === 0 ? 0 : Math.max(...parts) - bounds(name).y + CARD_PADDING

      return setHeight(name, Math.max(textHeight, partsHeight), undefined, before)
    }

    fitAreaOf(name)

    return bounds(name).h
  }

  const fit = (name: string) => fitShape(name)

  // A wider area widens every area of its column and moves the columns to its right by as much
  const resize = (name: string, { h, w }: { h?: number; w?: number }) => {
    const shape = editor.getShape(id(name))!

    if (w != null && isArea(shape)) {
      const before = bounds(name)
      const dx = w - before.w

      // The column is the top-level areas of this area's column. Areas nested inside one keep their own width
      const column = areaOf(shape) == null ? areas().filter((other) => areaOf(other) == null && sameColumn(editor.getShapePageBounds(other)!, before)) : [shape]

      // What moves right: the shapes past the column's right edge, and those that start past the right edge of a
      // narrower column area they sit beside
      const columnMaxX = Math.max(...column.map((area) => editor.getShapePageBounds(area)!.maxX))
      const right = topLevel().filter((other) => {
        const box = editor.getShapePageBounds(other)!

        if (column.some((area) => area.id === other.id)) {
          return false
        }

        return (
          box.x >= columnMaxX - 1 ||
          column.some((area) => {
            const edge = editor.getShapePageBounds(area)!

            return box.x >= edge.maxX - 1 && box.y < edge.maxY && box.maxY > edge.y
          })
        )
      })

      // Each shape moves by the growth of the column area it sits beside, so a shape beside a narrower area clears that
      // area's new right edge; a shape beside none moves by the resized area's growth
      const shifts = right.map((other) => {
        const box = editor.getShapePageBounds(other)!
        const beside = column
          .map((area) => editor.getShapePageBounds(area)!)
          .filter((edge) => box.x >= edge.maxX - 1 && box.y < edge.maxY && box.maxY > edge.y)

        return { other, shift: beside.length === 0 ? dx : Math.max(...beside.map((edge) => w - edge.w)) }
      })

      for (const area of column) {
        editor.updateShape({ id: area.id, type: 'mock', props: { w } })
      }

      for (const { other, shift } of shifts) {
        moveBy(editor.getShape(other.id)!, shift, 0)
      }
    } else if (w != null) {
      editor.updateShape({ id: shape.id, type: shape.type, props: { w } })
    }

    if (h != null) {
      setHeight(name, h)
    }
  }

  // Only one area is focused at a time, so focusing one clears every other
  const unfocusOthers = (keep?: TLShapeId) => {
    for (const each of editor.getCurrentPageShapes().filter(isArea)) {
      if (each.id === keep) continue

      const { data } = each.props as { data: Record<string, unknown> }

      if (data.isFocus === true) {
        editor.updateShape({ id: each.id, type: 'mock', props: { data: { ...data, isFocus: false } } })
      }
    }
  }

  // Called with a name that exists, area replaces the label, such as a branch's status, and takes the focus when asked.
  // The new data merges over the old, so a relabel keeps the focus
  const area = (name: string, { x, y, w, h, label, focus, into }: Partial<Place> & Into & { h?: number; label: string; focus?: boolean }, pause?: number) =>
    exists(name)
      ? step(
          id(name),
          () => {
            const { data } = editor.getShape(id(name))!.props as { data: Record<string, unknown> }

            editor.updateShape({
              id: id(name),
              type: 'mock',
              props: { data: { ...data, label, ...(focus == null ? {} : { isFocus: focus }) } },
            })

            if (focus) {
              unfocusOthers(id(name))
            }
          },
          pause,
        )
      : createArea(name, { x: x!, y: y!, w: w!, h: h!, label, isFocus: focus === true, into }, pause)

  const createArea = (name: string, { x, y, w, h, label, isFocus, into }: Place & Into & { h: number; label: string; isFocus: boolean }, pause?: number) =>
    step(
      centreOf({ x, y, w }, h),
      () => {
        editor.createShape({ id: id(name), type: 'mock', x, y, props: { w, h, kind: 'area', data: { label, isFocus } } })
        editor.sendToBack([id(name)])

        if (isFocus) {
          unfocusOthers(id(name))
        }

        adopt(name, into)
        settle(name, into)
      },
      pause,
    )

  // Marks the area the drawing is happening in: one area keeps the focus, and `null` hands it back to none
  const focus = (name: string | null, pause?: number) =>
    step(
      name == null ? null : id(name),
      () => {
        if (name != null) {
          const { data } = editor.getShape(id(name))!.props as { data: Record<string, unknown> }

          editor.updateShape({ id: id(name), type: 'mock', props: { data: { ...data, isFocus: true } } })
        }

        unfocusOthers(name == null ? undefined : id(name))
      },
      pause,
    )

  // Called with a name that exists, text, card and note replace that shape's text instead of creating a new one
  const update = (name: string, { x, y, w, text }: Partial<Place> & { text: string }) => {
    const shape = editor.getShape(id(name))!

    editor.updateShape({
      id: shape.id,
      type: shape.type,
      ...(x != null ? { x } : {}),
      ...(y != null ? { y } : {}),
      props: { richText: toRichText(text), ...(w != null ? { w } : {}) },
    })
  }

  const create = (name: string, into: string | undefined, shape: Omit<TLCreateShapePartial, 'id'>) => {
    editor.createShape({ ...shape, id: id(name) } as TLCreateShapePartial)
    adopt(name, into)
  }

  const text = async (name: string, options: TextOptions, pause?: number) => {
    const { x, y, w, text, mono = false, size = 's', into } = placed(options)
    const isNew = !exists(name)
    // tldraw sets a text's height from its content as soon as the text changes, so the shapes under it are read, and
    // the height it had, before the change. A text moved to a new place leaves the shapes under its old place alone
    const isEditedInPlace = !isNew && x == null && y == null
    const before = isEditedInPlace ? bounds(name) : undefined
    const moving = isEditedInPlace ? under(editor.getShape(id(name))!, before!.maxY) : []

    await step(
      exists(name) ? id(name) : { x: x!, y: y! },
      () =>
        exists(name)
          ? update(name, { x, y, w, text })
          : create(name, into, {
              type: 'text',
              x,
              y,
              props: { richText: toRichText(text), size, color: 'black', font: mono ? 'mono' : 'draw', textAlign: 'start', autoSize: false, w },
            }),
      pause,
    )

    if (isNew) {
      settle(name, into)
    }

    if (before != null) {
      const dy = bounds(name).maxY - before.maxY

      for (const other of moving) {
        moveBy(editor.getShape(other.id)!, 0, dy)
      }
    }

    return fit(name)
  }

  const createCard = (name: string, { x, y, w, text, color = 'violet', dash = 'solid', fill = 'semi', mono = false }: CardOptions) =>
    editor.createShape({
      id: id(name),
      type: 'geo',
      x,
      y,
      props: {
        geo: 'rectangle',
        w,
        h: 100,
        growY: 0,
        color,
        dash,
        fill,
        richText: toRichText(text),
        size: 's',
        font: mono ? 'mono' : 'draw',
        align: 'start',
        verticalAlign: 'start',
      },
    })

  const card = async (name: string, given: CardOptions, pause?: number) => {
    const options = placed(given)
    const { x, y, w, text, into } = options
    // tldraw grows a card as soon as its text changes, so the height the card had is read first
    const before = exists(name) ? bounds(name) : undefined

    await step(
      exists(name) ? id(name) : centreOf({ x: x!, y: y!, w: w! }, 100),
      () => {
        if (exists(name)) {
          update(name, { x, y, w, text })
        } else {
          createCard(name, options)
          adopt(name, into)
        }
      },
      pause,
    )

    const h = await fitShape(name, before)

    if (before == null) {
      settle(name, into)
    }

    return h
  }

  const note = (name: string, { text, ...place }: Partial<Place> & Into & Below & { text: string }, pause?: number) =>
    card(name, { ...place, text: `${NOTE_LABEL}${text}`, color: 'grey', dash: 'dashed', fill: 'none' }, pause)

  const NOTE_PREFIX = /^Agent\n+/

  // With `body: true`, an Agent note's text comes back without its label, ready to pass to `note` again
  const plain = (name: string, { body = false }: { body?: boolean } = {}) => {
    const shape = editor.getShape(id(name))!
    const value = editor.getShapeUtil(shape).getText(shape) ?? ''

    return body ? value.replace(NOTE_PREFIX, '') : value
  }

  const isBox = (shape: TLShape) => shape.type === 'geo' && (shape.props as { align?: string }).align === 'middle'

  // Writes a whole new text into any shape that holds one, through the helper that keeps the layout for its kind: a text
  // or a card moves the shapes under it when its height changes, a box keeps its size
  const setText = async (name: string, value: string, pause?: number) => {
    const shape = editor.getShape(id(name))!

    if (shape.type === 'text') {
      return text(name, { text: value }, pause)
    }

    if (shape.type === 'geo' && !isBox(shape)) {
      return card(name, { text: value }, pause)
    }

    return step(id(name), () => editor.updateShape({ id: shape.id, type: shape.type, props: { richText: toRichText(value) } }), pause)
  }

  const replaceIn = (value: string, pairs: [from: string, to: string][], all: boolean) =>
    pairs.reduce((result, [from, to]) => (all ? result.split(from).join(to) : result.replace(from, () => to)), value)

  // Every `from` must be found before anything changes, so a stale pair never leaves the text half edited
  const edit = async (name: string, pairs: [from: string, to: string][], { all = false }: { all?: boolean } = {}, pause?: number) => {
    const value = plain(name)
    const missing = pairs.filter(([from]) => !value.includes(from)).map(([from]) => from)

    if (missing.length > 0) {
      throw new Error(`edit(${name}): not found: ${missing.map((from) => JSON.stringify(from)).join(', ')}`)
    }

    return setText(name, replaceIn(value, pairs, all), pause)
  }

  // A sticky note is the user's message, so the writing pass leaves it as the user wrote it
  const hasText = (shape: TLShape) => shape.type !== 'note' && (shape.props as { richText?: unknown }).richText != null

  // Find-and-replace over the canvas texts and arrow labels, for the writing pass: a pair with `shape` changes that
  // shape only, a pair without it every shape holding `from`. Returns the pairs found nowhere
  const applyTexts = async (pairs: TextPair[]) => {
    const missing: TextPair[] = []

    for (const pair of pairs) {
      const targets = pair.shape == null
        ? editor.getCurrentPageShapes().filter((shape) => hasText(shape) && plain(shape.id).includes(pair.from))
        : [editor.getShape(id(pair.shape))].filter((shape): shape is TLShape => shape != null && plain(shape.id).includes(pair.from))

      if (targets.length === 0) {
        missing.push(pair)

        continue
      }

      for (const target of targets) {
        await setText(target.id, replaceIn(plain(target.id), [[pair.from, pair.to]], true), 0)
      }
    }

    return missing
  }

  // The shapes under the removed one move up until the first of them takes its place, so the gap that stood above the
  // removed shape stays and the one it filled closes. Arrows bound to the shape or to its follow-up parts would stay
  // where they were drawn, so they go with it
  const remove = (name: string, pause?: number) =>
    step(
      id(name),
      () => {
        const shape = editor.getShape(id(name))!

        // A sticky note is the user's message laid over the drawing, so removing it moves nothing and fits no area
        if (shape.type === 'note') {
          const arrows = editor.getBindingsToShape(shape, 'arrow').map((binding) => binding.fromId)

          editor.deleteShapes([shape.id, ...arrows])

          return
        }

        const before = bounds(name)
        const owner = areaOf(shape)
        const moving = under(shape, before.maxY)
        const removed = [name, ...partsOf(name)].map((each) => id(each))
        const arrows = topLevel().filter(
          (other) => other.type === 'arrow' && editor.getBindingsFromShape(other, 'arrow').some((binding) => removed.includes(binding.toId)),
        )

        editor.deleteShapes([...removed, ...arrows.map((arrow) => arrow.id)])

        if (moving.length > 0) {
          const dy = Math.min(...moving.map((other) => editor.getShapePageBounds(other)!.y)) - before.y

          for (const other of moving) {
            moveBy(editor.getShape(other.id)!, 0, -dy)
          }
        }

        if (owner != null) {
          fitAreaShape(owner)
        }
      },
      pause,
    )

  // A card's follow-up sits inside the card, under the card's own text: a summary box, an Agent note and, when there
  // is one, the next question as a card of its own; the card grows to hold them, which moves what is under it
  const followUp = async (name: string, { summary, note: noteText, question }: FollowUpOptions) => {
    editor.deleteShapes(partsOf(name).map((part) => id(part)))

    const textHeight = (await fit(name)) ?? bounds(name).h
    const outer = bounds(name)
    const x = outer.x + CARD_PADDING
    const w = outer.w - 2 * CARD_PADDING
    const parts = [
      { part: 'summary', text: summary, color: 'grey' as const, dash: 'solid' as const, fill: 'solid' as const },
      { part: 'note', text: `${NOTE_LABEL}${noteText}`, color: 'grey' as const, dash: 'dashed' as const, fill: 'none' as const },
      ...(question == null ? [] : [{ part: 'question', text: question, color: 'violet' as const, dash: 'solid' as const, fill: 'semi' as const }]),
    ]
    let y = outer.y + textHeight

    // The parts are measured and placed directly: fitting each one would move the shapes under the card once per part
    for (const { part, ...style } of parts) {
      await step({ x: x + w / 2, y: y + 50 }, () => createCard(`${name}-${part}`, { x, y, w, ...style }))

      const label = await measure(`${name}-${part}`, '.tl-rich-text')
      const h = label == null ? 100 : label.getBoundingClientRect().height / editor.getZoomLevel() + 2 * CARD_PADDING

      editor.updateShape({ id: id(`${name}-${part}`), type: 'geo', props: { h, growY: 0 } })
      y += h + GAP
    }

    return fit(name)
  }

  // A diagram node keeps the size it is given, unlike a card, which fits its height to its text
  const box = (name: string, options: BoxOptions, pause?: number) => {
    const { x, y, w, h, text, geo = 'rectangle', color = 'black', fill = 'semi', dash = 'draw', into } = placed(options)

    return step(
      exists(name) ? id(name) : centreOf({ x: x!, y: y!, w: w! }, h),
      () => {
        if (exists(name)) {
          editor.updateShape({ id: id(name), type: 'geo', props: { richText: toRichText(text) } })

          return
        }

        create(name, into, {
          type: 'geo',
          x,
          y,
          props: { geo, w, h, growY: 0, color, fill, dash, size: 's', font: 'draw', align: 'middle', verticalAlign: 'middle', richText: toRichText(text) },
        })
        settle(name, into)
      },
      pause,
    )
  }

  // Bound to the centres of both shapes, so the arrow follows either one when it moves. Called with a name that exists,
  // it changes only the options given
  const arrow = (name: string, from: string, to: string, options: ArrowOptions = {}, pause?: number) =>
    step(
      bounds(to).center,
      () => {
        const { text, ...style } = options
        const given = Object.fromEntries(Object.entries(style).filter(([, value]) => value != null))

        if (exists(name)) {
          editor.updateShape({ id: id(name), type: 'arrow', props: { ...given, ...(text != null ? { richText: toRichText(text) } : {}) } })

          return
        }

        const start = bounds(from).center
        const end = bounds(to).center

        editor.createShape({
          id: id(name),
          type: 'arrow',
          x: start.x,
          y: start.y,
          props: {
            start: { x: 0, y: 0 },
            end: { x: end.x - start.x, y: end.y - start.y },
            color: 'black',
            bend: 0,
            labelPosition: 0.5,
            dash: 'draw',
            ...given,
            size: 's',
            font: 'draw',
            richText: toRichText(text ?? ''),
          },
        })

        const bind = (target: string, terminal: 'start' | 'end') => ({
          type: 'arrow' as const,
          fromId: id(name),
          toId: id(target),
          props: { terminal, normalizedAnchor: { x: 0.5, y: 0.5 }, isExact: false, isPrecise: false },
        })

        editor.createBindings([bind(from, 'start'), bind(to, 'end')])
      },
      pause,
    )

  const mermaid = async (name: string, options: Partial<Place> & Into & Below & { source: string }, pause?: number) => {
    const { x, y, source, into } = placed(options)
    const isNew = !exists(name)

    await step(
      exists(name) ? id(name) : { x: x!, y: y! },
      () =>
        exists(name)
          ? editor.updateShape({ id: id(name), type: 'mock', props: { data: { source } } })
          : create(name, into, { type: 'mock', x, y, props: { w: 800, h: 200, kind: 'mermaid', data: { source } } }),
      pause,
    )

    const h = await fit(name)

    if (isNew) {
      settle(name, into)
    }

    return h
  }

  // Every move goes through here: a card's parts and an area's contents travel with the shape, and the area it leaves
  // and the area it lands in fit their height again. The shape joins the area that holds it where it lands and belongs
  // to none when it lands clear of every area; landing across an area's edge, it stays in the area it had
  const move = async (name: string, { x, y }: { x?: number; y?: number }, pause?: number) => {
    const shape = editor.getShape(id(name))!
    const dx = x == null ? 0 : x - shape.x
    const dy = y == null ? 0 : y - shape.y
    const left = areaOf(shape)

    await step(id(name), () => {
      for (const each of isArea(shape) ? withContents(shape) : [shape]) {
        moveBy(editor.getShape(each.id)!, dx, dy)
      }
    }, pause)

    const moved = editor.getShape(id(name))!
    const holder = containerOf(moved)
    const box = bounds(name)

    if (holder != null || !areas().some((other) => other.id !== moved.id && !isInside(other, moved) && box.collides(editor.getShapePageBounds(other)!))) {
      record(moved, holder)
    }

    const entered = areaOf(editor.getShape(id(name))!)

    for (const owner of new Set([left?.id, entered?.id])) {
      if (owner != null) {
        fitAreaShape(editor.getShape(owner)!)
      }
    }
  }

  // The shapes join the area, which grows to hold them before they move; the areas that held them before fit their
  // height again
  const flow = async (areaName: string, names: string[], { top, gap = FLOW_GAP }: { top?: number; gap?: number } = {}) => {
    const outer = bounds(areaName)
    const start = top ?? outer.y + LABEL_SPACE
    const shapes = names.filter(exists)
    const previous = new Set(shapes.map((name) => areaOf(editor.getShape(id(name))!)?.id).filter((owner) => owner != null && owner !== id(areaName)))
    const stacked = shapes.reduce((sum, name) => sum + bounds(name).h + gap, 0) - gap
    const others = contentsOf(editor.getShape(id(areaName))!).filter((shape) => !shapes.includes(nameOf(shape)))
    const lowest = Math.max(start + stacked, ...others.map((shape) => editor.getShapePageBounds(shape)!.maxY))

    if (lowest + AREA_PADDING > outer.maxY) {
      setHeight(areaName, lowest + AREA_PADDING - outer.y)
    }

    let y = start

    for (const name of shapes) {
      const shape = editor.getShape(id(name))!

      record(shape, editor.getShape(id(areaName)))
      moveBy(shape, 0, y - shape.y)
      y += bounds(name).h + gap
    }

    for (const owner of previous) {
      fitAreaShape(editor.getShape(owner!)!)
    }

    fitAreaShape(editor.getShape(id(areaName))!)
  }

  // Called with a name that exists, mock replaces the shape's data and fits its height again
  const mock = async (name: string, options: MockOptions, pause?: number) => {
    const { x, y, w = MOCK_WIDTH, kind, data, into } = placed(options)
    const isNew = !exists(name)

    await step(
      exists(name) ? id(name) : centreOf({ x: x!, y: y!, w }, 120),
      () =>
        exists(name)
          ? editor.updateShape({ id: id(name), type: 'mock', props: { data } })
          : create(name, into, { type: 'mock', x, y, props: { w, h: 120, kind, data } }),
      pause,
    )

    const h = await fit(name)

    if (isNew) {
      settle(name, into)
    }

    return h
  }

  // Pads every column to its widest cell so the `|` separators line up in the monospace font
  const tableText = (columns: string[], rows: string[][]) => {
    const widths = columns.map((column, index) => Math.max(column.length, ...rows.map((row) => (row[index] ?? '').length)))
    const line = (cells: string[]) => widths.map((width, index) => (cells[index] ?? '').padEnd(width)).join(' | ').trimEnd()

    return [line(columns), widths.map((width) => '-'.repeat(width)).join('-|-'), ...rows.map(line)].join('\n')
  }

  // Without `w` the text is as wide as its longest line, since a wrapped line breaks the columns
  const table = (name: string, { columns, rows, w, ...place }: TableOptions, pause?: number) => {
    const value = tableText(columns, rows)
    const longest = Math.max(...value.split('\n').map((line) => line.length))

    return text(name, { ...place, w: w ?? Math.ceil(longest * MONO_CHAR_WIDTH + MONO_PADDING), text: value, mono: true }, pause)
  }

  // A tree branch as the with-canvas skills lay it out: the area labelled with its title and status, the leaves in
  // monospace on the left, the prose on the right, and the Agent note under whatever sits under the prose. Called again,
  // it rewrites each part in place, so the questions and the note under the prose move with its height
  const branch = async (name: string, { x, y, w, title, status, leaves, prose, note: noteText, into }: BranchOptions, pause?: number) => {
    const label = `${title} · ${status}`
    const leavesName = `${name}-leaves`
    const proseName = `${name}-prose`
    const noteName = `${name}-agent`

    if (!exists(name)) {
      const width = w ?? AREA_PADDING + BRANCH_LEAVES_WIDTH + AREA_PADDING + BRANCH_PROSE_WIDTH + AREA_PADDING

      await area(name, { x: x!, y: y!, w: width, h: 200, label, into }, pause)

      const outer = bounds(name)

      await text(leavesName, { x: outer.x + AREA_PADDING, y: outer.y + BRANCH_TOP, w: BRANCH_LEAVES_WIDTH, text: leaves, mono: true, into: name }, pause)
      await text(proseName, { x: outer.x + 2 * AREA_PADDING + BRANCH_LEAVES_WIDTH, y: outer.y + BRANCH_TOP, w: BRANCH_PROSE_WIDTH, text: prose, into: name }, pause)
    } else {
      await area(name, { label }, pause)

      if (plain(leavesName) !== leaves) {
        await text(leavesName, { text: leaves }, pause)
      }

      if (plain(proseName) !== prose) {
        await text(proseName, { text: prose }, pause)
      }
    }

    if (noteText === null && exists(noteName)) {
      await remove(noteName, pause)
    } else if (noteText != null && exists(noteName)) {
      await note(noteName, { text: noteText }, pause)
    } else if (noteText != null) {
      const column = bounds(proseName)
      const lowest = Math.max(
        column.maxY,
        ...contentsOf(editor.getShape(id(name))!)
          .map((shape) => editor.getShapePageBounds(shape)!)
          .filter((box) => box.x < column.maxX && box.maxX > column.x)
          .map((box) => box.maxY),
      )

      await note(noteName, { x: column.x, y: lowest + BELOW_GAP, w: BRANCH_PROSE_WIDTH, text: noteText, into: name }, pause)
    }

    return bounds(name)
  }

  // One test branch drawn whole in one batch: stepping through every box, line and dot would make the user wait for a
  // drawing they read only once it is finished. A branch drawn again gets fresh ids, since a deleted id cannot be reused
  const classificationTree = (name: string, spec: TreeSpec, { x, y }: { x?: number; y?: number } = {}) => {
    const version = exists(name) ? ((editor.getShape(id(name))!.meta.treeVersion as number) ?? 0) + 1 : 0
    const prefix = `${name}~${version}-`
    const drawn: string[] = []

    if (exists(name)) {
      editor.deleteShapes(topLevel().filter((shape) => shape.id.startsWith(`shape:${name}~${version - 1}-`)).map((shape) => shape.id))
      editor.updateShape({ id: id(name), type: 'mock', props: { data: { label: spec.label } } })
    } else {
      editor.createShape({ id: id(name), type: 'mock', x, y, meta: { area: null }, props: { w: 1000, h: 400, kind: 'area', data: { label: spec.label } } })
      editor.sendToBack([id(name)])
    }

    editor.updateShape({ id: id(name), type: 'mock', meta: { treeVersion: version } })

    const outer = bounds(name)
    const partitions = spec.classifications.flatMap(({ partitions }, index) => partitions.map(([key]) => `${index}:${key}`))
    const left = outer.x + AREA_PADDING
    const middle = left + ROW_TEXT_WIDTH + AREA_PADDING
    const middleWidth = Math.max(partitions.length * (PARTITION_WIDTH + GAP) - GAP, PARTITION_WIDTH)
    const right = middle + middleWidth + AREA_PADDING
    const column: Record<string, number> = {}

    const shape = (part: string, props: object, type = 'geo', at: VecLike = { x: 0, y: 0 }) => {
      editor.createShape({ id: id(`${prefix}${part}`), type, x: at.x, y: at.y, props, meta: { area: name } })
      drawn.push(`${prefix}${part}`)

      return bounds(`${prefix}${part}`)
    }

    const label = (part: string, at: VecLike, w: number, text: string, color: TLDefaultColorStyle, textAlign: 'start' | 'middle' = 'start') =>
      shape(part, { richText: toRichText(text), w, autoSize: false, size: 's', font: 'draw', color, textAlign }, 'text', at)

    const node = (part: string, at: VecLike, w: number, h: number, text: string, color: TLDefaultColorStyle) =>
      shape(part, { geo: 'rectangle', w, h, growY: 0, color, fill: 'semi', dash: 'draw', size: 's', font: 'draw', align: 'middle', verticalAlign: 'middle', richText: toRichText(text) }, 'geo', at)

    const join = (part: string, from: string, to: string) => {
      const start = bounds(`${prefix}${from}`)
      const end = bounds(`${prefix}${to}`)

      shape(part, { start: { x: 0, y: 0 }, end: { x: end.center.x - start.center.x, y: end.y - start.maxY }, arrowheadStart: 'none', arrowheadEnd: 'none', color: 'grey', size: 's' }, 'arrow', { x: start.center.x, y: start.maxY })

      const bind = (to: string, terminal: 'start' | 'end') => ({ type: 'arrow', fromId: id(`${prefix}${part}`), toId: id(`${prefix}${to}`), props: { terminal, normalizedAnchor: { x: 0.5, y: 0.5 }, isExact: false, isPrecise: false } })

      editor.createBindings([bind(from, 'start'), bind(to, 'end')])
    }

    const dotted = (part: string, from: VecLike, to: VecLike) =>
      shape(part, { dash: 'dotted', color: 'grey', size: 's', points: { a1: { id: 'a1', index: 'a1', x: 0, y: 0 }, a2: { id: 'a2', index: 'a2', x: to.x - from.x, y: to.y - from.y } } }, 'line', from)

    let top = outer.y + LABEL_SPACE

    node('root', { x: middle, y: top }, middleWidth, 110, spec.root, 'blue')
    top += 110 + LABEL_SPACE

    if (partitions.length > 0) {
      let px = middle

      spec.classifications.forEach(({ name: classification, partitions: parts }, index) => {
        const width = parts.length * (PARTITION_WIDTH + GAP) - GAP

        node(`c${index}`, { x: px, y: top }, width, 60, classification, 'violet')
        join(`c${index}-line`, 'root', `c${index}`)

        parts.forEach(([key, text], position) => {
          const at = { x: px + position * (PARTITION_WIDTH + GAP), y: top + 110 }

          node(`p${index}-${key}`, at, PARTITION_WIDTH, 70, text, 'green')
          join(`p${index}-${key}-line`, `c${index}`, `p${index}-${key}`)
          column[`${index}:${key}`] = at.x + PARTITION_WIDTH / 2
        })

        px += width + GAP
      })

      top += 220
    }

    const summaryLeft = left + STAR_WIDTH
    const summaryWidth = ROW_TEXT_WIDTH - STAR_WIDTH

    label('head-star', { x: left, y: top }, STAR_WIDTH - 6, '★', 'grey', 'middle')
    label('head-left', { x: summaryLeft, y: top }, summaryWidth, 'row · what the test does', 'grey')
    label('head-right', { x: right, y: top }, OUTCOME_WIDTH, 'expected · kind · setup', 'grey')
    top += 50

    const matrixTop = top

    spec.rows.forEach((row, index) => {
      const color = row.manual ? 'orange' : 'black'

      if (row.isNew) {
        label(`r${index}-star`, { x: left, y: top }, STAR_WIDTH - 6, '★', color, 'middle')
      }

      const summary = label(`r${index}-left`, { x: summaryLeft, y: top }, summaryWidth, `${row.id} · ${row.summary}`, color)
      const outcome = label(`r${index}-right`, { x: right, y: top }, OUTCOME_WIDTH, [row.expected, row.kind, row.setup].filter((part) => part != null).join(' · '), color)
      const h = Math.max(summary.h, outcome.h)

      row.picks.forEach((key, classification) => {
        const cx = key == null ? undefined : column[`${classification}:${key}`]

        if (cx != null) {
          shape(`r${index}-dot${classification}`, { geo: 'ellipse', w: 18, h: 18, growY: 0, color, fill: 'solid', dash: 'solid', size: 's', richText: toRichText('') }, 'geo', { x: cx - 9, y: top + Math.min(h, 40) / 2 - 5 })
        }
      })

      top += h + GAP
      dotted(`r${index}-rule`, { x: left, y: top - GAP / 2 }, { x: right + OUTCOME_WIDTH, y: top - GAP / 2 })
    })

    dotted('v-star', { x: summaryLeft - 4, y: matrixTop - 10 }, { x: summaryLeft - 4, y: top - GAP / 2 })
    Object.values(column).forEach((cx, index) => dotted(`v${index}`, { x: cx, y: matrixTop - 10 }, { x: cx, y: top - GAP / 2 }))
    top += GAP

    for (const [index, reason] of (spec.dropped ?? []).entries()) {
      top += label(`dropped${index}`, { x: left, y: top }, right + OUTCOME_WIDTH - left, `Dropped: ${reason}`, 'grey').h + 8
    }

    for (const [index, entry] of (spec.deleted ?? []).entries()) {
      top += label(`deleted${index}`, { x: left, y: top }, right + OUTCOME_WIDTH - left, `Deleted: ${entry}`, 'grey').h + 8
    }

    if (spec.note != null) {
      top += label('note', { x: left, y: top }, right + OUTCOME_WIDTH - left, spec.note, 'grey').h + 8
    }

    editor.updateShape({ id: id(name), type: 'mock', props: { w: right + OUTCOME_WIDTH + AREA_PADDING - outer.x } })
    setHeight(name, top - outer.y + AREA_PADDING, new Set(drawn.map(id)))

    if (version === 0) {
      settle(name)
    }

    return bounds(name)
  }


  // One flow of a test design: its parts in call order, each part's variables as cards under it. A store is measured
  // from its own data-root, so a card under it never covers its title or caption
  const partsDrawing = async (name: string, { x, y, label, parts, arrows, into }: PartsSpec) => {
    const place = exists(name) ? bounds(name) : { x: x!, y: y! }

    await area(name, { x: place.x, y: place.y, w: parts.length * (PART_WIDTH + PART_GAP) - PART_GAP + 120, h: 400, label, into })

    for (const [index, part] of parts.entries()) {
      const px = place.x + 60 + index * (PART_WIDTH + PART_GAP)
      const py = place.y + 80
      const varied = (part.cards ?? []).some((partCard) => partCard.tone === 'varied')

      if (part.kind === 'store') {
        await mock(part.name, { x: px, y: py, w: PART_WIDTH, kind: 'cylinder', data: { title: part.title, caption: part.caption ?? '' }, into: name }, 0)
      } else {
        const geo = part.kind === 'external' ? 'cloud' : part.kind === 'actor' ? 'ellipse' : 'rectangle'
        const color = part.color ?? (part.kind === 'code' ? (varied ? 'orange' : 'green') : 'grey')

        await box(part.name, { x: px, y: py, w: PART_WIDTH, h: 120, geo, color, text: part.title, into: name }, 0)
      }

      let cy = bounds(part.name).y + bounds(part.name).h + 30

      for (const partCard of part.cards ?? []) {
        await card(partCard.name, { x: px, y: cy, w: PART_WIDTH, color: TONES[partCard.tone], text: `${partCard.category}\n${partCard.text}`, into: name }, 0)
        cy = bounds(partCard.name).y + bounds(partCard.name).h + 30
      }
    }

    for (const [from, to, text, options] of arrows) {
      await arrow(`${name}-${from}-${to}`, from, to, { text, ...options }, 0)
    }

    await fit(name)
  }

  return {
    id,
    bounds,
    plain,
    edit,
    applyTexts,
    area,
    focus,
    text,
    card,
    note,
    followUp,
    fit,
    resize,
    box,
    arrow,
    mermaid,
    mock,
    move,
    flow,
    remove,
    table,
    branch,
    classificationTree,
    partsDrawing,
  }
}
