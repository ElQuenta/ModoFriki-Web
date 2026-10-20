import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Search,
  X,
  Library,
} from 'lucide-react'
import { GENRES, SERIES, getChaptersForSeries } from '@/data/mock'
import { SERIES_STATUSES, SERIES_TYPES, SORT_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { useDebounce } from '@/hooks/useDebounce'
import { SeriesCard } from '@/components/catalog/SeriesCard'
import { Button, buttonStyles } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'

const PAGE_SIZE = 9

function getPageWindow(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1)

  const pages = new Set<number>([1, total, current - 1, current, current + 1])
  if (current <= 3) [2, 3, 4].forEach((page) => pages.add(page))
  if (current >= total - 2) {
    ;[total - 3, total - 2, total - 1].forEach((page) => pages.add(page))
  }

  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)
  const window: (number | 'ellipsis')[] = []

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1]! > 1) window.push('ellipsis')
    window.push(page)
  })

  return window
}

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

  const goToPage = (next: number) => {
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'auto' })
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
        <p className="text-accent mb-2 text-xs font-bold tracking-[0.2em] uppercase">
          Biblioteca
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Encuentra tu próxima obsesión
        </h1>
        <p className="text-secondary mt-3 text-sm leading-relaxed">
          {SERIES.length} series entre manhwas, mangas, manhuas y novelas. Filtra por
          género, estado o tipo y empieza a leer.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="text-muted absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
            <input
              value={query}
              onChange={(event) => update('q', event.target.value)}
              placeholder="Buscar por título, género o tag..."
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

          <div className="grid grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap lg:ml-auto">
            <select
              value={genre}
              onChange={(event) => update('genre', event.target.value)}
              aria-label="Filtrar por género"
              className="border-line bg-surface text-secondary focus:border-accent/60 col-span-2 h-10 w-full rounded-lg border px-2.5 text-xs outline-none sm:w-auto"
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
              className="border-line bg-surface text-secondary focus:border-accent/60 h-10 w-full rounded-lg border px-2.5 text-xs outline-none sm:w-auto"
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
                onClick={() => {
                  setParams({}, { replace: true })
                  setPage(1)
                }}
                className="text-accent inline-flex h-10 items-center gap-1 rounded-lg px-2 text-xs font-semibold hover:underline"
              >
                <X className="size-3.5" /> Limpiar
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="text-muted mb-4 flex items-center justify-between text-xs">
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
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
        <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:mt-10 sm:gap-2">
          <button
            type="button"
            onClick={() => goToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            aria-label="Página anterior"
            className={buttonStyles({
              variant: 'secondary',
              size: 'sm',
              className: 'disabled:opacity-40',
            })}
          >
            <ChevronLeft className="size-4 sm:hidden" />
            <span className="hidden sm:inline">Anterior</span>
          </button>
          {getPageWindow(currentPage, totalPages).map((entry, entryIndex) =>
            entry === 'ellipsis' ? (
              <span
                key={`ellipsis-${entryIndex}`}
                className="text-muted px-1 text-sm"
                aria-hidden
              >
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                onClick={() => goToPage(entry)}
                aria-label={`Página ${entry}`}
                aria-current={entry === currentPage ? 'page' : undefined}
                className={cn(
                  'flex size-10 items-center justify-center rounded-lg text-sm font-semibold transition-colors',
                  entry === currentPage
                    ? 'bg-accent text-base'
                    : 'border-line text-secondary hover:border-accent/40 hover:text-accent border',
                )}
              >
                {entry}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            aria-label="Página siguiente"
            className={buttonStyles({
              variant: 'secondary',
              size: 'sm',
              className: 'disabled:opacity-40',
            })}
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="size-4 sm:hidden" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
