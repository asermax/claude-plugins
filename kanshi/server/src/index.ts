import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { join, extname } from "node:path"
import { fileURLToPath } from "node:url"

import { WebSocketServer, type WebSocket } from "ws"

import { EventStore } from "./event-store.ts"
import { normalize } from "./event-normalizer.ts"
import type { HookPayload, WsMessage } from "./types.ts"

const PORT = parseInt(process.env.KANSHI_PORT ?? "3838", 10)
const __dirname = fileURLToPath(new URL(".", import.meta.url))
const DASHBOARD_DIR = join(__dirname, "..", "..", "dashboard")

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
}

const store = new EventStore()
const clients = new Set<WebSocket>()

const broadcast = (message: WsMessage): void => {
  const data = JSON.stringify(message)

  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send(data)
    }
  }
}

const readBody = (req: import("node:http").IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    let body = ""
    req.on("data", (chunk: Buffer) => (body += chunk.toString()))
    req.on("end", () => resolve(body))
    req.on("error", reject)
  })

const serveStatic = async (
  filePath: string,
  res: import("node:http").ServerResponse,
): Promise<void> => {
  try {
    const content = await readFile(filePath)
    const ext = extname(filePath)
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream" })
    res.end(content)
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" })
    res.end("Not found")
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`)

  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.writeHead(204)
    res.end()
    return
  }

  // Hook event endpoint
  if (req.method === "POST" && url.pathname === "/events") {
    try {
      const body = await readBody(req)
      const payload: HookPayload = JSON.parse(body)
      const event = normalize(payload)

      // For PostToolUse/PostToolUseFailure, try to update the matching PreToolUse event
      if (
        event.toolUseId &&
        (payload.hook_event_name === "PostToolUse" || payload.hook_event_name === "PostToolUseFailure")
      ) {
        const updated = store.updateByToolUseId(event.toolUseId, {
          status: event.status,
          detail: { ...event.detail },
          hookEvent: event.hookEvent,
        })

        if (updated) {
          broadcast({ type: "update", event: updated })
          res.writeHead(200, { "Content-Type": "application/json" })
          res.end("{}")
          return
        }
      }

      // New event (PreToolUse, or PostToolUse without a matching Pre)
      store.push(event)
      broadcast({ type: "event", event })

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end("{}")
    } catch (err) {
      console.error("Failed to process event:", err)
      res.writeHead(400, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "Invalid payload" }))
    }

    return
  }

  // API endpoint for fetching stored events
  if (req.method === "GET" && url.pathname === "/api/events") {
    const sessionFilter = url.searchParams.get("session")
    const events = sessionFilter ? store.getBySession(sessionFilter) : store.getAll()

    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify(events))
    return
  }

  // Static file serving for dashboard
  if (req.method === "GET") {
    const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname
    const filePath = join(DASHBOARD_DIR, requestedPath)

    // Prevent directory traversal
    if (!filePath.startsWith(DASHBOARD_DIR)) {
      res.writeHead(403, { "Content-Type": "text/plain" })
      res.end("Forbidden")
      return
    }

    await serveStatic(filePath, res)
    return
  }

  res.writeHead(405, { "Content-Type": "text/plain" })
  res.end("Method not allowed")
})

const wss = new WebSocketServer({ server })

wss.on("connection", (ws) => {
  clients.add(ws)

  const initMessage: WsMessage = { type: "init", events: store.getAll() }
  ws.send(JSON.stringify(initMessage))

  ws.on("close", () => {
    clients.delete(ws)
  })
})

server.listen(PORT, () => {
  console.log(`Kanshi dashboard: http://localhost:${PORT}`)
  console.log(`Waiting for hook events on POST /events...`)
})
