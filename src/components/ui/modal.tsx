import { X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  pending = false,
  dirty = false,
  onDiscardChanges,
  onKeepEditing,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
  pending?: boolean
  dirty?: boolean
  onDiscardChanges?: () => void
  onKeepEditing?: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [showDiscard, setShowDiscard] = useState(false)
  const titleId = useId()
  const descriptionId = useId()
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const dialog = dialogRef.current
    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const getFocusable = () =>
      Array.from(dialog?.querySelectorAll<HTMLElement>(focusableSelector) ?? []).filter(
        (element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true',
      )

    ;(getFocusable()[0] ?? dialog)?.focus()

    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!pending) {
          if (dirty && onDiscardChanges) setShowDiscard(true)
          else onCloseRef.current()
        }
        return
      }
      if (event.key !== 'Tab' || !dialog) return

      const focusable = getFocusable()
      if (focusable.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      const focusIsOutside = !dialog.contains(document.activeElement)
      if (event.shiftKey && (document.activeElement === first || focusIsOutside)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || focusIsOutside)) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', listener)
    return () => {
      window.removeEventListener('keydown', listener)
      if (previouslyFocused?.isConnected) previouslyFocused.focus()
    }
  }, [open, pending, dirty, onDiscardChanges])

  if (!open) return null

  return (
      <div
        data-modal-backdrop="true"
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) {
          if (dirty && onDiscardChanges) {
            setShowDiscard(true)
            return
          }
          else onClose()
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'animate-fade-up border-line bg-surface shadow-card my-4 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border p-5 sm:my-8 sm:p-6',
          className,
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="font-display text-xl font-bold">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-secondary mt-1 text-sm">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => {
              if (pending) return
              if (dirty && onDiscardChanges) {
                setShowDiscard(true)
                return
              }
              else onClose()
            }}
            disabled={pending}
            aria-label="Cerrar"
            className="text-secondary hover:bg-raised hover:text-primary flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
        {dirty && onDiscardChanges && onKeepEditing ? (
          <div role="group" aria-label="Cambios sin guardar" hidden={!showDiscard} className="border-line bg-raised mb-4 rounded-xl border p-4">
            <p className="text-primary text-sm">¿Descartar los cambios sin guardar?</p>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" disabled={pending} onClick={() => { setShowDiscard(false); onKeepEditing() }} className="text-secondary hover:text-primary rounded-lg px-3 py-2 text-sm disabled:opacity-50">Seguir editando</button>
              <button type="button" disabled={pending} onClick={() => { setShowDiscard(false); onDiscardChanges() }} className="text-danger rounded-lg px-3 py-2 text-sm disabled:opacity-50">Descartar cambios</button>
            </div>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  )
}
