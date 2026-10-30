import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Series } from '@/types'
import { zodResolver } from '@/lib/zod-resolver'
import { RELEASE_STATUS_LABELS } from '@/services/catalog'
import { assertWorkMediaTransportAvailable, type WorkFiles, type WorkInput } from '@/services/admin'
import { clearWorkMediaSelection, createWorkMediaSlot, disposeWorkMediaSlot, selectWorkMedia, validateWorkMediaSlots } from '@/services/work-media'
import type { WorkMediaSlotName, WorkMediaSlots } from '@/types/work-media'
import { useGenres, useWorkTypes } from '@/hooks/useCatalog'
import { Button } from '@/components/ui/button'
import { Field } from './Field'
import { WorkImageField } from './WorkImageField'
import { inputClass, textareaClass } from './styles'

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Escribe un título.')
    .max(200, 'Máximo 200 caracteres.'),
  synopsis: z
    .string()
    .trim()
    .min(1, 'Escribe una sinopsis.')
    .max(30000, 'Máximo 30000 caracteres.'),
  typeId: z.string().min(1, 'Elige un tipo.'),
  publicationStatus: z.enum(['DRAFT', 'PUBLISHED']),
  releaseStatus: z.enum(['ONGOING', 'COMPLETED', 'HIATUS', 'CANCELLED']),
  alternativeTitles: z.string(),
  genreIds: z.array(z.string()).max(50, 'Máximo 50 géneros.'),
})

type Values = z.infer<typeof schema>

export function WorkForm({
  work,
  onCancel,
}: {
  work?: Series
  onSubmit: (input: WorkInput, files: WorkFiles) => Promise<void>
  onCancel: () => void
}) {
  const { data: types } = useWorkTypes()
  const { data: genres } = useGenres()
  const [media, setMedia] = useState<WorkMediaSlots>(() => ({
    cover: createWorkMediaSlot(work?.coverMedia ?? null),
    detailBanner: createWorkMediaSlot(work?.detailBannerMedia ?? null),
    chapterBanner: createWorkMediaSlot(work?.chapterBannerMedia ?? null),
  }))
  const mediaRef = useRef(media)
  const [fileError, setFileError] = useState<string>()
  const [replacementConfirmation, setReplacementConfirmation] = useState<{ labels: string[] }>()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: work?.title ?? '',
      synopsis: work?.synopsis ?? '',
      typeId: work?.typeId ?? '',
      publicationStatus: work?.publicationStatus ?? 'DRAFT',
      releaseStatus: work?.releaseStatus ?? 'ONGOING',
      alternativeTitles: work?.alternativeTitles.join('\n') ?? '',
      genreIds: work?.genreItems?.map((genre) => genre.id) ?? [],
    },
  })
  useEffect(() => { mediaRef.current = media }, [media])
  useEffect(() => () => Object.values(mediaRef.current).forEach(disposeWorkMediaSlot), [])

  const updateMedia = (name: WorkMediaSlotName, file: File | null) => {
    setMedia((current) => ({
      ...current,
      [name]: file
        ? selectWorkMedia(current[name], file)
        : clearWorkMediaSelection(current[name]),
    }))
    setFileError(undefined)
  }

  const persist = async () => {
    try {
      assertWorkMediaTransportAvailable()
    } catch (error) {
      setFileError(error instanceof Error ? error.message : 'El guardado de medios no está disponible (DEP-004).')
    }
  }

  const submit = handleSubmit(async () => {
    const invalid = validateWorkMediaSlots(media)
    if (invalid) return setFileError(invalid)
    setFileError(undefined)
    const replacements = (Object.entries(media) as [WorkMediaSlotName, WorkMediaSlots[WorkMediaSlotName]][])
      .filter(([, slot]) => slot.selected && slot.persisted)
      .map(([name]) => name === 'cover' ? 'Portada' : name === 'detailBanner' ? 'Banner de ficha' : 'Banner de capítulo')
    if (replacements.length) {
      setReplacementConfirmation({ labels: replacements })
      return
    }
    await persist()
  })

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-4">
      <Field label="Título" error={errors.title?.message}>
        <input {...register('title')} maxLength={200} className={inputClass} />
      </Field>
      <Field label="Sinopsis" error={errors.synopsis?.message}>
        <textarea {...register('synopsis')} rows={4} className={textareaClass} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Tipo" error={errors.typeId?.message}>
          <select {...register('typeId')} className={inputClass}>
            <option value="">Elige…</option>
            {types?.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Emisión">
          <select {...register('releaseStatus')} className={inputClass}>
            {Object.entries(RELEASE_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Publicación">
          <select {...register('publicationStatus')} className={inputClass}>
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicada</option>
          </select>
        </Field>
      </div>
      <Field label="Títulos alternativos" hint="Uno por línea.">
        <textarea {...register('alternativeTitles')} rows={2} className={textareaClass} />
      </Field>
      <fieldset>
        <legend className="text-secondary mb-1.5 text-xs font-semibold">Géneros</legend>
        <div className="flex flex-wrap gap-2">
          {genres?.map((genre) => (
            <label
              key={genre.id}
              className="border-line bg-canvas has-checked:border-accent/50 has-checked:text-accent flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
            >
              <input
                type="checkbox"
                value={genre.id}
                {...register('genreIds')}
                className="accent-[var(--color-accent)]"
              />
              {genre.name}
            </label>
          ))}
        </div>
        {errors.genreIds?.message ? (
          <p className="text-danger mt-1 text-[11px]">{errors.genreIds.message}</p>
        ) : null}
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <WorkImageField label="Portada" slot={media.cover} onSelect={(file) => updateMedia('cover', file)} />
        <WorkImageField label="Banner de ficha" slot={media.detailBanner} hint="Obligatorio; se muestra en la ficha, no en tarjetas." onSelect={(file) => updateMedia('detailBanner', file)} />
        <WorkImageField label="Banner de capítulo" slot={media.chapterBanner} hint="Obligatorio; se muestra antes de las páginas del lector." onSelect={(file) => updateMedia('chapterBanner', file)} />
      </div>
      <p className="text-warning rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs" role="status">
        El servidor todavía no admite los tres medios independientes (DEP-004). Puedes preparar las selecciones, pero no se enviará ningún guardado, incluso para borradores.
      </p>
      {fileError ? (
        <p className="border-danger/30 bg-danger/10 text-danger rounded-lg border px-3 py-2 text-xs" role="alert">
          {fileError}
        </p>
      ) : null}
      {replacementConfirmation ? (
        <div className="border-line bg-raised rounded-xl border p-3" role="group" aria-label="Confirmar reemplazo de medios">
          <p className="text-primary text-sm font-semibold">Vas a reemplazar: {replacementConfirmation.labels.join(', ')}.</p>
          <p className="text-muted mt-1 text-xs">Las demás selecciones se conservarán. La confirmación no elimina medios del servidor.</p>
          <div className="mt-3 flex gap-2">
            <Button type="button" size="sm" onClick={() => void persist()}>Confirmar reemplazos</Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setReplacementConfirmation(undefined)}>Seguir editando</Button>
          </div>
        </div>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Validando…' : work ? 'Guardar cambios' : 'Crear obra'}
        </Button>
      </div>
    </form>
  )
}
