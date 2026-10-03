import { readdir, rename } from "node:fs/promises";
import { join, relative } from "node:path";

import { type AnchoredBlock, type StoredBlock, anchor, toStored } from "./anchor";
import { type MergeChunk, insertAfter, merge, replaceBlock } from "./edits";
import { describeChange } from "./messages";

export const META_FILE = ".meta.json";

const EDITABLE = /\.md$/;
const VIEWABLE = /\.(md|html?)$/;

type FileState = {
  snapshot: string;
  blocks: AnchoredBlock[];
};

type Meta = {
  pid: number;
  url: string | null;
  files: Record<string, { snapshot: string; blocks: StoredBlock[] }>;
};

export type EditResult =
  | { status: "ok" }
  | { status: "conflict"; current: string; chunks: MergeChunk[] }
  | { status: "deleted" }
  | { status: "missing" };

type Options = {
  root: string;
  notify: (message: string) => void;
  newId?: () => string;
};

// Paths starting with a dot (the metadata file, its temp copy, any hidden
// folder) are never shown and never trigger a sync.
export const isHidden = (path: string) => path.split("/").some((segment) => segment.startsWith("."));

export const isViewable = (path: string) => VIEWABLE.test(path) && !isHidden(path);

export const createWorkspace = async ({ root, notify, newId = () => crypto.randomUUID().slice(0, 8) }: Options) => {
  const states = new Map<string, FileState>();
  const metaPath = join(root, META_FILE);
  const info = { url: null as string | null };

  let queue: Promise<unknown> = Promise.resolve();

  const serial = <T>(work: () => Promise<T>): Promise<T> => {
    const next = queue.then(work);

    queue = next.catch(() => undefined);

    return next;
  };

  const persist = async () => {
    const meta: Meta = {
      pid: process.pid,
      url: info.url,
      files: Object.fromEntries(
        [...states].map(([path, state]) => [path, { snapshot: state.snapshot, blocks: toStored(state.blocks) }]),
      ),
    };

    await Bun.write(`${metaPath}.tmp`, JSON.stringify(meta, null, 2));
    await rename(`${metaPath}.tmp`, metaPath);
  };

  const readText = async (path: string) => {
    const file = Bun.file(join(root, path));

    return (await file.exists()) ? file.text() : null;
  };

  const listFiles = async () => {
    const entries = await readdir(root, { recursive: true, withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => relative(root, join(entry.parentPath, entry.name)))
      .filter(isViewable)
      .sort();
  };

  const syncFile = async (path: string) => {
    if (!EDITABLE.test(path) || isHidden(path)) {
      return false;
    }

    const text = await readText(path);
    const known = states.get(path);

    if (text == null) {
      return states.delete(path);
    }

    if (known != null && known.snapshot === text) {
      return false;
    }

    states.set(path, {
      snapshot: text,
      blocks: anchor(known?.snapshot ?? "", known == null ? [] : toStored(known.blocks), text, "agent", newId),
    });

    return true;
  };

  const syncAndPersist = async (path: string) => {
    const changed = await syncFile(path);

    if (changed) {
      await persist();
    }

    return changed;
  };

  const writeUser = async (path: string, text: string) => {
    const known = states.get(path)!;

    states.set(path, { snapshot: text, blocks: anchor(known.snapshot, toStored(known.blocks), text, "user", newId) });

    await Bun.write(join(root, path), text);
    await persist();
  };

  const loadMeta = async () => {
    const file = Bun.file(metaPath);

    if (!(await file.exists())) {
      return;
    }

    const meta: Meta = await file.json();

    for (const [path, stored] of Object.entries(meta.files)) {
      states.set(path, {
        snapshot: stored.snapshot,
        blocks: anchor(stored.snapshot, stored.blocks, stored.snapshot, "agent", newId),
      });
    }
  };

  await loadMeta();

  const present = new Set(await listFiles());

  for (const path of [...states.keys()]) {
    if (!present.has(path)) {
      states.delete(path);
    }
  }

  for (const path of present) {
    await syncFile(path);
  }

  await persist();

  return {
    listFiles,

    setUrl: (url: string) => {
      info.url = url;

      return serial(persist);
    },

    sync: (path: string) => serial(() => syncAndPersist(path)),

    view: (path: string) =>
      serial(async () => {
        await syncAndPersist(path);

        return states
          .get(path)
          ?.blocks.map(({ id, source, authors, depth, kind, start, end }) => ({
            id,
            source,
            authors,
            depth,
            kind,
            start,
            end,
          }));
      }),

    edit: (path: string, id: string, base: string, text: string) =>
      serial(async (): Promise<EditResult> => {
        await syncAndPersist(path);

        const state = states.get(path);

        if (state == null) {
          return { status: "missing" };
        }

        const block = state.blocks.find((candidate) => candidate.id === id);

        if (block == null) {
          return { status: "deleted" };
        }

        let final = text;

        if (block.source !== base) {
          const result = merge(base, block.source, text);

          if ("chunks" in result) {
            return { status: "conflict", current: block.source, chunks: result.chunks };
          }

          final = result.merged;
        }

        if (final === block.source) {
          return { status: "ok" };
        }

        const before = state.snapshot.split("\n").slice(block.start, block.end);
        const next = replaceBlock(state.snapshot, block, final);

        await writeUser(path, next);

        notify(
          final.trim() === ""
            ? describeChange({ kind: "deleted", path, start: block.start, lines: before })
            : describeChange({
                kind: "edited",
                path,
                start: block.start,
                before,
                after: next.split("\n").slice(block.start, block.start + final.split("\n").length),
              }),
        );

        return { status: "ok" };
      }),

    insert: (path: string, afterId: string | null, text: string) =>
      serial(async (): Promise<EditResult> => {
        await syncAndPersist(path);

        const state = states.get(path);

        if (state == null) {
          return { status: "missing" };
        }

        if (text.trim() === "") {
          return { status: "ok" };
        }

        // An anchor the agent deleted in the meantime falls back to the end of
        // the file, so what the user wrote is never lost.
        const anchorBlock =
          afterId == null ? null : (state.blocks.find((block) => block.id === afterId) ?? state.blocks.at(-1) ?? null);
        const inserted = insertAfter(state.snapshot, anchorBlock, text);

        await writeUser(path, inserted.text);

        notify(
          describeChange({
            kind: "added",
            path,
            start: inserted.start,
            lines: inserted.text.split("\n").slice(inserted.start, inserted.start + text.split("\n").length),
            under: anchorBlock?.source ?? null,
          }),
        );

        return { status: "ok" };
      }),
  };
};

export type Workspace = Awaited<ReturnType<typeof createWorkspace>>;
