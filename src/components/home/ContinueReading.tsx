import { Link } from 'react-router-dom'
import { ArrowRight, Clock3, Play } from 'lucide-react'
import { listReadingHistory } from '@/services/reading'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { formatChapterNumber } from '@/lib/format'
import { useLibrary } from '@/hooks/useLibrary'
import { useGenres } from '@/hooks/useCatalog'
import { SectionHeader } from '@/components/ui/section-header'
import { CoverImage } from '@/components/ui/cover-image'
import { Badge } from '@/components/ui/badge'

export function ContinueReading() {
  const { user } = useAuth()
  const { getProgress } = useLibrary()
  const { data } = useAsync(
    () => listReadingHistory(1, 20),
    `history:${user?.id}`,
    Boolean(user),
  )

  // Una entrada por obra: la lectura más reciente de cada una.
  const seen = new Set<string>()
  const entries = (user ? (data?.items ?? []) : [])
    .filter((item) => !seen.has(item.series.id) && seen.add(item.series.id))
    .slice(0, 3)

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
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {entries.map((item) => {
          const { series } = item
          const local = getProgress(series.id)
          const page = local?.chapterId === item.chapterId ? local : undefined
          return (
            <article
              key={series.id}
              className="group border-line bg-surface hover:border-accent/30 flex gap-3 rounded-2xl border p-3 transition-colors sm:gap-4"
            >
              <Link to={`/series/${series.id}`} className="shrink-0">
                <CoverImage
                  src={series.thumbUrl || series.coverUrl}
                  alt={`Portada de ${series.title}`}
                  title={series.title}
                  className="h-28 w-20 rounded-xl sm:h-32 sm:w-22"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/series/${series.id}`}
                    className="font-display hover:text-accent truncate text-base font-bold"
                  >
                    {series.title}
                  </Link>
                  {item.isRead ? (
                    <Badge tone="success" className="shrink-0">
                      Leído
                    </Badge>
                  ) : page ? (
                    <Badge tone="accent" className="shrink-0">
                      {page.percentage}%
                    </Badge>
                  ) : null}
                </div>
                <p className="text-secondary mt-1 truncate text-xs">
                  Cap. {formatChapterNumber(item.chapterNumber)}
                  {page ? ` · Página ${page.page} de ${page.totalPages}` : ''}
                </p>
                {page ? (
                  <div className="bg-raised mt-3 h-1.5 overflow-hidden rounded-full">
                    <div
                      className="bg-accent h-full rounded-full"
                      style={{ width: `${page.percentage}%` }}
                    />
                  </div>
                ) : null}
                <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                  <span className="text-muted flex items-center gap-1 text-[11px]">
                    <Clock3 className="size-3" />
                    {new Date(item.lastReadAt).toLocaleDateString('es', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                  <Link
                    to={`/read/${series.id}/${item.chapterId}`}
                    className="text-accent inline-flex items-center gap-1 text-xs font-semibold hover:underline"
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
  const { data: genres } = useGenres()
  if (!genres?.length) return null
  return (
    <section className="container-mf mt-12 sm:mt-14">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted mr-1 text-xs font-semibold tracking-wider uppercase">
          Explorar:
        </span>
        {genres.slice(0, 6).map((genre) => (
          <Link
            key={genre.id}
            to={`/series?genre=${genre.id}`}
            className="border-line bg-surface text-secondary hover:border-accent/40 hover:text-accent rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors"
          >
            {genre.name}
          </Link>
        ))}
        <Link
          to="/genres"
          className="text-accent inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold hover:underline"
        >
          Ver todos <ArrowRight className="size-3" />
        </Link>
      </div>
    </section>
  )
}
