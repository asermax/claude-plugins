const TOOL_INDICATORS = {
  Bash: "$>",
  Read: "[R]",
  Write: "[W]",
  Edit: "[E]",
  Glob: "[G]",
  Grep: "[?]",
  WebFetch: "[~]",
  WebSearch: "[~]",
  Agent: "[A]",
  Skill: "[S]",
}

const INFO_INDICATORS = {
  UserPromptSubmit: "[>]",
  SessionStart: "[-]",
  SessionEnd: "[-]",
  SubagentStart: "[A]",
  SubagentStop: "[A]",
  Stop: "[.]",
}

const getIndicator = (event) => {
  if (event.toolName) {
    if (event.toolName.startsWith("mcp__")) return "[M]"
    return TOOL_INDICATORS[event.toolName] ?? "[*]"
  }

  return INFO_INDICATORS[event.hookEvent] ?? "[*]"
}

const getToolLabel = (event) => {
  if (event.toolName) {
    if (event.toolName.startsWith("mcp__")) {
      const parts = event.toolName.split("__")
      return `${parts[1]}/${parts.slice(2).join("__")}`
    }

    return event.toolName
  }

  return event.hookEvent
}

const formatTime = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

const formatDetail = (detail) => {
  const lines = []

  for (const [key, value] of Object.entries(detail)) {
    if (value == null) continue

    const isError = key === "error"
    const formatted = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)
    const cssClass = isError ? "detail-error" : ""

    lines.push(`<span class="detail-key">${key}:</span> <span class="${cssClass}">${escapeHtml(formatted)}</span>`)
  }

  return lines.join("\n")
}

const escapeHtml = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const isInfoEvent = (event) =>
  ["UserPromptSubmit", "SessionStart", "SessionEnd", "Stop"].includes(event.hookEvent)

// State

const eventMap = new Map()
let userScrolled = false

// DOM

const feed = document.getElementById("feed")
const eventCount = document.getElementById("event-count")
const statusDot = document.getElementById("status-dot")
const statusText = document.getElementById("status-text")
const jumpBtn = document.getElementById("jump-to-latest")

const updateEventCount = () => {
  eventCount.textContent = `${eventMap.size} events`
}

const createEventCard = (event) => {
  const card = document.createElement("div")
  card.className = `event-card status-${event.status}${isInfoEvent(event) ? " event-info" : ""}`
  card.dataset.id = event.id
  if (event.toolUseId) card.dataset.toolUseId = event.toolUseId

  card.innerHTML = `
    <div class="event-card-header">
      <span class="event-time">${formatTime(event.timestamp)}</span>
      <span class="event-indicator">${getIndicator(event)}</span>
      <span class="event-tool-name">${escapeHtml(getToolLabel(event))}</span>
      <span class="event-summary" title="${escapeHtml(event.summary)}">${escapeHtml(event.summary)}</span>
      <span class="event-duration" data-start="${event.timestamp}"></span>
      <span class="event-status-badge ${event.status}"></span>
    </div>
    <div class="event-detail">${formatDetail(event.detail)}</div>
  `

  card.addEventListener("click", () => {
    card.classList.toggle("expanded")
  })

  return card
}

const updateEventCard = (event) => {
  const existingCard = feed.querySelector(`[data-tool-use-id="${event.toolUseId}"]`)

  if (!existingCard) return

  existingCard.className = `event-card status-${event.status}${isInfoEvent(event) ? " event-info" : ""}`

  const badge = existingCard.querySelector(".event-status-badge")
  if (badge) badge.className = `event-status-badge ${event.status}`

  const detail = existingCard.querySelector(".event-detail")
  if (detail) detail.innerHTML = formatDetail(event.detail)

  // Calculate and show duration
  const durationEl = existingCard.querySelector(".event-duration")
  if (durationEl) {
    const startTime = durationEl.dataset.start
    if (startTime) {
      const ms = new Date(event.timestamp).getTime() - new Date(startTime).getTime()

      if (ms >= 1000) {
        durationEl.textContent = `${(ms / 1000).toFixed(1)}s`
      } else {
        durationEl.textContent = `${ms}ms`
      }
    }
  }
}

const addEvent = (event) => {
  eventMap.set(event.id, event)
  const card = createEventCard(event)
  feed.appendChild(card)
  updateEventCount()

  if (!userScrolled) {
    feed.scrollTop = feed.scrollHeight
  }
}

const loadEvents = (events) => {
  feed.innerHTML = ""
  eventMap.clear()

  for (const event of events) {
    eventMap.set(event.id, event)
    const card = createEventCard(event)
    feed.appendChild(card)
  }

  updateEventCount()
  feed.scrollTop = feed.scrollHeight
}

// Scroll tracking

feed.addEventListener("scroll", () => {
  const atBottom = feed.scrollHeight - feed.scrollTop - feed.clientHeight < 50
  userScrolled = !atBottom
  jumpBtn.hidden = !userScrolled
})

jumpBtn.addEventListener("click", () => {
  feed.scrollTop = feed.scrollHeight
  userScrolled = false
  jumpBtn.hidden = true
})

// WebSocket

const WS_PORT = new URL(window.location.href).port || "3838"
let ws = null
let reconnectDelay = 1000

const setConnected = (connected) => {
  statusDot.className = `status-dot ${connected ? "connected" : "disconnected"}`
  statusText.textContent = connected ? "connected" : "disconnected"
}

const connect = () => {
  ws = new WebSocket(`ws://localhost:${WS_PORT}`)

  ws.addEventListener("open", () => {
    setConnected(true)
    reconnectDelay = 1000
  })

  ws.addEventListener("message", (e) => {
    const message = JSON.parse(e.data)

    if (message.type === "init") {
      loadEvents(message.events)
      return
    }

    if (message.type === "event") {
      addEvent(message.event)
      return
    }

    if (message.type === "update") {
      updateEventCard(message.event)
    }
  })

  ws.addEventListener("close", () => {
    setConnected(false)
    setTimeout(connect, reconnectDelay)
    reconnectDelay = Math.min(reconnectDelay * 1.5, 10000)
  })

  ws.addEventListener("error", () => {
    ws.close()
  })
}

connect()
