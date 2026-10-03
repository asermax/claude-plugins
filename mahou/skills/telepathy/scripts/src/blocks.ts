import MarkdownIt from "markdown-it";

export type Block = {
  start: number;
  end: number;
  tail: number;
  depth: number;
  kind: "list-item" | "block";
  indent: string;
  source: string;
};

type Item = {
  map: [number, number];
  depth: number;
  children: [number, number][];
};

const parser = new MarkdownIt();

const LIST_OPEN = new Set(["bullet_list_open", "ordered_list_open"]);

const isBlank = (line: string) => line.trim() === "";

const trim = (lines: string[], start: number, end: number): [number, number] => {
  let from = start;
  let to = end;

  while (from < to && isBlank(lines[from])) {
    from++;
  }

  while (to > from && isBlank(lines[to - 1])) {
    to--;
  }

  return [from, to];
};

const leadingWhitespace = (line: string) => line.match(/^\s*/)![0];

// A nested list item is handed to the editor without its indentation, so the
// user edits "- item" and not "      - item"; the server puts it back on write.
const commonIndent = (lines: string[]) => {
  const indent = leadingWhitespace(lines[0]);

  return lines.every((line) => isBlank(line) || line.startsWith(indent)) ? indent : "";
};

const toBlock = (
  lines: string[],
  [start, end]: [number, number],
  tail: number,
  depth: number,
  kind: Block["kind"],
): Block => {
  const own = lines.slice(start, end);
  const indent = commonIndent(own);

  return {
    start,
    end,
    tail,
    depth,
    kind,
    indent,
    source: own.map((line) => line.slice(indent.length)).join("\n"),
  };
};

const segments = ([start, end]: [number, number], holes: [number, number][]) => {
  const result: [number, number][] = [];
  let cursor = start;

  for (const [holeStart, holeEnd] of [...holes].sort((a, b) => a[0] - b[0])) {
    if (holeStart > cursor) {
      result.push([cursor, holeStart]);
    }

    cursor = Math.max(cursor, holeEnd);
  }

  if (cursor < end) {
    result.push([cursor, end]);
  }

  return result;
};

export const parseBlocks = (text: string): Block[] => {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  const items: Item[] = [];
  const stack: { type: string; item?: Item }[] = [];

  for (const token of parser.parse(text, {})) {
    if (token.nesting === -1) {
      stack.pop();

      continue;
    }

    const parent = stack.at(-1);
    const outsideOpaque = stack.every((entry) => LIST_OPEN.has(entry.type) || entry.type === "list_item_open");

    if (outsideOpaque && token.map != null) {
      if (LIST_OPEN.has(token.type)) {
        parent?.item?.children.push(token.map);
      } else if (token.type === "list_item_open") {
        const item: Item = {
          map: token.map,
          depth: stack.filter((entry) => entry.type === "list_item_open").length,
          children: [],
        };

        items.push(item);
        stack.push({ type: token.type, item });

        continue;
      } else if (parent == null) {
        const range = trim(lines, token.map[0], token.map[1]);

        if (range[1] > range[0]) {
          blocks.push(toBlock(lines, range, range[1], 0, "block"));
        }
      }
    }

    if (token.nesting === 1) {
      stack.push({ type: token.type });
    }
  }

  for (const item of items) {
    const [, itemEnd] = trim(lines, item.map[0], item.map[1]);

    segments(item.map, item.children).forEach((segment, index) => {
      const range = trim(lines, segment[0], segment[1]);

      if (range[1] > range[0]) {
        blocks.push(
          toBlock(lines, range, index === 0 ? itemEnd : range[1], item.depth, index === 0 ? "list-item" : "block"),
        );
      }
    });
  }

  return blocks.sort((a, b) => a.start - b.start);
};
