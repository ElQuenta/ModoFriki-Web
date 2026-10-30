import { useEffect, useRef } from 'react'

type HotkeyHandler = (event: KeyboardEvent) => boolean | void

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
      if (event.defaultPrevented || event.isComposing) return

      const key = normalize(event)
      const handler = handlersRef.current[key]
      if (!handler) return

      const target = event.target
      const typing =
        target instanceof Element &&
        Boolean(
          target.closest(
            'input, textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]',
          ),
        )
      const isCommand = key.startsWith('mod+')
      const isEscape = event.key === 'Escape'

      if (typing && !isCommand && !isEscape) return
      if (!isCommand && !isEscape && (event.ctrlKey || event.metaKey || event.altKey)) return

      // Un handler puede devolver false para dejar que el navegador haga lo suyo.
      if (handler(event) !== false) event.preventDefault()
    }

    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [enabled])
}
