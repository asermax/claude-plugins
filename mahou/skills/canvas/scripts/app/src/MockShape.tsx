import type { ReactNode } from 'react'
import { BaseBoxShapeUtil, HTMLContainer, type JsonObject, type TLShape } from 'tldraw'
import { Area } from './kit/Area'
import { Browser } from './kit/Browser'
import { Cylinder } from './kit/Cylinder'
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
  width: number
  // A shape's data is merged over these, so a shape passes only what differs
  defaults: P
  render: (props: P) => ReactNode
}

const BUILT_IN: Record<string, MockDefinition<any>> = {
  cylinder: {
    width: 260,
    defaults: { title: '', caption: '' },
    render: ({ title, caption }) => <Cylinder title={title} caption={caption} />,
  },
  // A labelled region around the shapes that belong together; drawn behind them, it does not move them along like a frame
  area: { width: 800, defaults: { label: '' }, render: ({ label }) => <Area label={label} /> },
  // The legend's sample of a screen
  'blank-screen': { width: 560, defaults: {}, render: () => <Browser app="…">{null}</Browser> },
}

// Each file in the folder's mockups/ exports one `mockup`, and its file name is the kind
const MOCKS: Record<string, MockDefinition<any>> = Object.fromEntries(
  Object.entries(import.meta.glob<{ mockup?: MockDefinition<any> }>('@mockups/*.tsx', { eager: true }))
    .filter(([, module]) => module.mockup != null)
    .map(([path, module]) => [path.replace(/^.*\/|\.tsx$/g, ''), module.mockup!]),
)

const definitionOf = (kind: string): MockDefinition<any> | undefined => MOCKS[kind] ?? BUILT_IN[kind]

export class MockShapeUtil extends BaseBoxShapeUtil<MockShape> {
  static override type = MOCK_TYPE

  static override props = mockShapeProps

  getDefaultProps(): MockShape['props'] {
    return { w: 400, h: 300, kind: 'blank-screen', data: {} }
  }

  component(shape: MockShape) {
    const definition = definitionOf(shape.props.kind)

    // Content is laid out at the mockup's natural width and scaled to the shape, so a large mockup and a thumbnail share one layout
    const scale = shape.props.w / (definition?.width ?? shape.props.w)

    return (
      <HTMLContainer id={shape.id} style={{ pointerEvents: 'none' }}>
        <div style={{ position: 'relative', width: shape.props.w / scale, height: shape.props.h / scale, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          {definition == null ? <span>unknown mockup: {shape.props.kind}</span> : definition.render({ ...definition.defaults, ...shape.props.data })}
        </div>
      </HTMLContainer>
    )
  }

  getIndicatorPath(shape: MockShape) {
    const path = new Path2D()
    path.rect(0, 0, shape.props.w, shape.props.h)
    return path
  }
}
