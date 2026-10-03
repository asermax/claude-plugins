export const INK = '#1d1d1d'
export const PAPER = '#fffdf8'
export const MUTED = '#868e96'
export const LINE = '#ced4da'
export const BLUE = '#4465e9'
export const GREEN = '#099268'
export const ORANGE = '#e16919'
export const RED = '#e03131'

export const HAND = 'var(--tl-font-draw), "Shantell Sans", cursive'
export const MONO = 'var(--tl-font-mono), ui-monospace, monospace'
export const FONT_SANS = "'tldraw_sans', system-ui, sans-serif"

export const sketchBorder = (color = INK) => ({
  border: `2px solid ${color}`,
  borderRadius: '14px 10px 16px 9px / 9px 15px 10px 14px',
})
