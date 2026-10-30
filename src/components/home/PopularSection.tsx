import { PUBLIC_CACHE_MS } from '@/lib/constants'
import type { Series } from '@/types'
import { listPopularWorks, listRecommendedWorks } from '@/services/discovery'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { SeriesCard } from '@/components/catalog/SeriesCard'
import { SectionHeader } from '@/components/ui/section-header'
import { SeriesCardSkeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/empty-state'

function WorkGrid({
  items,
  loading,
  error,
  reload,
}: {
  items?: Series[]
  loading: boolean
  error?: string
  reload: () => void
}) {
  if (error) return <ErrorState message={error} onRetry={reload} />
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
      {loading && !items
        ? Array.from({ length: 6 }, (_, index) => <SeriesCardSkeleton key={index} />)
        : items?.map((series) => <SeriesCard key={series.id} series={series} compact />)}
    </div>
  )
}

export function PopularSection() {
  const { data, loading, error, reload } = useAsync(
    () => listPopularWorks({ period: 'all', limit: 6 }),
    'popular-all-6',
    true,
    undefined,
    PUBLIC_CACHE_MS,
  )

  if (!loading && !error && !data?.items.length) return null

  return (
    <section className="container-mf mt-16">
      <SectionHeader
        eyebrow="Todo el mundo está leyendo"
        title="Populares ahora"
        description="Las series que no dejan de sonar en la comunidad."
        actionLabel="Ver rankings"
        actionTo="/rankings"
      />
      <WorkGrid items={data?.items} loading={loading} error={error} reload={reload} />
    </section>
  )
}

export function ForYouSection() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useAsync(
    () => listRecommendedWorks(6),
    `recommended:${user?.id ?? 'guest'}`,
  )

  if (!loading && !error && !data?.items.length) return null

  const byGenres = data?.basis === 'genres'

  return (
    <section className="container-mf mt-16">
      <SectionHeader
        eyebrow={byGenres ? 'Según tus favoritos' : 'Para empezar'}
        title="Para ti"
        description={
          byGenres
            ? 'Obras de los géneros que más guardas.'
            : 'Guarda favoritos y afinaremos estas recomendaciones.'
        }
        actionLabel="Explorar todo"
        actionTo="/series"
      />
      <WorkGrid items={data?.items} loading={loading} error={error} reload={reload} />
    </section>
  )
}
