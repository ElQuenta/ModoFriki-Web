import { Link } from 'react-router-dom'
import { ArrowUpRight, Hash, Layers } from 'lucide-react'
import { GENRES, SERIES, TAGS } from '@/data/mock'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Badge } from '@/components/ui/badge'

export function GenresPage() {
  useDocumentTitle('Géneros y tags')

  return (
    <div className="container-mf pt-8 pb-4">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 text-xs font-bold tracking-[0.2em] text-accent uppercase">
          Explora por categoría
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Géneros y tags
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-secondary">
          Encuentra exactamente lo que te apetece leer. Cada género reúne series de todos
          los tipos y estados.
        </p>
      </div>

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
          <Layers className="size-5 text-accent" /> Géneros
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {GENRES.map((genre) => {
            const count = SERIES.filter((series) => series.genres.includes(genre)).length
            return (
              <Link
                key={genre}
                to={`/series?genre=${encodeURIComponent(genre)}`}
                className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40"
              >
                <div className="absolute -top-8 -right-8 size-24 rounded-full bg-accent/5 blur-2xl transition-colors group-hover:bg-accent/10" />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-base font-bold transition-colors group-hover:text-accent">
                      {genre}
                    </p>
                    <p className="mt-1 text-[11px] text-muted">
                      {count} {count === 1 ? 'serie' : 'series'}
                    </p>
                  </div>
                  <ArrowUpRight className="size-4 text-muted transition-colors group-hover:text-accent" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
          <Hash className="size-5 text-accent" /> Tags populares
        </h2>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => {
            const count = SERIES.filter((series) => series.tags.includes(tag)).length
            return (
              <Link
                key={tag}
                to={`/series?q=${encodeURIComponent(tag)}`}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm text-secondary transition-colors hover:border-accent/40 hover:text-accent"
              >
                #{tag}
                <span className="text-[10px] text-muted">{count}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-line bg-surface p-5">
        <Badge tone="accent">Tip</Badge>
        <p className="mt-3 text-sm text-secondary">
          Puedes combinar filtros desde el catálogo: por ejemplo,{' '}
          <Link
            to="/series?genre=Fantasía&status=En%20emisión&sort=rating"
            className="font-semibold text-accent hover:underline"
          >
            fantasía en emisión mejor valorada
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
