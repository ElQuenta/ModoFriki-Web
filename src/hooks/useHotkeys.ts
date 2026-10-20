import { useEffect, useRef } from 'react'

type HotkeyHandler = (event: KeyboardEvent) => void

function normalize(event: KeyboardEvent): string {
  const parts: string[] = []
  if (event.ctrlKey || event.metaKey) parts.push('mod')
  if (event.altKey) parts.push('alt')
  if (event.shiftKey) parts.push('shift')
  parts.push(event.key.toLowerCase())
  return parts.join('+')
}

export function useHotkeys(
  handlers: Record<string, HotkeyHandler>,
  enabled = true,
): void {
  const handlersRef = useRef(handlers)

  useEffect(() => {
    handlersRef.current = handlers
  })

  useEffect(() => {
    if (!enabled) return

    const listener = (event: KeyboardEvent) => {
      const handler = handlersRef.current[normalize(event)]
      if (!handler) return
      const target = event.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      const isCommand = normalize(event).startsWith('mod+')
      if (typing && !isCommand) return
      event.preventDefault()
      handler(event)
    }

    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [enabled])
}
