import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { buttonStyles } from './button'

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  className,
}: {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
  onAction?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'surface-card flex flex-col items-center justify-center px-6 py-16 text-center',
        className,
      )}
    >
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
        <Icon className="size-7" />
      </div>
      <h3 className="font-display text-xl font-bold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-secondary">{description}</p>
      {actionLabel && actionTo ? (
        <Link to={actionTo} className={buttonStyles({ className: 'mt-6' })}>
          {actionLabel}
        </Link>
      ) : null}
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className={buttonStyles({ className: 'mt-6' })}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
