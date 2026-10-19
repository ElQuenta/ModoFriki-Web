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
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-[0.2em] text-accent uppercase">
          <Trophy className="size-3.5" /> Lo mejor de la semana
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Rankings
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-secondary">
          Las series mejor valoradas por la comunidad de ModoFriki. El ranking se
          actualiza con cada voto.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {podium.map((series, index) => (
          <Link
            key={series.id}
            to={`/series/${series.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-4 transition-all hover:-translate-y-1 hover:border-accent/40"
          >
            <div className="absolute -top-12 -right-12 size-40 rounded-full bg-accent/5 blur-3xl" />
            <div className="relative flex items-start gap-3">
              <CoverImage
                src={series.coverUrl}
                alt={`Portada de ${series.title}`}
                title={series.title}
                className="h-36 w-24 shrink-0 rounded-xl"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {index === 0 ? (
                    <Crown className="size-5 text-accent" />
                  ) : (
                    <Medal className="size-5 text-muted" />
                  )}
                  <span className="font-display text-2xl font-bold text-muted">
                    #{index + 1}
                  </span>
                </div>
                <h2 className="mt-1 font-display text-lg leading-tight font-bold transition-colors group-hover:text-accent">
                  {series.title}
                </h2>
                <p className="mt-1 text-[11px] text-muted">
                  {series.type} · {series.genres[0]}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-warning">
                  <Star className="size-4 fill-current" />
                  {formatRating(series.rating)}
                </div>
              </div>
            </div>
            <div className="relative mt-4 flex items-center justify-between border-t border-line pt-3 text-[11px] text-muted">
              <span className="flex items-center gap-1">
                <Eye className="size-3" /> {formatViews(series.views)}
              </span>
              <Badge tone="accent">{series.totalChapters} caps.</Badge>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface">
        {rest.map((series, index) => (
          <Link
            key={series.id}
            to={`/series/${series.slug}`}
            className="group flex items-center gap-3 border-b border-line px-4 py-3 transition-colors last:border-b-0 hover:bg-raised sm:gap-5 sm:px-5"
          >
            <span className="w-8 shrink-0 text-center font-display text-lg font-bold text-muted">
              {index + 4}
            </span>
            <CoverImage
              src={series.coverUrl}
              alt={`Portada de ${series.title}`}
              title={series.title}
              className="h-16 w-11 shrink-0 rounded-md"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold transition-colors group-hover:text-accent">
                {series.title}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-muted">
                {series.type} · {series.genres.slice(0, 2).join(', ')}
              </p>
            </div>
            <div className="hidden items-center gap-4 text-[11px] text-muted sm:flex">
              <span className="flex items-center gap-1">
                <Eye className="size-3" /> {formatViews(series.views)}
              </span>
              <span className="flex items-center gap-1 font-semibold text-warning">
                <Star className="size-3 fill-current" /> {formatRating(series.rating)}
              </span>
            </div>
            <Badge tone={series.status === 'En emisión' ? 'success' : 'neutral'}>
              {series.status}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  )
}
