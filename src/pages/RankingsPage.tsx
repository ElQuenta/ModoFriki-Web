import { Link } from 'react-router-dom'
import { Crown, Eye, Medal, Star, Trophy } from 'lucide-react'
import { SERIES } from '@/data/mock'
import { formatRating, formatViews } from '@/lib/format'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { CoverImage } from '@/components/ui/cover-image'
import { Badge } from '@/components/ui/badge'

export function RankingsPage() {
  useDocumentTitle('Rankings')
  const ranking = [...SERIES].sort((a, b) => b.rating - a.rating)
  const podium = ranking.slice(0, 3)
  const rest = ranking.slice(3)

  return (
    <div className="container-mf pt-8 pb-4">
      <div className="mb-8 max-w-2xl">
        <p className="text-accent mb-2 flex items-center gap-1.5 text-xs font-bold tracking-[0.2em] uppercase">
          <Trophy className="size-3.5" /> Lo mejor de la semana
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Rankings
        </h1>
        <p className="text-secondary mt-3 text-sm leading-relaxed">
          Las series mejor valoradas por la comunidad de ModoFriki. El ranking se
          actualiza con cada voto.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {podium.map((series, index) => (
          <Link
            key={series.id}
            to={`/series/${series.slug}`}
            className="group border-line bg-surface hover:border-accent/40 relative overflow-hidden rounded-2xl border p-3.5 transition-all hover:-translate-y-1 sm:p-4"
          >
            <div className="bg-accent/5 absolute -top-12 -right-12 size-40 rounded-full blur-3xl" />
            <div className="relative flex items-start gap-3">
              <CoverImage
                src={series.coverUrl}
                alt={`Portada de ${series.title}`}
                title={series.title}
                className="h-32 w-22 shrink-0 rounded-xl sm:h-36 sm:w-24"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {index === 0 ? (
                    <Crown className="text-accent size-5" />
                  ) : (
                    <Medal className="text-muted size-5" />
                  )}
                  <span className="font-display text-muted text-2xl font-bold">
                    #{index + 1}
                  </span>
                </div>
                <h2 className="font-display group-hover:text-accent mt-1 line-clamp-2 text-base leading-tight font-bold transition-colors sm:text-lg">
                  {series.title}
                </h2>
                <p className="text-muted mt-1 text-[11px]">
                  {series.type} · {series.genres[0]}
                </p>
                <div className="text-warning mt-2 flex items-center gap-1.5 text-sm font-semibold">
                  <Star className="size-4 fill-current" />
                  {formatRating(series.rating)}
                </div>
              </div>
            </div>
            <div className="border-line text-muted relative mt-4 flex items-center justify-between border-t pt-3 text-[11px]">
              <span className="flex items-center gap-1">
                <Eye className="size-3" /> {formatViews(series.views)}
              </span>
              <Badge tone="accent">{series.totalChapters} caps.</Badge>
            </div>
          </Link>
        ))}
      </div>

      <div className="border-line bg-surface mt-8 overflow-hidden rounded-2xl border">
        {rest.map((series, index) => (
          <Link
            key={series.id}
            to={`/series/${series.slug}`}
            className="group border-line hover:bg-raised flex items-center gap-3 border-b px-4 py-3 transition-colors last:border-b-0 sm:gap-5 sm:px-5"
          >
            <span className="font-display text-muted w-8 shrink-0 text-center text-lg font-bold">
              {index + 4}
            </span>
            <CoverImage
              src={series.coverUrl}
              alt={`Portada de ${series.title}`}
              title={series.title}
              className="h-16 w-11 shrink-0 rounded-md"
            />
            <div className="min-w-0 flex-1">
              <p className="group-hover:text-accent truncate text-sm font-semibold transition-colors">
                {series.title}
              </p>
              <p className="text-muted mt-0.5 truncate text-[11px]">
                {series.type} · {series.genres.slice(0, 2).join(', ')}
              </p>
            </div>
            <div className="text-muted hidden items-center gap-4 text-[11px] sm:flex">
              <span className="flex items-center gap-1">
                <Eye className="size-3" /> {formatViews(series.views)}
              </span>
              <span className="text-warning flex items-center gap-1 font-semibold">
                <Star className="size-3 fill-current" /> {formatRating(series.rating)}
              </span>
            </div>
            <span className="text-warning flex items-center gap-1 text-[11px] font-semibold sm:hidden">
              <Star className="size-3 fill-current" /> {formatRating(series.rating)}
            </span>
            <Badge
              tone={series.status === 'En emisión' ? 'success' : 'neutral'}
              className="hidden shrink-0 sm:inline-flex"
            >
              {series.status}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  )
}
