import { useEffect } from 'react'

// Varias capas (modal, menú móvil, ajustes del lector) pueden bloquear el scroll.
// Solo la primera guarda el estado original y solo la última lo restaura.
let lockCount = 0
let previousOverflow = ''
let previousPaddingRight = ''

export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return

    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow
      previousPaddingRight = document.body.style.paddingRight
      const scrollbar = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
    }

    lockCount += 1

    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow
        document.body.style.paddingRight = previousPaddingRight
      }
    }
  }, [locked])
}
