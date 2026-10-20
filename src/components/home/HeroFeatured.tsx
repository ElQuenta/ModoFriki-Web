import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Eye, Heart, Play, Star, BookOpen } from 'lucide-react'
import { FEATURED_SERIES } from '@/data/mock'
import { cn } from '@/lib/cn'
import { formatRating, formatViews } from '@/lib/format'
import { useLibrary } from '@/hooks/useLibrary'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Badge } from '@/components/ui/badge'
import { buttonStyles } from '@/components/ui/button'

export function HeroFeatured() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const { isFavorite, toggleFavorite } = useLibrary()
  const reduceMotion = usePrefersReducedMotion()
  const series = FEATURED_SERIES[index]

  useEffect(() => {
    if (paused || reduceMotion) return
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % FEATURED_SERIES.length),
      7000,
    )
    return () => window.clearInterval(timer)
  }, [paused, reduceMotion])

  if (!series) return null

  const next = () => setIndex((value) => (value + 1) % FEATURED_SERIES.length)
  const previous = () =>
    setIndex((value) => (value - 1 + FEATURED_SERIES.length) % FEATURED_SERIES.length)

  return (
    <section
      className="container-mf pt-4 sm:pt-8"
      aria-label="Series destacadas"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="border-line bg-surface relative min-h-[440px] overflow-hidden rounded-2xl border sm:min-h-[560px] sm:rounded-3xl">
        {FEATURED_SERIES.map((item, slideIndex) => (
          <div
            key={item.id}
            aria-hidden={slideIndex !== index}
            className={cn(
              'absolute inset-0 transition-opacity duration-700',
              slideIndex === index ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <img
              src={item.bannerUrl}
              alt=""
              className="size-full object-cover"
              loading={slideIndex === 0 ? 'eager' : 'lazy'}
            />
            <div className="from-base via-base/85 to-base/20 absolute inset-0 bg-gradient-to-r" />
            <div className="from-base absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
          </div>
        ))}

        <div className="relative flex min-h-[440px] items-end p-5 pb-20 sm:min-h-[560px] sm:p-10 sm:pb-10 lg:max-w-3xl lg:p-14">
          <div key={series.id} className="animate-fade-up">
            <div className="mb-3 flex flex-wrap items-center gap-1.5 sm:mb-4 sm:gap-2">
              <Badge tone="accent">Destacado</Badge>
              <Badge tone="neutral">{series.type}</Badge>
              <Badge tone="success">{series.status}</Badge>
            </div>
            <h1 className="font-display text-3xl leading-[1.08] font-bold tracking-tight text-balance sm:text-5xl sm:leading-[1.05] lg:text-6xl">
              {series.title}
            </h1>
            <p className="text-secondary mt-2.5 line-clamp-3 max-w-xl text-sm leading-relaxed sm:mt-3 sm:line-clamp-none sm:text-base">
              {series.synopsis}
            </p>

            <div className="text-secondary mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:mt-5 sm:gap-4 sm:text-sm">
              <span className="text-warning flex items-center gap-1.5 font-semibold">
                <Star className="size-4 fill-current" />
                {formatRating(series.rating)}
                <span className="text-muted font-normal">
                  ({formatViews(series.ratingCount)})
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="size-4" />
                {formatViews(series.views)} lecturas
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="size-4" />
                {series.totalChapters} capítulos
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3">
              <Link
                to={`/read/${series.slug}/1`}
                className={buttonStyles({
                  size: 'lg',
                  className: 'w-full sm:w-auto sm:min-w-40',
                })}
              >
                <Play className="size-5 fill-current" />
                Leer ahora
              </Link>
              <button
                type="button"
                onClick={() => toggleFavorite(series.id)}
                className={buttonStyles({
                  variant: 'secondary',
                  size: 'lg',
                  className: cn(
                    'w-full sm:w-auto',
                    isFavorite(series.id) && 'border-accent/40 text-accent',
                  ),
                })}
              >
                <Heart
                  className={cn('size-5', isFavorite(series.id) && 'fill-current')}
                />
                {isFavorite(series.id) ? 'En favoritos' : 'Favorito'}
              </button>
              <Link
                to={`/series/${series.slug}`}
                className={buttonStyles({
                  variant: 'ghost',
                  size: 'lg',
                  className: 'w-full sm:w-auto',
                })}
              >
                Ver ficha
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute right-4 bottom-4 flex items-center gap-2 sm:right-10 sm:bottom-10">
          <button
            type="button"
            onClick={previous}
            aria-label="Serie anterior"
            className="border-line-strong text-primary hover:border-accent hover:text-accent flex size-10 items-center justify-center rounded-full border bg-black/50 backdrop-blur transition-colors"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Serie siguiente"
            className="border-line-strong text-primary hover:border-accent hover:text-accent flex size-10 items-center justify-center rounded-full border bg-black/50 backdrop-blur transition-colors"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="absolute bottom-8 left-10 hidden items-center gap-1.5 sm:flex lg:left-14">
          {FEATURED_SERIES.map((item, dotIndex) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(dotIndex)}
              aria-label={`Ver ${item.title}`}
              className={cn(
                'h-1.5 rounded-full transition-all',
                dotIndex === index
                  ? 'bg-accent w-8'
                  : 'w-2 bg-white/30 hover:bg-white/60',
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
