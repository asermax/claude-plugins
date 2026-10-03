import type { Migration } from '../migration.ts'

const isMock = (record: Record<string, any>) => record.typeName === 'shape' && record.type === 'mock'

const dataOf = (kind: string, variant: string) => {
  if (kind === 'cylinder') {
    const [title = '', caption = ''] = variant.split('|')

    return { title, caption }
  }

  return variant === '' ? {} : { variant }
}

// Mock shapes passed their mockup one free-form string; they now pass it props as JSON
export const mockData: Migration = {
  version: 3,
  description: 'replace the mock shape variant string with structured data',
  up: (document, warn) => {
    const kindsKeepingVariant = new Set<string>()

    const documents = document.room.documents.map(({ state, lastChangedClock }: Record<string, any>) => {
      if (!isMock(state)) {
        return { state, lastChangedClock }
      }

      const { variant = '', ...props } = state.props
      const data = dataOf(props.kind, variant)

      if ('variant' in data) {
        kindsKeepingVariant.add(props.kind)
      }

      return { state: { ...state, props: { ...props, data } }, lastChangedClock }
    })

    kindsKeepingVariant.forEach((kind) =>
      warn(`mockups/${kind}.tsx received a variant string; its shapes now pass it as data.variant, so update the mockup to read its props`),
    )

    return { ...document, room: { ...document.room, documents } }
  },
}
