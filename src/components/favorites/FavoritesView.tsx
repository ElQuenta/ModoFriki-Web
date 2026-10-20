import { Link } from 'react-router-dom'
import { Heart, Trash2, BookOpen } from 'lucide-react'
import { useLibrary } from '@/hooks/useLibrary'
import { SeriesCard } from '@/components/catalog/SeriesCard'
import { EmptyState, ErrorState } from '@/components/ui/empty-state'
import { SeriesCardSkeleton } from '@/components/ui/skeleton'
import { buttonStyles } from '@/components/ui/button'

export function FavoritesView() {
  const { favorites, favoritesLoading, favoritesError, reloadFavorites, removeFavorite } =
    useLibrary()

  const items = Object.values(favorites).sort(
    (a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt),
  )

  return (
    <div className="container-mf pt-8 pb-4">
      <div className="mb-8">
        <p className="text-accent mb-2 text-xs font-bold tracking-[0.2em] uppercase">
          Tu biblioteca
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Favoritos
        </h1>
        <p className="text-secondary mt-3 max-w-xl text-sm">
          {items.length} series guardadas. Retoma la lectura cuando quieras.
        </p>
      </div>

      {favoritesError ? (
        <ErrorState message={favoritesError} onRetry={reloadFavorites} />
      ) : favoritesLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <SeriesCardSkeleton key={index} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Tu biblioteca está esperando"
          description="Guarda series con el botón de favorito para tenerlas siempre a mano."
          actionLabel="Explorar catálogo"
          actionTo="/series"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {items.map(({ series }) => (
            <div key={series.id}>
              <SeriesCard series={series} compact />
              <button
                type="button"
                onClick={() => void removeFavorite(series.id)}
                aria-label={`Quitar ${series.title} de favoritos`}
                className="border-line text-muted hover:border-danger/40 hover:text-danger mt-2 flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border text-xs transition-colors"
              >
                <Trash2 className="size-3.5" /> Quitar
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border-accent/20 bg-accent/5 mt-10 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="bg-accent/10 text-accent flex size-10 items-center justify-center rounded-xl">
          <BookOpen className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">¿Buscas algo nuevo?</p>
          <p className="text-secondary mt-1 text-xs">
            El catálogo se actualiza con nuevas series y capítulos cada semana.
          </p>
        </div>
        <Link
          to="/series"
          className={buttonStyles({
            variant: 'secondary',
            size: 'sm',
            className: 'w-full sm:w-auto',
          })}
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  )
}
