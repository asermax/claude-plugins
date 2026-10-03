import { diffArrays } from "diff";

import { excerpt } from "./anchor";

export const MESSAGE_PREFIX = "[telepathy]";

type Change =
  | { kind: "edited"; path: string; start: number; before: string[]; after: string[] }
  | { kind: "added"; path: string; start: number; lines: string[]; under: string | null }
  | { kind: "deleted"; path: string; start: number; lines: string[] };

const range = (start: number, count: number) =>
  count <= 1 ? `line ${start + 1}` : `lines ${start + 1}-${start + count}`;

const fenced = (lines: string[]) => ["```diff", ...lines, "```"].join("\n");

const prefixed = (sign: string, lines: string[]) => lines.map((line) => `${sign} ${line}`);

const diffLines = (before: string[], after: string[]) =>
  diffArrays(before, after).flatMap((part) => prefixed(part.added ? "+" : part.removed ? "-" : " ", part.value));

export const describeChange = (change: Change) => {
  switch (change.kind) {
    case "edited":
      return [
        `${MESSAGE_PREFIX} The user edited ${change.path}, ${range(change.start, change.after.length)}:`,
        fenced(diffLines(change.before, change.after)),
      ].join("\n");

    case "added":
      return [
        `${MESSAGE_PREFIX} The user added ${range(change.start, change.lines.length)} to ${change.path}, ${
          change.under == null ? "at the top of the file" : `under "${excerpt(change.under)}"`
        }:`,
        fenced(prefixed("+", change.lines)),
      ].join("\n");

    case "deleted":
      return [
        `${MESSAGE_PREFIX} The user deleted ${range(change.start, change.lines.length)} of ${change.path}:`,
        fenced(prefixed("-", change.lines)),
      ].join("\n");
  }
};
