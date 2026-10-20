import { Link } from 'react-router-dom'
import { BookMarked, ArrowUpRight } from 'lucide-react'
import { SERIES } from '@/data/mock'
import { CoverImage } from '@/components/ui/cover-image'
import { Badge } from '@/components/ui/badge'
import { SectionHeader } from '@/components/ui/section-header'

export function NovelsSection() {
  const novels = SERIES.filter((series) => series.type === 'Novela')

  return (
    <section className="container-mf mt-16">
      <SectionHeader
        eyebrow="Para leer sin prisa"
        title="Novelas ligeras"
        description="Historias que se disfrutan con una taza de café."
        actionLabel="Ver novelas"
        actionTo="/series?type=Novela"
      />
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        {novels.map((novel) => (
          <Link
            key={novel.id}
            to={`/series/${novel.slug}`}
            className="group border-line bg-surface hover:border-accent/30 flex gap-3 rounded-2xl border p-3 transition-all hover:-translate-y-0.5 sm:gap-4 sm:p-4"
          >
            <CoverImage
              src={novel.coverUrl}
              alt={`Portada de ${novel.title}`}
              title={novel.title}
              className="h-36 w-24 shrink-0 rounded-xl sm:h-40 sm:w-27"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <Badge tone="info">Novela</Badge>
                <ArrowUpRight className="text-muted group-hover:text-accent size-4 transition-colors" />
              </div>
              <h3 className="font-display group-hover:text-accent mt-2 line-clamp-2 text-base font-bold transition-colors sm:text-lg">
                {novel.title}
              </h3>
              <p className="text-secondary mt-1 text-xs">{novel.author}</p>
              <p className="text-muted mt-2 line-clamp-3 text-xs leading-relaxed">
                {novel.synopsis}
              </p>
              <p className="text-muted mt-auto flex items-center gap-1.5 pt-3 text-[11px]">
                <BookMarked className="text-accent size-3.5" />
                {novel.genres.join(' · ')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
