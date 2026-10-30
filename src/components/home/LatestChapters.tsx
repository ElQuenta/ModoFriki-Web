import { PUBLIC_CACHE_MS } from '@/lib/constants'
import { listLatestChapters } from '@/services/discovery'
import { useAsync } from '@/hooks/useAsync'
import { SeriesCard } from '@/components/catalog/SeriesCard'
import { SectionHeader } from '@/components/ui/section-header'
import { SeriesCardSkeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/empty-state'

export function LatestChapters() {
  const { data, loading, error, reload } = useAsync(
    () => listLatestChapters({ limit: 8 }),
    'latest-chapters',
    true,
    undefined,
    PUBLIC_CACHE_MS,
  )
  const items = data?.items ?? []

  if (!loading && !error && items.length === 0) return null

  return (
    <section className="container-mf mt-16">
      <SectionHeader
        eyebrow="Recién salido del horno"
        title="Últimos capítulos"
        description="Las actualizaciones más recientes de la biblioteca."
        actionLabel="Ver todos"
        actionTo="/chapters/latest"
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {loading && !data
            ? Array.from({ length: 4 }, (_, index) => <SeriesCardSkeleton key={index} />)
            : items.map(({ series, chapter }) => (
                <SeriesCard key={chapter.id} series={series} latestChapter={chapter} />
              ))}
        </div>
      )}
    </section>
  )
}
