import { useLayoutEffect, useRef, useSyncExternalStore, type ReactNode } from 'react'
import { BaseBoxShapeUtil, HTMLContainer, useEditor, type JsonObject, type TLShape } from 'tldraw'
import { Area } from './kit/Area'
import { Browser } from './kit/Browser'
import { CodeSnippet, JS_HIGHLIGHT, type CodeSnippetProps } from './kit/CodeSnippet'
import { Cylinder } from './kit/Cylinder'
import { Mermaid } from './kit/Mermaid'
import { mockupOf, mockupsVersion, subscribeToMockups } from './mockups'
import { MOCK_TYPE, mockShapeProps } from './schema'

declare module 'tldraw' {
  export interface TLGlobalShapePropsMap {
    [MOCK_TYPE]: {
      w: number
      h: number
      kind: string
      data: JsonObject
    }
  }
}

type MockShape = TLShape<typeof MOCK_TYPE>

export interface MockDefinition<P extends object = Record<string, never>> {
  // A function lets a mockup change its natural width with its props, such as a side-by-side view
  width?: number | ((props: P) => number)
  // A shape's data is merged over these, so a shape passes only what differs
  defaults: P
  // `update` merges a patch into the shape's data, so state a mockup changes on a click is saved and reaches every tab
  render: (props: P, tools: { update: (patch: Partial<P>) => void }) => ReactNode
}

const BUILT_IN: Record<string, MockDefinition<any>> = {
  cylinder: {
    width: 260,
    defaults: { title: '', caption: '' },
    render: ({ title, caption }) => <Cylinder title={title} caption={caption} />,
  },
  // A labelled region around the shapes that belong together; drawn behind them, it does not move them along like a frame.
  // It has no natural width, so its border and label keep their size at any area size
  area: { defaults: { label: '' }, render: ({ label }) => <Area label={label} /> },
  // A mermaid diagram from its source text, drawn at the shape's own size and scaled to fit it
  mermaid: { defaults: { source: '' }, render: ({ source }) => <Mermaid source={source} /> },
  // A code or config fragment with diff marks, notes beside its lines and syntax highlighting; the side-by-side view
  // is wider, so the two sides keep the width the unified view gives the code
  'code-snippet': {
    width: (props: CodeSnippetProps) => (props.view === 'split' ? 1500 : 900),
    defaults: { file: 'file.ts', tag: null, lines: [], gutterNotes: false, highlight: JS_HIGHLIGHT, view: 'unified', expanded: [] },
    render: (props: CodeSnippetProps, { update }: { update: (patch: Partial<CodeSnippetProps>) => void }) => <CodeSnippet {...props} update={update} />,
  },
  // The legend's sample of a screen
  'blank-screen': { width: 560, defaults: {}, render: () => <Browser app="…">{null}</Browser> },
}

export const definitionOf = (kind: string): MockDefinition<any> | undefined => mockupOf(kind) ?? BUILT_IN[kind]

// Subscribes to the mockup registry, so editing a mockup file redraws its shapes without reloading the page
const MockContent = ({ shape }: { shape: MockShape }) => {
  useSyncExternalStore(subscribeToMockups, mockupsVersion)

  const editor = useEditor()
  const box = useRef<HTMLDivElement>(null)
  const definition = definitionOf(shape.props.kind)

  const naturalWidth = (data: JsonObject) => {
    const width = definition?.width
    return typeof width === 'function' ? width({ ...definition!.defaults, ...data }) : width
  }

  // A patch that changes the natural width resizes the shape by the same ratio, so the drawing keeps its scale
  const update = (patch: JsonObject) => {
    const data = { ...shape.props.data, ...patch }
    const before = naturalWidth(shape.props.data)
    const after = naturalWidth(data)
    const w = before == null || after == null ? shape.props.w : (shape.props.w * after) / before

    editor.updateShape({ id: shape.id, type: MOCK_TYPE, props: { data, w } })
  }

  // A mockup with a natural width keeps the shape as tall as its content, so a click that grows or shrinks it
  // resizes the shape in every tab
  useLayoutEffect(() => {
    const root = box.current?.querySelector<HTMLElement>('[data-root]')
    const natural = naturalWidth(shape.props.data)
    if (root == null || natural == null) return

    const sync = () => {
      const height = Math.ceil(root.offsetHeight * (shape.props.w / natural))
      if (height > 0 && Math.abs(height - shape.props.h) > 1) editor.updateShape({ id: shape.id, type: MOCK_TYPE, props: { h: height } })
    }
    const observer = new ResizeObserver(sync)

    observer.observe(root)
    sync()
    return () => observer.disconnect()
  })

  // Content is laid out at the mockup's natural width and scaled to the shape, so a large mockup and a thumbnail share one
  // layout; a mockup with no natural width is laid out at the shape's own size
  const scale = shape.props.w / (naturalWidth(shape.props.data) ?? shape.props.w)

  return (
    <div
      ref={box}
      style={{ position: 'relative', width: shape.props.w / scale, height: shape.props.h / scale, transform: `scale(${scale})`, transformOrigin: 'top left' }}
      // Elements marked data-interactive take clicks; tldraw keeps every other pointer event for selecting and moving
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest('[data-interactive]') != null) event.stopPropagation()
      }}
    >
      <style>{'[data-interactive] { pointer-events: all; cursor: pointer; }'}</style>
      {definition == null ? <span>unknown mockup: {shape.props.kind}</span> : definition.render({ ...definition.defaults, ...shape.props.data }, { update })}
    </div>
  )
}

export class MockShapeUtil extends BaseBoxShapeUtil<MockShape> {
  static override type = MOCK_TYPE

  static override props = mockShapeProps

  getDefaultProps(): MockShape['props'] {
    return { w: 400, h: 300, kind: 'blank-screen', data: {} }
  }

  component(shape: MockShape) {
    return (
      <HTMLContainer id={shape.id} style={{ pointerEvents: 'none' }}>
        <MockContent shape={shape} />
      </HTMLContainer>
    )
  }

  getIndicatorPath(shape: MockShape) {
    const path = new Path2D()
    path.rect(0, 0, shape.props.w, shape.props.h)
    return path
  }
}
