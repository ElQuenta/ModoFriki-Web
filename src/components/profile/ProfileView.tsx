import { Link } from 'react-router-dom'
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
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
    .map((item) => ({
      item,
      series: SERIES.find((series) => series.id === item.seriesId),
    }))
    .filter((entry) => entry.series)

  const reading = Object.values(favorites).filter(
    (item) => item.status === 'Leyendo',
  ).length
  const completed = Object.values(favorites).filter(
    (item) => item.status === 'Completado',
  ).length

  return (
    <div className="container-mf pt-8 pb-4">
      <div className="border-line bg-surface relative overflow-hidden rounded-3xl border">
        <div className="from-accent/25 via-accent/10 h-28 bg-gradient-to-r to-transparent sm:h-40" />
        <div className="px-4 pb-5 sm:px-8 sm:pb-6">
          <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end">
            <Avatar
              src={user.avatarUrl}
              alt={user.name}
              size="xl"
              className="border-surface size-24 self-center border-4 sm:size-28 sm:self-auto"
            />
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold sm:text-3xl">
                  {user.name}
                </h1>
                <Badge tone="accent">{user.role}</Badge>
              </div>
              <p className="text-muted mt-1 text-sm">@{user.username}</p>
              <p className="text-secondary mt-2 max-w-xl text-sm">{user.bio}</p>
              <p className="text-muted mt-2 flex items-center gap-1.5 text-[11px]">
                <CalendarDays className="size-3.5" /> Miembro desde{' '}
                {formatDate(user.joinedAt)}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={logout}
              className="w-full sm:mb-1 sm:w-auto"
            >
              <LogOut className="size-4" /> Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {[
          { label: 'Favoritos', value: Object.keys(favorites).length, icon: BookOpen },
          { label: 'Leyendo', value: reading, icon: Clock3 },
          { label: 'Completados', value: completed, icon: CheckCircle2 },
          { label: 'En historial', value: history.length, icon: Settings2 },
        ].map((stat) => (
          <div key={stat.label} className="surface-card p-3.5 sm:p-4">
            <stat.icon className="text-accent size-4" />
            <p className="font-display mt-2 text-2xl font-bold">{stat.value}</p>
            <p className="text-muted text-[11px]">{stat.label}</p>
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
            <div className="border-line bg-surface overflow-hidden rounded-2xl border">
              {history.map(({ item, series }, index) => {
                if (!series) return null
                return (
                  <Link
                    key={series.id}
                    to={`/read/${series.slug}/${item.chapterNumber}`}
                    className={cn(
                      'group hover:bg-raised flex items-center gap-3 p-3 transition-colors sm:gap-4',
                      index !== history.length - 1 && 'border-line border-b',
                    )}
                  >
                    <CoverImage
                      src={series.coverUrl}
                      alt={`Portada de ${series.title}`}
                      title={series.title}
                      className="h-20 w-14 shrink-0 rounded-lg"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="group-hover:text-accent truncate text-sm font-semibold transition-colors">
                        {series.title}
                      </p>
                      <p className="text-muted mt-0.5 text-[11px]">
                        Cap. {item.chapterNumber} · Página {item.page} de{' '}
                        {item.totalPages}
                      </p>
                      <div className="bg-raised mt-2 h-1.5 max-w-xs overflow-hidden rounded-full">
                        <div
                          className="bg-accent h-full rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <Badge tone="accent" className="shrink-0">
                      {item.percentage}%
                    </Badge>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="surface-card p-5">
            <h2 className="font-display flex items-center gap-2 text-base font-bold">
              <Settings2 className="text-accent size-4" /> Preferencias
            </h2>
            <p className="text-muted mt-3 text-[11px] font-semibold tracking-wider uppercase">
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
            <p className="text-muted mt-3 text-[11px]">
              El modo se guarda en este dispositivo y se aplica al lector.
            </p>
          </div>

          <div className="surface-card p-5">
            <h2 className="font-display text-base font-bold">Tu cuenta</h2>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted shrink-0">Correo</dt>
                <dd className="min-w-0 truncate text-right font-medium">{user.email}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Rol</dt>
                <dd className="font-medium">{user.role}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Estado</dt>
                <dd className="text-success font-medium">Activo</dd>
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
              className="border-line text-muted hover:border-danger/40 hover:text-danger flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-colors"
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

      <div className="mt-10 grid gap-2.5 sm:grid-cols-3 sm:gap-3">
        {FAVORITE_STATUSES.map((status) => (
          <div key={status} className="border-line bg-surface rounded-xl border p-4">
            <p className="text-muted text-xs">{status}</p>
            <p className="font-display mt-1 text-xl font-bold">
              {Object.values(favorites).filter((item) => item.status === status).length}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
