import { Link } from 'react-router-dom'
import { ArrowRight, Clock3, Play } from 'lucide-react'
import { SERIES } from '@/data/mock'
import { useLibrary } from '@/hooks/useLibrary'
import { SectionHeader } from '@/components/ui/section-header'
import { CoverImage } from '@/components/ui/cover-image'
import { Badge } from '@/components/ui/badge'

export function ContinueReading() {
  const { progress } = useLibrary()
  const entries = Object.values(progress)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 3)
    .map((item) => ({ item, series: SERIES.find((series) => series.id === item.seriesId) }))
    .filter((entry) => entry.series)

  if (entries.length === 0) return null

  return (
    <section className="container-mf mt-14">
      <SectionHeader
        eyebrow="Tu biblioteca"
        title="Continuar leyendo"
        description="Retoma justo donde lo dejaste."
        actionLabel="Ver historial"
        actionTo="/profile"
      />
      <div className="grid gap-4 md:grid-cols-3">
        {entries.map(({ item, series }) => {
          if (!series) return null
          return (
            <article
              key={item.seriesId}
              className="group flex gap-4 rounded-2xl border border-line bg-surface p-3 transition-colors hover:border-accent/30"
            >
              <Link to={`/series/${series.slug}`} className="shrink-0">
                <CoverImage
                  src={series.coverUrl}
                  alt={`Portada de ${series.title}`}
                  title={series.title}
                  className="h-32 w-22 rounded-xl"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/series/${series.slug}`}
                    className="truncate font-display text-base font-bold hover:text-accent"
                  >
                    {series.title}
                  </Link>
                  <Badge tone="accent" className="shrink-0">
                    {item.percentage}%
                  </Badge>
                </div>
                <p className="mt-1 truncate text-xs text-secondary">
                  Cap. {item.chapterNumber} · Página {item.page} de {item.totalPages}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-raised">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                  <span className="flex items-center gap-1 text-[11px] text-muted">
                    <Clock3 className="size-3" />
                    {new Date(item.updatedAt).toLocaleDateString('es', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                  <Link
                    to={`/read/${series.slug}/${item.chapterNumber}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                  >
                    <Play className="size-3 fill-current" /> Continuar
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function GenreStrip() {
  const genres = ['Acción', 'Fantasía', 'Romance', 'Sci-Fi', 'Terror', 'Comedia']
  return (
    <section className="container-mf mt-10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold tracking-wider text-muted uppercase">
          Explorar:
        </span>
        {genres.map((genre) => (
          <Link
            key={genre}
            to={`/series?genre=${encodeURIComponent(genre)}`}
            className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-accent/40 hover:text-accent"
          >
            {genre}
          </Link>
        ))}
        <Link
          to="/genres"
          className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-accent hover:underline"
        >
          Ver todos <ArrowRight className="size-3" />
        </Link>
      </div>
    </section>
  )
}
