import { SERIES, getChaptersForSeries } from '@/data/mock'
import { SeriesCard } from '@/components/catalog/SeriesCard'
import { SectionHeader } from '@/components/ui/section-header'

export function LatestChapters() {
  const latest = [...SERIES]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 4)

  return (
    <section className="container-mf mt-16">
      <SectionHeader
        eyebrow="Recién salido del horno"
        title="Últimos capítulos"
        description="Las actualizaciones más recientes de la biblioteca."
        actionLabel="Ver catálogo"
        actionTo="/series"
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {latest.map((series) => (
          <SeriesCard
            key={series.id}
            series={series}
            latestChapter={getChaptersForSeries(series.id)[0]}
          />
        ))}
      </div>
    </section>
  )
}
