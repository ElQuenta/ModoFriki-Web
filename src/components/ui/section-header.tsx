import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export function SectionHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  actionTo,
  children,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
  children?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-accent mb-2 text-xs font-bold tracking-[0.2em] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="text-secondary mt-2 max-w-2xl text-sm">{description}</p>
        ) : null}
      </div>
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="group text-secondary hover:text-accent inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold transition-colors"
        >
          {actionLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      ) : null}
      {children}
    </div>
  )
}
