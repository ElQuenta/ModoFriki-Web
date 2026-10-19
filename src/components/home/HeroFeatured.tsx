import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Play,
  Star,
  BookOpen,
} from 'lucide-react'
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
      className="container-mf pt-5 sm:pt-8"
      aria-label="Series destacadas"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-h-[520px] overflow-hidden rounded-3xl border border-line bg-surface sm:min-h-[560px]">
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
            <div className="absolute inset-0 bg-gradient-to-r from-base via-base/85 to-base/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-base via-transparent to-transparent" />
          </div>
        ))}

        <div className="relative flex min-h-[520px] items-end p-6 sm:min-h-[560px] sm:p-10 lg:max-w-3xl lg:p-14">
          <div key={series.id} className="animate-fade-up">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge tone="accent">Destacado</Badge>
              <Badge tone="neutral">{series.type}</Badge>
              <Badge tone="success">{series.status}</Badge>
            </div>
            <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {series.title}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-secondary sm:text-base">
              {series.synopsis}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-secondary">
              <span className="flex items-center gap-1.5 font-semibold text-warning">
                <Star className="size-4 fill-current" />
                {formatRating(series.rating)}
                <span className="font-normal text-muted">({formatViews(series.ratingCount)})</span>
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

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={`/read/${series.slug}/1`}
                className={buttonStyles({ size: 'lg', className: 'min-w-40' })}
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
                  className: cn(isFavorite(series.id) && 'border-accent/40 text-accent'),
                })}
              >
                <Heart className={cn('size-5', isFavorite(series.id) && 'fill-current')} />
                {isFavorite(series.id) ? 'En favoritos' : 'Favorito'}
              </button>
              <Link
                to={`/series/${series.slug}`}
                className={buttonStyles({ variant: 'ghost', size: 'lg' })}
              >
                Ver ficha
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute right-6 bottom-6 flex items-center gap-2 sm:right-10 sm:bottom-10">
          <button
            type="button"
            onClick={previous}
            aria-label="Serie anterior"
            className="flex size-10 items-center justify-center rounded-full border border-line-strong bg-black/50 text-primary backdrop-blur transition-colors hover:border-accent hover:text-accent"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Serie siguiente"
            className="flex size-10 items-center justify-center rounded-full border border-line-strong bg-black/50 text-primary backdrop-blur transition-colors hover:border-accent hover:text-accent"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="absolute bottom-8 left-6 flex items-center gap-1.5 sm:left-10 lg:left-14">
          {FEATURED_SERIES.map((item, dotIndex) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(dotIndex)}
              aria-label={`Ver ${item.title}`}
              className={cn(
                'h-1.5 rounded-full transition-all',
                dotIndex === index ? 'w-8 bg-accent' : 'w-2 bg-white/30 hover:bg-white/60',
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
