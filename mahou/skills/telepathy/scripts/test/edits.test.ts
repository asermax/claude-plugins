import { describe, expect, test } from "bun:test";

import { parseBlocks } from "../src/blocks";
import { insertAfter, merge, replaceBlock } from "../src/edits";

const blockWith = (text: string, source: string) => parseBlocks(text).find((block) => block.source === source)!;

describe("replaceBlock", () => {
  test("replaces a block's lines", () => {
    const text = "One\n\nTwo\n\nThree\n";

    expect(replaceBlock(text, blockWith(text, "Two"), "Deux\nzwei")).toBe("One\n\nDeux\nzwei\n\nThree\n");
  });

  test("puts back the indentation of a nested item", () => {
    const text = "- a\n  - b\n";

    expect(replaceBlock(text, blockWith(text, "- b"), "- B\n  more")).toBe("- a\n  - B\n    more\n");
  });

  test("deletes a block and one of the blank lines around it", () => {
    const text = "One\n\nTwo\n\nThree\n";

    expect(replaceBlock(text, blockWith(text, "Two"), "")).toBe("One\n\nThree\n");
    expect(replaceBlock(text, blockWith(text, "One"), "  ")).toBe("Two\n\nThree\n");
  });
});

describe("insertAfter", () => {
  test("adds a paragraph under a block as its own block", () => {
    const text = "Question?\n\nNext\n";

    expect(insertAfter(text, blockWith(text, "Question?"), "Answer").text).toBe("Question?\n\nAnswer\n\nNext\n");
  });

  test("adds a paragraph at the end of a file", () => {
    const text = "Question?";

    expect(insertAfter(text, blockWith(text, "Question?"), "Answer").text).toBe("Question?\n\nAnswer");
  });

  test("adds a list item to the anchor's list after its children", () => {
    const text = "- a\n  - child\n- b\n";

    expect(insertAfter(text, blockWith(text, "- a"), "- new").text).toBe("- a\n  - child\n- new\n- b\n");
    expect(insertAfter(text, blockWith(text, "- child"), "- sibling").text).toBe("- a\n  - child\n  - sibling\n- b\n");
  });

  test("reports the line the insertion starts at", () => {
    const text = "- a\n- b\n\nPara\n";

    expect(insertAfter(text, blockWith(text, "- a"), "- new").start).toBe(1);
    expect(insertAfter(text, blockWith(text, "Para"), "Next").start).toBe(5);
  });

  test("inserts at the top of a file when there is no anchor", () => {
    expect(insertAfter("", null, "First").text).toBe("First");
    expect(insertAfter("Existing\n", null, "First").text).toBe("First\n\nExisting\n");
  });
});

describe("merge", () => {
  test("merges changes to different lines", () => {
    expect(merge("a\nb\nc\nd", "A\nb\nc\nd", "a\nb\nc\nD")).toEqual({ merged: "A\nb\nc\nD" });
  });

  test("returns the chunks when both sides changed the same line", () => {
    expect(merge("a\nb\nc", "a\nagent\nc", "a\nyours\nc")).toEqual({
      chunks: [{ ok: ["a"] }, { conflict: { agent: ["agent"], base: ["b"], yours: ["yours"] } }, { ok: ["c"] }],
    });
  });
});
