import { diffArrays } from "diff";

import { type Block, parseBlocks } from "./blocks";

export const AUTHORS = { user: "user", agent: "agent" } as const;

export type Author = (typeof AUTHORS)[keyof typeof AUTHORS];

export type AnchoredBlock = Block & {
  id: string;
  authors: Author[];
};

export type StoredBlock = Pick<AnchoredBlock, "id" | "start" | "end" | "authors"> & {
  excerpt: string;
};

export const excerpt = (source: string) => {
  const line = source.split("\n").find((candidate) => candidate.trim() !== "") ?? "";
  const trimmed = line.trim();

  return trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed;
};

export const toStored = (blocks: AnchoredBlock[]): StoredBlock[] =>
  blocks.map(({ id, start, end, authors, source }) => ({ id, start, end, authors, excerpt: excerpt(source) }));

const newLineToOldLine = (previous: string[], current: string[]) => {
  const mapping = new Map<number, number>();
  let oldLine = 0;
  let newLine = 0;

  for (const part of diffArrays(previous, current)) {
    const count = part.value.length;

    if (part.added) {
      newLine += count;
    } else if (part.removed) {
      oldLine += count;
    } else {
      for (let offset = 0; offset < count; offset++) {
        mapping.set(newLine + offset, oldLine + offset);
      }

      oldLine += count;
      newLine += count;
    }
  }

  return mapping;
};

// Carries ids and authors from the previous version of a file to the current
// one. A line diff tells which lines survived; each current block inherits the
// identity of the previous block most of its surviving lines came from, and a
// block whose lines all survived untouched keeps its authors unchanged.
export const anchor = (
  previousText: string,
  previousBlocks: StoredBlock[],
  text: string,
  actor: Author,
  newId: () => string,
): AnchoredBlock[] => {
  const blocks = parseBlocks(text);
  const mapping = newLineToOldLine(previousText.split("\n"), text.split("\n"));

  const owner = new Map<number, number>();

  previousBlocks.forEach((block, index) => {
    for (let line = block.start; line < block.end; line++) {
      owner.set(line, index);
    }
  });

  const candidates: { current: number; previous: number; overlap: number }[] = [];

  blocks.forEach((block, current) => {
    const overlaps = new Map<number, number>();

    for (let line = block.start; line < block.end; line++) {
      const oldLine = mapping.get(line);
      const previous = oldLine == null ? undefined : owner.get(oldLine);

      if (previous != null) {
        overlaps.set(previous, (overlaps.get(previous) ?? 0) + 1);
      }
    }

    overlaps.forEach((overlap, previous) => candidates.push({ current, previous, overlap }));
  });

  candidates.sort((a, b) => b.overlap - a.overlap);

  const matched = new Map<number, number>();
  const taken = new Set<number>();

  for (const { current, previous } of candidates) {
    if (matched.has(current) || taken.has(previous)) {
      continue;
    }

    matched.set(current, previous);
    taken.add(previous);
  }

  // A block rewritten from top to bottom shares no line with its old version.
  // It is still the same block when it sits in the same gap between matched
  // neighbours, and pairing the leftovers of each gap in order keeps its id, so
  // a user editing it meets a conflict instead of a block that seems deleted.
  let lastPrevious = -1;
  let pending: number[] = [];

  const pairGap = (nextPrevious: number) => {
    const free = previousBlocks
      .map((_, index) => index)
      .filter((index) => index > lastPrevious && index < nextPrevious && !taken.has(index));

    pending.slice(0, free.length).forEach((current, offset) => {
      matched.set(current, free[offset]);
      taken.add(free[offset]);
    });

    pending = [];
  };

  blocks.forEach((_, current) => {
    const previous = matched.get(current);

    if (previous == null) {
      pending.push(current);

      return;
    }

    pairGap(previous);
    lastPrevious = Math.max(lastPrevious, previous);
  });

  pairGap(previousBlocks.length);

  return blocks.map((block, current) => {
    const previousIndex = matched.get(current);

    if (previousIndex == null) {
      return { ...block, id: newId(), authors: [actor] };
    }

    const previous = previousBlocks[previousIndex];
    const length = block.end - block.start;
    const untouched =
      length === previous.end - previous.start &&
      Array.from({ length }, (_, offset) => mapping.get(block.start + offset) === previous.start + offset).every(
        Boolean,
      );

    return {
      ...block,
      id: previous.id,
      authors: untouched || previous.authors.includes(actor) ? previous.authors : [...previous.authors, actor],
    };
  });
};
