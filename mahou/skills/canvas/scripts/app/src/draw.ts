import { createShapeId, toRichText, type Editor, type TLDefaultColorStyle, type TLShape, type VecLike } from 'tldraw'
import { definitionOf } from './MockShape'
import { stepOf } from './step'

type Place = { x: number; y: number; w: number }

type TextOptions = Partial<Place> & { text: string; mono?: boolean; size?: 's' | 'm' | 'l' }

type CardOptions = Partial<Place> & {
  text: string
  color?: TLDefaultColorStyle
  dash?: 'solid' | 'dashed'
  fill?: 'none' | 'semi' | 'solid'
  mono?: boolean
}

type FollowUpOptions = { summary: string; note: string; question?: string }

const CARD_PADDING = 20
const GAP = 20
const AREA_PADDING = 40
const AREA_GAP = 60
const NOTE_LABEL = 'Claude\n\n'

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

  const isPart = (shape: TLShape) => {
    const match = nameOf(shape).match(/^(.*)-(summary|note|question)$/)

    return match != null && editor.getShape(id(match[1])) != null
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

  // A shape belongs to the lowest area of its column whose top edge is above the shape's top edge, so a shape placed
  // under an area that has not grown yet still belongs to that area and not to the one below it
  const ownerOf = (shape: TLShape) => {
    const top = editor.getShapePageBounds(shape)!

    return topLevel()
      .filter((area) => isArea(area) && area.id !== shape.id && overlapsX(area, shape))
      .filter((area) => editor.getShapePageBounds(area)!.y <= top.y + 1)
      .sort((a, b) => editor.getShapePageBounds(b)!.y - editor.getShapePageBounds(a)!.y)[0]
  }

  const contentsOf = (area: TLShape) => topLevel().filter((shape) => !isArea(shape) && ownerOf(shape)?.id === area.id)

  // The shapes that sit under a shape and move when it grows: the next areas of its column, each with its contents,
  // or the shapes under it inside the same area. `own` holds the grown area's contents, which can already sit lower
  // than the next area's top and would otherwise count as that area's
  const under = (shape: TLShape, bottom: number, own: Set<string> = new Set()) => {
    const owner = isArea(shape) ? undefined : ownerOf(shape)

    return topLevel()
      .filter((other) => other.id !== shape.id && !own.has(other.id) && isArea(other) === isArea(shape) && overlapsX(other, shape))
      .filter((other) => editor.getShapePageBounds(other)!.y >= bottom - 1)
      .filter((other) => isArea(other) || ownerOf(other)?.id === owner?.id)
      .flatMap((other) => (isArea(other) ? [other, ...contentsOf(other).filter((inner) => !own.has(inner.id))] : [other]))
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

    return h
  }

  // `held` is the area's contents, collected before anything moved: a shape pushed down by a sibling can sit below
  // the next area's top until this area grows
  const fitAreaShape = (area: TLShape, held = contentsOf(area)) => {
    const outer = editor.getShapePageBounds(area)!
    const bottoms = held.map((shape) => editor.getShapePageBounds(shape.id)!.maxY)

    if (bottoms.length > 0) {
      setHeight(nameOf(area), Math.max(...bottoms) - outer.y + AREA_PADDING, new Set(held.map((shape) => shape.id)))
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

    if (shape.type === 'mock') {
      const { kind, w } = shape.props as { kind: string; w: number }
      const width = definitionOf(kind)?.width
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
      const right = topLevel().filter((other) => editor.getShapePageBounds(other)!.x >= before.maxX - 1)

      for (const area of topLevel().filter((other) => isArea(other) && overlapsX(other, shape))) {
        editor.updateShape({ id: area.id, type: 'mock', props: { w } })
      }

      for (const other of right) {
        moveBy(editor.getShape(other.id)!, dx, 0)
      }
    } else if (w != null) {
      editor.updateShape({ id: shape.id, type: shape.type, props: { w } })
    }

    if (h != null) {
      setHeight(name, h)
    }
  }

  const area = (name: string, { x, y, w, h, label }: Place & { h: number; label: string }, pause?: number) =>
    step(
      centreOf({ x, y, w }, h),
      () => {
        editor.createShape({ id: id(name), type: 'mock', x, y, props: { w, h, kind: 'area', data: { label } } })
        editor.sendToBack([id(name)])
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

  const text = async (name: string, { x, y, w, text, mono = false, size = 's' }: TextOptions, pause?: number) => {
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
    const { x, y, w, text } = options

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

  // A card's follow-up sits inside the card, under the card's own text: a summary box, a Claude note and, when there
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

  return { id, bounds, plain, area, text, card, note, followUp, fit, resize }
}
