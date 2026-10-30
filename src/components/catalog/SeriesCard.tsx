import { Link } from 'react-router-dom'
import { BookOpen, Eye, Star } from 'lucide-react'
import type { Chapter, Series } from '@/types'
import { cn } from '@/lib/cn'
import { formatChapterNumber, formatRating, formatViews } from '@/lib/format'
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
        to={`/series/${series.id}`}
        className="border-line bg-surface hover:border-accent/30 hover:shadow-card block overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1"
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          <CoverImage
            src={series.thumbUrl || series.coverUrl}
            alt={`Portada de ${series.title}`}
            title={series.title}
            className="size-full rounded-none"
            imgClassName="transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 sm:top-3 sm:left-3">
            {series.type ? (
              <Badge
                tone="accent"
                className="px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px]"
              >
                {series.type}
              </Badge>
            ) : null}
            {series.status === 'En emisión' ? (
              <Badge
                tone="success"
                className="hidden px-2 py-0.5 text-[10px] sm:inline-flex sm:px-2.5 sm:py-1 sm:text-[11px]"
              >
                En emisión
              </Badge>
            ) : null}
          </div>
          {series.rating !== undefined ? (
            <div className="text-warning absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold backdrop-blur sm:top-3 sm:right-3 sm:px-2 sm:py-1 sm:text-xs">
              <Star className="size-3 fill-current" />
              {formatRating(series.rating)}
            </div>
          ) : null}
          <div className="absolute right-0 bottom-0 left-0 p-3 sm:p-4">
            <h3 className="font-display line-clamp-2 text-base leading-tight font-bold text-white sm:text-lg">
              {series.title}
            </h3>
            <div className="mt-1.5 flex items-center gap-2.5 text-[10px] text-zinc-300 sm:gap-3 sm:text-[11px]">
              {series.totalChapters !== undefined ? (
                <span className="flex items-center gap-1">
                  <BookOpen className="size-3" />
                  {series.totalChapters} caps.
                </span>
              ) : null}
              {series.views !== undefined ? (
                <span className="flex items-center gap-1">
                  <Eye className="size-3" />
                  {formatViews(series.views)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </Link>

      {!compact ? (
        <div className="mt-3 px-0.5">
          {series.genres.length ? (
            <p className="text-muted truncate text-xs">{series.genres.join(' · ')}</p>
          ) : null}
          {latestChapter ? (
            <Link
              to={`/read/${series.id}/${latestChapter.id}`}
              className="text-secondary hover:text-accent mt-1.5 flex items-center justify-between gap-2 text-xs transition-colors"
            >
              <span className="truncate">
                Cap. {formatChapterNumber(latestChapter.number)}
                {latestChapter.title ? ` · ${latestChapter.title}` : ''}
              </span>
              <span className="text-muted shrink-0 text-[10px]">Nuevo</span>
            </Link>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
