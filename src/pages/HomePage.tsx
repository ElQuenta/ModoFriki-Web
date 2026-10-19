import { Link } from 'react-router-dom'
import { ArrowRight, Flame, Sparkles } from 'lucide-react'
import { HeroFeatured } from '@/components/home/HeroFeatured'
import { ContinueReading, GenreStrip } from '@/components/home/ContinueReading'
import { LatestChapters } from '@/components/home/LatestChapters'
import { RankingSection } from '@/components/home/RankingSection'
import { PopularSection } from '@/components/home/PopularSection'
import { NovelsSection } from '@/components/home/NovelsSection'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { buttonStyles } from '@/components/ui/button'

export function HomePage() {
  useDocumentTitle('Inicio')

  return (
    <div className="pb-10">
      <HeroFeatured />
      <GenreStrip />
      <ContinueReading />
      <LatestChapters />
      <RankingSection />
      <PopularSection />
      <NovelsSection />

      <section className="container-mf mt-16">
        <div className="relative overflow-hidden rounded-3xl border border-accent/25 bg-gradient-to-br from-accent/15 via-surface to-surface p-6 sm:p-10">
          <div className="absolute -top-20 -right-10 size-64 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
              <Flame className="size-3.5" /> Nuevas historias cada semana
            </div>
            <h2 className="font-display text-2xl leading-tight font-bold sm:text-4xl">
              Tu próxima obsesión está a un clic.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              Explora más de 200 capítulos de manhwas, mangas, manhuas y novelas. Guarda
              tus favoritos y continúa leyendo en cualquier dispositivo.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/series" className={buttonStyles({ size: 'lg' })}>
                Explorar catálogo <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/register"
                className={buttonStyles({ variant: 'secondary', size: 'lg' })}
              >
                <Sparkles className="size-4 text-accent" /> Crear cuenta gratis
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
