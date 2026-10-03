import { describe, expect, test } from "bun:test";

import { type Author, anchor, toStored } from "../src/anchor";

const counter = () => {
  let next = 0;

  return () => `b${++next}`;
};

const start = (text: string, actor: Author = "agent") => {
  const newId = counter();
  const blocks = anchor("", [], text, actor, newId);

  return { text, blocks, newId };
};

const summary = (blocks: ReturnType<typeof anchor>) => blocks.map(({ id, authors, source }) => ({ id, authors, source }));

describe("anchor", () => {
  test("gives every block of a new file a fresh id and the actor", () => {
    const { blocks } = start("# Title\n\nBody\n");

    expect(summary(blocks)).toEqual([
      { id: "b1", authors: ["agent"], source: "# Title" },
      { id: "b2", authors: ["agent"], source: "Body" },
    ]);
  });

  test("keeps ids and authors of untouched blocks that moved", () => {
    const first = start("Question\n\nAnswer\n");
    const answered = anchor(first.text, toStored(first.blocks), "Question\n\nAnswer\n\nMine\n", "user", first.newId);
    const shifted = "Intro\n\nQuestion\n\nAnswer\n\nMine\n";

    expect(summary(anchor("Question\n\nAnswer\n\nMine\n", toStored(answered), shifted, "agent", first.newId))).toEqual([
      { id: "b4", authors: ["agent"], source: "Intro" },
      { id: "b1", authors: ["agent"], source: "Question" },
      { id: "b2", authors: ["agent"], source: "Answer" },
      { id: "b3", authors: ["user"], source: "Mine" },
    ]);
  });

  test("keeps the id of an edited block and adds the actor as author", () => {
    const first = start("Line one\nline two\n\nOther\n", "user");
    const edited = anchor(first.text, toStored(first.blocks), "Line one\nline 2\n\nOther\n", "agent", first.newId);

    expect(summary(edited)).toEqual([
      { id: "b1", authors: ["user", "agent"], source: "Line one\nline 2" },
      { id: "b2", authors: ["user"], source: "Other" },
    ]);
  });

  test("keeps the id of a block rewritten in place", () => {
    const first = start("Old text\n\nKeep\n", "user");
    const rewritten = anchor(first.text, toStored(first.blocks), "Brand new\n\nKeep\n", "agent", first.newId);

    expect(summary(rewritten)).toEqual([
      { id: "b1", authors: ["user", "agent"], source: "Brand new" },
      { id: "b2", authors: ["user"], source: "Keep" },
    ]);
  });

  test("gives a new id to blocks added beside a rewritten one", () => {
    const first = start("Top\n\nOld\n\nBottom\n");
    const rewritten = anchor(first.text, toStored(first.blocks), "Top\n\nNew\n\nExtra\n\nBottom\n", "agent", first.newId);

    expect(summary(rewritten).map(({ id }) => id)).toEqual(["b1", "b2", "b4", "b3"]);
  });

  test("treats a block added where nothing was removed as new", () => {
    const first = start("One\n\nTwo\n", "user");
    const added = anchor(first.text, toStored(first.blocks), "One\n\nInserted\n\nTwo\n", "agent", first.newId);

    expect(summary(added)).toEqual([
      { id: "b1", authors: ["user"], source: "One" },
      { id: "b3", authors: ["agent"], source: "Inserted" },
      { id: "b2", authors: ["user"], source: "Two" },
    ]);
  });

  test("keeps user blocks that survive a full rewrite of the file", () => {
    const first = start("A\n\nB\n\nC\n", "user");
    const rewritten = anchor(first.text, toStored(first.blocks), "Z\n\nB\n\nY\n", "agent", first.newId);

    expect(rewritten.find((block) => block.source === "B")).toMatchObject({ id: "b2", authors: ["user"] });
  });

  test("hands an old id to at most one block when a block splits", () => {
    const first = start("one\ntwo\nthree\nfour\n");
    const split = anchor(first.text, toStored(first.blocks), "one\ntwo\nthree\n\nfour\n", "agent", first.newId);

    expect(summary(split)).toEqual([
      { id: "b1", authors: ["agent"], source: "one\ntwo\nthree" },
      { id: "b2", authors: ["agent"], source: "four" },
    ]);
  });
});
