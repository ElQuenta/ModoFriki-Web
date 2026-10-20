import { Link } from 'react-router-dom'
import { Code2, Heart, MessageCircle, Sparkles } from 'lucide-react'

const columns = [
  {
    title: 'Leer',
    links: [
      { label: 'Catálogo', to: '/series' },
      { label: 'Rankings', to: '/rankings' },
      { label: 'Géneros', to: '/genres' },
      { label: 'Favoritos', to: '/favorites' },
    ],
  },
  {
    title: 'Explorar',
    links: [
      { label: 'Manhwas', to: '/series?type=Manhwa' },
      { label: 'Mangas', to: '/series?type=Manga' },
      { label: 'Novelas', to: '/series?type=Novela' },
      { label: 'Novedades', to: '/' },
    ],
  },
  {
    title: 'Comunidad',
    links: [
      { label: 'Mi perfil', to: '/profile' },
      { label: 'Crear cuenta', to: '/register' },
      { label: 'Iniciar sesión', to: '/login' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-line bg-surface/40 mt-16 border-t sm:mt-20">
      <div className="container-mf grid gap-8 py-10 sm:grid-cols-2 sm:gap-10 sm:py-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link to="/" className="font-display text-2xl font-bold tracking-tight">
            MODO<span className="text-accent">FRIKI</span>
          </Link>
          <p className="text-secondary mt-4 max-w-xs text-sm leading-relaxed">
            Cómics, manhwas y novelas en español. Una biblioteca hecha por frikis, para
            frikis.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <a
              href="https://github.com/ElQuenta/ModoFriki-Web"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub de ModoFriki"
              className="border-line text-secondary hover:border-accent/40 hover:text-accent flex size-10 items-center justify-center rounded-lg border transition-colors"
            >
              <Code2 className="size-4" />
            </a>
            <a
              href="#"
              aria-label="Comunidad"
              className="border-line text-secondary hover:border-accent/40 hover:text-accent flex size-10 items-center justify-center rounded-lg border transition-colors"
            >
              <MessageCircle className="size-4" />
            </a>
            <a
              href="#"
              aria-label="Apoyar el proyecto"
              className="border-line text-secondary hover:border-accent/40 hover:text-accent flex size-10 items-center justify-center rounded-lg border transition-colors"
            >
              <Heart className="size-4" />
            </a>
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-primary mb-4 text-sm font-semibold">{column.title}</h3>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-secondary hover:text-accent text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-line border-t">
        <div className="container-mf text-muted flex flex-col items-center justify-between gap-3 py-5 text-xs sm:flex-row">
          <p>© 2026 ModoFriki. Hecho con demasiado café y cómics.</p>
          <p className="flex items-center gap-1.5">
            <Sparkles className="text-accent size-3.5" />
            Proyecto académico. Solo frontend, datos de demostración.
          </p>
        </div>
      </div>
    </footer>
  )
}
