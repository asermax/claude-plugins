import type { MockDefinition } from './MockShape'

interface Registry {
  mocks: Record<string, MockDefinition<any>>
  version: number
  listeners: Set<() => void>
}

// tldraw keeps the shape util it mounted with, so the registry lives on the window and survives this module being re-run
const registry: Registry = ((window as unknown as { __mockups?: Registry }).__mockups ??= { mocks: {}, version: 0, listeners: new Set() })

// Each file in the folder's mockups/ exports one `mockup`, and its file name is the kind
registry.mocks = Object.fromEntries(
  Object.entries(import.meta.glob<{ mockup?: MockDefinition<any> }>('@mockups/*.tsx', { eager: true }))
    .filter(([, module]) => module.mockup != null)
    .map(([path, module]) => [path.replace(/^.*\/|\.tsx$/g, ''), module.mockup!]),
)
registry.version += 1
registry.listeners.forEach((listener) => listener())

export const mockupOf = (kind: string): MockDefinition<any> | undefined => registry.mocks[kind]

export const subscribeToMockups = (listener: () => void) => {
  registry.listeners.add(listener)

  return () => registry.listeners.delete(listener)
}

export const mockupsVersion = () => registry.version

// A changed mockup re-runs this module, which swaps the definitions and redraws every mock shape in place
import.meta.hot?.accept()
