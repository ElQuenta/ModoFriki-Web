import { useParams } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { formatChapterNumber } from '@/lib/format'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useChapter, useChapters, useWork } from '@/hooks/useCatalog'
import { ReaderView } from '@/components/reader/ReaderView'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'

export function ReaderPage() {
  const { workId = '', chapterId = '' } = useParams()
  const work = useWork(workId)
  const chapters = useChapters(workId)
  const chapter = useChapter(workId, chapterId)
  const series = work.data
  const current = chapter.data
  useDocumentTitle(
    series && current
      ? `${series.title} · Cap. ${formatChapterNumber(current.number)}`
      : 'Lector',
  )

  if ((work.loading && !series) || chapter.loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-3 px-4 pt-20">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="aspect-[2/3] w-full" />
        ))}
      </div>
    )
  }

  if (!series || !current) {
    return (
      <div className="container-mf py-16">
        <EmptyState
          icon={BookOpen}
          title="No encontramos este capítulo"
          description="El capítulo no existe o todavía no está disponible. Vuelve a la ficha de la serie para ver los capítulos publicados."
          actionLabel={series ? 'Volver a la serie' : 'Volver al catálogo'}
          actionTo={series ? `/series/${series.id}` : '/series'}
        />
      </div>
    )
  }

  return (
    <ReaderView
      key={current.id}
      series={series}
      chapter={current}
      chapters={chapters.data ?? [current]}
    />
  )
}
