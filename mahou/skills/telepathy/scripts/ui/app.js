import MarkdownIt from "https://esm.sh/markdown-it@14";
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";

const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;

mermaid.initialize({ startOnLoad: false, theme: dark ? "dark" : "default" });

const md = new MarkdownIt({ linkify: true, breaks: true });
const defaultFence = md.renderer.rules.fence;

md.renderer.rules.fence = (tokens, index, options, env, self) =>
  tokens[index].info.trim() === "mermaid"
    ? `<pre class="mermaid">${md.utils.escapeHtml(tokens[index].content)}</pre>`
    : defaultFence(tokens, index, options, env, self);

const CALLOUT_MARKER = /^\[!([\w-]+)\][+-]?[ \t]*([^<\n]*)(?:<br>\n?)?/;

// Obsidian-style callouts: a blockquote whose first line is "[!type] Title".
// markdown-it renders them as plain blockquotes, so the marker is turned into a
// titled box here, after rendering.
const renderCallouts = (root) => {
  for (const quote of root.querySelectorAll("blockquote")) {
    const first = quote.firstElementChild;
    const match = first?.tagName === "P" ? first.innerHTML.match(CALLOUT_MARKER) : null;

    if (match == null) {
      continue;
    }

    const [marker, type, title] = match;
    const callout = document.createElement("div");
    const heading = document.createElement("div");

    first.innerHTML = first.innerHTML.slice(marker.length);

    if (first.innerHTML.trim() === "") {
      first.remove();
    }

    callout.className = "callout";
    callout.dataset.type = type.toLowerCase();
    heading.className = "callout-title";
    heading.innerHTML = title.trim() === "" ? type.charAt(0).toUpperCase() + type.slice(1) : title;
    callout.append(heading, ...quote.childNodes);
    quote.replaceWith(callout);
  }
};

const elements = {
  root: document.getElementById("root-name"),
  connection: document.getElementById("connection"),
  files: document.getElementById("files"),
  fileName: document.getElementById("file-name"),
  content: document.getElementById("content"),
};

const state = {
  files: [],
  path: null,
  blocks: [],
  editor: null,
};

const rendered = new Map();

let rerendering = false;

const post = async (url, body) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: state.path, ...body }),
    });

    return await response.json();
  } catch {
    return { status: "offline" };
  }
};

const OFFLINE_NOTE = "The server did not answer, so nothing was sent. Your text is still here; send it again once the page reconnects.";

const keepOpen = (editor) => {
  editor.busy = false;
  editor.note.hidden = false;
  editor.note.textContent = OFFLINE_NOTE;
};


