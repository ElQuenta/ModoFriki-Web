import { Link, NavLink } from 'react-router-dom'
import {
  Heart,
  Menu,
  Search,
  UserRound,
  ChevronDown,
  LogOut,
  Settings,
  Library,
} from 'lucide-react'
import { useState } from 'react'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { useUI } from '@/hooks/useUI'
import { useAuth } from '@/hooks/useAuth'
import { useLibrary } from '@/hooks/useLibrary'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { useClickOutside } from '@/hooks/useClickOutside'
import { Avatar } from '@/components/ui/avatar'
import { buttonStyles } from '@/components/ui/button'

export function Header() {
  const { openCommand, openMobileNav } = useUI()
  const { user, logout } = useAuth()
  const { favoriteCount } = useLibrary()
  const { scrolled } = useScrollDirection()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useClickOutside<HTMLDivElement>(() => setMenuOpen(false))

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-all duration-300',
        scrolled
          ? 'border-line bg-base/90 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl'
          : 'border-transparent bg-base/70 backdrop-blur-md',
      )}
    >
      <div className="container-mf flex h-16 items-center gap-3 sm:h-18">
        <button
          type="button"
          onClick={openMobileNav}
          aria-label="Abrir menú"
          className="flex size-10 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-raised hover:text-primary lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <Link to="/" className="group flex items-center gap-2.5" aria-label="ModoFriki, inicio">
          <span className="relative flex size-9 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 font-display text-lg font-bold text-accent shadow-glow">
            M
            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-accent" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight sm:text-xl">
            MODO<span className="text-accent">FRIKI</span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={'end' in link ? link.end : false}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-secondary hover:bg-raised hover:text-primary',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={openCommand}
            className="hidden h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm text-muted transition-colors hover:border-line-strong hover:text-secondary md:flex"
            aria-label="Buscar series"
          >
            <Search className="size-4" />
            <span className="w-24 text-left">Buscar...</span>
            <kbd className="rounded border border-line-strong bg-raised px-1.5 py-0.5 text-[10px] font-semibold text-secondary">
              Ctrl K
            </kbd>
          </button>

          <button
            type="button"
            onClick={openCommand}
            aria-label="Buscar"
            className="flex size-10 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-raised hover:text-primary md:hidden"
          >
            <Search className="size-5" />
          </button>

          <Link
            to="/favorites"
            aria-label={`Favoritos (${favoriteCount})`}
            className="relative flex size-10 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-raised hover:text-accent"
          >
            <Heart className="size-5" />
            {favoriteCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-base">
                {favoriteCount}
              </span>
            ) : null}
          </Link>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-raised"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <Avatar src={user.avatarUrl} alt={user.name} size="sm" />
                <span className="hidden max-w-24 truncate text-sm font-medium sm:block">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown
                  className={cn(
                    'hidden size-4 text-muted transition-transform sm:block',
                    menuOpen && 'rotate-180',
                  )}
                />
              </button>
              {menuOpen ? (
                <div
                  role="menu"
                  className="animate-fade-up absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-card"
                >
                  <div className="border-b border-line px-3 py-2.5">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-secondary transition-colors hover:bg-raised hover:text-primary"
                  >
                    <UserRound className="size-4" /> Mi perfil
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-secondary transition-colors hover:bg-raised hover:text-primary"
                  >
                    <Library className="size-4" /> Mi biblioteca
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-secondary transition-colors hover:bg-raised hover:text-primary"
                  >
                    <Settings className="size-4" /> Preferencias
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setMenuOpen(false)
                    }}
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
                  >
                    <LogOut className="size-4" /> Cerrar sesión
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link to="/login" className={buttonStyles({ size: 'sm', className: 'hidden sm:inline-flex' })}>
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
