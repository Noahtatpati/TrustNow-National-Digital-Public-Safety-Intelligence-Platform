import { useEffect } from 'react'

type Shortcut = {
  key: string
  meta?: boolean
  ctrl?: boolean
  handler: () => void
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      for (const shortcut of shortcuts) {
        const metaMatch = shortcut.meta ? e.metaKey : true
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : true
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()
        const noModifiers = !shortcut.meta && !shortcut.ctrl

        if (noModifiers && keyMatch && !e.metaKey && !e.ctrlKey) {
          e.preventDefault()
          shortcut.handler()
          return
        }

        if ((shortcut.meta || shortcut.ctrl) && metaMatch && ctrlMatch && keyMatch) {
          e.preventDefault()
          shortcut.handler()
          return
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcuts])
}