const autosize = (textarea) => {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight + textarea.offsetHeight - textarea.clientHeight}px`;
};

const textareaWith = (value) => {
  const textarea = document.createElement("textarea");

  textarea.value = value;
  textarea.spellcheck = false;
  textarea.rows = 1;
  textarea.addEventListener("input", () => autosize(textarea));

  return textarea;
};

const previousId = (id) => {
  const index = state.blocks.findIndex((block) => block.id === id);

  return index > 0 ? state.blocks[index - 1].id : null;
};

const closeEditor = (editor = state.editor) => {
  if (state.editor === editor) {
    state.editor = null;
  }

  return loadFile();
};

const focusEditor = () => {
  const textarea = state.editor?.textarea;

  if (textarea == null) {
    return;
  }

  autosize(textarea);
  textarea.focus();
  textarea.setSelectionRange(textarea.value.length, textarea.value.length);
};

// Enter and blur both send. The flag keeps the blur that follows an Enter, or
// one fired while the page re-renders, from sending the same text twice.
const createTextEditor = ({ mode, id, afterId, base, depth = 0 }) => {
  const element = document.createElement("div");
  const textarea = textareaWith(mode === "edit" ? base : "");
  const note = document.createElement("p");

  element.className = "block editor";
  element.style.setProperty("--depth", depth);
  note.className = "note";
  note.hidden = true;
  element.append(textarea, note);

  const editor = { mode, id, afterId, base, element, textarea, note, busy: false };

  const commit = async () => {
    if (editor.busy || state.editor !== editor) {
      return;
    }

    const text = textarea.value.replace(/\s+$/, "");

    if ((mode === "edit" && text === base) || (mode === "insert" && text.trim() === "")) {
      return closeEditor(editor);
    }

    editor.busy = true;

    const result =
      mode === "edit" ? await post("/api/edit", { id, base, text }) : await post("/api/insert", { afterId, text });

    if (result.status === "offline") {
      return keepOpen(editor);
    }

    if (result.status === "conflict") {
      return openMerge({ kind: "conflict", id, current: result.current, chunks: result.chunks, yours: text });
    }

    if (result.status === "deleted") {
      return openMerge({ kind: "deleted", id, afterId: editor.previous, yours: text });
    }

    return closeEditor(editor);
  };

  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      editor.busy = true;
      closeEditor(editor);
    }
  });

  textarea.addEventListener("blur", () => {
    if (!rerendering) {
      commit();
    }
  });

  editor.previous = id == null ? null : previousId(id);

  return editor;
};

const lines = (values) => values.join("\n");

const createMergeEditor = ({ kind, id, afterId, current, chunks, yours }) => {
  const element = document.createElement("div");
  const intro = document.createElement("p");
  const note = document.createElement("p");
  const choices = (chunks ?? []).map(() => "yours");
  const hunks = document.createElement("div");
  const textarea = textareaWith("");
  const actions = document.createElement("div");
  const save = document.createElement("button");
  const drop = document.createElement("button");

  element.className = "block merge";
  actions.className = "actions";
  note.className = "note";
  note.hidden = true;

  intro.textContent =
    kind === "conflict"
      ? "The agent changed the same lines while you were editing. Pick a side per change or combine them in the result below, then press Enter."
      : "The agent deleted this block while you were editing. Enter restores your text; Esc lets the deletion stand.";

  save.textContent = kind === "conflict" ? "Save result (Enter)" : "Restore (Enter)";
  drop.textContent = kind === "conflict" ? "Keep the agent's version (Esc)" : "Let it go (Esc)";

  const compose = () =>
    kind === "conflict"
      ? lines(
          chunks.flatMap((chunk, index) => {
            if (chunk.ok != null) {
              return chunk.ok;
            }

            const choice = choices[index];

            return choice === "agent"
              ? chunk.conflict.agent
              : choice === "yours"
                ? chunk.conflict.yours
                : [...chunk.conflict.agent, ...chunk.conflict.yours];
          }),
        )
      : yours;

  const choiceButtons = [];

  (chunks ?? []).forEach((chunk, index) => {
    if (chunk.conflict == null) {
      return;
    }

    const hunk = document.createElement("div");
    const buttons = document.createElement("div");

    hunk.className = "hunk";
    buttons.className = "choices";

    hunk.innerHTML = `
      <div class="side agent"><h4>Agent's</h4><pre></pre></div>
      <div class="side yours"><h4>Yours</h4><pre></pre></div>`;
    hunk.querySelector(".agent pre").textContent = lines(chunk.conflict.agent) || "(removed)";
    hunk.querySelector(".yours pre").textContent = lines(chunk.conflict.yours) || "(removed)";

    for (const [value, label] of [
      ["agent", "Agent's"],
      ["yours", "Yours"],
      ["both", "Both"],
    ]) {
      const button = document.createElement("button");

      button.textContent = label;
      button.dataset.index = index;
      button.dataset.value = value;
      button.addEventListener("mousedown", (event) => event.preventDefault());
      button.addEventListener("click", () => {
        choices[index] = value;
        textarea.value = compose();
        refreshChoices();
        focusEditor();
      });

      choiceButtons.push(button);
      buttons.append(button);
    }

    hunk.append(buttons);
    hunks.append(hunk);
  });

  const refreshChoices = () => {
    for (const button of choiceButtons) {
      button.classList.toggle("chosen", choices[button.dataset.index] === button.dataset.value);
    }
  };

  const editor = {
    mode: "merge",
    id,
    afterId,
    previous: previousId(id),
    base: current,
    element,
    textarea,
    note,
    busy: false,
  };

  const submit = async () => {
    if (editor.busy) {
      return;
    }

    editor.busy = true;

    const text = textarea.value.replace(/\s+$/, "");
    const result =
      kind === "conflict"
        ? await post("/api/edit", { id, base: current, text })
        : await post("/api/insert", { afterId, text });

    if (result.status === "offline") {
      return keepOpen(editor);
    }

    if (result.status === "conflict") {
      return openMerge({ kind: "conflict", id, current: result.current, chunks: result.chunks, yours: text });
    }

    return closeEditor(editor);
  };

  textarea.value = compose();
  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      submit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeEditor(editor);
    }
  });

  save.addEventListener("click", submit);
  drop.addEventListener("click", () => closeEditor(editor));
  actions.append(save, drop);
  element.append(intro, hunks, textarea, note, actions);
  refreshChoices();

  return editor;
};

const openMerge = (options) => {
  state.editor = createMergeEditor(options);

  return loadFile().then(focusEditor);
};

const openEditor = (options) => {
  state.editor = createTextEditor(options);
  render();
  focusEditor();
};

const blockNode = (block) => {
  const key = `${block.id}\u0000${block.source}\u0000${block.authors.join()}\u0000${block.depth}`;

  if (rendered.has(key)) {
    return rendered.get(key);
  }

  const element = document.createElement("div");
  const add = document.createElement("button");
  const content = document.createElement("div");

  element.className = block.authors.includes("user") ? "block mine" : "block";
  element.style.setProperty("--depth", block.depth);
  add.className = "add";
  add.textContent = "+";
  add.title = "Write under this block";
  content.className = "content";
  content.innerHTML = md.render(block.source);
  renderCallouts(content);

  add.addEventListener("click", () => openEditor({ mode: "insert", afterId: block.id, depth: block.depth }));
  content.addEventListener("click", (event) => {
    const link = event.target.closest("a");

    if (link != null || window.getSelection().toString() !== "") {
      return;
    }

    openEditor({ mode: "edit", id: block.id, base: block.source, depth: block.depth });
  });

  element.append(add, content);
  rendered.set(key, element);

  return element;
};

const emptyNode = () => {
  const element = document.createElement("div");

  element.className = "empty";
  element.textContent = "This file is empty. Click to write the first block.";
  element.addEventListener("click", () => openEditor({ mode: "insert", afterId: null }));

  return element;
};

// An editor replaces the block it edits. An editor with no block of its own
// (writing under a block, or restoring one the agent deleted) sits after its
// anchor, or at the top when there is none.
const desiredNodes = () => {
  const editor = state.editor;
  const inPlace = editor != null && editor.id != null && state.blocks.some((block) => block.id === editor.id);
  const after = editor == null || inPlace ? undefined : (editor.afterId ?? editor.previous ?? null);
  const nodes = after === null ? [editor.element] : [];

  if (editor?.note != null) {
    editor.note.hidden = true;
  }

  for (const block of state.blocks) {
    if (inPlace && editor.id === block.id) {
      nodes.push(editor.element);

      if (editor.note != null && block.source !== editor.base) {
        editor.note.hidden = false;
        editor.note.textContent = "The agent changed this block while you were editing. Sending will merge the two.";
      }
    } else {
      nodes.push(blockNode(block));
    }

    if (after != null && after === block.id) {
      nodes.push(editor.element);
    }
  }

  if (editor != null && !nodes.includes(editor.element)) {
    nodes.push(editor.element);
  }

  if (editor?.note != null && editor.mode === "edit" && !inPlace) {
    editor.note.hidden = false;
    editor.note.textContent = "The agent deleted this block while you were editing.";
  }

  if (nodes.length === 0) {
    nodes.push(emptyNode());
  }

  return nodes;
};

// Nodes are reconciled in place rather than replaced, so an open editor never
// leaves the document: removing it would drop focus and fire a blur that sends.
const render = () => {
  const nodes = desiredNodes();
  const wanted = new Set(nodes);
  const active = document.activeElement;

  rerendering = true;

  for (const child of [...elements.content.children]) {
    if (!wanted.has(child)) {
      child.remove();
    }
  }

  nodes.forEach((node, index) => {
    if (elements.content.children[index] !== node) {
      elements.content.insertBefore(node, elements.content.children[index] ?? null);
    }
  });

  if (active != null && active !== document.activeElement && elements.content.contains(active)) {
    active.focus();
  }

  rerendering = false;

  const pending = [...elements.content.querySelectorAll("pre.mermaid:not([data-processed])")];

  if (pending.length > 0) {
    mermaid.run({ nodes: pending }).catch(() => undefined);
  }
};

const renderHtml = () => {
  const frame = document.createElement("iframe");

  frame.src = `/raw/${encodeURIComponent(state.path)}?t=${Date.now()}`;
  elements.content.replaceChildren(frame);
};

const loadFile = async () => {
  if (state.path == null) {
    elements.content.replaceChildren();

    return;
  }

  elements.fileName.textContent = state.path;

  if (!state.path.endsWith(".md")) {
    state.editor = null;

    return renderHtml();
  }

  const response = await fetch(`/api/file?path=${encodeURIComponent(state.path)}`);

  if (!response.ok) {
    state.blocks = [];
    elements.content.replaceChildren();

    return;
  }

  state.blocks = (await response.json()).blocks;
  render();
};

const renderFiles = () => {
  const nodes = [];
  let folder = null;

  for (const path of state.files) {
    const slash = path.lastIndexOf("/");
    const directory = slash === -1 ? null : path.slice(0, slash);

    if (directory !== folder && directory != null) {
      const header = document.createElement("div");

      header.className = "folder";
      header.textContent = directory;
      nodes.push(header);
    }

    folder = directory;

    const button = document.createElement("button");

    button.className = `file${directory == null ? "" : " nested"}${path === state.path ? " active" : ""}`;
    button.textContent = path.slice(slash + 1);
    button.addEventListener("click", () => selectFile(path));
    nodes.push(button);
  }

  elements.files.replaceChildren(...nodes);
};

const selectFile = (path) => {
  if (path === state.path) {
    return;
  }

  state.path = path;
  state.editor = null;
  rendered.clear();
  elements.content.replaceChildren();
  history.replaceState(null, "", `#${encodeURIComponent(path)}`);
  renderFiles();
  loadFile();
};

