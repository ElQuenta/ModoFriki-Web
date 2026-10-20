import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, BookOpen } from 'lucide-react'
import { FAVORITE_STATUSES } from '@/lib/constants'
import { SERIES } from '@/data/mock'
import type { FavoriteStatus } from '@/types'
import { cn } from '@/lib/cn'
import { useLibrary } from '@/hooks/useLibrary'
import { SeriesCard } from '@/components/catalog/SeriesCard'
import { EmptyState } from '@/components/ui/empty-state'
import { buttonStyles } from '@/components/ui/button'

type Filter = 'Todos' | FavoriteStatus

export function FavoritesView() {
  const { favorites, setFavoriteStatus, removeFavorite } = useLibrary()
  const [filter, setFilter] = useState<Filter>('Todos')

  const items = Object.values(favorites)
    .map((favorite) => ({
      favorite,
      series: SERIES.find((series) => series.id === favorite.seriesId),
    }))
    .filter((item) => item.series)
    .filter((item) => filter === 'Todos' || item.favorite.status === filter)

  const counts = FAVORITE_STATUSES.reduce<Record<string, number>>((acc, status) => {
    acc[status] = Object.values(favorites).filter((item) => item.status === status).length
    return acc
  }, {})

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
          {Object.keys(favorites).length} series guardadas. Organízalas por estado y
          retoma la lectura cuando quieras.
        </p>
      </div>

      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilter('Todos')}
          className={cn(
            'shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors',
            filter === 'Todos'
              ? 'border-accent/40 bg-accent/10 text-accent'
              : 'border-line bg-surface text-secondary hover:text-primary',
          )}
        >
          Todos ({Object.keys(favorites).length})
        </button>
        {FAVORITE_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors',
              filter === status
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'border-line bg-surface text-secondary hover:text-primary',
            )}
          >
            {status} ({counts[status] ?? 0})
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Tu biblioteca está esperando"
          description="Guarda series con el botón de favorito para tenerlas siempre a mano. Puedes organizarlas por estado de lectura."
          actionLabel="Explorar catálogo"
          actionTo="/series"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {items.map(({ favorite, series }) => {
            if (!series) return null
            return (
              <div key={series.id}>
                <SeriesCard series={series} compact />
                <div className="mt-2 flex items-center gap-1.5">
                  <select
                    value={favorite.status}
                    onChange={(event) =>
                      setFavoriteStatus(series.id, event.target.value as FavoriteStatus)
                    }
                    aria-label={`Estado de ${series.title}`}
                    className="border-line bg-surface text-secondary focus:border-accent/60 h-10 min-w-0 flex-1 rounded-lg border px-2 text-[11px] outline-none"
                  >
                    {FAVORITE_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeFavorite(series.id)}
                    aria-label={`Quitar ${series.title} de favoritos`}
                    className="border-line text-muted hover:border-danger/40 hover:text-danger flex size-10 shrink-0 items-center justify-center rounded-lg border transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
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
