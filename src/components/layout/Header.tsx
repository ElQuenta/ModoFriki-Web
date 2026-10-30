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
  ShieldCheck,
  RotateCw,
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
  const { user, logout, sessionError, retrySession } = useAuth()
  const { favoriteCount } = useLibrary()
  const { scrolled } = useScrollDirection()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useClickOutside<HTMLDivElement>(() => setMenuOpen(false))

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-all duration-300',
        scrolled
          ? 'border-line bg-canvas/90 shadow-card backdrop-blur-xl'
          : 'bg-canvas/70 border-transparent backdrop-blur-md',
      )}
    >
      <div className="container-mf flex h-16 items-center gap-2 sm:h-18 sm:gap-3">
        <button
          type="button"
          onClick={openMobileNav}
          aria-label="Abrir menú"
          className="text-secondary hover:bg-raised hover:text-primary flex size-10 items-center justify-center rounded-xl transition-colors lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <Link
          to="/"
          className="group flex items-center gap-2.5"
          aria-label="ModoFriki, inicio"
        >
          <span className="border-accent/30 bg-accent/10 font-display text-accent shadow-glow relative flex size-9 items-center justify-center rounded-xl border text-lg font-bold">
            M
            <span className="bg-accent absolute -top-0.5 -right-0.5 size-2 rounded-full" />
          </span>
          <span className="font-display hidden text-lg font-bold tracking-tight sm:inline sm:text-xl">
            MODO<span className="text-accent">FRIKI</span>
          </span>
        </Link>

        <nav
          className="ml-6 hidden items-center gap-1 lg:flex"
          aria-label="Navegación principal"
        >
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
            className="border-line bg-surface text-muted hover:border-line-strong hover:text-secondary hidden h-10 items-center gap-2 rounded-xl border px-3 text-sm transition-colors md:flex"
            aria-label="Buscar series"
          >
            <Search className="size-4" />
            <span className="w-24 text-left">Buscar...</span>
            <kbd className="border-line-strong bg-raised text-secondary rounded border px-1.5 py-0.5 text-[10px] font-semibold">
              Ctrl K
            </kbd>
          </button>

          <button
            type="button"
            onClick={openCommand}
            aria-label="Buscar"
            className="text-secondary hover:bg-raised hover:text-primary flex size-10 items-center justify-center rounded-xl transition-colors md:hidden"
          >
            <Search className="size-5" />
          </button>

          <Link
            to="/favorites"
            aria-label={`Favoritos (${favoriteCount})`}
            className="text-secondary hover:bg-raised hover:text-accent relative flex size-10 items-center justify-center rounded-xl transition-colors"
          >
            <Heart className="size-5" />
            {favoriteCount > 0 ? (
              <span className="bg-accent text-canvas absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold">
                {favoriteCount}
              </span>
            ) : null}
          </Link>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="hover:bg-raised flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <Avatar alt={user.username} size="sm" />
                <span className="hidden max-w-24 truncate text-sm font-medium sm:block">
                  {user.username}
                </span>
                <ChevronDown
                  className={cn(
                    'text-muted hidden size-4 transition-transform sm:block',
                    menuOpen && 'rotate-180',
                  )}
                />
              </button>
              {menuOpen ? (
                <div
                  role="menu"
                  className="animate-fade-up border-line bg-surface shadow-card absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border p-1.5"
                >
                  <div className="border-line border-b px-3 py-2.5">
                    <p className="truncate text-sm font-semibold">{user.username}</p>
                    <p className="text-muted truncate text-xs">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                    className="text-secondary hover:bg-raised hover:text-primary flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors"
                  >
                    <UserRound className="size-4" /> Mi perfil
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                    className="text-secondary hover:bg-raised hover:text-primary flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors"
                  >
                    <Library className="size-4" /> Mi biblioteca
                  </Link>
                  {user.role !== 'BASIC' ? (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                      className="text-secondary hover:bg-raised hover:text-primary flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors"
                    >
                      <ShieldCheck className="size-4" /> Panel
                    </Link>
                  ) : null}
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                    className="text-secondary hover:bg-raised hover:text-primary flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors"
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
                    className="text-danger hover:bg-danger/10 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors"
                  >
                    <LogOut className="size-4" /> Cerrar sesión
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              {sessionError ? (
                <>
                  <span role="status" className="sr-only">
                    {sessionError}
                  </span>
                  <button
                    type="button"
                    onClick={() => void retrySession()}
                    aria-label="Reintentar validación de sesión"
                    title={sessionError}
                    className="text-secondary hover:bg-raised hover:text-primary flex h-10 items-center justify-center gap-1.5 rounded-xl px-2 transition-colors"
                  >
                    <RotateCw className="size-4" />
                    <span className="hidden text-xs sm:inline">Reintentar</span>
                  </button>
                </>
              ) : null}
              <Link
                to="/login"
                aria-label="Iniciar sesión"
                className="text-secondary hover:bg-raised hover:text-primary flex size-10 items-center justify-center rounded-xl transition-colors sm:hidden"
              >
                <UserRound className="size-5" />
              </Link>
              <Link
                to="/login"
                className={buttonStyles({
                  size: 'sm',
                  className: 'hidden sm:inline-flex',
                })}
              >
                Entrar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