const loadFiles = async () => {
  const { root, files } = await (await fetch("/api/files")).json();

  state.files = files;
  elements.root.textContent = root;
  document.title = `telepathy · ${root}`;

  const wanted = decodeURIComponent(location.hash.slice(1));

  if (state.path == null || !files.includes(state.path)) {
    const next = files.includes(wanted) ? wanted : (files[0] ?? null);

    state.path = null;

    if (next == null) {
      renderFiles();
      elements.fileName.textContent = "";
      elements.content.textContent = "No files yet. The agent's files will appear here.";
    } else {
      selectFile(next);
    }

    return;
  }

  renderFiles();
};

const connect = () => {
  const events = new EventSource("/api/events");

  events.addEventListener("open", () => {
    elements.connection.textContent = "connected";
    elements.connection.classList.remove("offline");
    elements.connection.classList.add("online");
    loadFiles().then(loadFile);
  });

  events.addEventListener("error", () => {
    elements.connection.textContent = "disconnected, retrying…";
    elements.connection.classList.remove("online");
    elements.connection.classList.add("offline");
  });

  events.addEventListener("message", (message) => {
    const event = JSON.parse(message.data);

    if (event.type === "files") {
      loadFiles();
    } else if (event.type === "file" && event.path === state.path) {
      loadFile();
    }
  });
};

connect();
