import { useEffect, useRef, useState } from 'react'

export function useIntersectionObserver<T extends HTMLElement>(
  options: IntersectionObserverInit = {},
) {
  const { root = null, rootMargin = '0px', threshold = 0 } = options
  const thresholdKey = Array.isArray(threshold) ? threshold.join(',') : String(threshold)
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      {
        root,
        rootMargin,
        threshold: thresholdKey.split(',').map(Number),
      },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [root, rootMargin, thresholdKey])

  return { ref, inView }
}
