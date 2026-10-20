import { Link, NavLink } from 'react-router-dom'
import {
  Heart,
  Home,
  Library,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
  LogIn,
} from 'lucide-react'
import { NAV_LINKS, ROLE_LABELS } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { useUI } from '@/hooks/useUI'
import { useAuth } from '@/hooks/useAuth'
import { useLibrary } from '@/hooks/useLibrary'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { Avatar } from '@/components/ui/avatar'
import { buttonStyles } from '@/components/ui/button'

const icons = [Home, Library, Trophy, Sparkles]

export function MobileNav() {
  const { mobileNavOpen, closeMobileNav, openCommand } = useUI()
  const { user } = useAuth()
  const { favoriteCount } = useLibrary()
  useLockBodyScroll(mobileNavOpen)

  if (!mobileNavOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Cerrar menú"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={closeMobileNav}
      />
      <aside className="animate-fade-in border-line bg-base absolute inset-y-0 left-0 flex w-[min(88vw,22rem)] flex-col border-r p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            onClick={closeMobileNav}
            className="font-display text-xl font-bold"
          >
            MODO<span className="text-accent">FRIKI</span>
          </Link>
          <button
            type="button"
            onClick={closeMobileNav}
            aria-label="Cerrar menú"
            className="text-secondary hover:bg-raised hover:text-primary flex size-10 items-center justify-center rounded-xl"
          >
            <X className="size-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            closeMobileNav()
            openCommand()
          }}
          className="border-line bg-surface text-muted mt-6 flex h-11 items-center gap-2 rounded-xl border px-3 text-sm"
        >
          <Search className="size-4" /> Buscar series, capítulos...
        </button>

        <nav className="mt-6 flex flex-col gap-1" aria-label="Navegación móvil">
          {NAV_LINKS.map((link, index) => {
            const Icon = icons[index] ?? Home
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={'end' in link ? link.end : false}
                onClick={closeMobileNav}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-secondary hover:bg-raised hover:text-primary',
                  )
                }
              >
                <Icon className="size-5" />
                {link.label}
              </NavLink>
            )
          })}
          <NavLink
            to="/favorites"
            onClick={closeMobileNav}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-secondary hover:bg-raised hover:text-primary',
              )
            }
          >
            <Heart className="size-5" />
            Favoritos
            <span className="bg-accent/10 text-accent ml-auto rounded-full px-2 py-0.5 text-xs">
              {favoriteCount}
            </span>
          </NavLink>
          {user && user.role !== 'BASIC' ? (
            <NavLink
              to="/admin"
              onClick={closeMobileNav}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-secondary hover:bg-raised hover:text-primary',
                )
              }
            >
              <ShieldCheck className="size-5" />
              Panel
            </NavLink>
          ) : null}
        </nav>

        <div className="border-line mt-auto border-t pt-5">
          {user ? (
            <Link
              to="/profile"
              onClick={closeMobileNav}
              className="hover:bg-raised flex items-center gap-3 rounded-xl p-2 transition-colors"
            >
              <Avatar alt={user.username} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.username}</p>
                <p className="text-muted truncate text-xs">{ROLE_LABELS[user.role]}</p>
              </div>
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={closeMobileNav}
              className={buttonStyles({ className: 'w-full' })}
            >
              <LogIn className="size-4" /> Entrar
            </Link>
          )}
        </div>
      </aside>
    </div>
  )
}
