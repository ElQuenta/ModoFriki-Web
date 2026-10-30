import { useState } from 'react'
import type { WorkMediaSlot } from '@/types/work-media'
import { Button } from '@/components/ui/button'
import { Field } from './Field'

export function WorkImageField({
  label,
  slot,
  required = true,
  hint,
  onSelect,
}: {
  label: string
  slot: WorkMediaSlot
  required?: boolean
  hint?: string
  onSelect: (file: File | null) => void
}) {
  const [failedPreviewUrl, setFailedPreviewUrl] = useState<string | null>(null)
  const previewFailed = failedPreviewUrl === slot.previewUrl

  return (
    <div className="space-y-2">
      <Field
        label={label}
        hint={hint ?? `${required ? 'Obligatorio' : 'Opcional'}; JPEG, PNG o WebP, hasta 10 MiB.`}
        error={slot.error}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            onSelect(event.currentTarget.files?.[0] ?? null)
            event.currentTarget.value = ''
          }}
          className="text-secondary text-xs"
        />
      </Field>

      {slot.previewUrl ? previewFailed ? (
        <p className="text-muted rounded-lg border border-line p-3 text-xs" role="status">
          No se pudo mostrar la vista previa. {slot.persisted ? 'La referencia guardada sigue disponible.' : 'No hay una referencia guardada para este medio.'}
        </p>
      ) : (
        <img
          src={slot.previewUrl}
          alt={`Vista previa: ${label}`}
          onError={() => setFailedPreviewUrl(slot.previewUrl)}
          className="bg-raised h-28 w-full rounded-lg object-contain"
        />
      ) : (
        <p className="text-muted rounded-lg border border-dashed border-line p-3 text-xs" role="status">
          Sin medio guardado ni vista previa.
        </p>
      )}

      {slot.selected ? (
        <div className="flex items-center justify-between gap-2">
          <p className="text-secondary truncate text-xs">Selección: {slot.selected.name}</p>
          <Button type="button" variant="ghost" size="sm" onClick={() => onSelect(null)}>
            Cancelar selección
          </Button>
        </div>
      ) : slot.persisted ? (
        <p className="text-muted text-xs">Se conservará la imagen actual si no seleccionas otra.</p>
      ) : null}
    </div>
  )
}
