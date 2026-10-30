import { PUBLIC_CACHE_MS } from '@/lib/constants'
import { Link, useSearchParams } from 'react-router-dom'
import { Crown, Eye, Medal, Trophy } from 'lucide-react'
import { listPopularWorks } from '@/services/discovery'
import { cn } from '@/lib/cn'
import { formatViews } from '@/lib/format'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useWorkTypes } from '@/hooks/useCatalog'
import { CoverImage } from '@/components/ui/cover-image'
import { EmptyState, ErrorState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'

const PERIODS = [
  { value: 'all', label: 'Histórico' },
  { value: 'day', label: 'Últimas 24 h' },
] as const

export function RankingsPage() {
  useDocumentTitle('Rankings')
  const [params, setParams] = useSearchParams()
  const period = params.get('period') === 'day' ? 'day' : 'all'
  const page = Math.max(1, Number(params.get('page')) || 1)
  const typeId = params.get('type') || undefined
  const { data: types } = useWorkTypes()
  const { data, loading, error, reload } = useAsync(
    () => listPopularWorks({ period, typeId, page, limit: 50 }),
    `rankings:${period}:${typeId ?? ''}:${page}`,
    true,
    undefined,
    PUBLIC_CACHE_MS,
  )
  const ranking = data?.items ?? []
  const podium = ranking.slice(0, 3)
  const rest = ranking.slice(3)
  const total = data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / 50))
  const change = (updates: { period?: 'all' | 'day'; type?: string; page?: number }) => {
    const next = new URLSearchParams()
    const nextPeriod = updates.period ?? period
    const nextType = updates.type === undefined ? typeId : updates.type || undefined
    const nextPage = updates.page ?? 1
    if (nextPeriod !== 'all') next.set('period', nextPeriod)
    if (nextType) next.set('type', nextType)
    if (nextPage > 1) next.set('page', String(nextPage))
    setParams(next)
  }

  return (
    <div className="container-mf pt-8 pb-4">
      <div className="mb-8 max-w-2xl">
        <p className="text-accent mb-2 flex items-center gap-1.5 text-xs font-bold tracking-[0.2em] uppercase">
          <Trophy className="size-3.5" /> Lo más visitado
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Rankings
        </h1>
        <p className="text-secondary mt-3 text-sm leading-relaxed">
          Las series más visitadas por la comunidad de ModoFriki. El ranking se actualiza
          con cada visita.
        </p>
        <div className="mt-5 flex gap-1.5" role="group" aria-label="Periodo del ranking">
          {PERIODS.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={period === item.value}
              onClick={() => change({ period: item.value })}
              className={cn(
                'rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                period === item.value
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-line bg-surface text-secondary hover:text-primary',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="mt-3 block max-w-xs">
          <span className="text-secondary mb-1.5 block text-xs font-semibold">Tipo de obra</span>
          <select aria-label="Filtrar tipo de obra" value={typeId ?? ''} onChange={(event) => change({ type: event.target.value })} className="border-line bg-surface text-primary h-10 w-full rounded-lg border px-3 text-sm">
            <option value="">Todos los tipos</option>
            {types?.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
          </select>
        </label>
      </div>

      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {loading && !data ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : null}
      {!loading && !error && ranking.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Todavía no hay ranking"
          description="Cuando la comunidad empiece a visitar series, aparecerán aquí."
          actionLabel="Explorar catálogo"
          actionTo="/series"
        />
      ) : null}
      {data ? <p className="text-muted mb-4 text-xs">{total.toLocaleString('es')} resultados · Página {page} de {pageCount}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {podium.map((series, index) => (
          <Link
            key={series.id}
            to={`/series/${series.id}`}
            className="group border-line bg-surface hover:border-accent/40 relative overflow-hidden rounded-2xl border p-3.5 transition-all hover:-translate-y-1 sm:p-4"
          >
            <div className="bg-accent/5 absolute -top-12 -right-12 size-40 rounded-full blur-3xl" />
            <div className="relative flex items-start gap-3">
              <CoverImage
                src={series.thumbUrl || series.coverUrl}
                alt={`Portada de ${series.title}`}
                title={series.title}
                className="h-32 w-22 shrink-0 rounded-xl sm:h-36 sm:w-24"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {index === 0 ? (
                    <Crown className="text-accent size-5" />
                  ) : (
                    <Medal className="text-muted size-5" />
                  )}
                  <span className="font-display text-muted text-2xl font-bold">
                    #{index + 1}
                  </span>
                </div>
                <h2 className="font-display group-hover:text-accent mt-1 line-clamp-2 text-base leading-tight font-bold transition-colors sm:text-lg">
                  {series.title}
                </h2>
              </div>
            </div>
            <div className="border-line text-muted relative mt-4 flex items-center justify-between border-t pt-3 text-[11px]">
              <span className="flex items-center gap-1">
                <Eye className="size-3" /> {formatViews(series.views ?? 0)} visitas
              </span>
            </div>
          </Link>
        ))}
      </div>
      {pageCount > 1 ? <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Paginación del ranking">
        <button type="button" className="border-line bg-surface text-secondary rounded-lg border px-4 py-2 text-sm disabled:opacity-50" disabled={page <= 1 || loading} onClick={() => change({ page: page - 1 })}>Anterior</button>
        <span className="text-secondary text-sm">{page} / {pageCount}</span>
        <button type="button" className="border-line bg-surface text-secondary rounded-lg border px-4 py-2 text-sm disabled:opacity-50" disabled={page >= pageCount || loading} onClick={() => change({ page: page + 1 })}>Siguiente</button>
      </nav> : null}

      <div className="border-line bg-surface mt-8 overflow-hidden rounded-2xl border empty:hidden">
        {rest.map((series, index) => (
          <Link
            key={series.id}
            to={`/series/${series.id}`}
            className="group border-line hover:bg-raised flex items-center gap-3 border-b px-4 py-3 transition-colors last:border-b-0 sm:gap-5 sm:px-5"
          >
            <span className="font-display text-muted w-8 shrink-0 text-center text-lg font-bold">
              {index + 4}
            </span>
            <CoverImage
              src={series.thumbUrl || series.coverUrl}
              alt={`Portada de ${series.title}`}
              title={series.title}
              className="h-16 w-11 shrink-0 rounded-md"
            />
            <div className="min-w-0 flex-1">
              <p className="group-hover:text-accent truncate text-sm font-semibold transition-colors">
                {series.title}
              </p>
            </div>
            <span className="text-muted flex items-center gap-1 text-[11px]">
              <Eye className="size-3" /> {formatViews(series.views ?? 0)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
