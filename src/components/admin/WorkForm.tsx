import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import type { Series } from '@/types'
import { zodResolver } from '@/lib/zod-resolver'
import { RELEASE_STATUS_LABELS } from '@/services/catalog'
import { validateImages, type WorkFiles, type WorkInput } from '@/services/admin'
import { useGenres, useWorkTypes } from '@/hooks/useCatalog'
import { Button } from '@/components/ui/button'
import { Field } from './Field'
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
  onSubmit,
  onCancel,
}: {
  work?: Series
  onSubmit: (input: WorkInput, files: WorkFiles) => Promise<void>
  onCancel: () => void
}) {
  const { data: types } = useWorkTypes()
  const { data: genres } = useGenres()
  const [cover, setCover] = useState<File>()
  const [banner, setBanner] = useState<File>()
  const [fileError, setFileError] = useState<string>()
  const {
    register,
    handleSubmit,
    control,
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
  const publishing = useWatch({ control, name: 'publicationStatus' }) === 'PUBLISHED'

  const submit = handleSubmit(async (values) => {
    const files = [cover, banner].filter((file): file is File => Boolean(file))
    const invalid = validateImages(files)
    if (invalid) return setFileError(invalid)
    if (publishing && !cover && !work?.coverUrl) {
      return setFileError('Para publicar la obra necesitas subir una portada.')
    }
    setFileError(undefined)
    const alternativeTitles = [
      ...new Set(
        values.alternativeTitles
          .split('\n')
          .map((title) => title.trim())
          .filter(Boolean),
      ),
    ]
    await onSubmit({ ...values, alternativeTitles }, { cover, inpagecover: banner })
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
              className="border-line bg-base has-checked:border-accent/50 has-checked:text-accent flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
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
        <Field
          label="Portada"
          hint={
            work?.coverUrl
              ? 'Deja vacío para conservar la actual.'
              : 'JPEG, PNG o WebP (≤ 10 MiB).'
          }
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setCover(event.target.files?.[0])}
            className="text-secondary text-xs"
          />
        </Field>
        <Field label="Banner" hint="Opcional. Se usa en la ficha.">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setBanner(event.target.files?.[0])}
            className="text-secondary text-xs"
          />
        </Field>
      </div>
      {fileError ? (
        <p className="border-danger/30 bg-danger/10 text-danger rounded-lg border px-3 py-2 text-xs">
          {fileError}
        </p>
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
          {isSubmitting ? 'Guardando…' : work ? 'Guardar cambios' : 'Crear obra'}
        </Button>
      </div>
    </form>
  )
}
