import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Search, X, Library } from 'lucide-react'
import { GENRES, SERIES, getChaptersForSeries } from '@/data/mock'
import { SERIES_STATUSES, SERIES_TYPES, SORT_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { useDebounce } from '@/hooks/useDebounce'
import { SeriesCard } from '@/components/catalog/SeriesCard'
import { Button, buttonStyles } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'

const PAGE_SIZE = 9

export function CatalogView() {
  const [params, setParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const query = params.get('q') ?? ''
  const type = params.get('type') ?? ''
  const genre = params.get('genre') ?? ''
  const status = params.get('status') ?? ''
  const sort = params.get('sort') ?? 'recent'
  const debouncedQuery = useDebounce(query, 250)

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
    setPage(1)
  }

  const filtered = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase()
    const result = SERIES.filter((series) => {
      const matchesQuery =
        !term ||
        series.title.toLowerCase().includes(term) ||
        series.alternativeTitles.some((title) => title.toLowerCase().includes(term)) ||
        series.genres.some((item) => item.toLowerCase().includes(term)) ||
        series.tags.some((tag) => tag.toLowerCase().includes(term))
      const matchesType = !type || series.type === type
      const matchesGenre = !genre || series.genres.includes(genre)
      const matchesStatus = !status || series.status === status
      return matchesQuery && matchesType && matchesGenre && matchesStatus
    })

    return result.sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating
      if (sort === 'views') return b.views - a.views
      if (sort === 'title') return a.title.localeCompare(b.title, 'es')
      return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
    })
  }, [debouncedQuery, type, genre, status, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const hasFilters = Boolean(query || type || genre || status || sort !== 'recent')

  return (
    <div className="container-mf pt-8 pb-4">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 text-xs font-bold tracking-[0.2em] text-accent uppercase">
          Biblioteca
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Encuentra tu próxima obsesión
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-secondary">
          {SERIES.length} series entre manhwas, mangas, manhuas y novelas. Filtra por
          género, estado o tipo y empieza a leer.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => update('q', event.target.value)}
              placeholder="Buscar por título, género o tag..."
              aria-label="Buscar series"
              className="h-11 w-full rounded-xl border border-line bg-surface pr-10 pl-10 text-sm text-primary outline-none transition-colors placeholder:text-muted focus:border-accent/60"
            />
            {query ? (
              <button
                type="button"
                onClick={() => update('q', '')}
                aria-label="Limpiar búsqueda"
                className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-raised hover:text-primary"
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
                !type
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-line bg-surface text-secondary hover:text-primary',
              )}
            >
              Todos
            </button>
            {SERIES_TYPES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => update('type', type === item ? '' : item)}
                className={cn(
                  'shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                  type === item
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-line bg-surface text-secondary hover:text-primary',
                )}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <select
              value={genre}
              onChange={(event) => update('genre', event.target.value)}
              aria-label="Filtrar por género"
              className="h-9 rounded-lg border border-line bg-surface px-2.5 text-xs text-secondary outline-none focus:border-accent/60"
            >
              <option value="">Todos los géneros</option>
              {GENRES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => update('status', event.target.value)}
              aria-label="Filtrar por estado"
              className="h-9 rounded-lg border border-line bg-surface px-2.5 text-xs text-secondary outline-none focus:border-accent/60"
            >
              <option value="">Cualquier estado</option>
              {SERIES_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(event) => update('sort', event.target.value)}
              aria-label="Ordenar resultados"
              className="h-9 rounded-lg border border-line bg-surface px-2.5 text-xs text-secondary outline-none focus:border-accent/60"
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
                onClick={() => {
                  setParams({}, { replace: true })
                  setPage(1)
                }}
                className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-accent hover:underline"
              >
                <X className="size-3.5" /> Limpiar
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between text-xs text-muted">
        <p>
          {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
        </p>
        {totalPages > 1 ? (
          <p>
            Página {currentPage} de {totalPages}
          </p>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Library}
          title="No encontramos nada con esos filtros"
          description="Prueba con otro título, género o estado. También puedes limpiar los filtros y explorar todo el catálogo."
          actionLabel="Limpiar filtros"
          onAction={() => {
            setParams({}, { replace: true })
            setPage(1)
          }}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((series) => (
            <SeriesCard
              key={series.id}
              series={series}
              latestChapter={getChaptersForSeries(series.id)[0]}
            />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage === 1}
            className={buttonStyles({
              variant: 'secondary',
              size: 'sm',
              className: 'disabled:opacity-40',
            })}
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
            <button
              key={number}
              type="button"
              onClick={() => setPage(number)}
              className={cn(
                'flex size-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors',
                number === currentPage
                  ? 'bg-accent text-base'
                  : 'border border-line text-secondary hover:border-accent/40 hover:text-accent',
              )}
            >
              {number}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={currentPage === totalPages}
            className={buttonStyles({
              variant: 'secondary',
              size: 'sm',
              className: 'disabled:opacity-40',
            })}
          >
            Siguiente
          </button>
        </div>
      ) : null}
    </div>
  )
}
