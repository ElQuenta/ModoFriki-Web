import { Sparkles, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useUI } from '@/hooks/useUI'

export function AnnouncementBar() {
  const { announcementDismissed, dismissAnnouncement } = useUI()
  if (announcementDismissed) return null

  return (
    <div className="relative border-b border-accent/20 bg-gradient-to-r from-accent/15 via-accent/5 to-transparent">
      <div className="container-mf flex items-center justify-center gap-2 py-2 text-center text-xs text-secondary sm:text-sm">
        <Sparkles className="size-3.5 shrink-0 text-accent" />
        <p>
          Nueva temporada de <span className="font-semibold text-primary">Cazador de Sombras</span>.{' '}
          <Link to="/series/cazador-de-sombras" className="font-semibold text-accent hover:underline">
            Leer ahora
          </Link>
        </p>
        <button
          type="button"
          onClick={dismissAnnouncement}
          aria-label="Cerrar anuncio"
          className="absolute right-3 flex size-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-raised hover:text-primary sm:right-6"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
