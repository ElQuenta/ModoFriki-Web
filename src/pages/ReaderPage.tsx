import { useParams } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import {
  getChapter,
  getChaptersForSeries,
  getSeriesBySlug,
} from '@/data/mock'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ReaderView } from '@/components/reader/ReaderView'
import { EmptyState } from '@/components/ui/empty-state'

export function ReaderPage() {
  const { slug = '', chapter: chapterParam = '1' } = useParams()
  const series = getSeriesBySlug(slug)
  const chapterNumber = Number(chapterParam)
  const chapter = series ? getChapter(series.id, chapterNumber) : undefined
  useDocumentTitle(
    series && chapter ? `${series.title} · Cap. ${chapter.number}` : 'Lector',
  )

  if (!series || !chapter) {
    return (
      <div className="container-mf py-16">
        <EmptyState
          icon={BookOpen}
          title="No encontramos este capítulo"
          description="El capítulo no existe o todavía no está disponible. Vuelve a la ficha de la serie para ver los capítulos publicados."
          actionLabel="Volver al catálogo"
          actionTo="/series"
        />
      </div>
    )
  }

  return (
    <ReaderView
      key={chapter.id}
      series={series}
      chapter={chapter}
      chapters={getChaptersForSeries(series.id)}
    />
  )
}
