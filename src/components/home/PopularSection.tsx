import { SERIES, getChaptersForSeries } from '@/data/mock'
import { SeriesCard } from '@/components/catalog/SeriesCard'
import { SectionHeader } from '@/components/ui/section-header'

export function PopularSection() {
  const popular = [...SERIES].sort((a, b) => b.views - a.views).slice(0, 6)

  return (
    <section className="container-mf mt-16">
      <SectionHeader
        eyebrow="Todo el mundo está leyendo"
        title="Populares ahora"
        description="Las series que no dejan de sonar en la comunidad."
        actionLabel="Explorar todo"
        actionTo="/series"
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {popular.map((series) => (
          <SeriesCard
            key={series.id}
            series={series}
            latestChapter={getChaptersForSeries(series.id)[0]}
            compact
          />
        ))}
      </div>
    </section>
  )
}
