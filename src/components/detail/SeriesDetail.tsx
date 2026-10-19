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
        <div className="absolute inset-0 h-[420px] overflow-hidden">
          <img
            src={series.bannerUrl}
            alt=""
            className="size-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-base via-base/80 to-base/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-base/80 to-transparent" />
        </div>

        <div className="container-mf relative pt-8 pb-10">
          <nav className="mb-8 flex items-center gap-2 text-xs text-muted" aria-label="Migas de pan">
            <Link to="/" className="hover:text-accent">Inicio</Link>
            <span>/</span>
            <Link to="/series" className="hover:text-accent">Catálogo</Link>
            <span>/</span>
            <span className="truncate text-secondary">{series.title}</span>
          </nav>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <CoverImage
              src={series.coverUrl}
              alt={`Portada de ${series.title}`}
              title={series.title}
              className="h-64 w-44 shrink-0 rounded-2xl border border-line shadow-card sm:h-80 sm:w-56"
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
              <p className="mt-2 text-sm text-secondary">
                {series.alternativeTitles.join(' · ')}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-secondary">
                <span className="flex items-center gap-1.5 font-semibold text-warning">
                  <Star className="size-4 fill-current" />
                  {formatRating(series.rating)}
                  <span className="font-normal text-muted">
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

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/read/${series.slug}/${progress?.chapterNumber ?? 1}`}
                  className={buttonStyles({ size: 'lg' })}
                >
                  <Play className="size-5 fill-current" />
                  {progress ? `Continuar cap. ${progress.chapterNumber}` : 'Empezar a leer'}
                </Link>
                <button
                  type="button"
                  onClick={() => toggleFavorite(series.id)}
                  className={buttonStyles({
                    variant: 'secondary',
                    size: 'lg',
                    className: cn(favorite && 'border-accent/40 text-accent'),
                  })}
                >
                  <Heart className={cn('size-5', favorite && 'fill-current')} />
                  {favorite ? 'En favoritos' : 'Favorito'}
                </button>
                {latest ? (
                  <Link
                    to={`/read/${series.slug}/${latest.number}`}
                    className={buttonStyles({ variant: 'ghost', size: 'lg' })}
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
            <p className="mt-3 text-sm leading-relaxed text-secondary">{series.synopsis}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {series.genres.map((genre) => (
                <Link
                  key={genre}
                  to={`/series?genre=${encodeURIComponent(genre)}`}
                  className="rounded-full border border-line bg-raised px-3 py-1 text-xs text-secondary transition-colors hover:border-accent/40 hover:text-accent"
                >
                  {genre}
                </Link>
              ))}
              {series.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs text-accent/90"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="font-display text-xl font-bold sm:text-2xl">Capítulos</h2>
                <p className="mt-1 text-xs text-secondary">
                  {chapters.length} capítulos disponibles · orden descendente
                </p>
              </div>
              {first ? (
                <Link
                  to={`/read/${series.slug}/${first.number}`}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  Leer desde el inicio
                </Link>
              ) : null}
            </div>

            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              {visibleChapters.map((chapter, index) => (
                <Link
                  key={chapter.id}
                  to={`/read/${series.slug}/${chapter.number}`}
                  className={cn(
                    'group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-raised sm:gap-4 sm:px-5',
                    index !== visibleChapters.length - 1 && 'border-b border-line',
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-base font-display text-sm font-bold text-secondary transition-colors group-hover:border-accent/40 group-hover:text-accent">
                    {chapter.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium transition-colors group-hover:text-accent">
                      {chapter.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {formatDate(chapter.releaseDate)} · {formatViews(chapter.views)} vistas
                    </p>
                  </div>
                  <span className="hidden text-[11px] text-muted sm:block">
                    {chapter.pages.length} páginas
                  </span>
                  <Play className="size-4 shrink-0 text-muted transition-colors group-hover:text-accent" />
                </Link>
              ))}
            </div>

            {chapters.length > 8 ? (
              <button
                type="button"
                onClick={() => setShowAll((value) => !value)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-surface py-2.5 text-xs font-semibold text-secondary transition-colors hover:border-accent/40 hover:text-accent"
              >
                {showAll ? 'Mostrar menos' : `Ver los ${chapters.length} capítulos`}
                <ChevronDown className={cn('size-4 transition-transform', showAll && 'rotate-180')} />
              </button>
            ) : null}
          </section>

          <CommentSection seriesId={series.id} />
        </div>

        <aside className="space-y-4">
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
            <h2 className="flex items-center gap-2 font-display text-base font-bold">
              <Users className="size-4 text-accent" /> Comunidad
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-secondary">
              Únete a la conversación, comparte teorías y descubre nuevas lecturas con
              otros frikis.
            </p>
            <Link to="/register" className={buttonStyles({ className: 'mt-4 w-full' })}>
              <Check className="size-4" /> Crear cuenta
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
