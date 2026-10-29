import { useState } from 'react'
import { toast } from 'sonner'
import type { ReportReason } from '@/types'
import { ApiError, errorMessage } from '@/lib/api'
import { REPORT_REASONS, reportComment } from '@/services/community'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

export function ReportDialog({
  open,
  commentId,
  onClose,
}: {
  open: boolean
  commentId: string
  onClose: () => void
}) {
  const [reason, setReason] = useState<ReportReason>('SPAM')
  const [details, setDetails] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    try {
      await reportComment(commentId, reason, details.trim() || undefined)
      toast.success('Gracias, revisaremos el reporte')
      setDetails('')
      onClose()
    } catch (error) {
      toast.error(
        error instanceof ApiError && error.status === 409
          ? 'Ya reportaste este comentario.'
          : errorMessage(error, 'No pudimos enviar el reporte.'),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reportar comentario"
      description="Cuéntanos qué pasa con este comentario."
    >
      <fieldset className="mt-4 space-y-2">
        <legend className="sr-only">Motivo</legend>
        {REPORT_REASONS.map((item) => (
          <label key={item.value} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={`reason-${commentId}`}
              value={item.value}
              checked={reason === item.value}
              onChange={() => setReason(item.value)}
              className="accent-[var(--color-accent)]"
            />
            {item.label}
          </label>
        ))}
      </fieldset>
      <textarea
        value={details}
        onChange={(event) => setDetails(event.target.value)}
        placeholder="Detalles (opcional)"
        aria-label="Detalles del reporte"
        maxLength={2000}
        rows={3}
        className="border-line bg-canvas focus:border-accent/60 mt-4 w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none"
      />
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        <Button onClick={() => void submit()} disabled={busy}>
          {busy ? 'Enviando…' : 'Enviar reporte'}
        </Button>
      </div>
    </Modal>
  )
}
