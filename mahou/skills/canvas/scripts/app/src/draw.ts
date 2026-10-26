import { createShapeId, toRichText, type Editor, type TLDefaultColorStyle, type TLShape, type TLShapeId, type VecLike } from 'tldraw'
import { definitionOf } from './MockShape'
import { stepOf } from './step'

type Place = { x: number; y: number; w: number }

type Into = { into?: string }

type TextOptions = Partial<Place> & Into & { text: string; mono?: boolean; size?: 's' | 'm' | 'l' }

type CardOptions = Partial<Place> & Into & {
  text: string
  color?: TLDefaultColorStyle
  dash?: 'solid' | 'dashed'
  fill?: 'none' | 'semi' | 'solid'
  mono?: boolean
}

type FollowUpOptions = { summary: string; note: string; question?: string }

type BoxOptions = Place & Into & {
  h: number
  text: string
  geo?: 'rectangle' | 'ellipse' | 'cloud'
  color?: TLDefaultColorStyle
  fill?: 'none' | 'semi' | 'solid'
  dash?: 'draw' | 'solid' | 'dashed'
}

type MockOptions = Partial<Place> & Into & { kind: string; data: Record<string, unknown> }

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

const CARD_PADDING = 20
const GAP = 20
const AREA_PADDING = 40
const AREA_GAP = 60
const NOTE_LABEL = 'Agent\n\n'
const LABEL_SPACE = 60
const FLOW_GAP = 30
const MOCK_WIDTH = 520
const PARTITION_WIDTH = 170
const STAR_WIDTH = 38
const ROW_TEXT_WIDTH = 620
const OUTCOME_WIDTH = 760

const nextFrame = () => new Promise((done) => requestAnimationFrame(() => done(null)))

