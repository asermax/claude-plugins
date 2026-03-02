import type { NormalizedEvent } from "./types.ts"

export class EventStore {
  private events: NormalizedEvent[] = []
  private capacity: number

  constructor(capacity = 500) {
    this.capacity = capacity
  }

  push(event: NormalizedEvent): void {
    this.events.push(event)

    if (this.events.length > this.capacity) {
      this.events = this.events.slice(-this.capacity)
    }
  }

  updateByToolUseId(toolUseId: string, update: Partial<NormalizedEvent>): NormalizedEvent | null {
    for (let i = this.events.length - 1; i >= 0; i--) {
      if (this.events[i].toolUseId === toolUseId) {
        this.events[i] = { ...this.events[i], ...update }
        return this.events[i]
      }
    }

    return null
  }

  flushPending(): NormalizedEvent[] {
    const flushed: NormalizedEvent[] = []

    for (let i = 0; i < this.events.length; i++) {
      if (this.events[i].status === "pending") {
        this.events[i] = { ...this.events[i], status: "canceled" }
        flushed.push(this.events[i])
      }
    }

    return flushed
  }

  getAll(): NormalizedEvent[] {
    return this.events
  }

  getBySession(sessionId: string): NormalizedEvent[] {
    return this.events.filter((e) => e.sessionId === sessionId)
  }
}
