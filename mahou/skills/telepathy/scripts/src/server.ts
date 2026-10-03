import { watch } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { parseArgs } from "node:util";

import { createNotifier } from "./notifier";
import { isHidden, isViewable, createWorkspace } from "./workspace";

const WATCH_DEBOUNCE_MS = 100;
const KEEPALIVE_MS = 15000;

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    port: { type: "string" },
    agent: { type: "string" },
    "no-open": { type: "boolean" },
  },
  allowPositionals: true,
});

const [name] = positionals;

if (name == null) {
  console.error("usage: telepathy.sh <scratch-folder> [--port N] [--agent TARGET] [--no-open]");
  process.exit(1);
}

const root = resolve(process.cwd(), ".scratch", name);
const uiDir = resolve(import.meta.dir, "../ui");

await mkdir(root, { recursive: true });

const clients = new Set<ReadableStreamDefaultController<string>>();

// A closed tab does not always cancel its stream, and enqueueing on a closed
// controller throws; an unhandled throw from the keepalive timer would take the
// whole server down, so a failed send just forgets the client.
const send = (client: ReadableStreamDefaultController<string>, chunk: string) => {
  try {
    client.enqueue(chunk);
  } catch {
    clients.delete(client);
  }
};

const broadcast = (event: { type: "files" } | { type: "file"; path: string }) => {
  for (const client of clients) {
    send(client, `data: ${JSON.stringify(event)}\n\n`);
  }
};

const workspace = await createWorkspace({
  root,
  notify: createNotifier(values.agent ?? process.env.HERDR_PANE_ID ?? null),
});

const insideRoot = (path: string | null) => {
  if (path == null) {
    return null;
  }

  const full = resolve(root, path);

  return full.startsWith(`${root}${sep}`) ? full : null;
};

const json = (body: unknown, status = 200) => Response.json(body, { status });

const events = (request: Request) =>
  new Response(
    new ReadableStream<string>({
      start: (controller) => {
        clients.add(controller);
        send(controller, ": connected\n\n");
        request.signal.addEventListener("abort", () => clients.delete(controller));
      },
    }),
    { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } },
  );

const handleWrite = async (request: Request, pathname: string) => {
  const body = await request.json();

  if (!isViewable(body.path ?? "") || insideRoot(body.path) == null) {
    return json({ status: "missing" }, 404);
  }

  const result =
    pathname === "/api/edit"
      ? await workspace.edit(body.path, body.id, body.base, body.text)
      : await workspace.insert(body.path, body.afterId ?? null, body.text);

  if (result.status === "ok") {
    broadcast({ type: "file", path: body.path });
  }

  return json(result);
};

const server = Bun.serve({
  port: values.port == null ? 0 : Number(values.port),
  idleTimeout: 0,

  fetch: async (request) => {
    const { pathname, searchParams } = new URL(request.url);

    if (request.method === "POST" && (pathname === "/api/edit" || pathname === "/api/insert")) {
      return handleWrite(request, pathname);
    }

    if (pathname === "/") {
      return new Response(Bun.file(join(uiDir, "index.html")));
    }

    if (pathname.startsWith("/ui/")) {
      const file = Bun.file(join(uiDir, pathname.slice("/ui/".length).replaceAll("..", "")));

      return (await file.exists()) ? new Response(file) : new Response("not found", { status: 404 });
    }

    if (pathname === "/api/events") {
      return events(request);
    }

    if (pathname === "/api/files") {
      return json({ root: name, files: await workspace.listFiles() });
    }

    if (pathname === "/api/file") {
      const path = searchParams.get("path");
      const blocks = path == null || insideRoot(path) == null ? undefined : await workspace.view(path);

      return blocks == null ? json({ status: "missing" }, 404) : json({ path, blocks });
    }

    if (pathname.startsWith("/raw/")) {
      const full = insideRoot(decodeURIComponent(pathname.slice("/raw/".length)));
      const file = full == null ? null : Bun.file(full);

      return file != null && (await file.exists()) ? new Response(file) : new Response("not found", { status: 404 });
    }

    return new Response("not found", { status: 404 });
  },
});

setInterval(() => {
  for (const client of clients) {
    send(client, ": keepalive\n\n");
  }
}, KEEPALIVE_MS);

const pending = new Map<string, Timer>();
let knownFiles = JSON.stringify(await workspace.listFiles());

// The server's own writes land on disk too; sync() compares against the
// snapshot it just stored and reports no change, so they never echo back.
watch(root, { recursive: true }, (_, filename) => {
  if (filename == null || isHidden(filename)) {
    return;
  }

  clearTimeout(pending.get(filename));

  pending.set(
    filename,
    setTimeout(async () => {
      pending.delete(filename);

      const files = JSON.stringify(await workspace.listFiles());

      if (files !== knownFiles) {
        knownFiles = files;
        broadcast({ type: "files" });
      }

      if (!isViewable(filename)) {
        return;
      }

      if (filename.endsWith(".md") ? await workspace.sync(filename) : true) {
        broadcast({ type: "file", path: filename });
      }
    }, WATCH_DEBOUNCE_MS),
  );
});

const url = `http://localhost:${server.port}`;

await workspace.setUrl(url);

console.log(`telepathy: serving ${root} at ${url}`);

if (!values["no-open"]) {
  Bun.spawn(["xdg-open", url], { stdout: "ignore", stderr: "ignore" });
}

const stop = () => {
  server.stop(true);
  process.exit(0);
};

process.on("SIGTERM", stop);
process.on("SIGINT", stop);
