import { writeFileSync } from 'node:fs'
import type { ServerResponse } from 'node:http'
import { dirname, resolve } from 'node:path'
import { TLSocketRoom } from '@tldraw/sync-core'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { WebSocketServer } from 'ws'
import { readDocument, writeDocument } from './document/canvasDocument.ts'
import { schema } from './src/schema.ts'

const DOC_PATH = process.env.CANVAS_DOC

if (DOC_PATH == null) {
  throw new Error('CANVAS_DOC must point to the canvas document, <folder>/<name>.tldr.json')
}

const DOC_DIR = dirname(DOC_PATH)
const MOCKUPS_DIR = resolve(DOC_DIR, 'mockups')
const SVG_PATH = DOC_PATH.replace(/\.tldr\.json$/, '.svg')
const SYNC_PATH = '/api/sync'

// The mockups read tldraw's font variables, which only exist inside the editor
const SVG_FONT_FIX = '<style>svg { --tl-font-draw: "tldraw_draw"; --tl-font-mono: ui-monospace, "DejaVu Sans Mono", monospace; --tl-font-sans: system-ui, sans-serif; }</style>'

const readBody = (req: NodeJS.ReadableStream) =>
  new Promise<string>((done) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => done(body))
  })

// Clicks on "Send to Claude" are streamed to whoever listens, so nothing about them is written to disk
const listeners = new Set<ServerResponse>()

const canvasApi = (): Plugin => ({
  name: 'canvas-api',
  configureServer(server) {
    // Vite watches only the app, so the folder's mockups/ is added to the watcher. Adding, changing or removing a mockup then
    // re-runs src/mockups.ts through hot reload, which swaps the definitions without reloading the page
    server.watcher.add(MOCKUPS_DIR)

    // Every open tab, the user's and Claude's, edits this one room, which keeps the document on disk current
    const room = new TLSocketRoom({ schema, initialSnapshot: readDocument(DOC_PATH)?.room, onDataChange: () => scheduleSave() })

    let saveTimer: ReturnType<typeof setTimeout> | undefined

    const save = () => {
      clearTimeout(saveTimer)
      saveTimer = undefined
      writeDocument(DOC_PATH, room.getCurrentSnapshot())
    }

    const scheduleSave = () => {
      clearTimeout(saveTimer)
      saveTimer = setTimeout(save, 300)
    }

    // canvas.sh stop sends SIGTERM, which would drop an edit still waiting to be saved
    process.once('SIGTERM', () => saveTimer != null && save())

    const sockets = new WebSocketServer({ noServer: true })

    server.httpServer?.on('upgrade', (req, socket, head) => {
      const url = new URL(req.url ?? '', 'http://localhost')

      // Vite's own hot reload socket shares the server
      if (url.pathname !== SYNC_PATH) {
        return
      }

      sockets.handleUpgrade(req, socket, head, (ws) => room.handleSocketConnect({ sessionId: url.searchParams.get('sessionId') ?? crypto.randomUUID(), socket: ws }))
    })

    server.middlewares.use('/api/health', (_req, res) => {
      res.end(DOC_PATH)
    })

    server.middlewares.use('/api/export', async (req, res) => {
      const svg = await readBody(req)
      const open = svg.match(/<svg[^>]*>/)

      writeFileSync(SVG_PATH, open == null ? svg : svg.replace(open[0], open[0] + SVG_FONT_FIX))
      res.end(SVG_PATH)
    })

    server.middlewares.use('/api/notify', async (req, res) => {
      // Whoever reacts to the click reads the document from disk
      if (saveTimer != null) {
        save()
      }

      // A voice message arrives as { message, selected }; the watch prints one line per event, so its newlines are flattened
      const body = await readBody(req)
      const { message, selected = [] } = body === '' ? {} : (JSON.parse(body) as { message?: string; selected?: { id: string; kind: string; text: string }[] })
      const flat = (value: string) => value.replace(/\s+/g, ' ').trim()
      const selection = selected.map(({ id, kind, text }) => (text === '' ? `${id} (${kind})` : `${id} (${kind}: "${flat(text)}")`)).join(', ')
      const event = message == null ? 'click' : `voice: ${flat(message)}${selection === '' ? '' : ` | selected: ${selection}`}`

      listeners.forEach((listener) => listener.write(`data: ${event}\n\n`))
      res.end('ok')
    })

    server.middlewares.use('/api/events', (req, res) => {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' })
      res.write(': listening\n\n')
      listeners.add(res)
      req.on('close', () => listeners.delete(res))
    })
  },
})

export default defineConfig({
  root: __dirname,
  cacheDir: resolve(__dirname, 'node_modules/.vite'),
  plugins: [react(), canvasApi()],
  resolve: {
    alias: {
      '@canvas': resolve(__dirname, 'src'),
      '@mockups': MOCKUPS_DIR,
    },
    // The document's mockups live outside the app, so React and tldraw resolve from the app's node_modules
    dedupe: ['react', 'react-dom', 'tldraw', '@tldraw/tlschema', '@tldraw/validate'],
  },
  server: { fs: { allow: [__dirname, DOC_DIR] } },
})
