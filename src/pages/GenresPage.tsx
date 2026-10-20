import { Link } from 'react-router-dom'
import { ArrowUpRight, Layers, Shapes } from 'lucide-react'
import type { Taxonomy } from '@/types'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useGenres, useWorkTypes } from '@/hooks/useCatalog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/empty-state'

function TaxonomyGrid({
  items,
  loading,
  error,
  reload,
  param,
}: {
  items?: Taxonomy[]
  loading: boolean
  error?: string
  reload: () => void
  param: 'genre' | 'type'
}) {
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (loading && !items) {
    return (
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    )
  }
  if (!items?.length) {
    return <p className="text-secondary text-sm">Todavía no hay nada aquí.</p>
  }
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.id}
          to={`/series?${param}=${item.id}`}
          className="group border-line bg-surface hover:border-accent/40 relative overflow-hidden rounded-2xl border p-4 transition-all hover:-translate-y-0.5"
        >
          <div className="bg-accent/5 group-hover:bg-accent/10 absolute -top-8 -right-8 size-24 rounded-full blur-2xl transition-colors" />
          <div className="flex items-start justify-between gap-2">
            <p className="font-display group-hover:text-accent text-base font-bold transition-colors">
              {item.name}
            </p>
            <ArrowUpRight className="text-muted group-hover:text-accent size-4 transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  )
}

export function GenresPage() {
  useDocumentTitle('Géneros')
  const genres = useGenres()
  const types = useWorkTypes()

  return (
    <div className="container-mf pt-8 pb-4">
      <div className="mb-8 max-w-2xl">
        <p className="text-accent mb-2 text-xs font-bold tracking-[0.2em] uppercase">
          Explora por categoría
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Géneros y tipos
        </h1>
        <p className="text-secondary mt-3 text-sm leading-relaxed">
          Encuentra exactamente lo que te apetece leer. Cada género reúne series de todos
          los tipos y estados.
        </p>
      </div>

      <section>
        <h2 className="font-display mb-4 flex items-center gap-2 text-xl font-bold">
          <Layers className="text-accent size-5" /> Géneros
        </h2>
        <TaxonomyGrid
          items={genres.data}
          loading={genres.loading}
          error={genres.error}
          reload={genres.reload}
          param="genre"
        />
      </section>

      <section className="mt-12">
        <h2 className="font-display mb-4 flex items-center gap-2 text-xl font-bold">
          <Shapes className="text-accent size-5" /> Tipos de obra
        </h2>
        <TaxonomyGrid
          items={types.data}
          loading={types.loading}
          error={types.error}
          reload={types.reload}
          param="type"
        />
      </section>

      <section className="border-line bg-surface mt-12 rounded-2xl border p-5">
        <Badge tone="accent">Tip</Badge>
        <p className="text-secondary mt-3 text-sm">
          En el catálogo puedes combinar un tipo con un género, o ver{' '}
          <Link
            to="/series?sort=views"
            className="text-accent font-semibold hover:underline"
          >
            las series más visitadas
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
