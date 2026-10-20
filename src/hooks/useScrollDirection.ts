import { useEffect, useState } from 'react'

export function useScrollDirection() {
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let previous = window.scrollY

    const listener = () => {
      const current = window.scrollY
      setScrolled(current > 12)
      if (Math.abs(current - previous) < 8) return
      setDirection(current > previous ? 'down' : 'up')
      previous = current
    }

    window.addEventListener('scroll', listener, { passive: true })
    return () => window.removeEventListener('scroll', listener)
  }, [])

  return { direction, scrolled }
}
