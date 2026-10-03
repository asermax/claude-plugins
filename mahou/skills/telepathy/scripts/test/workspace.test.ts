import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createWorkspace } from "../src/workspace";

let root: string;
let messages: string[];

const counter = () => {
  let next = 0;

  return () => `b${++next}`;
};

const open = () => createWorkspace({ root, notify: (message) => messages.push(message), newId: counter() });

const read = (path: string) => Bun.file(join(root, path)).text();

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "telepathy-"));
  messages = [];
});

afterEach(() => rm(root, { recursive: true, force: true }));

describe("workspace", () => {
  test("lists markdown and html files, hiding dot paths", async () => {
    await Bun.write(join(root, "design.md"), "# Design\n");
    await Bun.write(join(root, "prototypes/a.html"), "<p>a</p>");
    await Bun.write(join(root, "spikes/q/main.ts"), "");
    await Bun.write(join(root, ".hidden/x.md"), "");

    const workspace = await open();

    expect(await workspace.listFiles()).toEqual(["design.md", "prototypes/a.html"]);
    expect(await Bun.file(join(root, ".meta.json")).exists()).toBe(true);
  });

  test("applies an edit, marks the user as author and notifies the agent", async () => {
    await Bun.write(join(root, "design.md"), "Q1 - where?\n\nAnswer here\n");

    const workspace = await open();
    const [, answer] = (await workspace.view("design.md"))!;

    expect(await workspace.edit("design.md", answer.id, answer.source, "In the database")).toEqual({ status: "ok" });
    expect(await read("design.md")).toBe("Q1 - where?\n\nIn the database\n");
    expect((await workspace.view("design.md"))!.map((block) => block.authors)).toEqual([["agent"], ["agent", "user"]]);
    expect(messages).toEqual([
      '[telepathy] The user edited design.md, line 3:\n```diff\n- Answer here\n+ In the database\n```',
    ]);
  });

  test("picks up agent writes before applying a user edit to another block", async () => {
    await Bun.write(join(root, "design.md"), "One\n\nTwo\n");

    const workspace = await open();
    const [, two] = (await workspace.view("design.md"))!;

    await Bun.write(join(root, "design.md"), "Intro\n\nOne\n\nTwo\n");

    expect(await workspace.edit("design.md", two.id, two.source, "Deux")).toEqual({ status: "ok" });
    expect(await read("design.md")).toBe("Intro\n\nOne\n\nDeux\n");
  });

  test("merges a user edit with an agent edit to other lines of the same block", async () => {
    await Bun.write(join(root, "design.md"), "a\nb\nc\nd\n");

    const workspace = await open();
    const [block] = (await workspace.view("design.md"))!;

    await Bun.write(join(root, "design.md"), "A\nb\nc\nd\n");

    expect(await workspace.edit("design.md", block.id, block.source, "a\nb\nc\nD")).toEqual({ status: "ok" });
    expect(await read("design.md")).toBe("A\nb\nc\nD\n");
  });

  test("returns a conflict when both sides changed the same lines", async () => {
    await Bun.write(join(root, "design.md"), "original\n");

    const workspace = await open();
    const [block] = (await workspace.view("design.md"))!;

    await Bun.write(join(root, "design.md"), "agent's\n");

    expect(await workspace.edit("design.md", block.id, block.source, "mine")).toEqual({
      status: "conflict",
      current: "agent's",
      chunks: [{ conflict: { agent: ["agent's"], base: ["original"], yours: ["mine"] } }],
    });
    expect(await read("design.md")).toBe("agent's\n");
    expect(messages).toEqual([]);
  });

  test("reports a block the agent deleted", async () => {
    await Bun.write(join(root, "design.md"), "Keep\n\nGone\n");

    const workspace = await open();
    const [, gone] = (await workspace.view("design.md"))!;

    await Bun.write(join(root, "design.md"), "Keep\n");

    expect(await workspace.edit("design.md", gone.id, gone.source, "edited")).toEqual({ status: "deleted" });
  });

  test("inserts under a block and deletes a cleared one", async () => {
    await Bun.write(join(root, "design.md"), "Question\n\nNext\n");

    const workspace = await open();
    const [question, next] = (await workspace.view("design.md"))!;

    await workspace.insert("design.md", question.id, "My answer");
    await workspace.edit("design.md", next.id, next.source, "");

    expect(await read("design.md")).toBe("Question\n\nMy answer\n");
    expect(messages).toEqual([
      '[telepathy] The user added line 3 to design.md, under "Question":\n```diff\n+ My answer\n```',
      "[telepathy] The user deleted line 5 of design.md:\n```diff\n- Next\n```",
    ]);
  });

  test("keeps authorship across a restart", async () => {
    await Bun.write(join(root, "design.md"), "Agent text\n");

    const first = await open();
    const [block] = (await first.view("design.md"))!;

    await first.insert("design.md", block.id, "User text");
    await Bun.write(join(root, "design.md"), "Agent text\n\nUser text\n\nWritten while stopped\n");

    const second = await open();

    expect((await second.view("design.md"))!.map(({ source, authors }) => ({ source, authors }))).toEqual([
      { source: "Agent text", authors: ["agent"] },
      { source: "User text", authors: ["user"] },
      { source: "Written while stopped", authors: ["agent"] },
    ]);
  });
});
