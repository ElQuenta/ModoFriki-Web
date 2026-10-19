import { Link } from 'react-router-dom'
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogIn,
  LogOut,
  Settings2,
  Trash2,
  UserRound,
} from 'lucide-react'
import { SERIES } from '@/data/mock'
import { FAVORITE_STATUSES } from '@/lib/constants'
import type { ReadingMode } from '@/types'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'
import { useAuth } from '@/hooks/useAuth'
import { useLibrary } from '@/hooks/useLibrary'
import { useReaderSettings } from '@/hooks/useReaderSettings'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button, buttonStyles } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { CoverImage } from '@/components/ui/cover-image'
import { SectionHeader } from '@/components/ui/section-header'

export function ProfileView() {
  const { user, logout } = useAuth()
  const { favorites, progress, clearHistory } = useLibrary()
  const { settings, setMode } = useReaderSettings()

  if (!user) {
    return (
      <div className="container-mf pt-10">
        <EmptyState
          icon={UserRound}
          title="Inicia sesión para ver tu perfil"
          description="Guarda tus favoritos, continúa leyendo donde lo dejaste y personaliza tu experiencia."
          actionLabel="Iniciar sesión"
          actionTo="/login"
        />
      </div>
    )
  }

  const history = Object.values(progress)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .map((item) => ({ item, series: SERIES.find((series) => series.id === item.seriesId) }))
    .filter((entry) => entry.series)

  const reading = Object.values(favorites).filter((item) => item.status === 'Leyendo').length
  const completed = Object.values(favorites).filter(
    (item) => item.status === 'Completado',
  ).length

  return (
    <div className="container-mf pt-8 pb-4">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface">
        <div className="h-32 bg-gradient-to-r from-accent/25 via-accent/10 to-transparent sm:h-40" />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end">
            <Avatar
              src={user.avatarUrl}
              alt={user.name}
              size="xl"
              className="size-24 border-4 border-surface sm:size-28"
            />
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold sm:text-3xl">{user.name}</h1>
                <Badge tone="accent">{user.role}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">@{user.username}</p>
              <p className="mt-2 max-w-xl text-sm text-secondary">{user.bio}</p>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
                <CalendarDays className="size-3.5" /> Miembro desde {formatDate(user.joinedAt)}
              </p>
            </div>
            <Button variant="secondary" onClick={logout} className="sm:mb-1">
              <LogOut className="size-4" /> Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Favoritos', value: Object.keys(favorites).length, icon: BookOpen },
          { label: 'Leyendo', value: reading, icon: Clock3 },
          { label: 'Completados', value: completed, icon: CheckCircle2 },
          { label: 'En historial', value: history.length, icon: Settings2 },
        ].map((stat) => (
          <div key={stat.label} className="surface-card p-4">
            <stat.icon className="size-4 text-accent" />
            <p className="mt-2 font-display text-2xl font-bold">{stat.value}</p>
            <p className="text-[11px] text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section>
          <SectionHeader
            title="Historial de lectura"
            description="Retoma cualquiera de tus lecturas recientes."
          />
          {history.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Todavía no has leído nada"
              description="Abre cualquier capítulo y tu progreso aparecerá aquí automáticamente."
              actionLabel="Empezar a leer"
              actionTo="/series"
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              {history.map(({ item, series }, index) => {
                if (!series) return null
                return (
                  <Link
                    key={series.id}
                    to={`/read/${series.slug}/${item.chapterNumber}`}
                    className={cn(
                      'group flex items-center gap-3 p-3 transition-colors hover:bg-raised sm:gap-4',
                      index !== history.length - 1 && 'border-b border-line',
                    )}
                  >
                    <CoverImage
                      src={series.coverUrl}
                      alt={`Portada de ${series.title}`}
                      title={series.title}
                      className="h-20 w-14 shrink-0 rounded-lg"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold transition-colors group-hover:text-accent">
                        {series.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        Cap. {item.chapterNumber} · Página {item.page} de {item.totalPages}
                      </p>
                      <div className="mt-2 h-1.5 max-w-xs overflow-hidden rounded-full bg-raised">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <Badge tone="accent">{item.percentage}%</Badge>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="surface-card p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-bold">
              <Settings2 className="size-4 text-accent" /> Preferencias
            </h2>
            <p className="mt-3 text-[11px] font-semibold tracking-wider text-muted uppercase">
              Modo de lectura
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['cascade', 'paginated'] as ReadingMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setMode(mode)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                    settings.mode === mode
                      ? 'border-accent/40 bg-accent/10 text-accent'
                      : 'border-line text-secondary hover:text-primary',
                  )}
                >
                  {mode === 'cascade' ? 'Cascada' : 'Paginado'}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted">
              El modo se guarda en este dispositivo y se aplica al lector.
            </p>
          </div>

          <div className="surface-card p-5">
            <h2 className="font-display text-base font-bold">Tu cuenta</h2>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Correo</dt>
                <dd className="truncate font-medium">{user.email}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Rol</dt>
                <dd className="font-medium">{user.role}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Estado</dt>
                <dd className="font-medium text-success">Activo</dd>
              </div>
            </dl>
            <Button variant="danger" onClick={logout} className="mt-4 w-full">
              <LogOut className="size-4" /> Cerrar sesión
            </Button>
          </div>

          {history.length > 0 ? (
            <button
              type="button"
              onClick={clearHistory}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-xs font-semibold text-muted transition-colors hover:border-danger/40 hover:text-danger"
            >
              <Trash2 className="size-3.5" /> Borrar historial
            </button>
          ) : null}

          <Link
            to="/favorites"
            className={buttonStyles({ variant: 'secondary', className: 'w-full' })}
          >
            <BookOpen className="size-4" /> Ver favoritos
          </Link>
        </aside>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {FAVORITE_STATUSES.map((status) => (
          <div key={status} className="rounded-xl border border-line bg-surface p-4">
            <p className="text-xs text-muted">{status}</p>
            <p className="mt-1 font-display text-xl font-bold">
              {Object.values(favorites).filter((item) => item.status === status).length}
            </p>
          </div>
        ))}
      </div>

      {!user ? (
        <Link to="/login" className={buttonStyles({ className: 'mt-6' })}>
          <LogIn className="size-4" /> Iniciar sesión
        </Link>
      ) : null}
    </div>
  )
}
