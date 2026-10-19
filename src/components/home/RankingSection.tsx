import { Link } from 'react-router-dom'
import { Eye, Star } from 'lucide-react'
import { SERIES } from '@/data/mock'
import { formatRating, formatViews } from '@/lib/format'
import { SectionHeader } from '@/components/ui/section-header'
import { CoverImage } from '@/components/ui/cover-image'
import { cn } from '@/lib/cn'

export function RankingSection() {
  const ranking = [...SERIES].sort((a, b) => b.rating - a.rating).slice(0, 5)

  return (
    <section className="container-mf mt-16">
      <SectionHeader
        eyebrow="La comunidad decide"
        title="Ranking semanal"
        description="Las obras mejor valoradas de los últimos siete días."
        actionLabel="Ver ranking completo"
        actionTo="/rankings"
      />
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        {ranking.map((series, index) => (
          <Link
            key={series.id}
            to={`/series/${series.slug}`}
            className={cn(
              'group flex items-center gap-4 p-3 transition-colors hover:bg-raised sm:p-4',
              index !== ranking.length - 1 && 'border-b border-line',
            )}
          >
            <span
              className={cn(
                'w-8 shrink-0 text-center font-display text-2xl font-bold',
                index === 0 ? 'text-accent' : 'text-muted',
              )}
            >
              {index + 1}
            </span>
            <CoverImage
              src={series.coverUrl}
              alt={`Portada de ${series.title}`}
              title={series.title}
              className="h-20 w-14 shrink-0 rounded-lg sm:h-24 sm:w-17"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display font-bold transition-colors group-hover:text-accent">
                {series.title}
              </p>
              <p className="mt-0.5 truncate text-xs text-secondary">
                {series.type} · {series.genres.slice(0, 2).join(', ')}
              </p>
              <p className="mt-1.5 text-[11px] text-muted">
                {series.totalChapters} capítulos · {series.status}
              </p>
            </div>
            <div className="hidden items-center gap-5 text-xs text-secondary sm:flex">
              <span className="flex items-center gap-1.5">
                <Eye className="size-3.5" /> {formatViews(series.views)}
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-warning">
                <Star className="size-3.5 fill-current" /> {formatRating(series.rating)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
