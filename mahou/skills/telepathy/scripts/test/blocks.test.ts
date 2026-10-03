import { describe, expect, test } from "bun:test";

import { parseBlocks } from "../src/blocks";

const summary = (text: string) =>
  parseBlocks(text).map(({ start, end, tail, depth, kind, source }) => ({ start, end, tail, depth, kind, source }));

describe("parseBlocks", () => {
  test("splits top-level blocks and trims blank lines", () => {
    const text = "# Title\n\nFirst paragraph\nstill first\n\n```mermaid\ngraph TD\n  A --> B\n```\n";

    expect(summary(text)).toEqual([
      { start: 0, end: 1, tail: 1, depth: 0, kind: "block", source: "# Title" },
      { start: 2, end: 4, tail: 4, depth: 0, kind: "block", source: "First paragraph\nstill first" },
      { start: 5, end: 9, tail: 9, depth: 0, kind: "block", source: "```mermaid\ngraph TD\n  A --> B\n```" },
    ]);
  });

  test("makes every list item its own block, without its children", () => {
    const text = "- parent\n  continued\n  - child\n    - grandchild\n- sibling\n";

    expect(summary(text)).toEqual([
      { start: 0, end: 2, tail: 4, depth: 0, kind: "list-item", source: "- parent\n  continued" },
      { start: 2, end: 3, tail: 4, depth: 1, kind: "list-item", source: "- child" },
      { start: 3, end: 4, tail: 4, depth: 2, kind: "list-item", source: "- grandchild" },
      { start: 4, end: 5, tail: 5, depth: 0, kind: "list-item", source: "- sibling" },
    ]);
  });

  test("keeps a blockquote and a table whole", () => {
    const text = "> quoted\n> - not an item block\n\n| a | b |\n| - | - |\n| 1 | 2 |\n";

    expect(summary(text).map(({ start, end }) => [start, end])).toEqual([
      [0, 2],
      [3, 6],
    ]);
  });

  test("returns no blocks for an empty file", () => {
    expect(parseBlocks("")).toEqual([]);
    expect(parseBlocks("\n\n")).toEqual([]);
  });

  test("keeps the indentation of a nested item out of its source", () => {
    const [, child] = parseBlocks("1. one\n   - nested\n     more\n");

    expect(child.indent).toBe("   ");
    expect(child.source).toBe("- nested\n  more");
  });
});
