import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { GREEN, HAND, INK, LINE, MONO, MUTED, PAPER, RED, sketchBorder } from './theme'

export interface CodeLine {
  text: string
  mark: 'same' | 'add' | 'remove' | 'gap'
  note: string | null
}

export interface Highlight {
  pattern: string
  color: string
}

export interface CodeSnippetProps {
  file: string
  tag: string | null
  lines: CodeLine[]
  gutterNotes: boolean
  highlight: Highlight[]
  view: 'unified' | 'split' | 'code'
  expanded: number[]
}

interface NotesLayout {
  tops: number[]
  lines: number[]
  height: number
  clipped: number[]
}

const sameLayout = (a: NotesLayout, b: NotesLayout) =>
  a.height === b.height && a.tops.join() === b.tops.join() && a.lines.join() === b.lines.join() && a.clipped.join() === b.clipped.join()

const MARK_BG: Record<CodeLine['mark'], string> = {
  same: 'transparent',
  add: '#e6f7ee',
  remove: '#fdecec',
  gap: 'transparent',
}

const MARK_SIGN: Record<CodeLine['mark'], string> = { same: ' ', add: '+', remove: '−', gap: ' ' }

// The default highlighting is a small JS/TS tokenizer. Each rule is tried in
// order at the current position, anchored to it, and the first that matches
// colors that part of the line. A shape passes its own rules to change them.
export const JS_HIGHLIGHT: Highlight[] = [
  { pattern: '//.*', color: '#868e96' },
  { pattern: `(["'\`])(?:\\\\.|(?!\\1).)*\\1`, color: '#2b8a3e' },
  { pattern: '\\b(?:const|let|var|if|else|return|yield|function|async|await|export|import|from|new|true|false|null|undefined)\\b', color: '#9c36b5' },
  { pattern: '\\b\\d+(?:\\.\\d+)?\\b', color: '#e8590c' },
  { pattern: '[A-Za-z_$][\\w$]*(?=\\s*\\()', color: '#1971c2' },
  { pattern: '[A-Za-z_$][\\w$]*(?=\\s*:)', color: '#c2255c' },
]

const colorize = (text: string, rules: Highlight[]) => {
  const compiled = rules.map((rule) => ({ regex: new RegExp(`^(?:${rule.pattern})`), color: rule.color }))
  const parts: { text: string; color: string }[] = []
  let rest = text

  while (rest.length > 0) {
    const hit = compiled.map((rule) => ({ match: rest.match(rule.regex)?.[0], color: rule.color })).find((rule) => rule.match != null && rule.match.length > 0)
    const match = hit?.match ?? rest.match(/^[\w$]+|^\s+|^./)?.[0] ?? rest[0]

    parts.push({ text: match, color: hit?.color ?? INK })
    rest = rest.slice(match.length)
  }

  return parts.map((part, index) => (
    <span key={index} style={{ color: part.color }}>
      {part.text}
    </span>
  ))
}

// In the split view each side keeps the lines it has: the old side drops added lines and the new side drops removed
// ones, and an added or removed line faces an empty row so the unchanged lines stay aligned.
const splitRows = (lines: CodeLine[]) => {
  const rows: { old: CodeLine | null; next: CodeLine | null; index: number }[] = []
  let pending: CodeLine[] = []

  lines.forEach((line, index) => {
    if (line.mark === 'remove') {
      pending.push(line)
      return
    }
    if (line.mark === 'add' && pending.length > 0) {
      rows.push({ old: pending.shift()!, next: line, index })
      return
    }
    pending.forEach((removed) => rows.push({ old: removed, next: null, index: -1 }))
    pending = []
    rows.push(line.mark === 'add' ? { old: null, next: line, index } : { old: line, next: line, index })
  })
  pending.forEach((removed) => rows.push({ old: removed, next: null, index: -1 }))

  return rows
}