export const drawOf = (editor: Editor) => {
  const step = stepOf(editor)

  const id = (name: string) => createShapeId(name)

  const bounds = (name: string) => editor.getShapePageBounds(id(name))!

  const exists = (name: string) => editor.getShape(id(name)) != null

  const centreOf = ({ x, y, w }: Place, h: number): VecLike => ({ x: x + w / 2, y: y + h / 2 })

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

  const overlapsX = (a: TLShape, b: TLShape) => {
    const one = editor.getShapePageBounds(a)!
    const other = editor.getShapePageBounds(b)!

    return one.x < other.maxX && one.maxX > other.x
  }

  const encloses = (outer: TLShape, inner: TLShape) => {
    const one = editor.getShapePageBounds(outer)!
    const other = editor.getShapePageBounds(inner)!

    return one.x <= other.x && one.maxX >= other.maxX && one.y <= other.y && one.maxY >= other.maxY
  }

  // An area strictly inside another's left and right edges belongs to that area even when the inner area starts below
  // the outer area's bottom edge. The areas of one column share their width, so only a nested area is narrower than
  // the area above it
  const parentOf = (area: TLShape) => {
    const inner = editor.getShapePageBounds(area)!

    return topLevel()
      .filter((other) => isArea(other) && other.id !== area.id)
      .filter((other) => {
        const outer = editor.getShapePageBounds(other)!

        return outer.x < inner.x - 0.5 && outer.maxX > inner.maxX + 0.5 && outer.y <= inner.y + 1
      })
      .sort((a, b) => editor.getShapePageBounds(b)!.y - editor.getShapePageBounds(a)!.y)[0]
  }

  const isInside = (area: TLShape, outer: TLShape): boolean => {
    const parent = parentOf(area)

    return parent != null && (parent.id === outer.id || isInside(parent, outer))
  }

  const nestedOf = (area: TLShape) => topLevel().filter((other) => isArea(other) && parentOf(other)?.id === area.id)

  // What moves with an area: its shapes, and each area nested in it with that area's own shapes
  const withContents = (area: TLShape): TLShape[] => [area, ...contentsOf(area), ...nestedOf(area).flatMap(withContents)]

  // A shape belongs to the innermost area that holds its top edge. When none holds it, it belongs to the lowest area of
  // its column whose top edge is above it, so a shape placed under an area that has not grown yet still belongs to that
  // area; an area nested inside another is left out there, or a shape placed under a nested area would grow it
  const ownerOf = (shape: TLShape) => {
    const top = editor.getShapePageBounds(shape)!

    const above = topLevel()
      .filter((area) => isArea(area) && area.id !== shape.id && overlapsX(area, shape))
      .filter((area) => editor.getShapePageBounds(area)!.y <= top.y + 1)

    const holding = above.filter((area) => editor.getShapePageBounds(area)!.maxY >= top.y)

    const candidates =
      holding.length > 0
        ? holding
        : above.filter((area) => !above.some((other) => other.id !== area.id && encloses(other, area)))

    return candidates.sort((a, b) => editor.getShapePageBounds(b)!.y - editor.getShapePageBounds(a)!.y)[0]
  }

  const contentsOf = (area: TLShape) => topLevel().filter((shape) => !isArea(shape) && ownerOf(shape)?.id === area.id)

  // The shapes that sit under a shape and move when it grows: the next areas of its column inside the same parent area,
  // each with its contents, or the shapes under it inside the same area. The areas past the parent move when the parent
  // refits. `own` holds the grown area's contents, which can already sit lower
  // than the next area's top and would otherwise count as that area's
  const under = (shape: TLShape, bottom: number, own: Set<string> = new Set()) => {
    const owner = isArea(shape) ? undefined : ownerOf(shape)

    return topLevel()
      .filter((other) => other.id !== shape.id && !own.has(other.id) && isArea(other) === isArea(shape) && overlapsX(other, shape))
      .filter((other) => editor.getShapePageBounds(other)!.y >= bottom - 1)
      .filter((other) => isArea(other) || ownerOf(other)?.id === owner?.id)
      .filter((other) => !isArea(shape) || (!isInside(other, shape) && parentOf(other)?.id === parentOf(shape)?.id))
      .flatMap((other) => (isArea(other) ? withContents(other).filter((inner) => !own.has(inner.id)) : [other]))
  }

  // Every height change goes through here: what sits under the shape moves by as much, and the area holding the
  // shape grows or shrinks to keep its margin
  const setHeight = (name: string, h: number, own?: Set<string>) => {
    const shape = editor.getShape(id(name))!
    const before = bounds(name)
    const owner = isArea(shape) ? undefined : ownerOf(shape)
    const siblings = owner == null ? undefined : contentsOf(owner)
    const moving = under(shape, before.maxY, own)

    editor.updateShape({ id: shape.id, type: shape.type, props: { h, ...(shape.type === 'geo' ? { growY: 0 } : {}) } })

    const dy = bounds(name).maxY - before.maxY

    for (const other of moving) {
      moveBy(editor.getShape(other.id)!, 0, dy)
    }

    if (owner != null) {
      fitAreaShape(owner, siblings)
    }

    const parent = isArea(shape) ? parentOf(shape) : undefined

    if (parent != null) {
      fitAreaShape(parent)
    }

    return h
  }

  // `held` is the area's contents, collected before anything moved: a shape pushed down by a sibling can sit below
  // the next area's top until this area grows
  const fitAreaShape = (area: TLShape, held = [...contentsOf(area), ...nestedOf(area)]) => {
    const outer = editor.getShapePageBounds(area)!
    const bottoms = held.map((shape) => editor.getShapePageBounds(shape.id)!.maxY)

    if (bottoms.length > 0) {
      setHeight(nameOf(area), Math.max(...bottoms) - outer.y + AREA_PADDING, new Set(held.map((shape) => shape.id)))
    }
  }

  // A shape belongs to the area that holds its top edge, so the area grows before the shape is created: a shape placed
  // past the area's bottom would belong to the area around it
  const makeRoom = (into: string | undefined, y: number, h: number) => {
    if (into == null) {
      return
    }

    const outer = bounds(into)

    if (y + h + AREA_PADDING > outer.maxY) {
      setHeight(into, y + h + AREA_PADDING - outer.y)
    }
  }

  const measure = async (name: string, selector: string) => {
    editor.zoomToBounds(bounds(name), { immediate: true, inset: 80 })
    await nextFrame()
    await nextFrame()

    return document.querySelector<HTMLElement>(`[data-shape-id="${id(name)}"] ${selector}`)
  }

  // tldraw measures a text, and a mockup draws its root, only once the shape is on screen, so fit zooms to it first
  const fit = async (name: string) => {
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

      return setHeight(name, Math.max(textHeight, partsHeight))
    }

    const owner = ownerOf(shape)

    if (owner != null) {
      fitAreaShape(owner)
    }

    return bounds(name).h
  }

  // A wider area widens every area of its column and moves the columns to its right by as much
  const resize = (name: string, { h, w }: { h?: number; w?: number }) => {
    const shape = editor.getShape(id(name))!

    if (w != null && isArea(shape)) {
      const before = bounds(name)
      const dx = w - before.w

      // The column is the top-level areas sharing this area's left edge. Areas nested inside one keep their own width,
      // and an area beside a narrower one in the column is not part of it
      const column =
        parentOf(shape) == null
          ? topLevel().filter(
              (other) => isArea(other) && parentOf(other) == null && Math.abs(editor.getShapePageBounds(other)!.x - before.x) < 1,
            )
          : [shape]

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
  const area = (name: string, { x, y, w, h, label, focus }: Partial<Place> & { h?: number; label: string; focus?: boolean }, pause?: number) =>
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
      : createArea(name, { x: x!, y: y!, w: w!, h: h!, label, isFocus: focus === true }, pause)

  const createArea = (name: string, { x, y, w, h, label, isFocus }: Place & { h: number; label: string; isFocus: boolean }, pause?: number) =>
    step(
      centreOf({ x, y, w }, h),
      () => {
        editor.createShape({ id: id(name), type: 'mock', x, y, props: { w, h, kind: 'area', data: { label, isFocus } } })
        editor.sendToBack([id(name)])

        if (isFocus) {
          unfocusOthers(id(name))
        }

        const parent = parentOf(editor.getShape(id(name))!)

        if (parent != null) {
          fitAreaShape(parent)
        }
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

  const text = async (name: string, { x, y, w, text, mono = false, size = 's', into }: TextOptions, pause?: number) => {
    if (!exists(name)) {
      makeRoom(into, y!, 40)
    }

    await step(
      exists(name) ? id(name) : { x: x!, y: y! },
      () =>
        exists(name)
          ? update(name, { x, y, w, text })
          : editor.createShape({
              id: id(name),
              type: 'text',
              x,
              y,
              props: { richText: toRichText(text), size, color: 'black', font: mono ? 'mono' : 'draw', textAlign: 'start', autoSize: false, w },
            }),
      pause,
    )

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

  const card = async (name: string, options: CardOptions, pause?: number) => {
    const { x, y, w, text, into } = options

    if (!exists(name)) {
      makeRoom(into, y!, 100)
    }

    await step(
      exists(name) ? id(name) : centreOf({ x: x!, y: y!, w: w! }, 100),
      () => (exists(name) ? update(name, { x, y, w, text }) : createCard(name, options)),
      pause,
    )

    return fit(name)
  }

  const note = (name: string, { text, ...place }: Partial<Place> & { text: string }, pause?: number) =>
    card(name, { ...place, text: `${NOTE_LABEL}${text}`, color: 'grey', dash: 'dashed', fill: 'none' }, pause)

  const plain = (name: string) => {
    const shape = editor.getShape(id(name))!

    return editor.getShapeUtil(shape).getText(shape) ?? ''
  }

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
  const box = (name: string, { x, y, w, h, text, geo = 'rectangle', color = 'black', fill = 'semi', dash = 'draw', into }: BoxOptions, pause?: number) => {
    if (!exists(name)) {
      makeRoom(into, y, h)
    }

    return step(
      exists(name) ? id(name) : centreOf({ x, y, w }, h),
      () =>
        exists(name)
          ? editor.updateShape({ id: id(name), type: 'geo', props: { richText: toRichText(text) } })
          : editor.createShape({
              id: id(name),
              type: 'geo',
              x,
              y,
              props: { geo, w, h, growY: 0, color, fill, dash, size: 's', font: 'draw', align: 'middle', verticalAlign: 'middle', richText: toRichText(text) },
            }),
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

  const mermaid = async (name: string, { x, y, source }: { x: number; y: number; source: string }, pause?: number) => {
    await step(
      exists(name) ? id(name) : { x, y },
      () =>
        exists(name)
          ? editor.updateShape({ id: id(name), type: 'mock', props: { data: { source } } })
          : editor.createShape({ id: id(name), type: 'mock', x, y, props: { w: 800, h: 200, kind: 'mermaid', data: { source } } }),
      pause,
    )

    return fit(name)
  }

  // Every move goes through here: a card's parts and an area's contents travel with the shape, and the area it leaves
  // and the area it lands in fit their height again
  const move = async (name: string, { x, y }: { x?: number; y?: number }, pause?: number) => {
    const shape = editor.getShape(id(name))!
    const dx = x == null ? 0 : x - shape.x
    const dy = y == null ? 0 : y - shape.y
    const left = isArea(shape) ? parentOf(shape) : ownerOf(shape)

    await step(id(name), () => {
      for (const each of isArea(shape) ? withContents(shape) : [shape]) {
        moveBy(editor.getShape(each.id)!, dx, dy)
      }
    }, pause)

    const moved = editor.getShape(id(name))!
    const entered = isArea(moved) ? parentOf(moved) : ownerOf(moved)

    for (const owner of new Set([left?.id, entered?.id])) {
      if (owner != null) {
        fitAreaShape(editor.getShape(owner)!)
      }
    }
  }

  // The area grows to hold the shapes before they move, so none of them lands past its bottom edge, where the next area
  // down would take it; the areas that held them before fit their height again
  const flow = async (areaName: string, names: string[], { top, gap = FLOW_GAP }: { top?: number; gap?: number } = {}) => {
    const outer = bounds(areaName)
    const start = top ?? outer.y + LABEL_SPACE
    const shapes = names.filter(exists)
    const previous = new Set(shapes.map((name) => ownerOf(editor.getShape(id(name))!)?.id).filter((owner) => owner != null && owner !== id(areaName)))
    const stacked = shapes.reduce((sum, name) => sum + bounds(name).h + gap, 0) - gap
    const others = contentsOf(editor.getShape(id(areaName))!).filter((shape) => !shapes.includes(nameOf(shape)))
    const lowest = Math.max(start + stacked, ...others.map((shape) => editor.getShapePageBounds(shape)!.maxY))

    if (lowest + AREA_PADDING > outer.maxY) {
      setHeight(areaName, lowest + AREA_PADDING - outer.y)
    }

    let y = start

    for (const name of shapes) {
      const shape = editor.getShape(id(name))!

      moveBy(shape, 0, y - shape.y)
      y += bounds(name).h + gap
    }

    for (const owner of previous) {
      fitAreaShape(editor.getShape(owner!)!)
    }

    fitAreaShape(editor.getShape(id(areaName))!)
  }

  // Called with a name that exists, mock replaces the shape's data and fits its height again
  const mock = async (name: string, { x, y, w = MOCK_WIDTH, kind, data, into }: MockOptions, pause?: number) => {
    if (!exists(name)) {
      makeRoom(into, y!, 120)
    }

    await step(
      exists(name) ? id(name) : centreOf({ x: x!, y: y!, w }, 120),
      () =>
        exists(name)
          ? editor.updateShape({ id: id(name), type: 'mock', props: { data } })
          : editor.createShape({ id: id(name), type: 'mock', x, y, props: { w, h: 120, kind, data } }),
      pause,
    )

    return fit(name)
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
      editor.createShape({ id: id(name), type: 'mock', x, y, props: { w: 1000, h: 400, kind: 'area', data: { label: spec.label } } })
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
      editor.createShape({ id: id(`${prefix}${part}`), type, x: at.x, y: at.y, props })
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

    return bounds(name)
  }

  return { id, bounds, plain, area, focus, text, card, note, followUp, fit, resize, box, arrow, mermaid, mock, move, flow, classificationTree }
}
