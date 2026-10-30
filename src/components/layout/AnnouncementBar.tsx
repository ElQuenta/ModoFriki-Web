import { Sparkles, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useUI } from '@/hooks/useUI'
import { useAsync } from '@/hooks/useAsync'
import { listLatestChapters } from '@/services/discovery'

export function AnnouncementBar() {
  const { announcementDismissed, dismissAnnouncement } = useUI()
  const { data } = useAsync(
    () => listLatestChapters({ limit: 1 }),
    'announcement-latest',
    !announcementDismissed,
  )
  const latest = data?.items[0]
  if (announcementDismissed || !latest) return null

  return (
    <div className="border-accent/20 from-accent/15 via-accent/5 relative border-b bg-gradient-to-r to-transparent">
      <div className="container-mf text-secondary flex items-center justify-center gap-2 py-2 pr-10 text-center text-xs sm:pr-12 sm:text-sm">
        <Sparkles className="text-accent size-3.5 shrink-0" />
        <p>
          Nuevo capítulo de{' '}
          <span className="text-primary font-semibold">{latest.series.title}</span>: Cap.{' '}
          {latest.chapter.number}.{' '}
          <Link
            to={`/read/${latest.series.id}/${latest.chapter.id}`}
            className="text-accent font-semibold hover:underline"
          >
            Leer ahora
          </Link>
        </p>
        <button
          type="button"
          onClick={dismissAnnouncement}
          aria-label="Cerrar anuncio"
          className="text-muted hover:bg-raised hover:text-primary absolute right-2 flex size-10 items-center justify-center rounded-lg transition-colors sm:right-5"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