// In the code view the lines are a plain file, not a diff: no mark colours and no struck-through lines. A line too
// long for the column wraps instead of being cut, its continuation indented two characters past the line's own
// indent, and the notes follow the taller row.
const Cell = ({ line, number, rules, plain = false }: { line: CodeLine | null; number: number | null; rules: Highlight[]; plain?: boolean }) => {
  if (line == null) return <div style={{ flex: 1, minWidth: 0, background: '#f8f9fa' }}>&nbsp;</div>

  const indent = line.text.match(/^ */)?.[0].length ?? 0
  const text = line.text.slice(indent)

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0, background: plain ? 'transparent' : MARK_BG[line.mark] }}>
      <span style={{ width: 30, flex: 'none', textAlign: 'right', paddingRight: 8, color: MUTED }}>{line.mark === 'gap' ? '' : number}</span>
      <span style={{ flex: 1, minWidth: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', paddingLeft: `${indent + 2}ch`, textIndent: '-2ch', color: line.mark === 'gap' ? MUTED : INK, textDecoration: !plain && line.mark === 'remove' ? 'line-through' : 'none' }}>
        {line.mark === 'gap' ? '⋯' : !plain && line.mark === 'remove' ? text : colorize(text, rules)}
      </span>
    </div>
  )
}

const Toggle = ({ view, onChange }: { view: 'unified' | 'split'; onChange: (view: 'unified' | 'split') => void }) => (
  <span style={{ marginLeft: 'auto', display: 'flex', ...sketchBorder(MUTED), borderRadius: 999, overflow: 'hidden', fontSize: 12 }}>
    {(['unified', 'split'] as const).map((option) => (
      <span
        key={option}
        data-interactive
        onClick={() => onChange(option)}
        style={{ padding: '0 10px', background: view === option ? INK : 'transparent', color: view === option ? PAPER : MUTED }}
      >
        {option === 'unified' ? 'unified' : 'side by side'}
      </span>
    ))}
  </span>
)

