import { Link } from 'react-router-dom'
import { Compass, Home, Search } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { buttonStyles } from '@/components/ui/button'

export function NotFoundPage() {
  useDocumentTitle('Página no encontrada')

  return (
    <div className="container-mf flex min-h-[60dvh] flex-col items-center justify-center py-12 text-center sm:py-16">
      <p className="font-display text-accent text-6xl font-bold sm:text-8xl">404</p>
      <h1 className="font-display mt-3 text-2xl font-bold sm:text-3xl">
        Te perdiste en otra dimensión
      </h1>
      <p className="text-secondary mt-3 max-w-md text-sm">
        La página que buscas no existe, cambió de nombre o el portal se cerró antes de
        tiempo.
      </p>
      <div className="mt-7 flex w-full flex-col justify-center gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
        <Link
          to="/"
          className={buttonStyles({ size: 'lg', className: 'w-full sm:w-auto' })}
        >
          <Home className="size-4" /> Volver al inicio
        </Link>
        <Link
          to="/series"
          className={buttonStyles({
            variant: 'secondary',
            size: 'lg',
            className: 'w-full sm:w-auto',
          })}
        >
          <Compass className="size-4" /> Explorar catálogo
        </Link>
        <Link
          to="/series"
          className={buttonStyles({
            variant: 'ghost',
            size: 'lg',
            className: 'w-full sm:w-auto',
          })}
        >
          <Search className="size-4" /> Buscar una serie
        </Link>
      </div>
    </div>
  )
}
