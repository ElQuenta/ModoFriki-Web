import { Sparkles, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useUI } from '@/hooks/useUI'

export function AnnouncementBar() {
  const { announcementDismissed, dismissAnnouncement } = useUI()
  if (announcementDismissed) return null

  return (
    <div className="border-accent/20 from-accent/15 via-accent/5 relative border-b bg-gradient-to-r to-transparent">
      <div className="container-mf text-secondary flex items-center justify-center gap-2 py-2 pr-10 text-center text-xs sm:pr-12 sm:text-sm">
        <Sparkles className="text-accent size-3.5 shrink-0" />
        <p>
          Nueva temporada de{' '}
          <span className="text-primary font-semibold">Cazador de Sombras</span>.{' '}
          <Link
            to="/series?q=Cazador%20de%20Sombras"
            className="text-accent font-semibold hover:underline"
          >
            Buscar en catálogo
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
