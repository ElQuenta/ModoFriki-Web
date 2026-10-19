import { Link } from 'react-router-dom'
import { Compass, Home, Search } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { buttonStyles } from '@/components/ui/button'

export function NotFoundPage() {
  useDocumentTitle('Página no encontrada')

  return (
    <div className="container-mf flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-display text-7xl font-bold text-accent sm:text-8xl">404</p>
      <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
        Te perdiste en otra dimensión
      </h1>
      <p className="mt-3 max-w-md text-sm text-secondary">
        La página que buscas no existe, cambió de nombre o el portal se cerró antes de
        tiempo.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link to="/" className={buttonStyles({ size: 'lg' })}>
          <Home className="size-4" /> Volver al inicio
        </Link>
        <Link to="/series" className={buttonStyles({ variant: 'secondary', size: 'lg' })}>
          <Compass className="size-4" /> Explorar catálogo
        </Link>
        <Link to="/series" className={buttonStyles({ variant: 'ghost', size: 'lg' })}>
          <Search className="size-4" /> Buscar una serie
        </Link>
      </div>
    </div>
  )
}
