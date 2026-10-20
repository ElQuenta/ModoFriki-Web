import { useParams } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useChapters, useWork } from '@/hooks/useCatalog'
import { SeriesDetail } from '@/components/detail/SeriesDetail'
import { EmptyState, ErrorState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'

export function DetailPage() {
  const { id = '' } = useParams()
  const work = useWork(id)
  const chapters = useChapters(id)
  useDocumentTitle(
    work.data?.title ?? (work.loading ? 'Cargando…' : 'Serie no encontrada'),
  )

  if (work.loading && !work.data) {
    return (
      <div className="container-mf flex flex-col gap-6 pt-10 sm:flex-row">
        <Skeleton className="mx-auto h-80 w-56 shrink-0 sm:mx-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (!work.data) {
    return (
      <div className="container-mf py-16">
        {work.error && !work.error.startsWith('No encontramos') ? (
          <ErrorState message={work.error} onRetry={work.reload} />
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No encontramos esta serie"
            description="Puede que el enlace esté mal escrito o que la serie ya no esté disponible."
            actionLabel="Volver al catálogo"
            actionTo="/series"
          />
        )}
      </div>
    )
  }

  return (
    <SeriesDetail
      key={work.data.id}
      series={work.data}
      chapters={chapters.data ?? []}
      chaptersLoading={chapters.loading && !chapters.data}
      chaptersError={chapters.error}
      onRetryChapters={chapters.reload}
    />
  )
}
