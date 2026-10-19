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
      <div className="grid gap-4 md:grid-cols-2">
        {novels.map((novel) => (
          <Link
            key={novel.id}
            to={`/series/${novel.slug}`}
            className="group flex gap-4 rounded-2xl border border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-accent/30"
          >
            <CoverImage
              src={novel.coverUrl}
              alt={`Portada de ${novel.title}`}
              title={novel.title}
              className="h-40 w-27 shrink-0 rounded-xl"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <Badge tone="info">Novela</Badge>
                <ArrowUpRight className="size-4 text-muted transition-colors group-hover:text-accent" />
              </div>
              <h3 className="mt-2 font-display text-lg font-bold transition-colors group-hover:text-accent">
                {novel.title}
              </h3>
              <p className="mt-1 text-xs text-secondary">{novel.author}</p>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted">
                {novel.synopsis}
              </p>
              <p className="mt-auto flex items-center gap-1.5 pt-3 text-[11px] text-muted">
                <BookMarked className="size-3.5 text-accent" />
                {novel.genres.join(' · ')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
