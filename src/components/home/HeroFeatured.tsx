import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Eye, Heart, Play } from 'lucide-react'
import { getWork } from '@/services/catalog'
import { listPopularWorks } from '@/services/discovery'
import { useAsync } from '@/hooks/useAsync'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/cn'
import { formatViews } from '@/lib/format'
import { useLibrary } from '@/hooks/useLibrary'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Badge } from '@/components/ui/badge'
import { buttonStyles } from '@/components/ui/button'

export function HeroFeatured() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const { isFavorite, toggleFavorite } = useLibrary()
  const reduceMotion = usePrefersReducedMotion()
  // Destacadas = las más visitadas; la ficha completa trae banner, tipo y sinopsis.
  const { data, loading } = useAsync(async () => {
    const popular = await listPopularWorks({ period: 'all', limit: 3 })
    const works = await Promise.all(popular.items.map((item) => getWork(item.id)))
    return works.map((work, position) => ({
      ...work,
      views: popular.items[position]?.views,
      isFeatured: position === 0,
    }))
  }, 'hero-featured')
  const featured = data ?? []
  const count = featured.length
  const series = featured[index % Math.max(count, 1)]

  useEffect(() => {
    if (paused || reduceMotion || count < 2) return
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % count), 7000)
    return () => window.clearInterval(timer)
  }, [paused, reduceMotion, count])

  if (loading && !data) {
    return (
      <section className="container-mf pt-4 sm:pt-8">
        <Skeleton className="h-[440px] w-full rounded-2xl sm:h-[560px] sm:rounded-3xl" />
      </section>
    )
  }

  if (!series) return null

  const next = () => setIndex((value) => (value + 1) % count)
  const previous = () => setIndex((value) => (value - 1 + count) % count)

  return (
    <section
      className="container-mf pt-4 sm:pt-8"
      aria-label="Series destacadas"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="border-line bg-surface relative min-h-[440px] overflow-hidden rounded-2xl border sm:min-h-[560px] sm:rounded-3xl">
        {featured.map((item, slideIndex) => (
          <div
            key={item.id}
            aria-hidden={item.id !== series.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-700',
              item.id === series.id ? 'opacity-100' : 'pointer-events-none opacity-0',
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
              {series.status ? <Badge tone="success">{series.status}</Badge> : null}
            </div>
            <h1 className="font-display text-3xl leading-[1.08] font-bold tracking-tight text-balance sm:text-5xl sm:leading-[1.05] lg:text-6xl">
              {series.title}
            </h1>
            <p className="text-secondary mt-2.5 line-clamp-3 max-w-xl text-sm leading-relaxed sm:mt-3 sm:line-clamp-none sm:text-base">
              {series.synopsis}
            </p>

            <div className="text-secondary mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:mt-5 sm:gap-4 sm:text-sm">
              <span className="flex items-center gap-1.5">
                <Eye className="size-4" />
                {formatViews(series.views ?? 0)} visitas
              </span>
              {series.genres.length ? (
                <span>{series.genres.slice(0, 3).join(' · ')}</span>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3">
              <Link
                to={`/series/${series.id}`}
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
                to={`/series/${series.id}`}
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
          {featured.map((item, dotIndex) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(dotIndex)}
              aria-label={`Ver ${item.title}`}
              className={cn(
                'h-1.5 rounded-full transition-all',
                item.id === series.id
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
