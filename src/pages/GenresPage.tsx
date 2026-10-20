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
        <p className="text-accent mb-2 text-xs font-bold tracking-[0.2em] uppercase">
          Explora por categoría
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Géneros y tags
        </h1>
        <p className="text-secondary mt-3 text-sm leading-relaxed">
          Encuentra exactamente lo que te apetece leer. Cada género reúne series de todos
          los tipos y estados.
        </p>
      </div>

      <section>
        <h2 className="font-display mb-4 flex items-center gap-2 text-xl font-bold">
          <Layers className="text-accent size-5" /> Géneros
        </h2>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {GENRES.map((genre) => {
            const count = SERIES.filter((series) => series.genres.includes(genre)).length
            return (
              <Link
                key={genre}
                to={`/series?genre=${encodeURIComponent(genre)}`}
                className="group border-line bg-surface hover:border-accent/40 relative overflow-hidden rounded-2xl border p-4 transition-all hover:-translate-y-0.5"
              >
                <div className="bg-accent/5 group-hover:bg-accent/10 absolute -top-8 -right-8 size-24 rounded-full blur-2xl transition-colors" />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display group-hover:text-accent text-base font-bold transition-colors">
                      {genre}
                    </p>
                    <p className="text-muted mt-1 text-[11px]">
                      {count} {count === 1 ? 'serie' : 'series'}
                    </p>
                  </div>
                  <ArrowUpRight className="text-muted group-hover:text-accent size-4 transition-colors" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display mb-4 flex items-center gap-2 text-xl font-bold">
          <Hash className="text-accent size-5" /> Tags populares
        </h2>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => {
            const count = SERIES.filter((series) => series.tags.includes(tag)).length
            return (
              <Link
                key={tag}
                to={`/series?q=${encodeURIComponent(tag)}`}
                className="border-line bg-surface text-secondary hover:border-accent/40 hover:text-accent inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors"
              >
                #{tag}
                <span className="text-muted text-[10px]">{count}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="border-line bg-surface mt-12 rounded-2xl border p-5">
        <Badge tone="accent">Tip</Badge>
        <p className="text-secondary mt-3 text-sm">
          Puedes combinar filtros desde el catálogo: por ejemplo,{' '}
          <Link
            to="/series?genre=Fantasía&status=En%20emisión&sort=rating"
            className="text-accent font-semibold hover:underline"
          >
            fantasía en emisión mejor valorada
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
