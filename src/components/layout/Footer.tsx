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
    <footer className="mt-20 border-t border-line bg-surface/40">
      <div className="container-mf grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link to="/" className="font-display text-2xl font-bold tracking-tight">
            MODO<span className="text-accent">FRIKI</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-secondary">
            Cómics, manhwas y novelas en español. Una biblioteca hecha por frikis, para
            frikis.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <a
              href="https://github.com/ElQuenta/ModoFriki-Web"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub de ModoFriki"
              className="flex size-9 items-center justify-center rounded-lg border border-line text-secondary transition-colors hover:border-accent/40 hover:text-accent"
            >
              <Code2 className="size-4" />
            </a>
            <a
              href="#"
              aria-label="Comunidad"
              className="flex size-9 items-center justify-center rounded-lg border border-line text-secondary transition-colors hover:border-accent/40 hover:text-accent"
            >
              <MessageCircle className="size-4" />
            </a>
            <a
              href="#"
              aria-label="Apoyar el proyecto"
              className="flex size-9 items-center justify-center rounded-lg border border-line text-secondary transition-colors hover:border-accent/40 hover:text-accent"
            >
              <Heart className="size-4" />
            </a>
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="mb-4 text-sm font-semibold text-primary">{column.title}</h3>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-secondary transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container-mf flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted sm:flex-row">
          <p>© 2026 ModoFriki. Hecho con demasiado café y cómics.</p>
          <p className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-accent" />
            Proyecto académico. Solo frontend, datos de demostración.
          </p>
        </div>
      </div>
    </footer>
  )
}
