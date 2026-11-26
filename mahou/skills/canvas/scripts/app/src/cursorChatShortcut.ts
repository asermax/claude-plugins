import type { Editor } from 'tldraw'

const isTyping = (editor: Editor) => {
  const active = document.activeElement as HTMLElement | null

  return editor.getEditingShapeId() != null || editor.getInstanceState().isChatting || active?.isContentEditable === true || active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA'
}

// tldraw binds cursor chat to the physical "/" key of a US layout, so on layouts where "/" is Shift+7 the shortcut never
// fires. This listener matches the character typed instead, so "/" opens cursor chat on any layout
export const cursorChatShortcut = (editor: Editor) => {
  window.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey || isTyping(editor)) return

      event.preventDefault()
      event.stopPropagation()
      editor.updateInstanceState({ isChatting: true })
    },
    { capture: true },
  )
}
