import { createShapeId, toRichText, type Editor, type TLDefaultColorStyle, type TLShape, type VecLike } from 'tldraw'
import { definitionOf } from './MockShape'
import { stepOf } from './step'

type Place = { x: number; y: number; w: number }

type TextOptions = Place & { text: string; mono?: boolean; size?: 's' | 'm' | 'l' }

type CardOptions = Place & {
  text: string
  color?: TLDefaultColorStyle
  dash?: 'solid' | 'dashed'
  fill?: 'none' | 'semi' | 'solid'
  mono?: boolean
}

type FollowUpOptions = { summary: string; note: string; question?: string; below?: string[] }

const CARD_PADDING = 20
const GAP = 20

const nextFrame = () => new Promise((done) => requestAnimationFrame(() => done(null)))

export const drawOf = (editor: Editor) => {
  const step = stepOf(editor)

  const id = (name: string) => createShapeId(name)

  const bounds = (name: string) => editor.getShapePageBounds(id(name))!

  const centreOf = ({ x, y, w }: Place, h: number): VecLike => ({ x: x + w / 2, y: y + h / 2 })

  const moveBy = (shape: TLShape, dy: number) => editor.updateShape({ id: shape.id, type: shape.type, y: shape.y + dy })

  const area = (name: string, { x, y, w, h, label }: Place & { h: number; label: string }, pause?: number) =>
    step(
      centreOf({ x, y, w }, h),
      () => {
        editor.createShape({ id: id(name), type: 'mock', x, y, props: { w, h, kind: 'area', data: { label } } })
        editor.sendToBack([id(name)])
      },
      pause,
    )

  const text = (name: string, { x, y, w, text, mono = false, size = 's' }: TextOptions, pause?: number) =>
    step(
      { x, y },
      () =>
        editor.createShape({
          id: id(name),
          type: 'text',
          x,
          y,
          props: { richText: toRichText(text), size, color: 'black', font: mono ? 'mono' : 'draw', textAlign: 'start', autoSize: false, w },
        }),
      pause,
    )

  const card = (
    name: string,
    { x, y, w, text, color = 'violet', dash = 'solid', fill = 'semi', mono = false }: CardOptions,
    pause?: number,
  ) =>
    step(
      centreOf({ x, y, w }, 100),
      () =>
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
        }),
      pause,
    )

  const note = (name: string, { x, y, w, text }: Place & { text: string }, pause?: number) =>
    card(name, { x, y, w, text: `Claude\n\n${text}`, color: 'grey', dash: 'dashed', fill: 'none' }, pause)

  const plain = (name: string) => {
    const shape = editor.getShape(id(name))!

    return editor.getShapeUtil(shape).getText(shape) ?? ''
  }

  // tldraw measures a text only once it draws it, and it draws only what is on screen
  const fit = async (name: string) => {
    editor.zoomToBounds(bounds(name), { immediate: true, inset: 80 })
    await nextFrame()
    await nextFrame()

    const label = document.querySelector(`[data-shape-id="${id(name)}"] .tl-rich-text`)

    if (label == null) {
      return null
    }

    const h = label.getBoundingClientRect().height / editor.getZoomLevel() + 2 * CARD_PADDING

    editor.updateShape({ id: id(name), type: 'geo', props: { h, growY: 0 } })

    return h
  }

  const isArea = (shape: TLShape) => shape.type === 'mock' && (shape.props as { kind?: string }).kind === 'area'

  const isInside = (shape: TLShape, area: TLShape) => {
    const inner = editor.getShapePageBounds(shape)!
    const outer = editor.getShapePageBounds(area)!

    return inner.x >= outer.x - 1 && inner.maxX <= outer.maxX + 1 && inner.y >= outer.y - 1 && inner.maxY <= outer.maxY + 1
  }

  // Each lower area's shapes are collected before the resize: once the upper area is taller, its own shapes can sit
  // inside the old bounds of the area below and would otherwise move with it
  const grow = (name: string, h: number, gap = 60) => {
    const top = bounds(name)
    const topLevel = editor.getCurrentPageShapes().filter((shape) => shape.parentId === editor.getCurrentPageId())

    const below = topLevel
      .filter((shape) => isArea(shape) && shape.id !== id(name))
      .filter((shape) => {
        const area = editor.getShapePageBounds(shape)!

        return area.y > top.y && area.x < top.maxX && area.maxX > top.x
      })
      .sort((a, b) => a.y - b.y)
      .map((shape) => ({ area: shape, contents: topLevel.filter((other) => other.id !== shape.id && !isArea(other) && isInside(other, shape)) }))

    editor.updateShape({ id: id(name), type: 'mock', props: { h } })

    let y = bounds(name).maxY + gap

    for (const { area, contents } of below) {
      const dy = y - editor.getShapePageBounds(area)!.y

      for (const shape of [area, ...contents]) {
        moveBy(editor.getShape(shape.id)!, dy)
      }

      y = editor.getShapePageBounds(area.id)!.maxY + gap
    }
  }

  // A card's follow-up sits inside the card, under the card's own text: a summary box, a Claude note and, when there
  // is one, the next question as a card of its own; the card grows to hold them and the shapes named in `below` move
  const followUp = async (name: string, { summary, note: noteText, question, below = [] }: FollowUpOptions) => {
    for (const part of ['summary', 'note', 'question']) {
      if (editor.getShape(id(`${name}-${part}`)) != null) {
        editor.deleteShapes([id(`${name}-${part}`)])
      }
    }

    const outer = bounds(name)
    const place = { x: outer.x + CARD_PADDING, w: outer.w - 2 * CARD_PADDING }
    const textHeight = (await fit(name)) ?? outer.h

    await card(`${name}-summary`, { ...place, y: outer.y + textHeight, text: summary, color: 'grey', fill: 'solid' })
    await fit(`${name}-summary`)
    await note(`${name}-note`, { ...place, y: bounds(`${name}-summary`).maxY + GAP, text: noteText })
    await fit(`${name}-note`)

    if (question != null) {
      await card(`${name}-question`, { ...place, y: bounds(`${name}-note`).maxY + GAP, text: question })
      await fit(`${name}-question`)
    }

    const last = question == null ? `${name}-note` : `${name}-question`
    const oldMaxY = outer.maxY

    editor.updateShape({ id: id(name), type: 'geo', props: { h: bounds(last).maxY - outer.y + CARD_PADDING } })

    const dy = bounds(name).maxY - oldMaxY

    for (const other of below) {
      moveBy(editor.getShape(id(other))!, dy)
    }
  }

  // A mock draws its kind at the mockup's natural width and scales it to the shape, so its height follows the root
  // element's height at that scale; the root exists only once the shape is drawn on screen
  const fitMock = async (name: string) => {
    const shape = editor.getShape(id(name))!
    const { kind, w } = shape.props as { kind: string; w: number }
    const width = definitionOf(kind)?.width

    editor.zoomToBounds(bounds(name), { immediate: true, inset: 80 })
    await nextFrame()
    await nextFrame()

    const root = document.querySelector<HTMLElement>(`[data-shape-id="${id(name)}"] [data-root]`)

    if (root == null || width == null) {
      return null
    }

    const h = (root.offsetHeight * w) / width

    editor.updateShape({ id: shape.id, type: 'mock', props: { h } })

    return h
  }

  // A shape that grew past the area's bottom still has its top edge inside it, so the top edge decides what the area holds
  const fitArea = (name: string, pad = 40) => {
    const outer = bounds(name)

    const held = editor
      .getCurrentPageShapes()
      .filter((shape) => shape.parentId === editor.getCurrentPageId() && shape.id !== id(name) && !isArea(shape))
      .map((shape) => editor.getShapePageBounds(shape)!)
      .filter((inner) => inner.x >= outer.x - 1 && inner.maxX <= outer.maxX + 1 && inner.y >= outer.y && inner.y <= outer.maxY)

    if (held.length === 0) {
      return
    }

    grow(name, Math.max(...held.map((inner) => inner.maxY)) - outer.y + pad)
  }

  return { id, bounds, area, text, card, note, plain, fit, fitMock, fitArea, grow, followUp }
}
