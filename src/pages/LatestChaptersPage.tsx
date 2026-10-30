import { useSearchParams } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { listLatestChapters } from '@/services/discovery'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useWorkTypes } from '@/hooks/useCatalog'
import { SeriesCard } from '@/components/catalog/SeriesCard'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState } from '@/components/ui/empty-state'
import { SeriesCardSkeleton } from '@/components/ui/skeleton'

const PAGE_SIZE = 20

export function LatestChaptersPage() {
  useDocumentTitle('Últimos capítulos')
  const [params, setParams] = useSearchParams()
  const { data: types } = useWorkTypes()
  const page = Math.max(1, Number(params.get('page')) || 1)
  const typeId = params.get('type') || undefined
  const { data, loading, error, reload } = useAsync(
    () => listLatestChapters({ page, limit: PAGE_SIZE, typeId }),
    `latest-chapters-page:${page}:${typeId ?? ''}`,
  )
  const items = data?.items ?? []
  const total = data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const change = (nextPage: number, nextType = typeId) => {
    const next = new URLSearchParams()
    if (nextType) next.set('type', nextType)
    if (nextPage > 1) next.set('page', String(nextPage))
    setParams(next)
  }

  return (
    <main className="container-mf pt-8 pb-12">
      <p className="text-accent mb-2 text-xs font-bold tracking-[0.2em] uppercase">Actualizaciones</p>
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Últimos capítulos</h1>
      <p className="text-secondary mt-3 max-w-2xl text-sm">Listado paginado de los capítulos publicados más recientes.</p>

      <label className="mt-6 block max-w-xs">
        <span className="text-secondary mb-1.5 block text-xs font-semibold">Tipo de obra</span>
        <select aria-label="Filtrar tipo de obra" value={typeId ?? ''} onChange={(event) => change(1, event.target.value || undefined)} className="border-line bg-surface text-primary h-10 w-full rounded-lg border px-3 text-sm">
          <option value="">Todos los tipos</option>
          {types?.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
        </select>
      </label>

      <p className="text-muted mt-5 text-xs">{total.toLocaleString('es')} capítulos · Página {page} de {pages}</p>
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {loading && !data ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <SeriesCardSkeleton key={i} />)}</div> : null}
      {!loading && !error && items.length === 0 ? <EmptyState icon={BookOpen} title="No hay capítulos recientes" description="Prueba con otro tipo de obra." actionLabel="Quitar filtro" onAction={() => change(1, undefined)} /> : null}
      {items.length > 0 ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">{items.map(({ series, chapter }) => <SeriesCard key={chapter.id} series={series} latestChapter={chapter} />)}</div> : null}
      {pages > 1 ? <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Paginación de últimos capítulos">
        <Button variant="secondary" disabled={page <= 1 || loading} onClick={() => change(page - 1)}>Anterior</Button>
        <span className="text-secondary text-sm">{page} / {pages}</span>
        <Button variant="secondary" disabled={page >= pages || loading} onClick={() => change(page + 1)}>Siguiente</Button>
      </nav> : null}
    </main>
  )
}
