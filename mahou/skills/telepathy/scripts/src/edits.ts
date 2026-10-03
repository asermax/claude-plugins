import { diff3Merge } from "node-diff3";

import type { Block } from "./blocks";

export type MergeChunk = { ok: string[] } | { conflict: { agent: string[]; base: string[]; yours: string[] } };

export type Merge = { merged: string } | { chunks: MergeChunk[] };

const LIST_MARKER = /^([-*+]|\d+[.)])\s/;

const isBlank = (line: string | undefined) => line != null && line.trim() === "";

const indentLines = (text: string, indent: string) =>
  text.split("\n").map((line) => (line.trim() === "" ? line : `${indent}${line}`));

export const replaceBlock = (text: string, block: Block, replacement: string) => {
  const lines = text.split("\n");

  if (replacement.trim() === "") {
    lines.splice(block.start, block.end - block.start);

    // Deleting a block leaves the blank lines that surrounded it; drop one so
    // two blocks do not end up separated by a double gap.
    if (isBlank(lines[block.start]) && (block.start === 0 || isBlank(lines[block.start - 1]))) {
      lines.splice(block.start, 1);
    }

    return lines.join("\n");
  }

  lines.splice(block.start, block.end - block.start, ...indentLines(replacement, block.indent));

  return lines.join("\n");
};

// Inserts user text below a block. A list item written under a list item joins
// its list at the same indentation; anything else becomes its own block,
// separated by blank lines. A null anchor inserts at the top of the file.
export const insertAfter = (text: string, anchor: Block | null, insertion: string) => {
  const lines = text === "" ? [] : text.split("\n");

  if (anchor == null) {
    const separator = lines.some((line) => line.trim() !== "") ? [""] : [];

    return { text: [...insertion.split("\n"), ...separator, ...lines].join("\n"), start: 0 };
  }

  if (anchor.kind === "list-item" && LIST_MARKER.test(insertion)) {
    lines.splice(anchor.tail, 0, ...indentLines(insertion, anchor.indent));

    return { text: lines.join("\n"), start: anchor.tail };
  }

  const following = lines[anchor.tail];
  const trailing = following == null || isBlank(following) ? [] : [""];

  lines.splice(anchor.tail, 0, "", ...insertion.split("\n"), ...trailing);

  return { text: lines.join("\n"), start: anchor.tail + 1 };
};

export const merge = (base: string, agent: string, yours: string): Merge => {
  const chunks: MergeChunk[] = diff3Merge(yours.split("\n"), base.split("\n"), agent.split("\n")).map((chunk) =>
    chunk.ok == null
      ? { conflict: { agent: chunk.conflict!.b, base: chunk.conflict!.o, yours: chunk.conflict!.a } }
      : { ok: chunk.ok },
  );

  return chunks.every((chunk) => "ok" in chunk)
    ? { merged: chunks.flatMap((chunk) => ("ok" in chunk ? chunk.ok : [])).join("\n") }
    : { chunks };
};
