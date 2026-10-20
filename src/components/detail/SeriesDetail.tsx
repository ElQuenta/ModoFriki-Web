import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  CalendarDays,
  Check,
  Eye,
  Heart,
  Play,
  Star,
  Users,
  ChevronDown,
} from 'lucide-react'
import type { Chapter, Series } from '@/types'
import { cn } from '@/lib/cn'
import { formatDate, formatRating, formatViews } from '@/lib/format'
import { useLibrary } from '@/hooks/useLibrary'
import { Badge } from '@/components/ui/badge'
import { CoverImage } from '@/components/ui/cover-image'
import { buttonStyles } from '@/components/ui/button'
import { CommentSection } from './CommentSection'

export function SeriesDetail({
  series,
  chapters,
}: {
  series: Series
  chapters: Chapter[]
}) {
  const { isFavorite, toggleFavorite, getProgress } = useLibrary()
  const [showAll, setShowAll] = useState(false)
  const favorite = isFavorite(series.id)
  const progress = getProgress(series.id)
  const latest = chapters[0]
  const first = chapters[chapters.length - 1]
  const visibleChapters = showAll ? chapters : chapters.slice(0, 8)

  return (
    <div>
      <div className="relative">
        <div className="absolute inset-0 h-[320px] overflow-hidden sm:h-[420px]">
          <img
            src={series.bannerUrl}
            alt=""
            className="size-full object-cover object-center"
          />
          <div className="from-base via-base/80 to-base/30 absolute inset-0 bg-gradient-to-t" />
          <div className="from-base/80 absolute inset-0 bg-gradient-to-r to-transparent" />
        </div>

        <div className="container-mf relative pt-6 pb-8 sm:pt-8 sm:pb-10">
          <nav
            className="text-muted mb-6 flex items-center gap-1.5 overflow-hidden text-[11px] sm:mb-8 sm:gap-2 sm:text-xs"
            aria-label="Migas de pan"
          >
            <Link to="/" className="hover:text-accent shrink-0">
              Inicio
            </Link>
            <span className="shrink-0">/</span>
            <Link to="/series" className="hover:text-accent shrink-0">
              Catálogo
            </Link>
            <span className="shrink-0">/</span>
            <span className="text-secondary truncate">{series.title}</span>
          </nav>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <CoverImage
              src={series.coverUrl}
              alt={`Portada de ${series.title}`}
              title={series.title}
              className="border-line shadow-card mx-auto h-60 w-40 shrink-0 rounded-2xl border sm:mx-0 sm:h-80 sm:w-56"
            />
            <div className="min-w-0 flex-1 pb-1">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge tone="accent">{series.type}</Badge>
                <Badge tone={series.status === 'En emisión' ? 'success' : 'neutral'}>
                  {series.status}
                </Badge>
                {series.isFeatured ? <Badge tone="warning">Destacado</Badge> : null}
              </div>
              <h1 className="font-display text-3xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">
                {series.title}
              </h1>
              <p className="text-secondary mt-2 text-sm">
                {series.alternativeTitles.join(' · ')}
              </p>

              <div className="text-secondary mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <span className="text-warning flex items-center gap-1.5 font-semibold">
                  <Star className="size-4 fill-current" />
                  {formatRating(series.rating)}
                  <span className="text-muted font-normal">
                    ({formatViews(series.ratingCount)} votos)
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="size-4" /> {formatViews(series.views)}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="size-4" /> {series.totalChapters} capítulos
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4" /> {formatDate(series.updatedAt)}
                </span>
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                <Link
                  to={`/read/${series.slug}/${progress?.chapterNumber ?? 1}`}
                  className={buttonStyles({ size: 'lg', className: 'w-full sm:w-auto' })}
                >
                  <Play className="size-5 fill-current" />
                  {progress
                    ? `Continuar cap. ${progress.chapterNumber}`
                    : 'Empezar a leer'}
                </Link>
                <button
                  type="button"
                  onClick={() => toggleFavorite(series.id)}
                  className={buttonStyles({
                    variant: 'secondary',
                    size: 'lg',
                    className: cn(
                      'w-full sm:w-auto',
                      favorite && 'border-accent/40 text-accent',
                    ),
                  })}
                >
                  <Heart className={cn('size-5', favorite && 'fill-current')} />
                  {favorite ? 'En favoritos' : 'Favorito'}
                </button>
                {latest ? (
                  <Link
                    to={`/read/${series.slug}/${latest.number}`}
                    className={buttonStyles({
                      variant: 'ghost',
                      size: 'lg',
                      className: 'w-full sm:w-auto',
                    })}
                  >
                    Último capítulo
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-mf grid gap-8 pb-4 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <section className="surface-card p-5 sm:p-6">
            <h2 className="font-display text-xl font-bold">Sinopsis</h2>
            <p className="text-secondary mt-3 text-sm leading-relaxed">
              {series.synopsis}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {series.genres.map((genre) => (
                <Link
                  key={genre}
                  to={`/series?genre=${encodeURIComponent(genre)}`}
                  className="border-line bg-raised text-secondary hover:border-accent/40 hover:text-accent rounded-full border px-3 py-1 text-xs transition-colors"
                >
                  {genre}
                </Link>
              ))}
              {series.tags.map((tag) => (
                <span
                  key={tag}
                  className="border-accent/20 bg-accent/5 text-accent/90 rounded-full border px-3 py-1 text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-xl font-bold sm:text-2xl">Capítulos</h2>
                <p className="text-secondary mt-1 text-xs">
                  {chapters.length} capítulos disponibles · orden descendente
                </p>
              </div>
              {first ? (
                <Link
                  to={`/read/${series.slug}/${first.number}`}
                  className="text-accent self-start text-xs font-semibold hover:underline sm:self-auto"
                >
                  Leer desde el inicio
                </Link>
              ) : null}
            </div>

            <div className="border-line bg-surface overflow-hidden rounded-2xl border">
              {visibleChapters.map((chapter, index) => (
                <Link
                  key={chapter.id}
                  to={`/read/${series.slug}/${chapter.number}`}
                  className={cn(
                    'group hover:bg-raised flex items-center gap-3 px-4 py-3 transition-colors sm:gap-4 sm:px-5',
                    index !== visibleChapters.length - 1 && 'border-line border-b',
                  )}
                >
                  <span className="border-line bg-base font-display text-secondary group-hover:border-accent/40 group-hover:text-accent flex size-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold transition-colors">
                    {chapter.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="group-hover:text-accent truncate text-sm font-medium transition-colors">
                      {chapter.title}
                    </p>
                    <p className="text-muted mt-0.5 text-[11px]">
                      {formatDate(chapter.releaseDate)} · {formatViews(chapter.views)}{' '}
                      vistas
                    </p>
                  </div>
                  <span className="text-muted hidden text-[11px] sm:block">
                    {chapter.pages.length} páginas
                  </span>
                  <Play className="text-muted group-hover:text-accent size-4 shrink-0 transition-colors" />
                </Link>
              ))}
            </div>

            {chapters.length > 8 ? (
              <button
                type="button"
                onClick={() => setShowAll((value) => !value)}
                className="border-line bg-surface text-secondary hover:border-accent/40 hover:text-accent mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-colors"
              >
                {showAll ? 'Mostrar menos' : `Ver los ${chapters.length} capítulos`}
                <ChevronDown
                  className={cn('size-4 transition-transform', showAll && 'rotate-180')}
                />
              </button>
            ) : null}
          </section>
        </div>

        <aside className="order-2 space-y-4 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="surface-card p-5">
            <h2 className="font-display text-base font-bold">Ficha técnica</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted">Autor</dt>
                <dd className="text-right font-medium">{series.author}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted">Artista</dt>
                <dd className="text-right font-medium">{series.artist}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted">Scanlation</dt>
                <dd className="text-right font-medium">{series.scanlationGroup}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted">Tipo</dt>
                <dd className="text-right font-medium">{series.type}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted">Estado</dt>
                <dd className="text-right font-medium">{series.status}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted">Actualizado</dt>
                <dd className="text-right font-medium">{formatDate(series.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="surface-card p-5">
            <h2 className="font-display flex items-center gap-2 text-base font-bold">
              <Users className="text-accent size-4" /> Comunidad
            </h2>
            <p className="text-secondary mt-2 text-xs leading-relaxed">
              Únete a la conversación, comparte teorías y descubre nuevas lecturas con
              otros frikis.
            </p>
            <Link to="/register" className={buttonStyles({ className: 'mt-4 w-full' })}>
              <Check className="size-4" /> Crear cuenta
            </Link>
          </div>
        </aside>

        <div className="order-3 min-w-0 lg:order-none lg:col-start-1 lg:row-start-2">
          <CommentSection seriesId={series.id} />
        </div>
      </div>
    </div>
  )
}
