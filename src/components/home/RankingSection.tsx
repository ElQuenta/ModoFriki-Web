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
      <div className="border-line bg-surface overflow-hidden rounded-2xl border">
        {ranking.map((series, index) => (
          <Link
            key={series.id}
            to={`/series/${series.slug}`}
            className={cn(
              'group hover:bg-raised flex items-center gap-4 p-3 transition-colors sm:p-4',
              index !== ranking.length - 1 && 'border-line border-b',
            )}
          >
            <span
              className={cn(
                'font-display w-6 shrink-0 text-center text-xl font-bold sm:w-8 sm:text-2xl',
                index === 0 ? 'text-accent' : 'text-muted',
              )}
            >
              {index + 1}
            </span>
            <CoverImage
              src={series.coverUrl}
              alt={`Portada de ${series.title}`}
              title={series.title}
              className="h-16 w-11 shrink-0 rounded-lg sm:h-24 sm:w-17"
            />
            <div className="min-w-0 flex-1">
              <p className="font-display group-hover:text-accent truncate font-bold transition-colors">
                {series.title}
              </p>
              <p className="text-secondary mt-0.5 truncate text-xs">
                {series.type} · {series.genres.slice(0, 2).join(', ')}
              </p>
              <p className="text-muted mt-1.5 text-[11px]">
                {series.totalChapters} capítulos · {series.status}
              </p>
            </div>
            <div className="text-secondary flex shrink-0 items-center gap-3 text-xs sm:gap-5">
              <span className="hidden items-center gap-1.5 sm:flex">
                <Eye className="size-3.5" /> {formatViews(series.views)}
              </span>
              <span className="text-warning flex items-center gap-1.5 font-semibold">
                <Star className="size-3.5 fill-current" /> {formatRating(series.rating)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
