import { useParams } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { getChaptersForSeries, getSeriesBySlug } from '@/data/mock'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { SeriesDetail } from '@/components/detail/SeriesDetail'
import { EmptyState } from '@/components/ui/empty-state'

export function DetailPage() {
  const { slug = '' } = useParams()
  const series = getSeriesBySlug(slug)
  useDocumentTitle(series?.title ?? 'Serie no encontrada')

  if (!series) {
    return (
      <div className="container-mf py-16">
        <EmptyState
          icon={BookOpen}
          title="No encontramos esta serie"
          description="Puede que el enlace esté mal escrito o que la serie ya no esté disponible."
          actionLabel="Volver al catálogo"
          actionTo="/series"
        />
      </div>
    )
  }

  return <SeriesDetail series={series} chapters={getChaptersForSeries(series.id)} />
}
