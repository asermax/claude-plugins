# Markdown AST parsers in Node

verified: 2026-09-12

Which markdown parsers return a syntax tree rather than HTML, and what each one reports for a node's position in the file.

## Knowledge

- `mdast-util-from-markdown` 2.0.3 returns an mdast tree directly and is the package `remark-parse` wraps. Its own documentation says to use it alone when you handle the tree yourself. It ships as ESM with bundled types and has 11 small dependencies from the same authors.
- In mdast, a fenced code block is a `code` node: `lang` holds the first word of the info string, `meta` the rest, `value` the text between the fences, and `position.start` / `position.end` carry line, column and offset, with lines counted from 1.
- Going through `unified` plus `remark-parse` plus `unist-util-visit` gives the same tree and installs three more packages.
- `markdown-it` 15.0.2 is written in TypeScript, ships ESM and CommonJS, and has 6 dependencies. A fence is a token with `info` holding the whole info string unsplit, `content` for the text, and `map` as a 0-indexed half-open `[startLine, endLine)`. `map[0]` is the opening fence line, so the content starts one line later, and `map[1]` is the line after the block.
- `marked` 18 has no dependencies and no position data on any token; its lexer tracks none. Recovering a line number means counting newlines.
- `micromark` 4.0.2 is the token layer under mdast-util-from-markdown: a flat stream of enter and exit events with points carrying line, column and offset. Reassembling a block from it is what mdast-util-from-markdown does.
- `@textlint/markdown-to-ast` wraps remark, renames the node types and adds `loc` and `range`. It is CommonJS and always loads the frontmatter extension, which cannot be turned off.
- No parser in the set interprets the inside of a fenced block. A CommonMark parser scans for a closing fence and nothing else, so a YAML frontmatter block inside a fence is never parsed.
- None of them handles a document's own top-level frontmatter by default. Without `remark-frontmatter` or its equivalent, a leading `---` block parses as a thematic break and a paragraph.
- `markdown-rs` has no Node binding. The `comrak` package on npm is a third-party WASM build, and whether it exposes a tree at all could not be verified.

## Sources

- https://github.com/syntax-tree/mdast-util-from-markdown
- https://github.com/syntax-tree/mdast
- https://github.com/markdown-it/markdown-it
- https://github.com/markedjs/marked
- https://github.com/micromark/micromark