// Notes sit beside their line without making it taller, each starting at its line's top so it stays on that line.
// A note takes at most two lines, and fewer when the next note's line starts sooner; text that does not fit shows a
// "more…" that expands the note over the ones under it. The box grows to hold the lowest note.
//
// The layout is measured again whenever the rows or notes change size: a shape first rendered off screen or before
// its fonts loaded measures every row at the top, and nothing else re-renders it once it is laid out.
export const CodeSnippet = ({ file, tag, lines, gutterNotes, highlight, view, expanded, update }: CodeSnippetProps & { update: (patch: Partial<CodeSnippetProps>) => void }) => {
  const rowsRef = useRef<HTMLDivElement>(null)
  const notesRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<NotesLayout>({ tops: [], lines: [], height: 0, clipped: [] })
  const lineHeight = 17

  const measure = () => {
    if (!gutterNotes || rowsRef.current == null || notesRef.current == null) return

    const rows = Array.from(rowsRef.current.children) as HTMLElement[]
    const notes = Array.from(notesRef.current.children) as HTMLElement[]
    const topOf = (note: HTMLElement | undefined) => rows.find((row) => row.dataset.line === note?.dataset.line)?.offsetTop ?? null
    const next: NotesLayout = { tops: [], lines: [], height: 0, clipped: [] }

    notes.forEach((note, position) => {
      const top = topOf(note) ?? 0
      const following = topOf(notes[position + 1])
      const room = following == null ? Infinity : following - top - 2
      const allowed = Math.max(1, Math.min(2, Math.floor(room / lineHeight)))
      const text = note.querySelector<HTMLElement>('[data-text]')
      const isOpen = expanded.includes(Number(note.dataset.line))

      if (text != null && text.scrollHeight > allowed * lineHeight + 1) next.clipped.push(Number(note.dataset.line))
      next.tops.push(top)
      next.lines.push(allowed)
      next.height = Math.max(next.height, top + (isOpen ? note.offsetHeight : allowed * lineHeight) + 6)
    })

    setLayout((previous) => (sameLayout(previous, next) ? previous : next))
  }

  useLayoutEffect(measure)

  useEffect(() => {
    if (!gutterNotes || rowsRef.current == null || notesRef.current == null) return

    const observer = new ResizeObserver(() => measure())

    observer.observe(rowsRef.current)
    Array.from(notesRef.current.children).forEach((note) => observer.observe(note))
    document.fonts?.ready.then(() => measure())

    return () => observer.disconnect()
  })

  const numbers: number[] = []
  let counter = 0
  lines.forEach((line) => {
    if (line.mark !== 'gap') counter += 1
    numbers.push(counter)
  })

  const noted = lines.map((line, index) => ({ line, index })).filter(({ line }) => line.note != null)

  return (
    <div data-root style={{ ...sketchBorder(), background: PAPER, fontFamily: MONO, fontSize: 13, color: INK }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderBottom: `1.5px solid ${LINE}`, fontFamily: HAND }}>
        <span style={{ fontWeight: 700 }}>{file}</span>
        {tag == null ? null : <span style={{ ...sketchBorder(MUTED), borderRadius: 999, padding: '0 8px', fontSize: 12, color: MUTED }}>{tag}</span>}
        {view === 'code' ? null : <Toggle view={view} onChange={(next) => update({ view: next })} />}
      </div>
      <div style={{ position: 'relative', padding: '6px 0', minHeight: layout.height }}>
        <div ref={rowsRef} style={{ display: 'flex', flexDirection: 'column', gap: 1, lineHeight: `${lineHeight}px`, marginRight: gutterNotes ? 260 : 0 }}>
          {view === 'split'
            ? splitRows(lines).map((row, position) => {
                const oldIndex = row.old == null ? -1 : lines.indexOf(row.old)
                const nextIndex = row.next == null ? -1 : lines.indexOf(row.next)
                return (
                  <div key={position} data-line={nextIndex === -1 ? oldIndex : nextIndex} style={{ display: 'flex', gap: 6 }}>
                    <Cell line={row.old} number={oldIndex === -1 ? null : numbers[oldIndex]} rules={highlight} />
                    <Cell line={row.next} number={nextIndex === -1 ? null : numbers[nextIndex]} rules={highlight} />
                  </div>
                )
              })
            : lines.map((line, index) => (
                <div key={index} data-line={index} style={{ display: 'flex' }}>
                  {view === 'code' ? null : <span style={{ width: 14, flex: 'none', textAlign: 'center', background: MARK_BG[line.mark], color: line.mark === 'add' ? GREEN : line.mark === 'remove' ? RED : MUTED }}>{MARK_SIGN[line.mark]}</span>}
                  <Cell line={line} number={numbers[index]} rules={highlight} plain={view === 'code'} />
                </div>
              ))}
        </div>
        {gutterNotes ? (
          <div ref={notesRef} style={{ position: 'absolute', top: 0, right: 0, width: 260 }}>
            {noted.map(({ line, index }, position) => {
              const open = expanded.includes(index)
              const allowed = layout.lines[position] ?? 2
              const isClipped = layout.clipped.includes(index)
              return (
                <div key={index} data-line={index} style={{ position: 'absolute', top: layout.tops[position] ?? 0, left: 0, right: 0, zIndex: open ? 1 : 0, paddingLeft: 12, fontFamily: HAND, fontSize: 13, lineHeight: `${lineHeight}px`, color: INK, background: open ? PAPER : 'transparent', borderLeft: `2px solid ${INK}` }}>
                  <div data-text style={{ maxHeight: open ? 'none' : lineHeight * allowed, overflow: 'hidden', overflowWrap: 'anywhere' }}>{line.note}</div>
                  {open || isClipped ? (
                    <span
                      data-interactive
                      onClick={() => update({ expanded: open ? expanded.filter((item) => item !== index) : [...expanded, index] })}
                      style={open ? { color: MUTED, fontSize: 12 } : { position: 'absolute', right: 0, bottom: 0, paddingLeft: 6, background: PAPER, color: MUTED, fontSize: 12, lineHeight: `${lineHeight}px` }}
                    >
                      {open ? 'less' : 'more…'}
                    </span>
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
}
