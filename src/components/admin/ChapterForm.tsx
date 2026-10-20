import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Chapter } from '@/types'
import { zodResolver } from '@/lib/zod-resolver'
import { validateImages, type ChapterInput } from '@/services/admin'
import { Button } from '@/components/ui/button'
import { Field } from './Field'
import { inputClass } from './styles'

const schema = z.object({
  number: z
    .string()
    .trim()
    .regex(
      /^\d{1,9}(?:\.\d{1,3})?$/,
      'Usa un número como 12 o 12.5 (hasta 3 decimales).',
    ),
  title: z.string().trim().max(200, 'Máximo 200 caracteres.'),
  kind: z.enum(['NORMAL', 'EXTRA', 'ANNOUNCEMENT']),
  status: z.enum(['DRAFT', 'PUBLISHED']),
})

type Values = z.infer<typeof schema>

export function ChapterForm({
  chapter,
  onSubmit,
  onCancel,
}: {
  chapter?: Chapter
  onSubmit: (input: ChapterInput, pages: File[]) => Promise<void>
  onCancel: () => void
}) {
  const [pages, setPages] = useState<File[]>([])
  const [fileError, setFileError] = useState<string>()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      number: chapter ? String(Number(chapter.number)) : '',
      title: chapter?.title ?? '',
      kind: chapter?.kind ?? 'NORMAL',
      status: chapter?.status ?? 'DRAFT',
    },
  })

  const submit = handleSubmit(async (values) => {
    const invalid = validateImages(pages)
    if (invalid) return setFileError(invalid)
    const hasPages = pages.length > 0 || Boolean(chapter?.pages.length)
    if (values.status === 'PUBLISHED' && !hasPages) {
      return setFileError('Para publicar el capítulo necesitas subir páginas.')
    }
    setFileError(undefined)
    await onSubmit({ ...values, title: values.title || null }, pages)
  })

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
        <Field label="Número" error={errors.number?.message}>
          <input {...register('number')} inputMode="decimal" className={inputClass} />
        </Field>
        <Field label="Título (opcional)" error={errors.title?.message}>
          <input {...register('title')} maxLength={200} className={inputClass} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo">
          <select {...register('kind')} className={inputClass}>
            <option value="NORMAL">Normal</option>
            <option value="EXTRA">Extra</option>
            <option value="ANNOUNCEMENT">Anuncio</option>
          </select>
        </Field>
        <Field label="Publicación">
          <select {...register('status')} className={inputClass}>
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicado</option>
          </select>
        </Field>
      </div>
      {!chapter ? (
        <Field
          label="Páginas"
          hint={
            pages.length
              ? `${pages.length} archivos, en el orden en que los elegiste.`
              : 'JPEG, PNG o WebP. Máximo 10 MiB cada una y 100 MiB en total.'
          }
        >
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setPages([...(event.target.files ?? [])])}
            className="text-secondary text-xs"
          />
        </Field>
      ) : null}
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
          {isSubmitting ? 'Guardando…' : chapter ? 'Guardar cambios' : 'Crear capítulo'}
        </Button>
      </div>
    </form>
  )
}
