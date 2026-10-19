import { Link } from 'react-router-dom'
import { BookOpen, Eye, Star } from 'lucide-react'
import type { Chapter, Series } from '@/types'
import { cn } from '@/lib/cn'
import { formatRating, formatViews } from '@/lib/format'
import { CoverImage } from '@/components/ui/cover-image'
import { Badge } from '@/components/ui/badge'

export function SeriesCard({
  series,
  latestChapter,
  className,
  compact = false,
}: {
  series: Series
  latestChapter?: Chapter
  className?: string
  compact?: boolean
}) {
  return (
    <article className={cn('group min-w-0', className)}>
      <Link
        to={`/series/${series.slug}`}
        className="block overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-card"
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          <CoverImage
            src={series.coverUrl}
            alt={`Portada de ${series.title}`}
            title={series.title}
            className="size-full rounded-none"
            imgClassName="transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <Badge tone="accent">{series.type}</Badge>
            {series.status === 'En emisión' ? <Badge tone="success">En emisión</Badge> : null}
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-warning backdrop-blur">
            <Star className="size-3 fill-current" />
            {formatRating(series.rating)}
          </div>
          <div className="absolute right-0 bottom-0 left-0 p-4">
            <h3 className="font-display text-lg leading-tight font-bold text-white">
              {series.title}
            </h3>
            <div className="mt-1.5 flex items-center gap-3 text-[11px] text-zinc-300">
              <span className="flex items-center gap-1">
                <BookOpen className="size-3" />
                {series.totalChapters} caps.
              </span>
              <span className="flex items-center gap-1">
                <Eye className="size-3" />
                {formatViews(series.views)}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {!compact ? (
        <div className="mt-3 px-0.5">
          <p className="truncate text-xs text-muted">{series.genres.join(' · ')}</p>
          {latestChapter ? (
            <Link
              to={`/read/${series.slug}/${latestChapter.number}`}
              className="mt-1.5 flex items-center justify-between gap-2 text-xs text-secondary transition-colors hover:text-accent"
            >
              <span className="truncate">
                Cap. {latestChapter.number} · {latestChapter.title}
              </span>
              <span className="shrink-0 text-[10px] text-muted">Nuevo</span>
            </Link>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
