import React, { useId, type ReactNode } from 'react'
import { labelClass } from './styles'

export function Field({
  label,
  error,
  hint,
  id,
  children,
}: {
  label: string
  error?: string
  hint?: string
  id?: string
  children: ReactNode
}) {
  const generatedId = useId()
  const fieldId = id ?? `field-${generatedId}`
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const control =
    children && typeof children === 'object' && 'props' in children
      ? (children as React.ReactElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>)
      : null
  const enhancedControl = control
    ? React.cloneElement(control, {
        id: control.props.id ?? fieldId,
        'aria-describedby': [control.props['aria-describedby'], describedBy].filter(Boolean).join(' ') || undefined,
        'aria-invalid': error ? true : control.props['aria-invalid'],
      })
    : children
  return (
    <div className="block">
      <label htmlFor={fieldId} className={labelClass}>{label}</label>
      {enhancedControl}
      {hint ? <span id={hintId} className="text-muted mt-1 block text-[11px]">{hint}</span> : null}
      {error ? (
        <span id={errorId} role="alert" className="text-danger mt-1 block text-[11px]">{error}</span>
      ) : null}
    </div>
  )
}
