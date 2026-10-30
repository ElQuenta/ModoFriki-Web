import { PUBLIC_CACHE_MS } from '@/lib/constants'
import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { listPopularWorks } from '@/services/discovery'
import { useAsync } from '@/hooks/useAsync'
import { formatViews } from '@/lib/format'
import { SectionHeader } from '@/components/ui/section-header'
import { CoverImage } from '@/components/ui/cover-image'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/empty-state'
import { cn } from '@/lib/cn'

export function RankingSection() {
  const { data, loading, error, reload } = useAsync(
    () => listPopularWorks({ period: 'day', limit: 5 }),
    'popular-day-5',
    true,
    undefined,
    PUBLIC_CACHE_MS,
  )
  const ranking = data?.items ?? []

  if (!loading && !error && ranking.length === 0) return null

  return (
    <section className="container-mf mt-16">
      <SectionHeader
        eyebrow="La comunidad decide"
        title="Tendencias de hoy"
        description="Las obras más visitadas en las últimas 24 horas."
        actionLabel="Ver ranking completo"
        actionTo="/rankings"
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="border-line bg-surface overflow-hidden rounded-2xl border">
          {loading && !data
            ? Array.from({ length: 5 }, (_, index) => (
                <div
                  key={index}
                  className="border-line flex gap-4 border-b p-4 last:border-b-0"
                >
                  <Skeleton className="h-16 w-11" />
                  <Skeleton className="h-4 w-1/2 self-center" />
                </div>
              ))
            : ranking.map((series, index) => (
                <Link
                  key={series.id}
                  to={`/series/${series.id}`}
                  className={cn(
                    'group hover:bg-raised flex items-center gap-4 p-3 transition-colors sm:p-4',
                    index !== ranking.length - 1 && 'border-line border-b',
                  )}
                >
                  <span
                    className={cn(
                      'font-display w-6 shrink-0 text-center text-xl font-bold sm:w-8 sm:text-2xl',
                      index === 0 ? 'text-accent' : 'text-muted',
                    )}
                  >
                    {index + 1}
                  </span>
                  <CoverImage
                    src={series.thumbUrl || series.coverUrl}
                    alt={`Portada de ${series.title}`}
                    title={series.title}
                    className="h-16 w-11 shrink-0 rounded-lg sm:h-24 sm:w-17"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display group-hover:text-accent truncate font-bold transition-colors">
                      {series.title}
                    </p>
                  </div>
                  <span className="text-secondary flex shrink-0 items-center gap-1.5 text-xs">
                    <Eye className="size-3.5" /> {formatViews(series.views ?? 0)}
                  </span>
                </Link>
              ))}
        </div>
      )}
    </section>
  )
}
