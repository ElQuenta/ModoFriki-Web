import type { ReactNode } from 'react'
import { labelClass } from './styles'

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
      {error ? (
        <span className="text-danger mt-1 block text-[11px]">{error}</span>
      ) : hint ? (
        <span className="text-muted mt-1 block text-[11px]">{hint}</span>
      ) : null}
    </label>
  )
}
