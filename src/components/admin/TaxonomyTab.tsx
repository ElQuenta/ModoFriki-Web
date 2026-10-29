import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Taxonomy } from '@/types'
import { ApiError, errorMessage } from '@/lib/api'
import { slugify } from '@/lib/format'
import { createGenre, createWorkType } from '@/services/admin'
import { invalidateTaxonomy, useGenres, useWorkTypes } from '@/hooks/useCatalog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Field } from './Field'
import { inputClass } from './styles'

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function TaxonomyColumn({
  title,
  items,
  loading,
  onCreate,
}: {
  title: string
  items?: Taxonomy[]
  loading: boolean
  onCreate: (name: string, slug: string) => Promise<unknown>
}) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const effectiveSlug = slugTouched ? slug : slugify(name)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || name.trim().length > 100)
      return setError('El nombre debe tener entre 1 y 100 caracteres.')
    if (!SLUG.test(effectiveSlug) || effectiveSlug.length > 120) {
      return setError(
        'El slug solo admite minúsculas, números y guiones (ej. ciencia-ficcion).',
      )
    }
    setError(undefined)
    setBusy(true)
    try {
      await onCreate(name.trim(), effectiveSlug)
      setName('')
      setSlug('')
      setSlugTouched(false)
      toast.success(`${title}: “${name.trim()}” creado`)
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.status === 409
          ? 'Ya existe uno con ese nombre o slug.'
          : errorMessage(caught, 'No pudimos crearlo.'),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="surface-card p-5">
      <h2 className="font-display text-base font-bold">{title}</h2>
      <form onSubmit={(event) => void submit(event)} className="mt-4 space-y-3">
        <Field label="Nombre">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            className={inputClass}
          />
        </Field>
        <Field label="Slug" error={error}>
          <input
            value={effectiveSlug}
            onChange={(event) => {
              setSlugTouched(true)
              setSlug(event.target.value)
            }}
            maxLength={120}
            className={inputClass}
          />
        </Field>
        <Button type="submit" size="sm" disabled={busy}>
          <Plus className="size-4" /> Crear
        </Button>
      </form>
      <div className="mt-5 flex flex-wrap gap-2">
        {loading && !items
          ? Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-7 w-20 rounded-full" />
            ))
          : items?.map((item) => (
              <span
                key={item.id}
                className="border-line bg-canvas text-secondary rounded-full border px-3 py-1 text-xs"
                title={item.slug}
              >
                {item.name}
              </span>
            ))}
      </div>
    </section>
  )
}

export function TaxonomyTab() {
  const genres = useGenres()
  const types = useWorkTypes()

  const created = (reload: () => void) => () => {
    invalidateTaxonomy()
    reload()
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <TaxonomyColumn
        title="Tipos de obra"
        items={types.data}
        loading={types.loading}
        onCreate={(name, slug) => createWorkType(name, slug).then(created(types.reload))}
      />
      <TaxonomyColumn
        title="Géneros"
        items={genres.data}
        loading={genres.loading}
        onCreate={(name, slug) => createGenre(name, slug).then(created(genres.reload))}
      />
    </div>
  )
}
