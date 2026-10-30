import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Search, X, Library } from 'lucide-react'
import { listWorks } from '@/services/catalog'
import { listPopularWorks } from '@/services/discovery'
import { SORT_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { useAsync } from '@/hooks/useAsync'
import { useDebounce } from '@/hooks/useDebounce'
import { useGenres, useWorkTypes } from '@/hooks/useCatalog'
import { SeriesCard } from '@/components/catalog/SeriesCard'
import { catalogPageCache } from './catalog-page-cache'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState } from '@/components/ui/empty-state'
import { SeriesCardSkeleton } from '@/components/ui/skeleton'

const PAGE_SIZE = 20

/** Cachea paginas por filtro para que cargar mas no vuelva a pedir lotes ya vistos. */
async function fetchPages<T>(
  wanted: number,
  cacheKey: string,
  load: (page: number, limit: number) => Promise<{ items: T[]; total?: number }>,
) {
  const pages = catalogPageCache.get(cacheKey) ?? new Map<number, { items: unknown[]; total?: number }>()
  catalogPageCache.set(cacheKey, pages)
  const requestedPages = Math.ceil(wanted / PAGE_SIZE)
  let exhausted = false
  for (let page = 1; page <= requestedPages; page += 1) {
    if (!pages.has(page)) {
      const batch = await load(page, PAGE_SIZE)
      pages.set(page, batch)
      if (batch.items.length < PAGE_SIZE) {
        exhausted = true
        break
      }
    }
    if (pages.get(page)?.items.length === 0) {
      exhausted = true
      break
    }
  }
  const batches = Array.from({ length: requestedPages }, (_, index) => pages.get(index + 1))
  const allItems = batches.flatMap((batch) => batch?.items ?? []) as T[]
  const items = [...new Map(allItems.map((item, index) => [
    item && typeof item === 'object' && 'id' in item ? String(item.id) : `row-${index}`,
    item,
  ])).values()]
  const total = [...pages.values()].find((batch) => batch.total !== undefined)?.total
  const lastLoaded = pages.get(Math.ceil(items.length / PAGE_SIZE))
  const hasMore = !exhausted && (total !== undefined
    ? allItems.length < total
    : items.length > 0 && lastLoaded?.items.length === PAGE_SIZE)
  return { items, hasMore }
}

