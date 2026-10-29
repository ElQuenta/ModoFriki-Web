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
import { formatChapterNumber, formatDate, formatRating, formatViews } from '@/lib/format'
import { useLibrary } from '@/hooks/useLibrary'
import { Badge } from '@/components/ui/badge'
import { CoverImage } from '@/components/ui/cover-image'
import { buttonStyles } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/empty-state'
import { CommentSection } from './CommentSection'
import { RatingControl } from './RatingControl'
import { useAuth } from '@/hooks/useAuth'
import { useWorkProgress, useWorkStats } from '@/hooks/useReading'

export function SeriesDetail({
  series: work,
  chapters,
  chaptersLoading = false,
  chaptersError,
  onRetryChapters,
}: {
  series: Series
  chapters: Chapter[]
  chaptersLoading?: boolean
  chaptersError?: string
  onRetryChapters?: () => void
}) {
  const { user } = useAuth()
  const { isFavorite, toggleFavorite, getProgress } = useLibrary()
  const stats = useWorkStats(work.id)
  const mine = useWorkProgress(work.id, stats.reload)
  const series: Series = {
    ...work,
    rating: stats.data?.averageRating ?? undefined,
    ratingCount: stats.data?.ratings,
    views: stats.data?.visits ?? work.views,
  }
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
          <div className="from-canvas via-canvas/80 to-canvas/30 absolute inset-0 bg-gradient-to-t" />
          <div className="from-canvas/80 absolute inset-0 bg-gradient-to-r to-transparent" />
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
                {series.status ? (
                  <Badge tone={series.status === 'En emisión' ? 'success' : 'neutral'}>
                    {series.status}
                  </Badge>
                ) : null}
                {series.publicationStatus === 'DRAFT' ? (
                  <Badge tone="warning">Borrador</Badge>
                ) : null}
                {series.isFeatured ? <Badge tone="warning">Destacado</Badge> : null}
              </div>
              <h1 className="font-display text-3xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">
                {series.title}
              </h1>
              <p className="text-secondary mt-2 text-sm">
                {series.alternativeTitles.join(' · ')}
              </p>

              <div className="text-secondary mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                {series.rating !== undefined ? (
                  <span className="text-warning flex items-center gap-1.5 font-semibold">
                    <Star className="size-4 fill-current" />
                    {formatRating(series.rating)}
                    {series.ratingCount !== undefined ? (
                      <span className="text-muted font-normal">
                        ({formatViews(series.ratingCount)} votos)
                      </span>
                    ) : null}
                  </span>
                ) : null}
                {series.views !== undefined ? (
                  <span className="flex items-center gap-1.5">
                    <Eye className="size-4" /> {formatViews(series.views)}
                  </span>
                ) : null}
                <span className="flex items-center gap-1.5">
                  <BookOpen className="size-4" /> {chapters.length} capítulos
                </span>
                {series.updatedAt ? (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-4" /> {formatDate(series.updatedAt)}
                  </span>
                ) : null}
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                {progress || first ? (
                  <Link
                    to={`/read/${series.id}/${progress?.chapterId ?? first?.id}`}
                    className={buttonStyles({
                      size: 'lg',
                      className: 'w-full sm:w-auto',
                    })}
                  >
                    <Play className="size-5 fill-current" />
                    {progress
                      ? `Continuar cap. ${formatChapterNumber(progress.chapterNumber)}`
                      : 'Empezar a leer'}
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => void toggleFavorite(series)}
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
                    to={`/read/${series.id}/${latest.id}`}
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
              {series.genreItems?.map((genre) => (
                <Link
                  key={genre.id}
                  to={`/series?genre=${genre.id}`}
                  className="border-line bg-raised text-secondary hover:border-accent/40 hover:text-accent rounded-full border px-3 py-1 text-xs transition-colors"
                >
                  {genre.name}
                </Link>
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
                  to={`/read/${series.id}/${first.id}`}
                  className="text-accent self-start text-xs font-semibold hover:underline sm:self-auto"
                >
                  Leer desde el inicio
                </Link>
              ) : null}
            </div>

            {chaptersError && onRetryChapters ? (
              <ErrorState message={chaptersError} onRetry={onRetryChapters} />
            ) : null}
            {chaptersLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} className="h-14 w-full" />
                ))}
              </div>
            ) : null}
            {!chaptersLoading && !chaptersError && chapters.length === 0 ? (
              <p className="border-line bg-surface text-secondary rounded-2xl border p-5 text-sm">
                Todavía no hay capítulos publicados.
              </p>
            ) : null}
            <div className="border-line bg-surface overflow-hidden rounded-2xl border empty:hidden">
              {visibleChapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className={cn(
                    'hover:bg-raised flex items-center transition-colors',
                    index !== visibleChapters.length - 1 && 'border-line border-b',
                  )}
                >
                  <Link
                    to={`/read/${series.id}/${chapter.id}`}
                    className="group flex min-w-0 flex-1 items-center gap-3 py-3 pl-4 sm:gap-4 sm:pl-5"
                  >
                    <span className="border-line bg-canvas font-display text-secondary group-hover:border-accent/40 group-hover:text-accent flex size-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold transition-colors">
                      {formatChapterNumber(chapter.number)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="group-hover:text-accent truncate text-sm font-medium transition-colors">
                        {chapter.title ||
                          `Capítulo ${formatChapterNumber(chapter.number)}`}
                      </p>
                      <p className="text-muted mt-0.5 text-[11px]">
                        {formatDate(chapter.releaseDate)}
                        {chapter.kind === 'EXTRA' ? ' · Extra' : ''}
                        {chapter.kind === 'ANNOUNCEMENT' ? ' · Anuncio' : ''}
                      </p>
                    </div>
                    <span className="text-muted hidden text-[11px] sm:block">
                      {chapter.pages.length} páginas
                    </span>
                    <Play className="text-muted group-hover:text-accent size-4 shrink-0 transition-colors" />
                  </Link>
                  {user ? (
                    <button
                      type="button"
                      onClick={() =>
                        void mine.setRead(chapter.id, !mine.readIds.has(chapter.id))
                      }
                      disabled={!mine.data}
                      aria-pressed={mine.readIds.has(chapter.id)}
                      aria-label={
                        mine.readIds.has(chapter.id)
                          ? `Marcar el capítulo ${formatChapterNumber(chapter.number)} como no leído`
                          : `Marcar el capítulo ${formatChapterNumber(chapter.number)} como leído`
                      }
                      className={cn(
                        'mx-2 flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-40 sm:mx-3',
                        mine.readIds.has(chapter.id)
                          ? 'text-success hover:bg-success/10'
                          : 'text-muted hover:text-primary hover:bg-raised',
                      )}
                    >
                      <Check className="size-4" />
                    </button>
                  ) : (
                    <span className="w-4 shrink-0 sm:w-5" />
                  )}
                </div>
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
                <dt className="text-muted">Tipo</dt>
                <dd className="text-right font-medium">{series.type}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted">Estado</dt>
                <dd className="text-right font-medium">{series.status ?? '—'}</dd>
              </div>
              {series.updatedAt ? (
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted">Actualizado</dt>
                  <dd className="text-right font-medium">
                    {formatDate(series.updatedAt)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          {user ? (
            <div className="surface-card p-5">
              <h2 className="font-display flex items-center gap-2 text-base font-bold">
                <Star className="text-accent size-4" /> Tu lectura
              </h2>
              {mine.error ? (
                <p className="text-danger mt-3 text-xs">{mine.error}</p>
              ) : (
                <>
                  <div className="mt-3">
                    <RatingControl
                      value={mine.data?.score ?? null}
                      onChange={(score) => void mine.setScore(score)}
                      disabled={!mine.data}
                    />
                  </div>
                  {mine.data ? (
                    <>
                      <p className="text-secondary mt-4 text-xs">
                        {mine.data.readChapters} de {mine.data.totalChapters} capítulos
                        leídos
                      </p>
                      <div className="bg-raised mt-2 h-1.5 overflow-hidden rounded-full">
                        <div
                          className="bg-accent h-full rounded-full"
                          style={{ width: `${mine.data.completionPercentage}%` }}
                        />
                      </div>
                    </>
                  ) : null}
                </>
              )}
            </div>
          ) : (
            <div className="surface-card p-5">
              <h2 className="font-display flex items-center gap-2 text-base font-bold">
                <Users className="text-accent size-4" /> Comunidad
              </h2>
              <p className="text-secondary mt-2 text-xs leading-relaxed">
                Crea tu cuenta para valorar, guardar favoritos y llevar la cuenta de lo
                que lees.
              </p>
              <Link to="/register" className={buttonStyles({ className: 'mt-4 w-full' })}>
                <Check className="size-4" /> Crear cuenta
              </Link>
            </div>
          )}
        </aside>

        <div className="order-3 min-w-0 lg:order-none lg:col-start-1 lg:row-start-2">
          <CommentSection targetType="WORK" targetId={series.id} />
        </div>
      </div>
    </div>
  )
}
