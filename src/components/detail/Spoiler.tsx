import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Spoiler({
  children,
  resetKey,
}: {
  children: ReactNode
  resetKey?: string
}) {
  const [revealed, setRevealed] = useState(false)

  // The parent keys this component by source/destination/revision. This prop
  // also documents the reset boundary and keeps it in the public component API.
  void resetKey

  return (
    <span className="mx-0.5 inline-flex flex-wrap items-baseline gap-x-1 rounded bg-raised px-1 py-0.5">
      <button
        type="button"
        aria-expanded={revealed}
        onClick={() => setRevealed((value) => !value)}
        className={cn(
          'text-accent rounded-sm text-xs font-semibold underline decoration-dotted underline-offset-2',
          'focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none',
        )}
      >
        {revealed ? 'Ocultar spoiler' : 'Revelar spoiler'}
      </button>
      {revealed ? <span className="text-primary">{children}</span> : null}
    </span>
  )
}