export function CatalogView() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { data: genres } = useGenres()
  const { data: types } = useWorkTypes()

  const query = params.get('q') ?? ''
  const typeId = params.get('type') ?? ''
  const genreId = params.get('genre') ?? ''
  const sort = params.get('sort') === 'views' ? 'views' : 'recent'
  const pages = Math.max(1, Number(params.get('page')) || 1)
  const debouncedQuery = useDebounce(query.trim(), 300)
  const byViews = sort === 'views'
  const wanted = pages * PAGE_SIZE

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setParams(next, { replace: true })
  }

  const clear = () => setParams({}, { replace: true })

  const loadMore = () => {
    const next = new URLSearchParams(params)
    next.set('page', String(pages + 1))
    setParams(next, { replace: true })
  }

  // El orden por visitas sale de /works/popular, que solo filtra por tipo.
  const works = useAsync(
    () =>
      byViews
        ? fetchPages(wanted, `popular:${typeId}`, (page, limit) =>
            listPopularWorks({ page, limit, typeId: typeId || undefined }).then(({ items, total }) => ({ items, total })),
          )
        : fetchPages(wanted, `works:${typeId}:${genreId}:${debouncedQuery}`, (page, limit) =>
            listWorks({
              page,
              limit,
              search: debouncedQuery || undefined,
              typeId: typeId || undefined,
              genreId: genreId || undefined,
            }).then((items) => ({ items })),
          ),
    `catalog:${sort}:${typeId}:${byViews ? '' : `${genreId}:${debouncedQuery}`}:${wanted}`,
    true,
    `catalog:${sort}:${typeId}:${byViews ? '' : `${genreId}:${debouncedQuery}`}`,
  )

  // Al cargar más se mantienen visibles los resultados anteriores.
  const visible = works.data?.items ?? (pages > 1 ? works.staleData?.items : undefined) ?? []
  const hasMore = works.data?.hasMore ?? false
  const hasFilters = Boolean(query || typeId || genreId || sort !== 'recent')

  return (
    <div className="container-mf pt-8 pb-4">
      <div className="mb-8 max-w-2xl">
        <p className="text-accent mb-2 text-xs font-bold tracking-[0.2em] uppercase">
          Biblioteca
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Encuentra tu próxima obsesión
        </h1>
        <p className="text-secondary mt-3 text-sm leading-relaxed">
          Manhwas, mangas, manhuas y novelas. Filtra por tipo o género y empieza a leer.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="text-muted absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
            <input
              value={query}
              onChange={(event) => update('q', event.target.value)}
              placeholder={
                byViews
                  ? 'La búsqueda no aplica al orden por visitas'
                  : 'Buscar por título...'
              }
              disabled={byViews}
              aria-label="Buscar series"
              className="border-line bg-surface text-primary placeholder:text-muted focus:border-accent/60 h-11 w-full rounded-xl border pr-10 pl-10 text-sm transition-colors outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => update('q', '')}
                aria-label="Limpiar búsqueda"
                className="text-muted hover:bg-raised hover:text-primary absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-md"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          <Button
            variant="secondary"
            onClick={() => setFiltersOpen((value) => !value)}
            className="shrink-0 lg:hidden"
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal className="size-4" />
            Filtros
          </Button>
        </div>

        <div
          className={cn(
            'flex flex-col gap-3 lg:flex lg:flex-row lg:items-center',
            filtersOpen ? 'flex' : 'hidden',
          )}
        >
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => update('type', '')}
              className={cn(
                'shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                !typeId
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-line bg-surface text-secondary hover:text-primary',
              )}
            >
              Todos
            </button>
            {types?.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => update('type', typeId === item.id ? '' : item.id)}
                className={cn(
                  'shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                  typeId === item.id
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-line bg-surface text-secondary hover:text-primary',
                )}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap lg:ml-auto">
            <select
              value={genreId}
              onChange={(event) => update('genre', event.target.value)}
              disabled={byViews}
              aria-label="Filtrar por género"
              className="border-line bg-surface text-secondary focus:border-accent/60 col-span-2 h-10 w-full rounded-lg border px-2.5 text-xs outline-none sm:w-auto"
            >
              <option value="">Todos los géneros</option>
              {genres?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(event) => update('sort', event.target.value)}
              aria-label="Ordenar resultados"
              className="border-line bg-surface text-secondary focus:border-accent/60 h-10 w-full rounded-lg border px-2.5 text-xs outline-none sm:w-auto"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {hasFilters ? (
              <button
                type="button"
                onClick={clear}
                className="text-accent inline-flex h-10 items-center gap-1 rounded-lg px-2 text-xs font-semibold hover:underline"
              >
                <X className="size-3.5" /> Limpiar
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <p className="text-muted mb-4 text-xs">
        {visible.length} {visible.length === 1 ? 'resultado' : 'resultados'}
        {hasMore ? ' (hay más)' : ''}
      </p>

      {works.error && visible.length === 0 ? (
        <ErrorState message={works.error} onRetry={works.reload} />
      ) : works.loading && visible.length === 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, index) => (
            <SeriesCardSkeleton key={index} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Library}
          title="No encontramos nada con esos filtros"
          description="Prueba con otro título, tipo o género. También puedes limpiar los filtros y explorar todo el catálogo."
          actionLabel="Limpiar filtros"
          onAction={clear}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((series) => (
            <SeriesCard key={series.id} series={series} />
          ))}
        </div>
      )}

      {works.error && visible.length > 0 ? (
        <div className="mt-6 text-center text-xs" role="status">
          <p className="text-danger">{works.error}</p>
          <Button variant="ghost" onClick={works.reload} disabled={works.loading} className="mt-2">Reintentar</Button>
        </div>
      ) : null}

      {hasMore || (works.loading && visible.length > 0) ? (
        <div className="mt-8 flex justify-center sm:mt-10">
          <Button variant="secondary" onClick={loadMore} disabled={works.loading}>
            {works.loading ? 'Cargando…' : 'Cargar más'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
